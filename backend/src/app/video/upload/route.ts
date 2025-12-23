import {NextRequest, NextResponse} from "next/server";
import {createBucketIfNeeded, uploadBucket, uploadFileToMinio} from "@/lib/services/minio";
import {randomUUID} from "crypto";
import {sendMessage} from "@/lib/services/rabbitmq";
import {connectionPool} from "@/lib/services/postgres";
import {getMp4Duration} from "@/lib/utils/video";
import NextError, {HttpError} from "@/lib/utils/error";
import {getUser} from "@/lib/auth/getUser";

export async function OPTIONS() {
	return new NextResponse(null, {
		status: 204, headers: {
			"Access-Control-Allow-Origin": "http://localhost",
			"Access-Control-Allow-Credentials": "true",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
		},
	});
}


export async function POST(req: NextRequest) {
	let client;

	try {
		// ====== getUser using new cookie-based getUser.ts ======
		const user = getUser(req);

		if (!user) {
			return NextResponse.json({error: "Not authenticated"}, {status: 401});
		}

		const formData = await req.formData();

		const file = formData.get("file") as File | null;
		const title = formData.get("title") as string | null;
		const description = formData.get("description") as string | null;

		// -------------------------------
		// Request validation
		// -------------------------------
		if (!file) {
			return NextError.error("No files uploaded.", HttpError.BadRequest);
		}

		if (!title || !description) {
			return NextError.error("Title and description are required.", HttpError.BadRequest);
		}

		if (!file.type.startsWith("video/")) {
			return NextError.error("Wrong file type. Only video files are allowed.", HttpError.BadRequest);
		}

		// -------------------------------
		// Prepare file
		// -------------------------------
		const buffer = Buffer.from(await file.arrayBuffer());
		const id = randomUUID();
		const extension = file.name.split(".").pop() || "mp4";
		const filename = `${id}.${extension}`;

		let duration: number | null = null;
		if (file.type === "video/mp4" || file.name.endsWith(".mp4") || file.name.endsWith(".mov")) {
			duration = await getMp4Duration(buffer);
		}

		// -------------------------------
		// Upload file to MinIO
		// -------------------------------
		await createBucketIfNeeded(uploadBucket);
		await uploadFileToMinio(filename, uploadBucket, buffer, file.type);

		// -------------------------------
		// Send RabbitMQ Jobs
		// -------------------------------
		const jobMessage = JSON.stringify({
			job_id: id, object_key: filename,
		});

		try {
			await Promise.all([sendMessage("resolution_jobs", jobMessage), sendMessage("transcribe_jobs", jobMessage),]);
		} catch (err) {
			console.error("RabbitMQ send error:", err);
			return NextError.error("Failed to send RabbitMQ jobs.", HttpError.InternalServerError);
		}

		// -------------------------------
		// Database Transaction
		// -------------------------------
		const metadataId = randomUUID();
		client = await connectionPool.connect();

		try {
			await client.query("BEGIN");

			await client.query(`INSERT INTO metadata (metadata_id)
                                VALUES ($1)`, [metadataId]);

			await client.query(`INSERT INTO video
                                (video_id, path, duration, title, description,
                                 is_age_restricted, tested, views, uploader, metadata_id)
                                VALUES ($1, $2, $3, $4, $5, DEFAULT, DEFAULT, DEFAULT, $7,
                                        $8)`, [id, `/video/${id}/master.m3u8`, duration, title, description, user.user_id, // <- neuer getUser user_id
				metadataId,]);

			await client.query("COMMIT");
			return NextResponse.json({id: id, success: true}, {status: 200});
		} catch (err) {
			await client.query("ROLLBACK");
			console.error("Database error:", err);
			return NextError.error("Database write failed.", HttpError.InternalServerError);
		} finally {
			client.release();
		}
	} catch (err: any) {
		console.error("Upload processing error:", err);
		const message = err instanceof Error ? err.message : "Server error.";
		return NextError.error(message, HttpError.InternalServerError);
	}
}
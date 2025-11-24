import {NextResponse} from "next/server";
import {createBucketIfNeeded, uploadBucket, uploadFileToMinio} from "@/lib/services/minio";
import {randomUUID} from "crypto";
import {sendMessage} from "@/lib/services/rabbitmq";
import {connectionPool} from "@/lib/services/postgres";
import {getMp4Duration} from "@/lib/utils/video";
import NextError, {HttpError} from "@/lib/utils/error";

export async function POST(req: Request) {
	let client;
	console.log(req.headers.get("content-type"));
	try {
		const formData = await req.formData();

		const file = formData.get("file") as File;
		const title = formData.get("title") as string;
		const description = formData.get("description") as string;
		const ageRestricted = formData.get("age_restricted") === "true";

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
			job_id: id, object_key: filename
		});

		try {
			await Promise.all([sendMessage("resolution_jobs", jobMessage), sendMessage("transcribe_jobs", jobMessage)]);
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

			await client.query(`
                INSERT INTO video (video_id, path, duration, title, description,
                                   is_age_restricted, tested, views, uploader, metadata_id)
                VALUES ($1, $2, $3, $4, $5, $6, DEFAULT, DEFAULT, $7,
                        $8)`, [id, `/video/${id}/master.m3u8`, duration, title, description, ageRestricted, null, // uploader
				metadataId]);

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
		return NextError.error(err || "Server error.", HttpError.InternalServerError);
	}
}

import {NextResponse} from "next/server";
import {createBucketIfNeeded, uploadBucket as bucket, uploadFileToMinio} from "@/lib/services/minio";
import {randomUUID} from "crypto";
import {sendMessage} from "@/lib/services/rabbitmq";
import {connectionPool} from "@/lib/services/postgres";
import * as MP4Box from "mp4box";

function getMp4Duration(buffer: Buffer): Promise<number> {
	return new Promise((resolve, reject) => {
		const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

		const mp4boxFile = MP4Box.createFile();
		mp4boxFile.onError = (e) => reject(e);

		mp4boxFile.onReady = (info) => {
			const seconds = info.duration / info.timescale;
			resolve(Math.floor(seconds));
		};

		const ab = arrayBuffer as any;
		ab.fileStart = 0;

		mp4boxFile.appendBuffer(ab);
		mp4boxFile.flush();
	});
}


export async function POST(req: Request) {
	try {
		const formData = await req.formData();

		const file = formData.get("file") as File;

		const title = formData.get("title") as string;
		const description = formData.get("description") as string;
		const age_restricted = formData.get("age_restricted") === "true";

		if (!file) {
			return NextResponse.json({error: "No file uploaded"}, {status: 400});
		}

		if (!file.type.startsWith("video/")) {
			return NextResponse.json({error: "Only video files are allowed"}, {status: 400});
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		const id = randomUUID();

		const extension = file.name.split('.').pop() || 'mp4';
		const filename = `${id}.${extension}`;

		let duration: number | null = null;

		if (file.type === "video/mp4" || file.name.endsWith(".mp4") || file.name.endsWith(".mov")) {
			duration = await getMp4Duration(buffer);
		}

		await createBucketIfNeeded(bucket);
		await uploadFileToMinio(filename, bucket, buffer, file.type);

		const msg = {
			job_id: id, object_key: filename,
		};

		try {
			await Promise.all([sendMessage("resolution_jobs", JSON.stringify(msg)), sendMessage("transcribe_jobs", JSON.stringify(msg)),]);
		} catch (rabbitError) {
			console.error("Error sending message to RabbitMQ:", rabbitError);
			return NextResponse.json({error: "Failed to send message to RabbitMQ"}, {status: 500});
		}

		let metadata_id = randomUUID();

		try {
			await connectionPool.query(`
            INSERT INTO metadata
            VALUES ($1)
		`, [metadata_id]);

			await connectionPool.query(`
                    INSERT INTO video(video_id, path, duration, title, description, is_age_restricted, tested, views, uploader, metadata_id)
                    VALUES ($1, $2, $3, $4, $5, $6, DEFAULT, DEFAULT, $7, $8)`,
				[
					id,
					"/video/" + id + "/master.m3u8",
					duration,
					title,
					description,
					age_restricted,
					null, // Uploader ID
					metadata_id
				]
			);
		} catch (err) {
			console.error("Error sending message to RabbitMQ:", err);
			return NextResponse.json({error: err});
		}


		return NextResponse.json({
			message: "Upload successful", filename: filename
		});

	} catch (error: any) {
		console.error("Error during file upload:", error);
		return NextResponse.json({error: error.message || "Upload failed"}, {status: 500});
	}
}
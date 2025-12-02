import {NextResponse} from "next/server";
import {minioClient, uploadBucket as bucket} from "@/lib/services/minio";
import {randomUUID} from "crypto";
import {sendMessage} from "@/lib/services/rabbitmq";

// Ensure the MinIO bucket exists
async function createBucketIfNeeded() {
	const exists = await minioClient.bucketExists(bucket);
	if (!exists) {
		await minioClient.makeBucket(bucket, "us-east-1");
	}
}

// Upload file to MinIO
async function uploadFileToMinio(filename: string, fileBuffer: Buffer, contentType: string) {
	await minioClient.putObject(bucket, filename, fileBuffer, fileBuffer.length, {
		"Content-Type": contentType,
	});
}

// Handle the file upload and message queuing
export async function POST(req: Request) {
	try {
		const formData = await req.formData();

		const file = formData.get("file") as File;

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

		await createBucketIfNeeded();
		await uploadFileToMinio(filename, buffer, file.type);

		const msg = {
			job_id: id,
			object_key: filename,
		};

		try {
			await Promise.all([
				sendMessage("resolution_jobs", JSON.stringify(msg)),
				sendMessage("transcribe_jobs", JSON.stringify(msg)),
			]);
		} catch (rabbitError) {
			console.error("Error sending message to RabbitMQ:", rabbitError);
			return NextResponse.json({error: "Failed to send message to RabbitMQ"}, {status: 500});
		}

		return NextResponse.json({
			message: "Upload successful",
			filename: filename
		});

	} catch (error: any) {
		console.error("Error during file upload:", error);
		return NextResponse.json({error: error.message || "Upload failed"}, {status: 500});
	}
}
import {NextResponse} from "next/server";
import {countFilesInFolder, objectExists, uploadFileToMinio, videoBucket} from "@/lib/services/minio";
import {randomUUID} from "crypto";
import {connectionPool} from "@/lib/services/postgres";

export async function POST(req: Request) {
	try {
		const formData = await req.formData();

		const video_id = formData.get("id");
		const file = formData.get("file") as File;

		if (!video_id) {
			return NextResponse.json({error: "No file given"}, {status: 400});
		}

		if (!file) {
			return NextResponse.json({error: "No file uploaded"}, {status: 400});
		}

		if (!file.type.startsWith("image/")) {
			return NextResponse.json({error: "Only image files are allowed"}, {status: 400});
		}

		const exists = await objectExists(videoBucket, `${video_id}/master.m3u8`);

		if (!exists) {
			return NextResponse.json({error: "Video isn't uploaded yet."}, {status: 400});
		}

		const thumbnails_existing = await countFilesInFolder(videoBucket, `${video_id}/thumbnails`);

		if (thumbnails_existing === 5) {
			return NextResponse.json({error: "Only 5 thumbnails are allowed at the same time"}, {status: 400});
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		const id = randomUUID();
		const extension = file.name.split(".").pop() || "png";
		const filename = `${id}.${extension}`;

		await uploadFileToMinio(`${video_id}/thumbnails/${filename}`, videoBucket, buffer, file.type);

		await connectionPool.query(`
            INSERT INTO photo (photo_id, path)
            VALUES ($1, $2)`, [`${id}`, `${video_id}/thumbnails/${filename}`]);
		await connectionPool.query(`
            INSERT INTO Thumbnail (thumbnail_id, photo_id, video_id, is_active)
            VALUES ($1, $2, $3, $4)`, [`${id}`, `${id}`, `${video_id}`, false]);

		return NextResponse.json({
			message: "Thumbnail upload successful", filename: filename,
		});
	} catch (error: any) {
		console.error("Error during thumbnail upload:", error);
		return NextResponse.json({error: error.message || "Upload failed"}, {status: 500});
	}
}

import {NextResponse} from "next/server";
import {listFilesInFolder, minioClient, videoBucket} from "@/lib/services/minio";
import {checkUUID} from "@/lib/utils/util";
import NextError, {HttpError} from "@/lib/utils/error";

export async function DELETE(req: Request) {
	let client;

	try {
		const formData = await req.formData();

		const videoId = formData.get("id") as string;
		const language = formData.get("language") as string;

		// -------------------------------
		// Request validation
		// -------------------------------
		if (!videoId) {
			return NextError.error("Missing id", HttpError.BadRequest);
		}

		if (!checkUUID(videoId)) {
			return NextError.error("Invalid video id format", HttpError.BadRequest);
		}

		if (!language) {
			return NextError.error("Missing language", HttpError.BadRequest);
		}

		let files = await listFilesInFolder(videoBucket, `${videoId}/subtitles`);

		files.map(file => {
			let file_lang = file.split(".")[0].split("_")[1];
			console.log(file_lang, language, file);
			if (file_lang === language) {
				minioClient.removeObject(videoBucket, `${file}`);
			}
		})

		return NextResponse.json({success: true});
	} catch (err) {
		console.error(err);
		return NextError.error("Minio error", HttpError.InternalServerError);
	}
}
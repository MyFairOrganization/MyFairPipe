import {NextResponse} from "next/server";
import NextError, {HttpError} from "@/lib/utils/error";
import {checkUUID} from "@/lib/utils/util";
import {countFilesInFolder, listFilesInFolder, videoBucket} from "@/lib/services/minio";

export async function GET(req: Request) {
	let client;

	try {
		const {searchParams} = new URL(req.url);

		const video_id = searchParams.get("id") as string;

		// -------------------------------
		// Request validation
		// -------------------------------
		if (!video_id) {
			return NextError.error("Missing id", HttpError.BadRequest);
		}

		if (!checkUUID(video_id)) {
			return NextError.error("Invalid video id format", HttpError.BadRequest);
		}

		// -------------------------------
		// Response
		// -------------------------------
		let count = await countFilesInFolder(videoBucket, `${video_id}/subtitles`);
		let languages: string[] = [];

		let files = await listFilesInFolder(videoBucket, `${video_id}/subtitles`);

		files.map(file => {
			let language = file.split(".")[0].split("_")[1];
			if (!languages.includes(language)) {
				languages.push(language);
			}
		})

		return NextResponse.json({
			count: count / 2, languages: languages
		}, {status: 200});
	} catch (err: any) {
		console.error("Minio error: ", err);
		return NextError.error(err || "Server error.", HttpError.InternalServerError);
	}
}
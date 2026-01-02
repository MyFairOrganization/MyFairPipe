import { NextResponse } from "next/server";
import NextError, { HttpError } from "@/lib/utils/error";
import { countFilesInFolder, listFilesInFolder, videoBucket } from "@/lib/services/minio";

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204, headers: {
            "Access-Control-Allow-Origin": "http://myfairpipe.com",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
        },
    });
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const videoId = searchParams.get("id") as string;

        // -------------------------------
        // Request validation
        // -------------------------------
        if (!videoId) {
            return NextError.Error("Missing id", HttpError.BadRequest);
        }

        // -------------------------------
        // Response
        // -------------------------------
        let count = await countFilesInFolder(videoBucket, `${videoId}/subtitles`);
        let languages: string[] = [];

        let files = await listFilesInFolder(videoBucket, `${videoId}/subtitles`);

        files.map(file => {
            let language = file.split(".")[0].split("_")[1];
            if (!languages.includes(language)) {
                languages.push(language);
            }
        });

        return NextResponse.json({
            count: count / 2, languages: languages, files
        }, { status: 200 });
    } catch (err: any) {
        console.error("Minio error: ", err);
        return NextError.Error(err || "Server error.", HttpError.InternalServerError);
    }
}
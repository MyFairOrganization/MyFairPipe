import * as Minio from 'minio'

export const uploadBucket = "upload";
export const videoBucket = "video";

let endpoint: string = process.env.MINIO_ENDPOINT || 'localhost:9000';

let host: string = endpoint.split(":")[0];
let port: number = parseInt(endpoint.split(":")[1]);

export const minioClient = new Minio.Client({
	endPoint: host,
	port: port,
	useSSL: false,
	accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
	secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
})

export async function createBucketIfNeeded(bucket: string) {
	const exists = await minioClient.bucketExists(bucket);
	if (!exists) {
		await minioClient.makeBucket(bucket, "us-east-1");
	}
}

export async function uploadFileToMinio(filename: string, bucket: string, fileBuffer: Buffer, contentType: string) {
	await minioClient.putObject(bucket, filename, fileBuffer, fileBuffer.length, {
		"Content-Type": contentType,
	});
}

export async function objectExists(bucket: string, key: string): Promise<boolean> {
	try {
		await minioClient.statObject(bucket, key);
		return true;
	} catch (err: any) {
		if (err.code === "NotFound") return false;
		throw err;
	}
}

export async function countFilesInFolder(
	bucket: string,
	folder: string
): Promise<number> {
	return new Promise((resolve, reject) => {
		let count = 0;

		const stream = minioClient.listObjects(bucket, folder, true);

		stream.on("data", () => {
			count++;
		});

		stream.on("error", (err) => {
			reject(err);
		});

		stream.on("end", () => {
			resolve(count);
		});
	});
}
import * as Minio from 'minio'

export const uploadBucket = "upload";
export const videoBucket = "video";
export const photoBucket = "photo";

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
		await minioClient.setBucketPolicy(
			bucket,
			JSON.stringify({
				Version: "2012-10-17",
				Statement: [
					{
						Effect: "Allow",
						Principal: { AWS: "*" },
						Action: ["s3:GetObject"],
						Resource: [`arn:aws:s3:::${bucket}/*`]
					}
				]
			})
		);
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

export async function countFilesInFolder(bucket: string, folder: string): Promise<number> {
	let count: number = 0;
	for await (const obj of minioClient.listObjectsV2(bucket, folder, true)) {
		if (obj.name) count++;
	}
	return count;
}

export async function listFilesInFolder(bucket: string, folder: string): Promise<string[]> {
	const files: string[] = [];
	for await (const obj of minioClient.listObjectsV2(bucket, folder, true)) {
		if (obj.name) files.push(obj.name);
	}
	return files;
}

export async function deleteFolder(bucket: string, folder: string) {
	const objectsToDelete: string[] = [];
	for await (const obj of minioClient.listObjectsV2(bucket, folder, true)) {
		if (obj.name) objectsToDelete.push(obj.name);
	}

	await Promise.all(objectsToDelete.map(name => minioClient.removeObject(bucket, name)));
}

// @ts-ignore
export async function streamToString(stream): Promise<string> {
	return new Promise((resolve, reject) => {
		let data = "";
		// @ts-ignore
		stream.on("data", chunk => (data += chunk.toString()));
		stream.on("end", () => resolve(data));
		stream.on("error", reject);
	});
}
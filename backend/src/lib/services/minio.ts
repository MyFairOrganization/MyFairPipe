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
import json
import os
import sys
import uuid

import pika
from minio import Minio


# ------------------------------------------------------------------
# MinIO connection (adjust if your compose env vars are different)
# ------------------------------------------------------------------
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS   = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET   = os.getenv("MINIO_SECRET_KEY", "minioadmin")
BUCKET         = "videos"


def upload_and_submit_job(local_path):
	"""
	1. Upload local_path -> MinIO bucket "videos"
	2. Post RabbitMQ message with the object key == basename(local_path)
	"""
	if not os.path.isfile(local_path):
		print(f"File not found: {local_path}")
		sys.exit(1)

	client = Minio(
		MINIO_ENDPOINT,
		access_key=MINIO_ACCESS,
		secret_key=MINIO_SECRET,
		secure=False
	)

	# Ensure bucket exists
	if not client.bucket_exists(BUCKET):
		client.make_bucket(BUCKET)

	object_key = os.path.basename(local_path)
	client.fput_object(BUCKET, object_key, local_path)
	print(f"Uploaded {local_path} → {BUCKET}/{object_key}")

	# ------------------------------------------------------------------
	# RabbitMQ
	# ------------------------------------------------------------------
	connection = pika.BlockingConnection(
		pika.ConnectionParameters(
			host="localhost",
			port=5672,
			credentials=pika.PlainCredentials("admin", "admin")
		)
	)
	channel = connection.channel()
	channel.queue_declare(queue="resolution_jobs", durable=True)

	job_id = str(uuid.uuid4())
	message = {"job_id": job_id, "object_key": object_key}
	channel.basic_publish(
		exchange="",
		routing_key="resolution_jobs",
		body=json.dumps(message),
		properties=pika.BasicProperties(delivery_mode=2)
	)

	print(f"Submitted job {job_id} for {object_key}")
	connection.close()
	return job_id


if __name__ == "__main__":
	if len(sys.argv) != 2:
		print("Usage: python test_submit_job.py <video_filename>")
		print("Example: python test_submit_job.py sample.mp4")
		sys.exit(1)

	upload_and_submit_job(sys.argv[1])
import json
import logging
import os
import signal
import sys
import time

import docker
import pika
from pika.exceptions import AMQPConnectionError

# --- Configuration ---
RABBIT_HOST = os.getenv("RABBIT_HOST", "rabbitmq")
RABBIT_PORT = int(os.getenv("RABBIT_PORT", 5672))
RABBIT_USER = os.getenv("RABBIT_USER", "guest")
RABBIT_PASS = os.getenv("RABBIT_PASS", "guest")
QUEUE = "transcribe_jobs"

# --- Logging setup ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout,
)

# --- Global clients (reused across jobs) ---
docker_client = docker.from_env()


def wait_for_rabbitmq(max_retries: int = 60, delay: int = 5):
    """Wait for RabbitMQ to be available with retries."""
    logging.info(f"🔍 Using RabbitMQ host: {RABBIT_HOST}:{RABBIT_PORT} with user {RABBIT_USER}")
    credentials = pika.PlainCredentials(RABBIT_USER, RABBIT_PASS)

    for attempt in range(max_retries):
        try:
            conn = pika.BlockingConnection(
                pika.ConnectionParameters(host=RABBIT_HOST, port=RABBIT_PORT, credentials=credentials)
            )
            conn.close()
            logging.info("RabbitMQ is ready")
            return
        except AMQPConnectionError as e:
            logging.warning(
                f"Waiting for RabbitMQ at {RABBIT_HOST}:{RABBIT_PORT} "
                f"(attempt {attempt + 1}/{max_retries})... {e}"
            )
            time.sleep(delay)

    raise RuntimeError("RabbitMQ not available after max retries")


def start_transcriber(job_id: str, object_key: str):
    """Start a worker container for transcription job."""
    env = {
        "JOB_ID": job_id,
        "OBJECT_KEY": object_key,
        "RABBIT_HOST": RABBIT_HOST,
        "RABBIT_PORT": str(RABBIT_PORT),
        "MINIO_ENDPOINT": os.getenv("MINIO_ENDPOINT", "minio:9000"),
        "MINIO_ACCESS_KEY": os.getenv("MINIO_ACCESS_KEY", "minioadmin"),
        "MINIO_SECRET_KEY": os.getenv("MINIO_SECRET_KEY", "minioadmin"),
    }

    container_name = f"worker-transcription-{job_id}"

	try:
		container = docker_client.containers.run(
			image="transcription-worker:latest",
			environment=env,
			network="internal-network",
			name=container_name,
			detach=True,
			remove=True,
		)
		logging.info(
			f"Started transcriber container {container.id[:12]} "
			f"for job {job_id}"
		)
	except docker.errors.APIError as e:
		logging.error(f"Docker error for job {job_id}: {e.explanation}")
		raise
	except Exception as e:
		logging.exception(f"Unexpected error starting container for job {job_id}")
		raise


def main():
    logging.info("Starting manager...")

    # Wait for RabbitMQ to be ready
    wait_for_rabbitmq()

    # Connect to RabbitMQ
    credentials = pika.PlainCredentials(RABBIT_USER, RABBIT_PASS)
    conn = pika.BlockingConnection(
        pika.ConnectionParameters(host=RABBIT_HOST, port=RABBIT_PORT, credentials=credentials)
    )
    ch = conn.channel()
    ch.queue_declare(queue=QUEUE, durable=True)
    ch.basic_qos(prefetch_count=1)

    def callback(ch, method, props, body):
        try:
            msg = json.loads(body)
            logging.info(f"Received job: {msg}")
            start_transcriber(msg["job_id"], msg["object_key"])
            ch.basic_ack(method.delivery_tag)
        except Exception as e:
            logging.error(f"Error processing job: {e}")
            ch.basic_nack(method.delivery_tag, requeue=False)

    ch.basic_consume(QUEUE, callback)
    logging.info("Manager started. Waiting for messages...")

    def shutdown(*_):
        logging.info("Stopping manager...")
        ch.stop_consuming()
        conn.close()
        docker_client.close()
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    try:
        ch.start_consuming()
    except Exception:
        logging.exception("Fatal error in manager loop")
        shutdown()


if __name__ == "__main__":
    main()

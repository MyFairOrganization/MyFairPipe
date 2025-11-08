import logging
import os
import shutil
import sys
import tempfile
import time

import ffmpeg
import whisper
from minio import Minio

# --- Config ---
MINIO_EP = os.getenv("MINIO_ENDPOINT", "minio:9000")
ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
JOB_ID = os.getenv("JOB_ID")
OBJECT_KEY = os.getenv("OBJECT_KEY")
upload_bucket = "upload"
result_bucket = "video"

# --- Logging ---
logging.basicConfig(
	level=logging.INFO,
	format="%(asctime)s [%(levelname)s] %(message)s",
	stream=sys.stdout,
)


def wait_for_minio(max_retries: int = 30, delay: int = 2) -> Minio:
	"""Wait for MinIO to be available with retries."""
	client = Minio(MINIO_EP, ACCESS_KEY, SECRET_KEY, secure=False)

	for attempt in range(max_retries):
		try:
			client.list_buckets()
			logging.info("MinIO is ready")
			return client
		except Exception as e:
			if attempt < max_retries - 1:
				logging.warning(
					f"Waiting for MinIO at {MINIO_EP} "
					f"(attempt {attempt + 1}/{max_retries})..."
				)
				time.sleep(delay)
			else:
				raise RuntimeError(
					f"MinIO not available after {max_retries} attempts: {e}"
				)


def format_timestamp(seconds):
	"""Convert seconds to SRT timestamp format (HH:MM:SS,mmm)."""
	hours = int(seconds // 3600)
	minutes = int((seconds % 3600) // 60)
	secs = int(seconds % 60)
	millis = int((seconds % 1) * 1000)
	return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def write_srt(segments, output_path):
	"""Convert Whisper segments to SRT format."""
	with open(output_path, "w", encoding="utf-8") as f:
		for i, segment in enumerate(segments, start=1):
			start = format_timestamp(segment["start"])
			end = format_timestamp(segment["end"])
			text = segment["text"].strip()

			f.write(f"{i}\n")
			f.write(f"{start} --> {end}\n")
			f.write(f"{text}\n\n")


def run_whisper(input_file: str, output_dir: str) -> str:
	"""Run Whisper transcription using Python API and return path to generated SRT."""
	try:
		logging.info("Loading Whisper model (small)...")
		model = whisper.load_model("small", download_root="/app/models")

		# Transcribe
		logging.info(f"Transcribing audio from {input_file}...")
		result = model.transcribe(
			input_file,
			verbose=False,
			language=None,
			task="transcribe",
		)

		# Generate SRT file
		stem = os.path.splitext(os.path.basename(input_file))[0]
		srt_path = os.path.join(output_dir, f"{stem}.srt")

		logging.info(f"Writing SRT to {srt_path}...")
		write_srt(result["segments"], srt_path)

		logging.info(f"Transcription complete. Detected language: {result.get('language', 'unknown')}")
		return srt_path

	except Exception as e:
		logging.error(f"Whisper transcription failed: {e}")
		raise


def main():
	if not JOB_ID or not OBJECT_KEY:
		logging.error("Missing JOB_ID or OBJECT_KEY environment variables")
		sys.exit(1)

	logging.info(f"Starting transcription for job {JOB_ID}, object {OBJECT_KEY}")
	minio = wait_for_minio()

	tmp_dir = tempfile.mkdtemp()
	local_in = os.path.join(tmp_dir, os.path.basename(OBJECT_KEY))
	local_srt = os.path.join(tmp_dir, f"{JOB_ID}.srt")
	local_vtt = os.path.join(tmp_dir, f"{JOB_ID}.vtt")

	try:
		logging.info(f"Downloading {OBJECT_KEY} from bucket {upload_bucket}...")
		minio.fget_object(upload_bucket, OBJECT_KEY, local_in)
		logging.info(f"Downloaded to {local_in}")

		logging.info("Running Whisper transcription...")
		generated_srt = run_whisper(local_in, tmp_dir)

		shutil.move(generated_srt, local_srt)

		logging.info("Converting SRT to WebVTT...")
		ffmpeg.input(local_srt).output(local_vtt, format="webvtt").run(quiet=True, overwrite_output=True)
		logging.info(f"VTT file prepared at {local_vtt}")

		local_subs_m3u8 = os.path.join(tmp_dir, "subs_en.m3u8")
		with open(local_subs_m3u8, "w", encoding="utf-8") as f:
			f.write("#EXTM3U\n")
			f.write("#EXT-X-VERSION:3\n")
			f.write("#EXTINF:9999999,\n")
			f.write(f"{os.path.basename(local_vtt)}\n")
			f.write("#EXT-X-ENDLIST\n")

		subs_prefix = f"{JOB_ID}/subtitles"
		minio.fput_object(
			result_bucket,
			f"{subs_prefix}/{os.path.basename(local_vtt)}",
			local_vtt,
			content_type="text/vtt"
		)
		minio.fput_object(
			result_bucket,
			f"{subs_prefix}/subs_en.m3u8",
			local_subs_m3u8,
			content_type="application/vnd.apple.mpegurl"
		)
		logging.info("Uploaded VTT and subtitles playlist to MinIO")

		master_local = os.path.join(tmp_dir, "master.m3u8")
		master_key = f"{JOB_ID}/master.m3u8"
		while True:
			try:
				minio.fget_object(result_bucket, master_key, master_local)
				logging.info("Downloaded existing master.m3u8")
				break
			except Exception:
				pass

		subtitle_entry = (
			'#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="English",'
			'DEFAULT=YES,AUTOSELECT=YES,LANGUAGE="en",'
			f'URI="subtitles/subs_en.m3u8"\n'
		)

		with open(master_local, "r+", encoding="utf-8") as f:
			content = f.read()
			if "TYPE=SUBTITLES" not in content:
				idx = content.find("#EXT-X-STREAM-INF")
				if idx != -1:
					content = content[:idx] + subtitle_entry + content[idx:]
				else:
					content += subtitle_entry
				f.seek(0)
				f.write(content)
				f.truncate()
				logging.info("Added subtitles entry to master.m3u8")

		minio.fput_object(
			result_bucket,
			master_key,
			master_local,
			content_type="application/vnd.apple.mpegurl"
		)
		logging.info(f"Uploaded updated master.m3u8 to {result_bucket}/{master_key}")

	except Exception:
		logging.exception(f"Job {JOB_ID} failed")
		sys.exit(1)
	finally:
		if os.path.exists(tmp_dir):
			shutil.rmtree(tmp_dir)
			logging.info("Cleaned up temporary files")


if __name__ == "__main__":
	main()

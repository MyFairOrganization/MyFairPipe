import logging
import os
import shutil
import sys
import tempfile
import time
from typing import Dict, Tuple

import ffmpeg
from minio import Minio

# --- Config ---
MINIO_EP = os.getenv("MINIO_ENDPOINT", "minio:9000")
ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
JOB_ID = os.getenv("JOB_ID")
OBJECT_KEY = os.getenv("OBJECT_KEY")
BUCKET = "video"

ENABLED_RENDITIONS = os.getenv("RENDITIONS", "360p,1080p").split(",")

# HLS settings
HLS_ENABLED = os.getenv("HLS_ENABLED", "true").lower() == "true"
HLS_SEGMENT_TIME = int(os.getenv("HLS_SEGMENT_TIME", "6"))
HLS_PLAYLIST_TYPE = os.getenv("HLS_PLAYLIST_TYPE", "vod")

# --- Logging ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout,
)

# All available renditions
ALL_RENDITIONS = {
    "240p": {"size": "426:240", "bitrate": "400k"},
    "360p": {"size": "640:360", "bitrate": "600k"},
    "480p": {"size": "854:480", "bitrate": "1000k"},
    "720p": {"size": "1280:720", "bitrate": "2800k"},
    "1080p": {"size": "1920:1080", "bitrate": "5000k"}
}


def wait_for_minio(max_retries: int = 30, delay: int = 2) -> Minio | None:
    """Wait for MinIO to become available."""
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


def get_video_info(src: str) -> Dict:
    """Probe video file to get resolution and other metadata."""
    try:
        probe = ffmpeg.probe(src)
        video_stream = next(
            (s for s in probe["streams"] if s["codec_type"] == "video"), None
        )
        audio_stream = next(
            (s for s in probe["streams"] if s["codec_type"] == "audio"), None
        )

        info = {
            "width": 0,
            "height": 0,
            "duration": 0,
            "has_audio": False,
            "audio_codec": None,
        }

        if video_stream:
            info["width"] = int(video_stream["width"])
            info["height"] = int(video_stream["height"])
            info["duration"] = float(probe["format"].get("duration", 0))

        if audio_stream:
            info["has_audio"] = True
            info["audio_codec"] = audio_stream.get("codec_name")
            logging.info(f"Audio detected: codec={info['audio_codec']}, "
                         f"channels={audio_stream.get('channels')}, "
                         f"sample_rate={audio_stream.get('sample_rate')}")
        else:
            logging.warning("NO AUDIO STREAM DETECTED in source file!")

        return info
    except Exception as e:
        logging.warning(f"Could not probe video: {e}")
    return {"width": 0, "height": 0, "duration": 0, "has_audio": False, "audio_codec": None}


def filter_renditions_by_source(
        source_height: int, renditions: Dict
) -> Dict[str, Dict]:
    """Only include renditions that are equal to or smaller than source."""
    filtered = {}
    for label, cfg in renditions.items():
        target_height = int(cfg["size"].split(":")[1])
        if target_height <= source_height:
            filtered[label] = cfg
        else:
            logging.info(
                f"Skipping {label} (source is {source_height}p, target is {target_height}p)"
            )
    return filtered


def generate_mp4_rendition(src: str, dst: str, size: str, bitrate: str) -> None:
    width, height = map(int, size.split(":"))

    input_stream = ffmpeg.input(src)

    video = input_stream['v:0'].filter("scale", width, height)
    audio = input_stream['a:0']  # CORRECT

    stream = (
        ffmpeg.output(
            video,
            audio,
            dst,
            vcodec="libx264",
            preset="faster",
            video_bitrate=bitrate,
            acodec="aac",
            audio_bitrate="128k",
            ar=48000,
            ac=2,
            movflags="+faststart",
        )
        .overwrite_output()
    )

    logging.info(f"Running ffmpeg MP4 rendition: {dst}")
    # ffmpeg.run(stream, capture_stdout=True, capture_stderr=True)
    try:
        out, err = ffmpeg.run(stream, capture_stdout=True, capture_stderr=True)
        logging.info(f"FFmpeg stderr (last 500 chars): {err.decode('utf-8')[-500:]}")
    except ffmpeg.Error as e:
        logging.error(f"FFmpeg error: {e.stderr.decode('utf-8')}")
        raise


def generate_hls_rendition(
        src: str, output_dir: str, label: str, size: str, bitrate: str
) -> Tuple[str, str]:
    """Generate HLS rendition with .m3u8 playlist and .ts segments."""
    width, height = map(int, size.split(":"))

    playlist_file = os.path.join(output_dir, f"{label}.m3u8")
    segment_pattern = os.path.join(output_dir, f"{label}_%03d.ts")

    # Build the command with explicit audio handling
    input_stream = ffmpeg.input(src)

    # Split and process video and audio separately
    video = input_stream['v:0'].filter("scale", width, height)
    audio = input_stream['a:0']

    stream = (
        ffmpeg.output(
            video,
            audio,
            playlist_file,
            vcodec="libx264",
            preset="faster",
            video_bitrate=bitrate,
            acodec="aac",
            audio_bitrate="128k",
            ar=48000,  # Audio sample rate
            ac=2,  # Stereo audio
            format="hls",
            hls_time=HLS_SEGMENT_TIME,
            hls_playlist_type=HLS_PLAYLIST_TYPE,
            hls_segment_filename=segment_pattern,
            start_number=0,
        )
        .overwrite_output()
    )

    logging.info(f"Running ffmpeg HLS rendition: {label}")
    try:
        out, err = ffmpeg.run(stream, capture_stdout=True, capture_stderr=True)
        logging.info(f"FFmpeg output for {label}: {err.decode('utf-8')[-500:]}")
    except ffmpeg.Error as e:
        logging.error(f"FFmpeg error for {label}: {e.stderr.decode('utf-8')}")
        raise

    return playlist_file, output_dir


def create_master_playlist(
        output_dir: str, renditions: Dict[str, Dict], base_name: str
) -> str:
    """Create HLS master playlist that references all rendition playlists."""
    master_file = os.path.join(output_dir, f"{base_name}_master.m3u8")

    with open(master_file, "w") as f:
        f.write("#EXTM3U\n")
        f.write("#EXT-X-VERSION:3\n\n")

        for label, cfg in renditions.items():
            width, height = map(int, cfg["size"].split(":"))
            bitrate_num = int(cfg["bitrate"].replace("k", "000"))

            f.write(
                f'#EXT-X-STREAM-INF:BANDWIDTH={bitrate_num},'
                f'RESOLUTION={width}x{height}\n'
            )
            f.write(f"{label}/{label}.m3u8\n")

    logging.info(f"Created master playlist: {master_file}")
    return master_file


def upload_hls_files(
        minio: Minio, output_dir: str, base_name: str, renditions: Dict[str, Dict]
) -> None:
    """Upload all HLS files (.m3u8 and .ts) to MinIO with organized structure."""
    # Upload master playlist to root
    master_file = os.path.join(output_dir, f"{base_name}_master.m3u8")
    if os.path.exists(master_file):
        object_path = os.path.join(base_name, "master.m3u8")
        logging.info(f"Uploading master playlist -> {BUCKET}/{object_path}")
        minio.fput_object(BUCKET, object_path, master_file)

    # Upload each rendition's files to its own folder
    for label in renditions.keys():
        playlist_file = os.path.join(output_dir, f"{label}.m3u8")

        # Upload playlist
        if os.path.exists(playlist_file):
            object_path = os.path.join(base_name, label, f"{label}.m3u8")
            logging.info(f"Uploading {label} playlist -> {BUCKET}/{object_path}")
            minio.fput_object(BUCKET, object_path, playlist_file)

        # Upload all TS segments for this rendition
        for file in os.listdir(output_dir):
            if file.startswith(f"{label}_") and file.endswith(".ts"):
                local_path = os.path.join(output_dir, file)
                segment_object_path = os.path.join(base_name, label, file)

                logging.info(f"Uploading segment -> {BUCKET}/{segment_object_path}")
                minio.fput_object(BUCKET, segment_object_path, local_path)


def main():
    if not JOB_ID or not OBJECT_KEY:
        logging.error("Missing JOB_ID or OBJECT_KEY environment variables")
        sys.exit(1)

    logging.info(f"Starting transcoding job {JOB_ID} for object {OBJECT_KEY}")
    logging.info(f"Enabled renditions: {ENABLED_RENDITIONS}")
    logging.info(f"HLS enabled: {HLS_ENABLED}")

    # Filter requested renditions
    renditions = {
        k: v for k, v in ALL_RENDITIONS.items() if k in ENABLED_RENDITIONS
    }

    if not renditions:
        logging.error(f"No valid renditions found in: {ENABLED_RENDITIONS}")
        sys.exit(1)

    minio = wait_for_minio()
    tmp_root = tempfile.mkdtemp()
    original_file = os.path.join(tmp_root, os.path.basename(OBJECT_KEY))

    try:
        # Download original file
        logging.info(f"Downloading {OBJECT_KEY} from bucket {BUCKET}...")
        minio.fget_object(BUCKET, OBJECT_KEY, original_file)
        logging.info("Download complete")

        # Get video info and filter renditions
        video_info = get_video_info(original_file)
        logging.info(
            f"Source video: {video_info['width']}x{video_info['height']}, "
            f"duration: {video_info['duration']}s"
        )

        renditions = filter_renditions_by_source(video_info["height"], renditions)

        if not renditions:
            logging.warning("No suitable renditions after filtering by source resolution")
            return

        base_name = os.path.splitext(os.path.basename(OBJECT_KEY))[0]
        base_object_path = os.path.splitext(OBJECT_KEY)[0]

        # Generate MP4 renditions
        mp4_paths = []
        for label, cfg in renditions.items():
            out_file = os.path.join(tmp_root, f"{base_name}_{label}.mp4")
            logging.info(f"Creating {label} MP4 rendition...")
            generate_mp4_rendition(original_file, out_file, cfg["size"], cfg["bitrate"])
            mp4_paths.append((label, out_file))
            logging.info(f"{label} MP4 rendition saved to {out_file}")

        # Upload MP4 renditions with new structure
        for label, local_path in mp4_paths:
            object_name = f"{label}.mp4"
            object_path = os.path.join(base_name, label, object_name)
            logging.info(f"Uploading {label} MP4 -> {BUCKET}/{object_path}")
            minio.fput_object(BUCKET, object_path, local_path)
            logging.info(f"{label} MP4 uploaded.")

        # Generate HLS renditions if enabled
        if HLS_ENABLED:
            hls_dir = os.path.join(tmp_root, "hls")
            os.makedirs(hls_dir, exist_ok=True)

            logging.info("Generating HLS renditions...")
            for label, cfg in renditions.items():
                generate_hls_rendition(
                    original_file, hls_dir, label, cfg["size"], cfg["bitrate"]
                )

            # Create master playlist
            create_master_playlist(hls_dir, renditions, base_name)

            # Upload all HLS files
            upload_hls_files(minio, hls_dir, base_name, renditions)
            logging.info("HLS renditions uploaded.")

        logging.info(f"All renditions created successfully for job {JOB_ID}")

    except Exception:
        logging.exception(f"Job {JOB_ID} failed")
        raise
    finally:
        if os.path.exists(tmp_root):
            shutil.rmtree(tmp_root)
            logging.info("Cleaned up temporary files")


if __name__ == "__main__":
    main()

# syntax=docker/dockerfile:1.4
ARG BASE_IMAGE=python-base:latest

FROM ${BASE_IMAGE}

ARG WORKER=Pipes/worker/worker.py

WORKDIR /app
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir openai-whisper torch torchaudio

RUN mkdir -p /app/models && \
    python -c "import whisper; whisper.load_model('small', download_root='/app/models')"

COPY ${WORKER} /app/worker.py

CMD ["python", "worker.py"]
# syntax=docker/dockerfile:1.4
ARG BASE_IMAGE=python-base:latest

FROM ${BASE_IMAGE}

ARG REQUIREMENTS=dockerfiles/requirements/requirements.txt
ARG WORKER=Pipes/worker/worker.py

WORKDIR /app
COPY ${REQUIREMENTS} /tmp/requirements.txt
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r /tmp/requirements.txt

RUN mkdir -p /app/models && \
    python -c "import whisper; whisper.load_model('small', download_root='/app/models')"

COPY ${WORKER} /app/worker.py

CMD ["python", "worker.py"]
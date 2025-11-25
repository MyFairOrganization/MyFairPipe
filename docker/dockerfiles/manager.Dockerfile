# syntax=docker/dockerfile:1.4
ARG BASE_IMAGE=/python-base:latest

FROM ${BASE_IMAGE}
WORKDIR /app

RUN --mount=type=cache,target=/root/.cache/pip

CMD ["python", "manager.py"]

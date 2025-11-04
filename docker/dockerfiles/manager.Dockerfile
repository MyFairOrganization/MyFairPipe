# syntax=docker/dockerfile:1.4
ARG BASE_IMAGE=mepipe.tail0e128.ts.net:5000/python-base:latest

FROM ${BASE_IMAGE}
WORKDIR /app

RUN --mount=type=cache,target=/root/.cache/pip

CMD ["python", "manager.py"]

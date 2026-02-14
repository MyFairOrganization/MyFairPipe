# MyFairPipe

---
<p align="center"> <strong>Privacy-First Modular Video Streaming Platform</strong><br/> Built for fairness, transparency, and scalable media processing. </p>

---

## Features

- Video-Upload for registrierte Users
- Video-Streaming without requiered Login
- Like / Dislike System
- Like-based Feed-Sort
- Automatic subtitle-generation
- Adaptive bitrate streaming
- Secure Authentification

---

## Tech Stack

### Frontend

- Vue 3
- TypeScript
- Vite

### Backend

- Node.js (Next.js API Routes)
- TypeScript
- JWT Auth

### Processing / Pipelines

- Python Worker
- RabbitMQ (Job Queue)
- Manager/Worker Pattern
- Video Resolution Pipeline
- Subtitle Transcription Pipeline

### Storage & Infrastruktur

- PostgreSQL
- Redis
- Elasticsearch
- MinIO
- Nginx
- Docker & Docker Compose

---

## Projektstruktur

```
├── frontend/ # Vue Frontend
├── backend/ # API & Business Logic
├── Pipes/ # Video & Subtitle Worker Pipelines
├── configuration/ # Nginx + SQL Setup
├── docker/ # Dockerfiles & Service Config
├── docker-compose.yaml
└── README.md
```

---

## Lokales Setup (Docker)

> Run all commands in the root directory.

### 1. Create the `.env` file

Create a `.env` file in the root directory.
(Example see `.env.example`)

### 2. Build

```bash
docker compose build python-base-image
docker compose build
```

```bash
cd frontend && npm ci
cd ../backend && npm ci
cd ..
```

```bash
docker compose --profile dev up -d
```
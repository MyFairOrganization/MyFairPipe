# ITP_Project_1sem

## MyFairPipe

# Setup

How to work with the docker compose?
<br>
`(everything in root dir)`

### 1. Make a .env file:

```env
# Minio
MINIO_USER=minioadmin
MINIO_PASSWORD=minioadmin

# RabbitMQ
RABBIT_HOST=rabbitmq
RABBIT_PORT=5672
RABBIT_USER=admin
RABBIT_PASS=admin

# PostGreSQL
POSTGRES_USER=PostGresUser
POSTGRES_PASS=PostGresPass
POSTGRES_DB=app

# Database URLs
POSTGRES="postgres://${POSTGRES_USER}:${POSTGRES_PASS}@postgres:5432/${POSTGRES_DB}"
REDIS=redis://redis:6379/0
ELASTICSEARCH_URL=http://elasticsearch:9200

# JWT
JWT_SECRET=changeme

# Domain
DOMAIN=https://myfairpipe.com
API_DOMAIN=https://api.myfairpipe.com
CDN_DOMAIN=https://cdn.myfairpipe.com

# Nginx
DOMAIN_HOST=myfairpipe.com
API_DOMAIN_HOST=api.myfairpipe.com
CDN_DOMAIN_HOST=cdn.myfairpipe.com
```

### 2. Build

```bash
docker compose build python-base-image
docker compose build
```

### 3. Install backend & frontend locally

#### In the corresponding folders

```bash
cd ./frontend
npm install
cd ./../backend
npm install
cd ./..
```

### 4. Start

```bash
 docker compose --profile dev up -d
```

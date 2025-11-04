# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---- Dependencies ----
FROM base AS deps
RUN npm ci

# ---- Builder (Production Build) ----
FROM deps AS builder
COPY . .
RUN npm run build

# ---- Production Runtime ----
FROM node:20-alpine AS prod
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Only copy /app/public if it exists in builder
RUN if [ -d /app/public ]; then mkdir -p /app/public && cp -r /app/public/* ./public/; else mkdir -p ./public; fi

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]



# ---- Development ----
FROM deps AS dev
WORKDIR /app
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]

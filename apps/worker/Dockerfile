FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml ./
COPY apps/worker/package.json ./apps/worker/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile=false

COPY apps/worker ./apps/worker
COPY prisma ./prisma

RUN pnpm --filter worker build && pnpm --filter web prisma:generate

CMD ["pnpm", "--filter", "worker", "start"]

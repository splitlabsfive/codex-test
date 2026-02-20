# Etsy Motion

Etsy Motion is an MVP web app that converts a single product image into a 15-second 1080x1080 MP4 with smooth camera-style movement and subtle polish.

## Stack

- Monorepo: pnpm workspaces
- `apps/web`: Next.js App Router + TypeScript + Tailwind
- `apps/worker`: Node.js TypeScript background worker + FFmpeg
- Postgres + Prisma (`Job` queue table)
- S3-compatible object storage (AWS S3 or Cloudflare R2)

## Features

- Upload 1 image (`jpg`/`png`) and pick preset:
  - `slow_zoom`
  - `pan_lr`
  - `push_in_light`
- Creates async render job via API
- Polling status updates every 2 seconds
- Preview + download generated MP4 when completed
- Worker handles retries/errors and marks failed jobs with reason

## Project structure

```txt
apps/
  web/      # Next.js frontend + API routes
  worker/   # polling worker that renders videos with ffmpeg
prisma/     # schema + SQL migration
.env.example
```

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy env file:

```bash
cp .env.example .env
```

3. Configure `.env` values for Postgres + S3/R2.

4. Apply migration + generate Prisma client:

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

## Local development

Run web app:

```bash
pnpm dev:web
```

Run worker in another terminal:

```bash
pnpm dev:worker
```

Open `http://localhost:3000/upload`.

## API

- `POST /api/jobs`
  - multipart form fields:
    - `image` (jpg/png)
    - `preset` (`slow_zoom|pan_lr|push_in_light`)
  - response: `{ jobId }`
- `GET /api/jobs/:id`
  - response: `{ id, status, outputUrl, errorMessage }`

## Worker Docker image

Build:

```bash
docker build -t etsy-motion-worker -f apps/worker/Dockerfile .
```

Run:

```bash
docker run --env-file .env etsy-motion-worker
```

## FFmpeg rendering notes

- Output: 15s, 1080x1080, H.264 (`libx264`), `yuv420p`, no audio
- Presets:
  - `slow_zoom`: eased center zoom-in
  - `pan_lr`: smooth left-to-right pan
  - `push_in_light`: zoom-in + programmatically generated warm light-leak overlay

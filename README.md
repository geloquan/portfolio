# Portfolio SPA

A Vite + React single-page portfolio focused on academic research, healthcare systems projects, and client-outcome delivery.

## Features

- Distinctive, high-contrast portfolio layout with light/dark mode
- Academic research highlight section for a YOLOv8 thesis project
- Thesis paper support with:
  - visual in-page preview
  - downloadable thesis link
- Resume download call-to-action
- Project portfolio covering:
  - Enterprise medical doctor platform (Project 1)
  - Kotlin + YOLOv8 OBB mobile research app (Project 2)
  - Compliance-focused doctor directory system for a Bacolod medical center (Project 3)
- Free consultation positioning via video-call platforms
- Cloudflare R2 media integration (Project 1 video and profile media)

## Environment variables

Copy `.env.example` to `.env.local` for development and `.env.production` for production:

```bash
cp .env.example .env.local
cp .env.example .env.production
```

Set the following values:

- `CLOUDFLARE_R2_PROFILE_IMAGE_URL`
- `CLOUDFLARE_R2_PROJECT_ONE_MEDIA_URL`
- `VITE_THESIS_PAPER_URL`

## Local development

```bash
npm ci
npm run dev
```

## Build

```bash
npm run build
```

## Docker (production with Caddy)

Use Compose for the production stack. It runs two uniquely named services:

- `portfolio` (`portfolio-app:local`) — builds the app with env vars and serves it on internal port `80`
- `caddy` (`portfolio-caddy:local`) — handles TLS, redirects HTTP to HTTPS, and reverse proxies to `portfolio` on internal port `80`

Compose reads build-time variables from your shell or a local `.env` file in the repo root.

```bash
cp .env.example .env
```

Set these deployment variables in `.env` for HTTPS:

- `SITE_HOSTNAMES=marcoangeloquanico.work, www.marcoangeloquanico.work`

Then start both services:

```bash
docker compose up --build
```

Open `https://marcoangeloquanico.work` after DNS is pointed to the VPS and certificates are issued.

For local/non-root testing where binding to 80/443 is not available, override host ports:

```bash
CADDY_HTTP_PORT=8080 CADDY_HTTPS_PORT=8443 docker compose up --build
```

The production deployment workflow also runs the full stack (`docker compose up -d --build`) so both `portfolio` and `caddy` are always running.

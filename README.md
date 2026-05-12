# Portfolio SPA

A Vite + React single-page portfolio with light/dark mode, responsive navigation, project previews, and Cloudflare-configurable media.

## Features

- Primary branding color: `#92DCE5`
- Light/dark mode toggle
- Responsive navigation menu and mobile layout support
- Scroll-aware floating “island” navigation style
- Smooth section transitions with reduced-motion support for low-power devices
- Skill section highlighting three.js floater creation progress
- Projects section (under 10 projects) with:
  - avatar/logo
  - image/video preview from Cloudflare URLs (via `.env`)
  - optional YouTube embed preview
  - optional Facebook post-style preview
- Education section and social links footer

## Environment variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Use Cloudflare-hosted URLs in these variables:

- `VITE_PROJECT_ONE_MEDIA_URL`
- `VITE_PROJECT_TWO_MEDIA_URL`
- `VITE_PROJECT_THREE_MEDIA_URL`
- `VITE_PROJECT_FOUR_MEDIA_URL`

Optional social preview links are also supported:

- `VITE_PROJECT_ONE_YOUTUBE_URL`
- `VITE_PROJECT_TWO_YOUTUBE_URL`
- `VITE_PROJECT_ONE_FACEBOOK_URL`
- `VITE_PROJECT_THREE_FACEBOOK_URL`

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

Build and run with Docker CLI using CPU/RAM limits:

```bash
docker build -t portfolio .
docker run --rm -p 80:80 -p 443:443 --cpus=0.5 --memory=200m portfolio
```

Or use Compose (Caddy serves the built SPA on port `80`):

```bash
docker compose up --build
```

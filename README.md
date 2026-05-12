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
  - image/video preview from Cloudflare R2 URLs (via `.env`)
  - optional YouTube embed preview
  - optional Facebook post-style preview
- Education section and social links footer

## Environment variables

Copy `.env.example` to `.env.local` for development and `.env.production` for production:

```bash
cp .env.example .env.local
cp .env.example .env.production
```

Set Cloudflare R2 media URLs with the `CLOUDFLARE_R2_` prefix:

- `CLOUDFLARE_R2_PROFILE_IMAGE_URL`
- `CLOUDFLARE_R2_PROJECT_ONE_MEDIA_URL`
- `CLOUDFLARE_R2_PROJECT_TWO_MEDIA_URL`
- `CLOUDFLARE_R2_PROJECT_THREE_MEDIA_URL`
- `CLOUDFLARE_R2_PROJECT_FOUR_MEDIA_URL`

Vite is configured to expose both `CLOUDFLARE_R2_*` and `CLOUDFLARE_R2_*` prefixes to the app, so either naming style works during migration.

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

Compose treats the preview and Cloudflare R2 variables as optional for local/default runs, so leaving them unset will not emit Docker variable warnings.

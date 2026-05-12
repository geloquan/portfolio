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

Use Compose for the production stack. It runs two uniquely named services:

- `portfolio` (`portfolio-app:local`) — builds the app with env vars and serves it on internal port `80`
- `caddy` (`portfolio-caddy:local`) — reverse proxies public port `80` to `portfolio`

Compose reads build-time variables from your shell or a local `.env` file in the repo root.

```bash
cp .env.example .env
```

Then start both services:

```bash
docker compose up --build
```

The production deployment workflow also runs the full stack (`docker compose up -d --build`) so both `portfolio` and `caddy` are always running.

## Secure VPS deploy keys for Caddy deployments

The deploy workflow SSHes into the VPS and pulls this repository using a dedicated deploy key (`~/.ssh/portfolio_deploy_key`).

On the VPS:

```bash
cd ~/portfolio
chmod +x ./generate-deploy-keys.sh
./generate-deploy-keys.sh
```

Then:

1. Copy the printed public key (`~/.ssh/portfolio_deploy_key.pub`).
2. Add it as a **read-only Deploy Key** in GitHub: `https://github.com/geloquan/portfolio/settings/keys`
3. Ensure the private key remains on the VPS at `~/.ssh/portfolio_deploy_key`.

If the key is missing, deployment now fails early with a clear error and guidance before any git pull/clone step.

> Note: `VPS_SSH_KEY` in GitHub Actions secrets is still required for Actions to connect to the VPS. The deploy key above is separately used by the VPS for secure git operations.
>
> For unattended deployments, `generate-deploy-keys.sh` uses an empty passphrase by default. Keep this key read-only and dedicated to this repository. You can set `DEPLOY_KEY_PASSPHRASE` before running the script if you want a passphrase-protected key.

## Troubleshooting: "Host Error" on the domain

If you see a generic **Host Error** instead of the site:

1. Confirm deployment started the full Compose stack (not only `portfolio`):
   ```bash
   docker compose ps
   ```
   You should see both `portfolio` and `caddy` in `Up` status.
2. Confirm DNS points both hostnames to the VPS public IP:
   - `marcoangeloquanico.work` (A/AAAA as needed)
   - `www.marcoangeloquanico.work` (CNAME or A/AAAA)
3. If DNS is proxied through a provider (Cloudflare, etc.), verify the proxy/origin settings still target this VPS and are not pointing at an old host.

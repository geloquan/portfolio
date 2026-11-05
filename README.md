# Portfolio SPA

A Vite + React single-page portfolio with light/dark mode, responsive navigation, project previews, and Cloudflare-configurable media.

The root route (`/`) is the concise home view. The detailed portfolio is available at
`/details`; `/archive` remains as a backwards-compatible alias for existing links.

## Features

- Organic Minimalism interface with accessible light/dark themes
- Persistent light/dark mode toggle
- Responsive navigation menu and mobile layout support
- Scroll-aware floating �island� navigation style
- Smooth section transitions with reduced-motion support for low-power devices
- Skill section highlighting three.js floater creation progress
- Projects section with healthcare and research project showcases
- Research thesis spotlight with:
  - visual preview via PDF URL
  - downloadable thesis action
  - best thesis award context

## Environment variables

Copy `.env.example` to `.env.local` for development and `.env.production` for production:

```bash
cp .env.example .env.local
cp .env.example .env.production
```

Set Cloudflare R2 object keys and credentials through your deployment environment or secret store:

- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_TOKEN_VALUE` (optional session token)
- `CLOUDFLARE_R2_BUCKET_NAME`
- `CLOUDFLARE_R2_S3_ENDPOINT`
- `CLOUDFLARE_R2_PROFILE_IMAGE_OBJECT_KEY`
- `CLOUDFLARE_R2_PROJECT_ONE_MEDIA_OBJECT_KEY` (AI legal system)
- `CLOUDFLARE_R2_MEDICAL_ARTS_MEDIA_OBJECT_KEY`
- `CLOUDFLARE_R2_PROJECT_TWO_MEDIA_OBJECT_KEY` (seashell research)
- `CLOUDFLARE_R2_PROJECT_THREE_MEDIA_OBJECT_KEY` (doctor directory)
- `CLOUDFLARE_R2_THESIS_PAPER_OBJECT_KEY`

Optional build-time overrides:

- `VITE_THESIS_PAPER_URL`
- `VITE_PROFILE_IMAGE_URL` (optional public profile image URL)
- `VITE_PROJECT_MEDICAL_ARTS_MEDIA_URL`
- `VITE_PROJECT_AI_LEGAL_MEDIA_URL`
- `VITE_PROJECT_SEASHELL_MEDIA_URL`
- `VITE_PROJECT_DOCTOR_DIRECTORY_MEDIA_URL`

All `VITE_*` values are public build-time URLs. Do not put API credentials or private tokens in them. In Docker builds, configure R2 object keys and credentials through the deployment's secret mechanism; credentials must never be committed.

## Portfolio content audit

`cv.md` and `cv-quanico.pdf` are the source of truth for professional history and CV-reported outcomes. The public site clearly labels unverified claims rather than inventing details. Check `TODOs.md` for the remaining owner actions and `docs/portfolio-audit.md` for the skill-by-skill findings, CV coverage, and validation record. Run `npm run check:placeholders` to detect newly added, unreviewed owner markers in application code. Current, deliberately reviewed verification markers are allowlisted in the script; review the audit checklist before launch. These audit files describe decisions and gaps only; the owner remains responsible for verifying claims and approving public materials.

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

- `portfolio` (`portfolio-app:local`) � builds the app with env vars and serves it on internal port `80`
- `caddy` (`portfolio-caddy:local`) � handles TLS, redirects HTTP to HTTPS, and reverse proxies to `portfolio` on internal port `80`

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
4. Confirm ports `80/tcp` and `443/tcp` are open in the VPS firewall/security group and mapped by Compose:
   ```bash
   docker compose ps --format "table {{.Name}}\t{{.Ports}}"
   ```
   Expected `caddy` mappings include `:80->80/tcp` and `:443->443/tcp`.
5. If HTTPS is not issuing, verify `.env` includes `SITE_HOSTNAMES`, then restart:
   ```bash
   docker compose up -d --build
   ```

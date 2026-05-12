#!/usr/bin/env bash

set -euo pipefail

KEY_PATH="${1:-$HOME/.ssh/portfolio_deploy_key}"
HOSTNAME_SAFE="$(hostname | tr -cs '[:alnum:].-_' '_')"
KEY_COMMENT="${2:-portfolio-deploy@${HOSTNAME_SAFE}}"
REPO_SLUG="${3:-${REPO_SLUG:-geloquan/portfolio}}"
REPO_SETTINGS_URL="https://github.com/${REPO_SLUG}/settings/keys"
DEPLOY_KEY_PASSPHRASE="${DEPLOY_KEY_PASSPHRASE:-}"

log() {
  printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1"
}

if [ -f "$KEY_PATH" ] || [ -f "${KEY_PATH}.pub" ]; then
  log "❌ Deployment key already exists at $KEY_PATH."
  log "   Remove/backup existing keys first, or pass a different key path:"
  log "   ./generate-deploy-keys.sh ~/.ssh/another_deploy_key"
  exit 1
fi

KEY_DIR="$(dirname "$KEY_PATH")"
mkdir -p "$KEY_DIR"
if [ "$KEY_DIR" = "$HOME/.ssh" ]; then
  chmod 700 "$KEY_DIR"
fi

log "🔐 Generating ed25519 deploy key at $KEY_PATH"
if [ -z "$DEPLOY_KEY_PASSPHRASE" ]; then
  log "ℹ️ Using an empty passphrase for non-interactive deploy automation (read-only deploy key recommended)."
fi
ssh-keygen -t ed25519 -f "$KEY_PATH" -C "$KEY_COMMENT" -N "$DEPLOY_KEY_PASSPHRASE"
chmod 600 "$KEY_PATH"
chmod 644 "${KEY_PATH}.pub"

log "✅ Deploy key pair generated."
log "📌 Next steps:"
log "   1) Add this public key as a read-only deploy key in GitHub:"
log "      $REPO_SETTINGS_URL"
log "   2) Keep the private key on the VPS at $KEY_PATH"
log "   3) Re-run deployment workflow."
echo
cat "${KEY_PATH}.pub"

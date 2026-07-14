#!/usr/bin/env bash
# Deploy apps/web to Vercel and print the production URL.
# Requires: VERCEL_TOKEN (https://vercel.com/account/tokens)
# Optional: VERCEL_ORG_ID, VERCEL_PROJECT_ID (skips interactive link)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB="$ROOT/apps/web"

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "Missing VERCEL_TOKEN."
  echo "Create one at https://vercel.com/account/tokens then:"
  echo "  export VERCEL_TOKEN=…"
  echo "  pnpm deploy:vercel"
  exit 1
fi

cd "$WEB"

echo "→ Pulling Vercel project metadata (if linked)…"
npx --yes vercel@latest pull --yes --environment=production --token "$VERCEL_TOKEN" || true

echo "→ Deploying production…"
npx --yes vercel@latest deploy --prod --yes --token "$VERCEL_TOKEN" | tee /tmp/tell-vercel-deploy.log
URL="$(tail -n 1 /tmp/tell-vercel-deploy.log)"

# Prefer the Production alias line when present (portable: no ripgrep required)
PROD_URL="$(grep -Eo 'https://[a-zA-Z0-9.-]+\.vercel\.app' /tmp/tell-vercel-deploy.log | tail -n 1 || true)"
FINAL_URL="${PROD_URL:-$URL}"

echo ""
echo "Production URL: $FINAL_URL"
echo ""
echo "Next:"
echo "  1. Vercel → Storage → Create Database → Neon  (or paste DATABASE_URL)"
echo "  2. GitHub → Settings → Actions → Variables → TELL_PREVIEW_URL = $FINAL_URL"
echo "  3. Redeploy after DATABASE_URL is set so share links persist"

#!/usr/bin/env sh
# Deploys dist/ to Cloudflare Workers: ./scripts/deploy.sh dev|prod
#   dev  → https://dev-docs.synapse-medical.fr (not indexed)
#   prod → https://docs.synapse-medical.fr
# Authentication: "npx wrangler login" locally, or CLOUDFLARE_API_TOKEN and
# CLOUDFLARE_ACCOUNT_ID in CI.
set -eu

cd "$(dirname "$0")/.."

test -f dist/index.html || { echo "dist/ is missing: run \"npm run build\" first." >&2; exit 1; }

case "${1:-}" in
  dev)
    # Staging: keep it out of search engines.
    grep -q 'X-Robots-Tag' dist/_headers || printf '\n/*\n  X-Robots-Tag: noindex, nofollow\n' >> dist/_headers
    npx wrangler deploy --env dev
    ;;
  prod)
    npx wrangler deploy --env=""
    ;;
  *)
    echo "Usage: $0 dev|prod" >&2
    exit 1
    ;;
esac

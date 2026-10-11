#!/usr/bin/env sh
# Déploie dist/ sur Cloudflare Workers : ./scripts/deploy.sh dev|prod
#   dev  → https://dev-docs.synapse-medical.fr (non indexée)
#   prod → https://docs.synapse-medical.fr
# Authentification : « npx wrangler login » en local, ou CLOUDFLARE_API_TOKEN et
# CLOUDFLARE_ACCOUNT_ID en CI.
set -eu

cd "$(dirname "$0")/.."

test -f dist/index.html || { echo "dist/ absent : lancer « npm run build » d'abord." >&2; exit 1; }

case "${1:-}" in
  dev)
    # Préproduction : ne pas indexer dans les moteurs de recherche.
    grep -q 'X-Robots-Tag' dist/_headers || printf '\n/*\n  X-Robots-Tag: noindex, nofollow\n' >> dist/_headers
    npx wrangler deploy --env dev
    ;;
  prod)
    npx wrangler deploy --env=""
    ;;
  *)
    echo "Usage : $0 dev|prod" >&2
    exit 1
    ;;
esac

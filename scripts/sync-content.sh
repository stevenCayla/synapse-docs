#!/usr/bin/env sh
# Relie src/content/docs au dossier docs/ du dépôt de l'application.
#
# Le contenu (docs/, .env pour APP_VERSION) vit dans le dépôt SYNAPSE-MEDICAL ;
# ce dépôt ne contient que le site Astro. Source utilisée, par ordre de priorité :
#   1. SYNAPSE_DIR : chemin d'un checkout existant (édition locale en direct),
#      ex. SYNAPSE_DIR=../symfony-docker npm run dev
#   2. .synapse/   : checkout déjà présent (la CI l'y place via actions/checkout)
#   3. sinon, clone partiel (docs/ + fichiers racine) de SYNAPSE_REF dans .synapse/
set -eu

cd "$(dirname "$0")/.."

SYNAPSE_REPO="${SYNAPSE_REPO:-git@github.com:stevenCayla/SYNAPSE-MEDICAL.git}"
SYNAPSE_REF="${SYNAPSE_REF:-develop}"
dir="${SYNAPSE_DIR:-.synapse}"

if [ ! -d "$dir/docs" ]; then
  if [ -n "${SYNAPSE_DIR:-}" ]; then
    echo "SYNAPSE_DIR=$SYNAPSE_DIR ne contient pas de dossier docs/." >&2
    exit 1
  fi
  echo "Clone de docs/ depuis $SYNAPSE_REPO ($SYNAPSE_REF)…"
  rm -rf .synapse
  git clone --quiet --depth 1 --filter=blob:none --sparse --branch "$SYNAPSE_REF" "$SYNAPSE_REPO" .synapse
  git -C .synapse sparse-checkout set docs
fi

target="$(cd "$dir" && pwd)/docs"
mkdir -p src/content
rm -rf src/content/docs
ln -s "$target" src/content/docs
echo "src/content/docs -> $target"

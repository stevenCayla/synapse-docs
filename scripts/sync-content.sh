#!/usr/bin/env sh
# Copies the docs/ folder of the application repository into src/content/docs/
# and its APP_VERSION into the APP_VERSION file, so this repository builds on
# its own. Run it to refresh the snapshot; the CI runs it automatically when
# docs/ changes on develop or main in SYNAPSE-MEDICAL.
#
# Source, by priority:
#   1. SYNAPSE_DIR: path of an existing checkout of the application,
#      e.g. SYNAPSE_DIR=../symfony-docker make sync
#   2. otherwise, partial clone (docs/ + root files) of SYNAPSE_REF into .synapse/
#
# src/content/docs/audit/, guides/ and resources/ (guides, glossary, compliance
# FAQ) and the home pages (src/pages/index.astro, built from
# src/components/home/) are maintained in this repository; the index.md of the
# application is not synced. The archived versions
# listed in versions.json (src/content/docs/<x.y>/, en/<x.y>/) are
# never synced.
set -eu

cd "$(dirname "$0")/.."

SYNAPSE_REPO="${SYNAPSE_REPO:-git@github.com:stevenCayla/SYNAPSE-MEDICAL.git}"
SYNAPSE_REF="${SYNAPSE_REF:-develop}"

if [ -n "${SYNAPSE_DIR:-}" ]; then
  dir="$SYNAPSE_DIR"
else
  echo "Cloning docs/ from $SYNAPSE_REPO ($SYNAPSE_REF)…"
  rm -rf .synapse
  git clone --quiet --depth 1 --filter=blob:none --sparse --branch "$SYNAPSE_REF" "$SYNAPSE_REPO" .synapse
  git -C .synapse sparse-checkout set docs
  dir=.synapse
fi

test -d "$dir/docs" || { echo "$dir does not contain a docs/ folder." >&2; exit 1; }

set -- --exclude '/audit/' --exclude '/guides/' --exclude '/resources/' --exclude '/index.md' --exclude '/en/index.md'
for slug in $(node -p 'require("./versions.json").map((v) => v.slug).join(" ")'); do
  set -- "$@" --exclude "/$slug/" --exclude "/en/$slug/"
done

mkdir -p src/content/docs
rsync -a --delete "$@" "$dir/docs/" src/content/docs/

version="$(sed -n 's/^[[:space:]]*APP_VERSION[[:space:]]*=[[:space:]]*//p' "$dir/.env" 2>/dev/null | tail -1 | tr -d "\"'")"
if [ -n "$version" ]; then
  echo "$version" > APP_VERSION
fi

echo "src/content/docs synced from $dir (APP_VERSION $(cat APP_VERSION 2>/dev/null || echo unknown))"

#!/usr/bin/env sh
# Copies the docs/ folder of the application repository into src/content/docs/
# and its version (latest release tag vX.Y.Z reachable from the synced commit,
# without the v; -rc tags ignored) into the APP_VERSION file, so this
# repository builds on its own. Run it to refresh the snapshot; the CI runs it automatically when
# docs/ changes on develop or main in synapse-app.
#
# Source, by priority:
#   1. SYNAPSE_DIR: path of an existing checkout of the application,
#      e.g. SYNAPSE_DIR=../symfony-docker make sync
#   2. otherwise, partial clone (docs/ + root files, full history without blobs
#      so that the tags are available) of SYNAPSE_REF into .synapse/
#
# Version, by priority: latest release tag; else APP_VERSION of the .env of the
# application, unless it is "dev"; else the current APP_VERSION file is kept.
# A checkout used as SYNAPSE_DIR needs its tags (git fetch --tags).
#
# src/content/docs/audit/, guides/, resources/ and recette/ and their en/ counterparts (guides, glossary, compliance
# FAQ) and the home pages (src/pages/index.astro, built from
# src/components/home/) are maintained in this repository; the index.md of the
# application is not synced. The archived versions
# listed in versions.json (src/content/docs/<x.y>/, en/<x.y>/) are
# never synced.
set -eu

cd "$(dirname "$0")/.."

SYNAPSE_REPO="${SYNAPSE_REPO:-git@github.com:stevenCayla/synapse-app.git}"
SYNAPSE_REF="${SYNAPSE_REF:-develop}"

if [ -n "${SYNAPSE_DIR:-}" ]; then
  dir="$SYNAPSE_DIR"
else
  echo "Cloning docs/ from $SYNAPSE_REPO ($SYNAPSE_REF)…"
  rm -rf .synapse
  git clone --quiet --filter=blob:none --sparse --branch "$SYNAPSE_REF" "$SYNAPSE_REPO" .synapse
  git -C .synapse sparse-checkout set docs
  dir=.synapse
fi

test -d "$dir/docs" || { echo "$dir does not contain a docs/ folder." >&2; exit 1; }

set -- --exclude '/audit/' --exclude '/guides/' --exclude '/resources/' --exclude '/recette/' --exclude '/index.md' --exclude '/en/index.md' --exclude '/en/guides/' --exclude '/en/resources/' --exclude '/en/recette/'
for slug in $(node -p 'require("./versions.json").map((v) => v.slug).join(" ")'); do
  set -- "$@" --exclude "/$slug/" --exclude "/en/$slug/"
done

mkdir -p src/content/docs
rsync -a --delete "$@" "$dir/docs/" src/content/docs/

# The changelog of the application (source of the changelog timeline).
if [ -f "$dir/CHANGELOG.md" ]; then
  mkdir -p src/data
  cp "$dir/CHANGELOG.md" src/data/CHANGELOG.md
fi

version="$(git -C "$dir" describe --tags --abbrev=0 --match 'v[0-9]*' --exclude '*-*' HEAD 2>/dev/null | sed 's/^v//' || true)"
if [ -z "$version" ]; then
  version="$(sed -n 's/^[[:space:]]*APP_VERSION[[:space:]]*=[[:space:]]*//p' "$dir/.env" 2>/dev/null | tail -1 | tr -d "\"'")"
  [ "$version" = dev ] && version=""
fi
if [ -n "$version" ]; then
  echo "$version" > APP_VERSION
else
  echo "No release tag nor usable APP_VERSION in $dir: APP_VERSION file unchanged." >&2
fi

echo "src/content/docs and src/data/CHANGELOG.md synced from $dir (APP_VERSION $(cat APP_VERSION 2>/dev/null || echo unknown))"

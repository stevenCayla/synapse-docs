#!/usr/bin/env sh
# Links src/content/docs to the docs/ folder of the application repository.
#
# The content (docs/, .env for APP_VERSION) lives in the SYNAPSE-MEDICAL
# repository; this repository only holds the Astro site. Source, by priority:
#   1. SYNAPSE_DIR: path of an existing checkout (live local editing),
#      e.g. SYNAPSE_DIR=../symfony-docker npm run dev
#   2. .synapse/:   checkout already present (put there by actions/checkout in CI)
#   3. otherwise, partial clone (docs/ + root files) of SYNAPSE_REF into .synapse/
set -eu

cd "$(dirname "$0")/.."

SYNAPSE_REPO="${SYNAPSE_REPO:-git@github.com:stevenCayla/SYNAPSE-MEDICAL.git}"
SYNAPSE_REF="${SYNAPSE_REF:-develop}"
dir="${SYNAPSE_DIR:-.synapse}"

if [ ! -d "$dir/docs" ]; then
  if [ -n "${SYNAPSE_DIR:-}" ]; then
    echo "SYNAPSE_DIR=$SYNAPSE_DIR does not contain a docs/ folder." >&2
    exit 1
  fi
  echo "Cloning docs/ from $SYNAPSE_REPO ($SYNAPSE_REF)…"
  rm -rf .synapse
  git clone --quiet --depth 1 --filter=blob:none --sparse --branch "$SYNAPSE_REF" "$SYNAPSE_REPO" .synapse
  git -C .synapse sparse-checkout set docs
fi

target="$(cd "$dir" && pwd)/docs"
mkdir -p src/content
rm -rf src/content/docs
ln -s "$target" src/content/docs
echo "src/content/docs -> $target"

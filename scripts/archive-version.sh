#!/usr/bin/env sh
# Archives the current documentation as version <x.y> (starlight-versions):
#   ./scripts/archive-version.sh 2.0      (or: make archive VERSION=2.0)
#
# Run it at release time, BEFORE syncing the content of the next version:
# the plugin copies the current pages into src/content/docs/<x.y>/ (and their
# metadata into src/content/versions/) on the next build. Commit the result.
set -eu

cd "$(dirname "$0")/.."

slug="${1:-}"
case "$slug" in
  [0-9]*.[0-9]*) ;;
  *) echo "Usage: $0 <major.minor>, e.g. $0 2.0" >&2; exit 1 ;;
esac

if [ -e "src/content/docs/$slug" ]; then
  echo "Version $slug is already archived." >&2
  exit 1
fi

# Newest archived version first, as shown in the version picker.
node -e '
const fs = require("node:fs");
const slug = process.argv[1];
const versions = JSON.parse(fs.readFileSync("versions.json", "utf8"));
versions.unshift({ slug, label: `v${slug}` });
fs.writeFileSync("versions.json", JSON.stringify(versions, null, 2) + "\n");
' "$slug"

npm run build

echo "Version $slug archived: commit versions.json, src/content/docs/$slug/ and src/content/versions/."

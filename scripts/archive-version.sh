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

# The plugin skips the archived versions at the root but not inside the locale
# folder: drop the copies of the older versions it embedded in en/<slug>/.
node -e '
const fs = require("node:fs");
const [slug, ...olds] = process.argv.slice(1);
for (const old of olds) {
  for (const dir of [`src/content/docs/${slug}/${old}`, `src/content/docs/en/${slug}/${old}`]) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
' "$slug" $(node -e 'for (const v of require("./versions.json")) if (v.slug !== process.argv[1]) console.log(v.slug)' "$slug")

# The plugin prefixes the absolute links with /<slug>/ and keeps the relative
# ones, which breaks the language switch: the English pages live under
# /en/<slug>/, not /<slug>/en/. Rewrite those links in the new archive.
node -e '
const fs = require("node:fs");
const path = require("node:path");
const slug = process.argv[1];
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const esc = slug.replace(/\./g, "\\.");
for (const [dir, en] of [[`src/content/docs/${slug}`, false], [`src/content/docs/en/${slug}`, true]]) {
  for (const file of walk(dir).filter((f) => /\.mdx?$/.test(f))) {
    const before = fs.readFileSync(file, "utf8");
    let after = before.replace(new RegExp(`\\]\\(/${esc}/en/`, "g"), `](/en/${slug}/`);
    // Relative language switch of the version home page.
    after = en ? after.replace(/\]\(\.\.\/\)/g, `](/${slug}/)`)
               : after.replace(/\]\(en\/\)/g, `](/en/${slug}/)`);
    if (after !== before) fs.writeFileSync(file, after);
  }
}
' "$slug"

echo "Version $slug archived: commit versions.json, src/content/docs/$slug/ and src/content/versions/."

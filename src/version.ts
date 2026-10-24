// DOCS_VERSION is derived from the APP_VERSION file (synced from the
// application's .env by scripts/sync-content.sh) at build time, through
// `vite.define` in astro.config.mjs.
// → No manual sync: bumping APP_VERSION is enough, the version selector
//   follows on the next build.
declare const __DOCS_VERSION__: string;

export const DOCS_VERSION = __DOCS_VERSION__;

// Same value, under its real meaning: the version of the application (the
// APP_VERSION file), not a version of the documentation pages. Used by the
// home page and the changelog.
export const APP_VERSION = DOCS_VERSION;

// GitHub Releases URL of the application. Empty while the SYNAPSE-MEDICAL
// repository is private: the version selector then hides the entry.
export const RELEASES_URL = '';

// Next release of the application, shown on the changelog while its changes
// are still in the "Unreleased" section. Remove it once the release is
// published (APP_VERSION catches up on the next content sync).
export const NEXT_VERSION = '3.2.0';

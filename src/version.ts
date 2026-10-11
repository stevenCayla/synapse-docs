// DOCS_VERSION is derived from the APP_VERSION file (synced from the
// application's .env by scripts/sync-content.sh) at build time, through
// `vite.define` in astro.config.mjs.
// → No manual sync: bumping APP_VERSION is enough, the version selector
//   follows on the next build.
declare const __DOCS_VERSION__: string;

export const DOCS_VERSION = __DOCS_VERSION__;

// GitHub Releases URL of the application. Empty while the SYNAPSE-MEDICAL
// repository is private: the version selector then hides the entry.
export const RELEASES_URL = '';

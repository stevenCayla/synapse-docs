// DOCS_VERSION is derived automatically from APP_VERSION (.env / .env.local of
// the application repository, see SYNAPSE_DIR) at build time, through
// `vite.define` in astro.config.mjs.
// → No manual sync: bumping APP_VERSION is enough, the version selector
//   follows on the next build.
declare const __DOCS_VERSION__: string;

export const DOCS_VERSION = __DOCS_VERSION__;

// GitHub Releases URL (to fill in once the repository is public).
export const RELEASES_URL = '#';

// DOCS_VERSION est dérivée automatiquement de APP_VERSION (.env / .env.local du
// projet) au moment du build, via `vite.define` dans astro.config.mjs.
// → Aucune synchronisation manuelle : bumper APP_VERSION suffit, le sélecteur de
//   version suit au prochain build.
declare const __DOCS_VERSION__: string;

export const DOCS_VERSION = __DOCS_VERSION__;

// URL des GitHub Releases (à renseigner une fois le dépôt public).
export const RELEASES_URL = '#';

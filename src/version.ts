// Constante remplacée à la compilation par Vite (`define` dans astro.config.mjs),
// alimentée par APP_VERSION du fichier .env à la racine du projet.
declare const __DOCS_VERSION__: string;

// Version courante de la documentation (= APP_VERSION).
export const DOCS_VERSION = __DOCS_VERSION__;

// URL des GitHub Releases (à renseigner une fois le dépôt public).
export const RELEASES_URL = '#';

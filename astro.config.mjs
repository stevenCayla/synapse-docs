import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import starlightVersions from 'starlight-versions';
import externalizeInlineScripts from './integrations/externalize-inline-scripts.mjs';
import fs from 'node:fs';

// Application version, synced from APP_VERSION in the application's .env by
// scripts/sync-content.sh, so the version selector stays in sync without a
// hard-coded value.
function readAppVersion() {
  try {
    return fs.readFileSync('APP_VERSION', 'utf8').trim() || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

const APP_VERSION = readAppVersion();

// Archived documentation versions (starlight-versions), managed with
// "make archive VERSION=x.y". The plugin requires at least one archived
// version, so it is only enabled once versions.json lists one.
const ARCHIVED_VERSIONS = JSON.parse(fs.readFileSync('versions.json', 'utf8'));

// Synapse Medical documentation — Starlight site.
// Root locale = French (served at /), English under /en/.
export default defineConfig({
  site: 'https://docs.synapse-medical.fr',
  // Injects the version (constant replaced by Vite at build time).
  vite: {
    define: {
      __DOCS_VERSION__: JSON.stringify(APP_VERSION),
    },
  },
  integrations: [
    // Renders ```mermaid blocks → SVG (client side, no Chromium).
    // Must come before starlight() to catch the blocks before syntax
    // highlighting. The theme follows the site's light/dark mode.
    mermaid({
      theme: 'neutral',
      autoTheme: true,
    }),
    starlight({
      title: 'Synapse Medical',
      plugins: ARCHIVED_VERSIONS.length
        ? [
            starlightVersions({
              versions: ARCHIVED_VERSIONS,
              current: { label: `v${APP_VERSION}` },
              // Audit & compliance pages always show their latest content.
              exclude: ['audit/**'],
            }),
          ]
        : [],
      // Synapse logo (same as the /login page), light/dark variants.
      logo: {
        light: './src/assets/synapse-logo-light.svg',
        dark: './src/assets/synapse-logo-dark.svg',
        alt: 'Synapse Medical',
      },
      favicon: '/favicon.svg',
      // Underlines the glossary terms of the guides with a tooltip.
      head: [{ tag: 'script', attrs: { src: '/glossary.js', defer: true } }],
      customCss: ['./src/styles/synapse.css', './src/styles/home.css', './src/styles/guides.css'],
      defaultLocale: 'root',
      locales: {
        root: { label: 'Français', lang: 'fr' },
        en: { label: 'English', lang: 'en' },
      },
      // Social links in the header.
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/stevenCayla/synapse-docs' },
        {
          icon: 'discord',
          label: 'Discord',
          href: 'https://discord.com/channels/1521440528388984934/1521440528829382718',
        },
      ],
      // Custom components:
      // - Sidebar: adds a version selector at the top of the sidebar.
      // - Footer:  Astro-style community section.
      components: {
        Sidebar: './src/components/Sidebar.astro',
        Footer: './src/components/Footer.astro',
      },
      // Sidebar organized in 4 top-level SECTIONS (Guide, Tutorials, Reference,
      // Ecosystem), like the Astro docs. The custom Sidebar component
      // (src/components/Sidebar.astro) renders these sections as icon tabs and
      // only shows the links of the active section (Guide by default).
      // Inner labels have NO icon: only the sections do.
      sidebar: [
        {
          label: 'Guide',
          items: [
            { label: 'Accueil', translations: { en: 'Home' }, link: '/' },
            {
              label: 'Architecture',
              collapsed: true,
              items: [{ autogenerate: { directory: 'architecture', collapsed: true } }],
            },
            {
              label: 'Backend',
              collapsed: true,
              items: [{ autogenerate: { directory: 'backend', collapsed: true } }],
            },
            {
              label: 'Sécurité',
              translations: { en: 'Security' },
              collapsed: true,
              items: [{ autogenerate: { directory: 'security', collapsed: true } }],
            },
            {
              label: 'Conventions de code',
              translations: { en: 'Code conventions' },
              collapsed: true,
              items: [{ autogenerate: { directory: 'code-convention', collapsed: true } }],
            },
            {
              label: 'Déploiement',
              translations: { en: 'Deployment' },
              collapsed: true,
              items: [{ autogenerate: { directory: 'deployment', collapsed: true } }],
            },
            {
              label: 'Dépannage',
              translations: { en: 'Troubleshooting' },
              collapsed: true,
              items: [{ autogenerate: { directory: 'troubleshooting', collapsed: true } }],
            },
          ],
        },
        {
          label: 'Tutorials',
          items: [
            {
              label: 'Guide de démarrage',
              translations: { en: 'Getting started' },
              link: '/getting-started/',
              badge: { text: 'Nouveau', variant: 'tip' },
            },
            {
              label: 'Prise en main',
              translations: { en: 'Getting started guides' },
              items: [
                'guides/premiers-pas',
                'guides/creer-etude',
                'guides/design-population-sites',
                'guides/reglementaire-ecrf-equipe',
                'guides/importer',
                'guides/lancer',
              ],
            },
            {
              label: "Conduire l'étude",
              translations: { en: 'Running the study' },
              items: [
                'guides/saisir-ecrf',
                'guides/requetes-monitoring',
                'guides/randomisation',
                'guides/gel-verrouillage',
                'guides/exports',
              ],
            },
            {
              label: 'QA',
              collapsed: true,
              items: [{ autogenerate: { directory: 'qa', collapsed: true } }],
            },
          ],
        },
        {
          label: 'Reference',
          items: [
            {
              label: 'Ressources',
              translations: { en: 'Resources' },
              items: ['resources/glossary', 'resources/compliance-faq'],
            },
            {
              label: 'API',
              collapsed: true,
              items: [{ autogenerate: { directory: 'api', collapsed: true } }],
            },
            {
              label: 'Commandes',
              translations: { en: 'Commands' },
              collapsed: true,
              items: [{ autogenerate: { directory: 'commands', collapsed: true } }],
            },
            {
              label: 'Base de données',
              translations: { en: 'Database' },
              collapsed: true,
              items: [{ autogenerate: { directory: 'database', collapsed: true } }],
            },
            {
              label: 'Audit & conformité',
              translations: { en: 'Audit & compliance' },
              collapsed: true,
              items: [{ autogenerate: { directory: 'audit', collapsed: true } }],
            },
            {
              label: 'RGPD',
              translations: { en: 'GDPR' },
              collapsed: true,
              items: [{ autogenerate: { directory: 'rgpd', collapsed: true } }],
            },
          ],
        },
        {
          label: 'Ecosystem',
          items: [
            {
              label: 'Contribuer',
              translations: { en: 'Contribute' },
              link: '/contribute/',
              badge: { text: 'Nouveau', variant: 'tip' },
            },
            {
              label: 'Changelog',
              collapsed: true,
              items: [{ autogenerate: { directory: 'changelog', collapsed: true } }],
            },
          ],
        },
      ],
    }),
    // Last: moves every inline <script> out of the generated HTML, for the
    // production CSP "script-src 'self'" (see the integration file).
    externalizeInlineScripts(),
  ],
});

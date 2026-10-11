import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import externalizeInlineScripts from './integrations/externalize-inline-scripts.mjs';
import fs from 'node:fs';
import path from 'node:path';

// Folder of the application repository (docs/ content + .env), see
// scripts/sync-content.sh. APP_VERSION is read from it so the version selector
// stays in sync without a hard-coded value.
const SYNAPSE_DIR = path.resolve(process.env.SYNAPSE_DIR || '.synapse');

function readAppVersion() {
  for (const file of ['.env.local', '.env']) {
    try {
      const content = fs.readFileSync(path.join(SYNAPSE_DIR, file), 'utf8');
      const match = content.match(/^\s*APP_VERSION\s*=\s*(.*)$/m);
      if (match) {
        const value = match[1].trim().replace(/^["']|["']$/g, '');
        if (value) return value;
      }
    } catch {
      // missing file → try the next one
    }
  }
  return '0.0.0';
}

const APP_VERSION = readAppVersion();

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
      // Synapse logo (same as the /login page), light/dark variants.
      logo: {
        light: './src/assets/synapse-logo-light.svg',
        dark: './src/assets/synapse-logo-dark.svg',
        alt: 'Synapse Medical',
      },
      favicon: '/favicon.svg',
      defaultLocale: 'root',
      locales: {
        root: { label: 'Français', lang: 'fr' },
        en: { label: 'English', lang: 'en' },
      },
      // Social links in the header (temporary "#" GitHub link).
      social: [
        { icon: 'github', label: 'GitHub', href: '#' },
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

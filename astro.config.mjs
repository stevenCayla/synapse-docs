import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import starlightVersions from 'starlight-versions';
import { satteri } from '@astrojs/markdown-satteri';
import mockupPlugin from './integrations/markdown-mockup.mjs';
import externalizeInlineScripts from './integrations/externalize-inline-scripts.mjs';
import fs from 'node:fs';
import { ExpressiveCodeTheme } from 'astro-expressive-code';

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
// Syntax colors of the code blocks (keys and keywords, strings, comments).
function syntaxTheme(type) {
  const dark = type === 'dark';
  const c = dark
    ? { fg: '#ecedfa', bg: '#0f1326', comment: '#868ab0', key: '#a5b4fc', str: '#4fd1a0' }
    : { fg: '#1e1b3a', bg: '#f7f7fc', comment: '#6a6890', key: '#4338ca', str: '#0a6b49' };
  return new ExpressiveCodeTheme({
    name: `synapse-${type}`,
    type,
    colors: { 'editor.background': c.bg, 'editor.foreground': c.fg },
    settings: [
      { settings: { foreground: c.fg } },
      { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: c.comment } },
      { scope: ['string', 'string.quoted', 'constant.numeric'], settings: { foreground: c.str } },
      {
        scope: ['keyword', 'storage', 'variable.other.readwrite', 'variable.other.constant', 'entity.name.function', 'support.function', 'entity.name.tag', 'support.type.property-name'],
        settings: { foreground: c.key },
      },
    ],
  });
}

export default defineConfig({
  site: 'https://docs.synapse-medical.fr',
  markdown: { processor: satteri({ mdastPlugins: [mockupPlugin] }) },
  // Injects the version (constant replaced by Vite at build time).
  vite: {
    // No data: URIs for the fonts: the CSP only allows font-src 'self'.
    build: { assetsInlineLimit: 0 },
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
      // Code blocks: the Synapse Docs palette (see src/styles/page.css for the frame).
      expressiveCode: {
        themes: [syntaxTheme('dark'), syntaxTheme('light')],
        useStarlightDarkModeSwitch: true,
        useStarlightUiThemeColors: false,
        styleOverrides: {
          borderRadius: '10px',
          borderColor: 'var(--sy-line)',
          codeFontSize: '13px',
          codeLineHeight: '1.75',
          codePaddingInline: '16px',
          codeFontFamily: 'var(--sy-font-mono)',
          uiFontFamily: 'var(--sy-font-mono)',
          uiFontSize: '12px',
          frames: {
            frameBoxShadowCssValue: 'none',
            terminalTitlebarDotsOpacity: '0',
            terminalTitlebarBackground: 'var(--sy-code)',
            terminalTitlebarForeground: 'var(--sy-ink3)',
            terminalTitlebarBorderBottomColor: 'var(--sy-line)',
            terminalBackground: 'var(--sy-code)',
            editorTabBarBackground: 'var(--sy-code)',
            editorActiveTabBackground: 'var(--sy-code)',
            editorActiveTabForeground: 'var(--sy-ink)',
            editorActiveTabBorderColor: 'transparent',
            editorActiveTabIndicatorTopColor: 'transparent',
            editorActiveTabIndicatorBottomColor: 'var(--sy-accent)',
            editorTabBarBorderBottomColor: 'var(--sy-line)',
            inlineButtonForeground: 'var(--sy-ink3)',
            inlineButtonBackground: 'transparent',
            inlineButtonBackgroundHoverOrFocusOpacity: '0.12',
            inlineButtonBorder: 'transparent',
          },
        },
      },
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
      // Date shown in the page header, from the git history.
      lastUpdated: true,
      // glossary.js: tooltips on the glossary terms of the guides.
      // recette.js: test file copy and test book tracking (recette pages).
      // progress.js: reading progress of the guides. contextual.js: ?step= and
      // ?from=app links opened from the application. lightbox.js: screenshot viewer. feedback.js: "was this page
      // helpful?" widget (opens a pre-filled GitHub issue, sends nothing itself).
      head: [
        { tag: 'script', attrs: { src: '/glossary.js', defer: true } },
        { tag: 'script', attrs: { src: '/recette.js', defer: true } },
        { tag: 'script', attrs: { src: '/progress.js', defer: true } },
        { tag: 'script', attrs: { src: '/contextual.js', defer: true } },
        { tag: 'script', attrs: { src: '/feedback.js', defer: true } },
        { tag: 'script', attrs: { src: '/lightbox.js', defer: true } },
        { tag: 'script', attrs: { src: '/a11y.js', defer: true } },
      ],
      customCss: ['./src/styles/synapse.css', './src/styles/home.css', './src/styles/guides.css', './src/styles/changelog.css', './src/styles/recette.css', './src/styles/page.css', './src/styles/sidebar.css'],
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
        Header: './src/components/Header.astro',
        // The plugin's notice must be rendered once a version is archived.
        PageTitle: ARCHIVED_VERSIONS.length
          ? './src/components/PageTitleVersioned.astro'
          : './src/components/PageTitle.astro',
        SiteTitle: './src/components/SiteTitle.astro',
        Search: './src/components/Search.astro',
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
          label: 'Prise en main',
          translations: { en: 'Getting started' },
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
              label: 'Ressources',
              translations: { en: 'Resources' },
              items: [
                'resources/glossary',
                'resources/compliance-faq',
                'resources/contextual-help',
                { label: 'Journal des modifications', translations: { en: 'Changelog' }, link: '/changelog/' },
              ],
            },
            {
              label: 'Recette',
              translations: { en: 'Acceptance tests' },
              collapsed: true,
              items: [
                'recette/strategie',
                'recette/kit',
                'recette/creation-etude',
                'recette/saisie-ecrf',
                'recette/import-donnees',
                'recette/audit-trail-esignature',
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
          label: 'Référence',
          translations: { en: 'Reference' },
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
          label: 'Écosystème',
          translations: { en: 'Ecosystem' },
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
              items: [
                { label: 'Timeline', translations: { fr: 'Chronologie', en: 'Timeline' }, link: '/changelog/' },
                { autogenerate: { directory: 'changelog', collapsed: true } },
              ],
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

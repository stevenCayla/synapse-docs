import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import fs from 'node:fs';
import path from 'node:path';

// Lit APP_VERSION depuis le .env à la racine du projet (au-dessus de docs-site/),
// afin que le sélecteur de version reste synchronisé sans valeur codée en dur.
function readAppVersion() {
  for (const file of ['.env.local', '.env']) {
    try {
      const content = fs.readFileSync(path.resolve('..', file), 'utf8');
      const match = content.match(/^\s*APP_VERSION\s*=\s*(.*)$/m);
      if (match) {
        const value = match[1].trim().replace(/^["']|["']$/g, '');
        if (value) return value;
      }
    } catch {
      // fichier absent → on tente le suivant
    }
  }
  return '0.0.0';
}

const APP_VERSION = readAppVersion();

// Documentation Synapse Medical — site Starlight.
// Locale racine = Français (servi à /), Anglais sous /en/.
export default defineConfig({
  site: 'https://docs.synapse-medical.fr',
  // Injecte la version (constante remplacée à la compilation par Vite).
  vite: {
    define: {
      __DOCS_VERSION__: JSON.stringify(APP_VERSION),
    },
  },
  integrations: [
    // Rendu des blocs ```mermaid → SVG (client, sans Chromium).
    // Doit précéder starlight() pour intercepter les blocs avant la
    // coloration syntaxique. Thème suit le clair/sombre du site.
    mermaid({
      theme: 'neutral',
      autoTheme: true,
    }),
    starlight({
      title: 'Synapse Medical',
      defaultLocale: 'root',
      locales: {
        root: { label: 'Français', lang: 'fr' },
        en: { label: 'English', lang: 'en' },
      },
      // Liens sociaux dans l'en-tête (lien GitHub temporaire « # »).
      social: [
        { icon: 'github', label: 'GitHub', href: '#' },
        {
          icon: 'discord',
          label: 'Discord',
          href: 'https://discord.com/channels/1521440528388984934/1521440528829382718',
        },
      ],
      // Composants personnalisés :
      // - Sidebar : ajoute un sélecteur de version en tête de barre latérale.
      // - Footer  : section communautaire à la manière d'Astro.
      components: {
        Sidebar: './src/components/Sidebar.astro',
        Footer: './src/components/Footer.astro',
      },
      // Sidebar explicite : pages de tête (Accueil, Guide de démarrage) en
      // premier, puis les groupes — tous repliés par défaut (`collapsed`).
      // Starlight ouvre automatiquement le groupe de la page courante.
      // Les `link` et dossiers `autogenerate` sont résolus par locale.
      sidebar: [
        { label: '🏠 Accueil', translations: { en: '🏠 Home' }, link: '/' },
        {
          label: '🚦 Guide de démarrage',
          translations: { en: '🚦 Getting started' },
          link: '/getting-started/',
        },
        {
          label: '🤝 Contribuer',
          translations: { en: '🤝 Contribute' },
          link: '/contribute/',
          badge: { text: 'Nouveau', variant: 'tip' },
        },
        {
          label: '🛠️ Backend',
          collapsed: true,
          items: [{ autogenerate: { directory: 'backend', collapsed: true } }],
        },
        {
          label: '🏗️ Architecture',
          collapsed: true,
          items: [{ autogenerate: { directory: 'architecture', collapsed: true } }],
        },
        {
          label: '🗄️ Base de données',
          translations: { en: '🗄️ Database' },
          collapsed: true,
          items: [{ autogenerate: { directory: 'database', collapsed: true } }],
        },
        {
          label: '🔌 API',
          collapsed: true,
          items: [{ autogenerate: { directory: 'api', collapsed: true } }],
        },
        {
          label: '⌨️ Commandes',
          translations: { en: '⌨️ Commands' },
          collapsed: true,
          items: [{ autogenerate: { directory: 'commands', collapsed: true } }],
        },
        {
          label: '🎨 Conventions de code',
          translations: { en: '🎨 Code conventions' },
          collapsed: true,
          items: [{ autogenerate: { directory: 'code-convention', collapsed: true } }],
        },
        {
          label: '🔒 Sécurité',
          translations: { en: '🔒 Security' },
          collapsed: true,
          items: [{ autogenerate: { directory: 'security', collapsed: true } }],
        },
        {
          label: '✅ Audit & conformité',
          translations: { en: '✅ Audit & compliance' },
          collapsed: true,
          items: [{ autogenerate: { directory: 'audit', collapsed: true } }],
        },
        {
          label: '🛡️ RGPD',
          translations: { en: '🛡️ GDPR' },
          collapsed: true,
          items: [{ autogenerate: { directory: 'rgpd', collapsed: true } }],
        },
        {
          label: '🧪 QA',
          collapsed: true,
          items: [{ autogenerate: { directory: 'qa', collapsed: true } }],
        },
        {
          label: '🚀 Déploiement',
          translations: { en: '🚀 Deployment' },
          collapsed: true,
          items: [{ autogenerate: { directory: 'deployment', collapsed: true } }],
        },
        {
          label: '🩺 Dépannage',
          translations: { en: '🩺 Troubleshooting' },
          collapsed: true,
          items: [{ autogenerate: { directory: 'troubleshooting', collapsed: true } }],
        },
        {
          label: '📝 Changelog',
          collapsed: true,
          items: [{ autogenerate: { directory: 'changelog', collapsed: true } }],
        },
      ],
    }),
  ],
});

import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Documentation Synapse Medical — site Starlight.
// Locale racine = Français (servi à /), Anglais sous /en/.
export default defineConfig({
  site: 'https://docs.synapse-medical.example',
  integrations: [
    starlight({
      title: 'Synapse Medical',
      defaultLocale: 'root',
      locales: {
        root: { label: 'Français', lang: 'fr' },
        en: { label: 'English', lang: 'en' },
      },
    }),
  ],
});

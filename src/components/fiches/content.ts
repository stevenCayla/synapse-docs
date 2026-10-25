// Printable sheets (A4): a one-page summary of a guide. The guide stays the
// reference; a sheet only repeats its key points (see Sheet.astro).

export interface Sheet {
  title: string;
  sub: string;
  time: string;
  before: { title: string; text: string };
  steps: { title: string; items: string[] }[];
  keep: { title: string; items: string[] };
  guide: string; // path of the full guide
}

export interface SheetText {
  kicker: string;
  reviewed: string;
  fullGuide: string;
  print: string;
  back: string;
  stepWord: string;
}

export const ui: Record<'fr' | 'en', SheetText> = {
  fr: {
    kicker: 'Fiche pratique',
    reviewed: 'Relue pour',
    fullGuide: 'Guide complet',
    print: 'Imprimer / Enregistrer en PDF',
    back: '← Revenir au guide',
    stepWord: 'Étape',
  },
  en: {
    kicker: 'Quick reference',
    reviewed: 'Reviewed for',
    fullGuide: 'Full guide',
    print: 'Print / Save as PDF',
    back: '← Back to the guide',
    stepWord: 'Step',
  },
};

const slugs = [
  'premiers-pas',
  'creer-etude',
  'design-population-sites',
  'reglementaire-ecrf-equipe',
  'importer',
  'lancer',
  'saisir-ecrf',
  'requetes-monitoring',
  'randomisation',
  'gel-verrouillage',
  'exports',
] as const;

// One file per guide (same name as the guide) exports `fr` and `en`.
const modules = import.meta.glob<{ fr: Sheet; en: Sheet }>('./*.ts', { eager: true });

export const sheets: Record<string, Record<'fr' | 'en', Sheet>> = Object.fromEntries(
  slugs.flatMap((slug) => {
    const mod = modules[`./${slug}.ts`];
    return mod ? [[slug, { fr: mod.fr, en: mod.en }]] : [];
  }),
);

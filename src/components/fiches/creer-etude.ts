import type { Sheet } from './content';

export const fr: Sheet = {
  title: 'Créer une étude',
  sub: "Type, informations et cadre réglementaire, les trois premières étapes de l'assistant.",
  time: '8 min',
  before: {
    title: 'Ouvrir l’assistant',
    text: 'Ouvrez Études → Nouvelle étude. Ce guide suit le mode Avancé ; en mode Essentiel, les mêmes champs sont regroupés en moins d’étapes.',
  },
  steps: [
    {
      title: '1. Type d’étude',
      items: [
        'Type : Étude prospective (données saisies visite par visite) ou Rétrospective (jeu de données d’analyse).',
        'Ce choix conditionne la suite et n’est plus modifiable une fois validé.',
        'Brouillon non terminé : cliquez sur son nom pour le reprendre, la croix le supprime.',
      ],
    },
    {
      title: '2. Informations',
      items: [
        'Sponsor : le promoteur, l’organisme responsable de l’étude.',
        'Study ID : code court et unique (lettres, chiffres, tirets), converti en majuscules ; il préfixe les identifiants.',
        'Titre court : le nom lisible de l’étude dans les listes.',
        'Les valeurs grisées sont des exemples : elles disparaissent dès la saisie.',
      ],
    },
    {
      title: '3. Cadre réglementaire',
      items: [
        'Produit de santé étudié : médicament, dispositif, diagnostic in vitro ou aucun (CTR, MDR, IVDR).',
        'Intervention ajoutée aux soins : Non minime → RIPH 1 ; Minime → RIPH 2 ; Aucune → RIPH 3.',
        'Données nouvelles ? « Données déjà existantes » mène vers une recherche sur données.',
        'Promoteur hors UE : il doit désigner un représentant légal dans l’UE.',
      ],
    },
  ],
  keep: {
    title: 'À retenir',
    items: [
      'Le type d’étude ne peut plus être changé une fois validé.',
      'Après « Continuer », l’étape est cochée en vert.',
      'La catégorie réglementaire dépend des pays choisis à l’étape Sites : sans pays, elle affiche « Non concerné ».',
    ],
  },
  guide: '/guides/creer-etude/',
};

export const en: Sheet = {
  title: 'Create a study',
  sub: 'Type, information and regulatory framework, the first three steps of the wizard.',
  time: '8 min',
  before: {
    title: 'Open the wizard',
    text: 'Open Studies → New study. This guide follows the Advanced mode; in Essential mode, the same fields are grouped into fewer steps.',
  },
  steps: [
    {
      title: '1. Study type',
      items: [
        'Type: Prospective study (data entered visit by visit) or Retrospective (analysis dataset).',
        'This choice determines what follows and cannot be changed once validated.',
        'Unfinished draft: click its name to resume it, the cross deletes it.',
      ],
    },
    {
      title: '2. Information',
      items: [
        'Sponsor: the organisation responsible for the study.',
        'Study ID: short, unique code (letters, digits, hyphens), converted to uppercase; it prefixes identifiers.',
        'Short title: the readable name of the study in lists.',
        'Greyed-out values are examples: they disappear as soon as you type.',
      ],
    },
    {
      title: '3. Regulatory framework',
      items: [
        'Health product studied: medicinal product, device, in vitro diagnostic or none (CTR, MDR, IVDR).',
        'Intervention added to care: Not minimal → RIPH 1; Minimal → RIPH 2; None → RIPH 3.',
        'New data? "Existing data" leads to a research on data.',
        'Non-EU sponsor: must appoint a legal representative in the EU.',
      ],
    },
  ],
  keep: {
    title: 'Keep in mind',
    items: [
      'The study type cannot be changed once validated.',
      'After "Continue", the step is ticked in green.',
      'The regulatory category depends on the countries chosen in the Sites step: with none, it shows "Not applicable".',
    ],
  },
  guide: '/en/guides/creer-etude/',
};

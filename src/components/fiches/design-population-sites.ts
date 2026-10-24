import type { Sheet } from './content';

export const fr: Sheet = {
  title: 'Design, population et sites',
  sub: "Décrire l'essai, qui peut être inclus, et dans quels établissements.",
  time: '8 min',
  before: {
    title: 'Sites optionnels',
    text: 'Les sites sont optionnels à ce stade : vous pourrez en ajouter depuis la page Configuration de l’étude. Sans site, l’écart à l’effectif cible s’affiche en orange, ce qui n’est pas bloquant.',
  },
  steps: [
    {
      title: '4. Design',
      items: [
        'Phase : le stade de développement. Pour un dispositif, choisissez la phase la plus proche.',
        'Design de l’essai : les designs randomisés activent la randomisation (ratio, par ex. 1:1).',
        'Aveugle et Type de contrôle : placebo, comparateur actif, soins standard ou aucun.',
        'Durée totale : calculée automatiquement (inclusion + suivi), modifiable.',
      ],
    },
    {
      title: '5. Population',
      items: [
        'Effectif cible : nombre de patients à inclure, référence des objectifs par site.',
        'Âge minimum / maximum : l’âge maximum doit être supérieur à l’âge minimum.',
        'Critères d’inclusion / d’exclusion : tapez un critère puis Entrée ; la croix l’enlève.',
      ],
    },
    {
      title: '6. Sites',
      items: [
        'Pays : détermine les exigences réglementaires appliquées (France, UE…).',
        'Site : choisi dans le référentiel, ou créé avec « Créer un nouveau site ».',
        'Investigateur principal : il voit uniquement les patients de son site.',
        'Objectif : patients attendus sur le site ; la somme est comparée à l’effectif cible.',
      ],
    },
  ],
  keep: {
    title: 'À retenir',
    items: [
      'La durée totale se calcule seule, mais reste modifiable.',
      'L’âge maximum doit dépasser l’âge minimum : le message s’affiche sous le champ.',
      'Les pays choisis ici déterminent les exigences réglementaires.',
    ],
  },
  guide: '/guides/design-population-sites/',
};

export const en: Sheet = {
  title: 'Design, population and sites',
  sub: 'Describe the trial, who can be enrolled, and at which institutions.',
  time: '8 min',
  before: {
    title: 'Sites are optional',
    text: 'Sites are optional at this stage: you can add them later from the study Configuration page. Without a site, the gap to the target is shown in orange, which is not blocking.',
  },
  steps: [
    {
      title: '4. Design',
      items: [
        'Phase: the development stage. For a device, choose the closest phase.',
        'Trial design: randomised designs enable randomisation (ratio, e.g. 1:1).',
        'Blinding and Control type: placebo, active comparator, standard of care or none.',
        'Total duration: calculated automatically (enrolment + follow-up), editable.',
      ],
    },
    {
      title: '5. Population',
      items: [
        'Target sample size: number of patients to enrol, the reference for site targets.',
        'Minimum / maximum age: the maximum age must be greater than the minimum age.',
        'Inclusion / exclusion criteria: type a criterion then press Enter; the cross removes it.',
      ],
    },
    {
      title: '6. Sites',
      items: [
        'Countries: determines the regulatory requirements applied (France, EU…).',
        'Site: chosen from the directory, or created with "Create a new site".',
        'Principal investigator: they only see the patients of their site.',
        'Target: patients expected at the site; the sum is compared with the target sample size.',
      ],
    },
  ],
  keep: {
    title: 'Keep in mind',
    items: [
      'The total duration is calculated automatically but stays editable.',
      'The maximum age must exceed the minimum age: the message appears below the field.',
      'The countries chosen here determine the regulatory requirements.',
    ],
  },
  guide: '/en/guides/design-population-sites/',
};

import type { Sheet } from './content';

export const fr: Sheet = {
  title: 'Randomiser un patient',
  sub: "Attribuer un bras de traitement, gérer l'aveugle et la levée d'aveugle d'urgence.",
  time: '5 min',
  before: {
    title: 'Études concernées',
    text: "Uniquement les études à design randomisé. La randomisation n'est pas disponible pour une RIPH 3.",
  },
  steps: [
    {
      title: 'Paramètres (data manager)',
      items: [
        'Configurés à la création de l’étude, puis verrouillés en production.',
        'Ratio : la répartition entre bras.',
        'Taille de bloc : doit être un multiple de la somme du ratio.',
        'Facteurs de stratification : équilibrent les bras au sein de chaque strate.',
      ],
    },
    {
      title: 'Randomiser',
      items: [
        'Fiche patient → Randomiser ; le bouton n’apparaît qu’une fois l’éligibilité confirmée.',
        'Strates : pré-remplies depuis l’eCRF quand c’est possible.',
        'Signature : votre mot de passe ; la randomisation est définitive et signée.',
        'En aveugle, seul le numéro de traitement s’affiche, jamais le bras.',
      ],
    },
    {
      title: 'Lever l’aveugle en urgence',
      items: [
        'Fiche patient → Levée d’aveugle ; réservé à l’investigateur principal.',
        'Motif : obligatoire, conservé dans l’audit trail.',
        'Confirmation par mot de passe : une notification part au promoteur et au data manager.',
      ],
    },
  ],
  keep: {
    title: 'À retenir',
    items: [
      'La randomisation est définitive et signée.',
      'La levée d’aveugle est irréversible : le bras n’est révélé qu’à l’utilisateur qui la lève, pour ce patient.',
      'Les paramètres sont verrouillés en production.',
    ],
  },
  guide: '/guides/randomisation/',
};

export const en: Sheet = {
  title: 'Randomize a patient',
  sub: 'Assign a treatment arm, manage blinding and emergency unblinding.',
  time: '5 min',
  before: {
    title: 'Studies concerned',
    text: 'Randomized-design studies only. Randomization is not available for a RIPH 3.',
  },
  steps: [
    {
      title: 'Settings (Data Manager)',
      items: [
        'Configured when the study is created, then locked in production.',
        'Ratio: the allocation between arms.',
        'Block size: must be a multiple of the sum of the ratio.',
        'Stratification factors: balance the arms within each stratum.',
      ],
    },
    {
      title: 'Randomize',
      items: [
        'Patient record → Randomize; the button only appears once eligibility is confirmed.',
        'Strata: pre-filled from the eCRF when possible.',
        'Signature: your password; randomization is final and signed.',
        'When blinded, only the treatment number is displayed, never the arm.',
      ],
    },
    {
      title: 'Emergency unblinding',
      items: [
        'Patient record → Unblind; restricted to the principal investigator.',
        'Reason: required, kept in the audit trail.',
        'Confirmation by password: a notification is sent to the sponsor and the Data Manager.',
      ],
    },
  ],
  keep: {
    title: 'Keep in mind',
    items: [
      'Randomization is final and signed.',
      'Unblinding is irreversible: the arm is revealed only to the user who unblinds, for that patient.',
      'Settings are locked in production.',
    ],
  },
  guide: '/en/guides/randomisation/',
};

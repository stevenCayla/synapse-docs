import type { Sheet } from './content';

export const fr: Sheet = {
  title: 'Premiers pas',
  sub: 'Votre compte, la double authentification et la façon dont Synapse enregistre votre travail.',
  time: '5 min',
  before: {
    title: 'Essentiel ou Avancé',
    text: "L'assistant de création d'étude propose deux modes, à changer à tout moment dans l'en-tête sans perdre ce que vous avez saisi. Essentiel : 6 étapes, pour créer vite. Avancé : 12 étapes, pour tout configurer d'emblée.",
  },
  steps: [
    {
      title: 'Votre compte',
      items: [
        'Votre administrateur vous envoie une invitation.',
        'Double authentification : scannez le QR code avec Google Authenticator ou Microsoft Authenticator.',
        'Codes de secours : ils servent si vous perdez votre téléphone. Rangez-les hors de votre ordinateur.',
        'Mot de passe : il sert aussi à signer électroniquement (import, validation de formulaires).',
      ],
    },
    {
      title: 'Comment Synapse enregistre',
      items: [
        'Enregistrement automatique : chaque champ est enregistré quelques secondes après la saisie.',
        'Le pied de fenêtre affiche « Brouillon enregistré · à l’instant ».',
        'Continuer valide l’étape ; une valeur refusée s’affiche sous le champ concerné.',
      ],
    },
    {
      title: 'Panneau Complétude',
      items: [
        'Bloquants : empêchent de lancer l’étude.',
        'Avant production : à lever avant la mise en production, sans bloquer la création.',
        'Avertissements : simple information.',
        'Cliquez sur une ligne pour aller directement au champ concerné.',
      ],
    },
  ],
  keep: {
    title: 'À retenir',
    items: [
      'Fermer la fenêtre ne perd rien : Nouvelle étude propose de reprendre le brouillon.',
      'Gardez votre mot de passe en tête : il sert aux signatures électroniques.',
      'Conservez vos codes de secours hors de votre ordinateur.',
    ],
  },
  guide: '/guides/premiers-pas/',
};

export const en: Sheet = {
  title: 'Getting started',
  sub: 'Your account, two-factor authentication and how Synapse saves your work.',
  time: '5 min',
  before: {
    title: 'Essential or Advanced',
    text: 'The study creation wizard offers two modes, which you can switch at any time from the header without losing what you have entered. Essential: 6 steps, to create quickly. Advanced: 12 steps, to configure everything upfront.',
  },
  steps: [
    {
      title: 'Your account',
      items: [
        'Your administrator sends you an invitation.',
        'Two-factor authentication: scan the QR code with Google Authenticator or Microsoft Authenticator.',
        'Backup codes: they let you sign in if you lose your phone. Store them somewhere other than your computer.',
        'Password: it is also used for electronic signatures (import, form validation).',
      ],
    },
    {
      title: 'How Synapse saves',
      items: [
        'Autosave: each field is saved a few seconds after you type.',
        'The window footer shows "Draft saved · just now".',
        'Continue validates the step; a rejected value is shown below the field concerned.',
      ],
    },
    {
      title: 'Completeness panel',
      items: [
        'Blocking: prevent the study from being launched.',
        'Before production: to be resolved before go-live, they do not block creation.',
        'Warnings: for information only.',
        'Click a line to go straight to the field concerned.',
      ],
    },
  ],
  keep: {
    title: 'Keep in mind',
    items: [
      'Closing the window loses nothing: New study offers to resume the draft.',
      'Remember your password: it is used for electronic signatures.',
      'Store your backup codes somewhere other than your computer.',
    ],
  },
  guide: '/en/guides/premiers-pas/',
};

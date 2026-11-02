---
title: "Variables d'environnement : bandeau d'environnement et garde-fous du courrier"
description: "Variables APP_ENVIRONMENT_LABEL et MAILER_ALLOWED_RECIPIENTS : bandeau et garde-fous du courrier hors production."
---

## `APP_ENVIRONMENT_LABEL`

Affiche, sur toutes les pages (page de connexion et pages 2FA comprises), un bandeau discret en haut de l'écran
avec le nom de l'environnement et la version, pour que personne ne confonde la recette ou le serveur de développement avec la production.

| Valeur | Effet |
|--------|-------|
| vide (défaut) | aucun bandeau : **valeur de la production** |
| `development` | bandeau bleu « Environnement de développement » (serveur de développement, `dev-app.synapse-medical.fr`) |
| `uat` | bandeau orange « Environnement de recette (UAT) » (recette, `uat-app.synapse-medical.fr`) |
| autre texte | bandeau gris affichant ce texte tel quel |

Les libellés `development` et `uat` sont traduits (français, anglais, selon la langue de l'interface).
Le bandeau est du HTML et du CSS servis comme le reste de l'application : aucun script ni style en ligne (Content Security Policy respectée).

Exemple (fichier `.env.local` du serveur, lu par `compose.prod.yaml`) :

```dotenv
APP_ENVIRONMENT_LABEL=uat
```

Recréer les conteneurs après modification (`docker compose up -d`).

## `MAILER_ALLOWED_RECIPIENTS`

Liste des destinataires autorisés à recevoir des e-mails, pour qu'un serveur de recette ou de développement n'écrive jamais à de vrais utilisateurs.
Valeurs séparées par des virgules, espaces et casse ignorés :

| Entrée | Effet |
|--------|-------|
| `example.org` ou `@example.org` | tout le domaine `example.org` (pas ses sous-domaines) |
| `prenom.nom@example.org` | cette adresse seulement |
| `*` | tout le monde |

Règles :

- les destinataires hors liste sont retirés de l'envoi et journalisés (avertissement, adresse masquée `p***@domaine` et sujet, jamais le corps) ; sans destinataire restant, le message n'est pas envoyé (aucune erreur côté application) ;
- **échec fermé** : si `APP_ENVIRONMENT_LABEL` est renseigné et que la liste est vide, aucun e-mail n'est envoyé (un avertissement est journalisé) ;
- **production** : laisser la variable **et** `APP_ENVIRONMENT_LABEL` vides, aucun filtrage ;
- **serveur de développement** : `*`, car son courrier part vers une boîte de test ; **recette** : seulement le domaine de l'équipe ou des adresses précises ;
- quand `APP_ENVIRONMENT_LABEL` est renseigné, le sujet est préfixé de `[NOM]` (en majuscules) et chaque e-mail se termine par « E-mail envoyé depuis l'environnement … — données fictives, ne pas répondre. ».

```dotenv
APP_ENVIRONMENT_LABEL=uat
MAILER_ALLOWED_RECIPIENTS=synapse-medical.fr,prenom.nom@example.org
```

## `APP_WEBSITE_URL`

URL de base du site public, vers lequel le lien « Demander une démo » de la page de connexion renvoie (nouvel onglet). L'application ajoute `/demo/` en français et `/en/demo/` en anglais, selon la langue de la page. Les demandes de démo sont traitées par le seul site public : l'application n'expose aucun formulaire qui envoie des e-mails.

- défaut : `https://synapse-medical.fr` (production) ; un `/` final est ignoré ;
- exemple : `APP_WEBSITE_URL=https://synapse-medical.fr` donne `https://synapse-medical.fr/demo/` et `https://synapse-medical.fr/en/demo/`.

Recréer les conteneurs après modification (`docker compose up -d`).

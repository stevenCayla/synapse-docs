---
title: "Variables d'environnement : bandeau d'environnement et garde-fous du courrier"
description: "Variables APP_ENVIRONMENT_LABEL, APP_PROFILE_SWITCHER et MAILER_ALLOWED_RECIPIENTS : bandeau, sélecteur de profil et garde-fous du courrier hors production."
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

## `APP_PROFILE_SWITCHER`

Active le sélecteur de profil (entrée « Changer de profil » du menu utilisateur, juste sous « Mon profil ») : un super administrateur agit en tant qu'un autre utilisateur du workspace actif pour tester ses droits réels (rôle de workspace, rôle d'étude, sites).
Il s'appuie sur le `switch_user` de Symfony : aucun rôle simulé, les voters et la restriction par site s'appliquent comme pour la personne.

| Condition | Effet |
|-----------|-------|
| `APP_PROFILE_SWITCHER=1` **et** `APP_ENVIRONMENT_LABEL` valant `local` ou `development` | l'entrée apparaît dans le menu utilisateur d'un super administrateur (jamais sur les écrans de configuration de la double authentification ni de changement de mot de passe obligatoire) |
| tout autre cas (variable absente, vide ou différente de `1` ; libellé vide, `uat`, `production`, autre texte) | rien n'est affiché, les routes `/dev/profile-switcher/*` répondent 404, aucun changement de profil n'est accepté |

- **Valeur par défaut : désactivé** (`.env`). **Recette et production : toujours désactivé**, même si la variable est renseignée, car le libellé de ces environnements n'est pas `local` ni `development`. `APP_ENV` n'est pas utilisé (le serveur de développement tourne en `prod`).
- **Le changement d'utilisateur n'existe qu'en local et en développement** (Refs #349) : sans `APP_PROFILE_SWITCHER=1` et un libellé `local` ou `development`, toute requête `_switch_user` est refusée (403) pour tous les rôles, et les liens des pages Utilisateurs et Équipe disparaissent. **Plus d'usurpation en recette ni en production** (à signaler au support) ; la sortie reste possible.
- Réservé au rôle `ROLE_SUPER_ADMIN`. Cibles : les utilisateurs actifs du workspace actif uniquement (jamais un autre workspace, jamais soi-même), revérifiées côté serveur à chaque changement. La liste est chargée à l'ouverture de la fenêtre, jamais au chargement d'une page.
- Pendant le changement de profil, le bandeau d'environnement affiche « Vous agissez en tant que… » avec le retour à son propre profil, sur toutes les pages, et l'entrée du menu reste disponible pour changer de nouveau. Un changement de profil ouvre l'accueil (la page courante peut être interdite à la personne choisie), le retour revient à la page courante.
- Le changement se fait par `POST` avec un jeton CSRF ; le retour aussi. Chaque début et chaque fin sont journalisés dans le journal d'audit de sécurité (`impersonation.start`, `impersonation.end`, avec l'utilisateur réel et la cible).
- **Aucune signature électronique pendant un changement de profil** (eCRF, approbations de configuration, signature d'import, publication d'un pack réglementaire) : elle engage la personne réelle. Cela vaut pour toute session d'usurpation, y compris celle des pages Utilisateurs et Équipe.
- L'authentification à deux facteurs et le changement de mot de passe obligatoire de l'utilisateur réel sont exigés pour démarrer ; pendant le changement de profil, ceux de la cible ne sont pas appliqués (comme pour l'usurpation existante).

Serveur de développement (`.env.local`, lu par `compose.prod.yaml`) :

```dotenv
APP_ENVIRONMENT_LABEL=development
APP_PROFILE_SWITCHER=1
```

Poste local : `APP_ENVIRONMENT_LABEL=local` et `APP_PROFILE_SWITCHER=1` dans `.env.local`. Recréer les conteneurs après modification (`docker compose up -d`).

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

## `TRUSTED_HOSTS`

Expression régulière (une seule) que l'en-tête `Host` de chaque requête doit satisfaire (`framework.trusted_hosts`, insensible à la casse). Une requête dont le `Host` (ou `X-Forwarded-Host` d'un proxy de confiance) ne correspond pas est refusée (400) : un `Host` forgé ne peut plus se retrouver dans les liens absolus des e-mails (réinitialisation du mot de passe, invitations).

- **Défaut** (développement local, piles E2E sur n'importe quel port, test) : `^(localhost|127\.0\.0\.1|\[::1\]|php)(:[0-9]+)?$`.
- **Production, recette, développement** : `TRUSTED_HOSTS` est **obligatoire** (`compose.prod.yaml` refuse de démarrer sans). Aucune expression n'est construite à partir de `DOMAIN` : un point non échappé accepterait des domaines voisins (`app-synapse-medical.fr`).
- Échapper les points ; mettre la valeur entre guillemets simples dans `.env.local`.

- Production : `'^(app\.synapse-medical\.fr|old\.synapse-medical\.fr)(:[0-9]+)?$'` (retirer `old` à la fin de la migration).
- Recette (UAT) : `'^uat-app\.synapse-medical\.fr(:[0-9]+)?$'`.
- Développement : `'^dev-app\.synapse-medical\.fr(:[0-9]+)?$'`.

Les appels internes (contrôle de santé sur l'API d'administration de Caddy, Mercure) ne passent pas par Symfony : `php` et `localhost` n'ont pas à figurer dans ces valeurs. La recette et le serveur de développement doivent aussi définir `TRUSTED_HOSTS`, sinon le défaut local s'applique et toute requête reçoit un 400.

## `DEFAULT_URI`

URL publique de base (`https://domaine`), utilisée pour les liens absolus générés **hors requête** (commandes console, worker Messenger, par exemple `app:gcp:send-expiry-reminders`). Dans une requête, les liens suivent le `Host` de la requête, borné par `TRUSTED_HOSTS`. En production, `compose.prod.yaml` la fixe à `https://${DOMAIN}` pour `php` et pour `worker`.

## Cookies

Le cookie de session (`PHPSESSID`), le cookie remember-me et le cookie d'appareil (`_syn_did`) sont `HttpOnly` et `SameSite=Lax` ; en production (`APP_ENV=prod`) ils sont toujours `Secure`, quel que soit l'en-tête `X-Forwarded-Proto` du proxy. En développement et en test, `Secure` suit la requête (les piles E2E peuvent tourner en HTTP).

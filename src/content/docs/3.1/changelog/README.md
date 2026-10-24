---
title: Journal des modifications
description: Politique de versioning de Synapse Medical (SemVer + GitHub
  Releases + Keep a Changelog) et historique des versions notables.
sidebar:
  label: Journal des modifications
  order: 1
slug: 3.1/changelog/readme
---

> 🌐 Version française · [English version](/en/3.1/changelog/readme/)

Synapse Medical suit le **[Semantic Versioning](https://semver.org/lang/fr/)**
(`MAJOR.MINOR.PATCH`) et le format **[Keep a Changelog](https://keepachangelog.com/fr/1.1.0/)**.

| Source | Rôle |
|--------|------|
| [`CHANGELOG.md`](https://github.com/stevenCayla/SYNAPSE-MEDICAL/blob/main/CHANGELOG.md) (racine du dépôt) | **Source de vérité**, format Keep a Changelog |
| [GitHub Releases](https://github.com/stevenCayla/SYNAPSE-MEDICAL/releases) | Une release par version publiée (tag `vX.Y.Z`) |
| Cette page | Reflet lisible de l'historique des versions |

:::note[Convention SemVer]
* **MAJOR** — changements incompatibles ([changements incompatibles](/3.1/changelog/breaking-changes/)).
* **MINOR** — nouvelles fonctionnalités rétrocompatibles.
* **PATCH** — corrections rétrocompatibles.
:::

## Version actuelle — `3.1.0`

Version intermédiaire vers l'assistant de création d'étude : socle de données, service d'import, worker et clôture d'étude ; version applicative (`APP_VERSION`).

## En cours (`Unreleased`)

Rien pour le moment.

## `3.1.0`

Version intermédiaire : elle livre le socle de l'assistant de création d'étude et la clôture d'une étude, **sans nouvel écran de création ni d'import**.

:::caution[À vérifier avant déploiement]
* **Aucun écran d'import** : l'ancien import est retiré (#82) et le nouveau n'a pas encore d'interface (service, worker et points d'accès JSON seulement).
* **Démarrer le nouveau service `worker`** (#88) et le recréer à chaque déploiement (`up -d --force-recreate worker` sans reconstruction) ; les messages en échec se gèrent avec `messenger:failed:show` / `retry` / `remove`.
* **Volume nommé `private_uploads`** (#108) : si des fichiers ont déjà été déposés en production, les copier avant le déploiement puis dans le volume (voir le guide de production).
* **Deux migrations**, appliquées au démarrage : `Version20261017160000` (#83) et `Version20261018091435` (#88). Sauvegarder la base avant de déployer ; aucune reprise de données manuelle.
* `MESSENGER_TRANSPORT_DSN` est intégrée à l'image (rien à ajouter) ; `IMPORT_ASYNC_THRESHOLD` est facultative (2000 par défaut).
:::

### Ajouté

* **Clôture d'une étude prospective** (#84) : bouton « Clôturer l'étude », réservé aux administrateurs, quand les données sont verrouillées.
* **Modèle de données de la création d'étude v2** (#83), service d'**import de données** (#87), **worker Messenger** pour les gros fichiers (#88) et **définition de champs eCRF depuis les colonnes** (#92) : sans écran dans cette version.
* **Tests de bout en bout** Playwright, exécutés en CI (#80).

### Modifié

* Dépendances de la CI et correctifs Composer (#96) ; le service `worker` démarre aussi en développement.

### Supprimé

* **Ancien import de données** (#82) et ses entrées de menu.

### Corrigé

* **Fichiers déposés** conservés à la recréation du conteneur en production (#108).
* **Gel et dégel d'une étude** : plus d'erreur 500 (#84).
* **Clone neuf** : plus d'erreur 500 sur `/login`, secrets de développement générés (#50).
* **Sauvegarde automatique eCRF** : mêmes règles que la saisie complète (#82) ; une étude dupliquée reste dans son workspace.

## `3.0.1`

Version corrective : aucune fonctionnalité nouvelle, pas de changement incompatible.

:::caution[À vérifier avant déploiement]
* La migration `Version20261015110000` (#62) **s'arrête sans rien modifier** et liste les doublons si la base contient plusieurs saisies eCRF pour un même patient d'étude, formulaire et visite. La requête de détection et la résolution sont décrites dans l'en-tête de la migration. Sauvegarder la base avant de déployer.
* `make db-setup` n'existe plus : utiliser `make up` puis `make migrate`.
:::

### Supprimé

* **`make db-setup`, `bin/setup-db.sh` et `docker/db/provision.sql`** (#52) : obsolètes (le conteneur PostgreSQL crée le rôle et la base, l'entrypoint de `php` applique les migrations).

### Corrigé

* **CSP** (#48) : scripts en ligne avec nonce et gestionnaires d'événements en ligne remplacés par des attributs `data-*`.
* **Aperçu du builder eCRF** (#49) : menu déroulant des choix multiples non coupé, couleurs du thème.
* **2FA** (#59) : codes de secours générés à la configuration, affichés une seule fois et gérés depuis le profil ; soumission du code 2FA de la page de connexion corrigée.
* **eCRF** (#62) : index uniques partiels de `ecrf_record` recréés ; la migration liste les doublons éventuels.
* **Invitations** (#63) : valeur par défaut de `assigned_role` alignée sur `member`.
* **Membres d'étude** (#74) : pages d'ajout et de modification, utilisateurs limités au workspace.
* **Création d'un eCRF d'étude** (#75) : la page `/studies/{id}/ecrf/new` ne renvoie plus d'erreur 500.

### Modifié

* CI : Composer authentifié pour éviter les erreurs HTTP 429 (#67).

## `3.0.0`

### Changements incompatibles

* **PostgreSQL 18** : nouveau volume `database_data_pg18`, migration manuelle (voir [Migration vers PostgreSQL 18](/3.1/deployment/postgresql-18-upgrade/)) ; `POSTGRES_VERSION` supprimée.
* **`app:seed`** : options `--admin-email` / `--admin-password` supprimées (utiliser `--admin` et `SEED_ADMIN_PASSWORD`) ; plus d'administrateur par défaut : `--reset` exige un super-administrateur nommé (`--admin=<email>` hors mode interactif).
* Service **`backup`** derrière le profil Compose `backup`.
* **Hub Mercure 1.0** : bloc `issuer`, `match=` à la place de `topic=`.

### Ajouté

* Documentation développeur FR/EN, site de documentation dans `synapse-docs`, Quick Start, diagrammes Mermaid.
* Outillage qualité (PHPStan, php-cs-fixer, Rector), audit hebdomadaire des dépendances, Dependabot sur `develop`.
* Simulateur d'autorisations RBAC, favicon adaptatif.

### Modifié

* **PostgreSQL 18**, **Symfony 8.1**, **PHP 8.5.11** minimum, images conteneur épinglées, choices.js 11.
* Refonte de plusieurs pages de l'interface et seed sans données personnelles ni administrateur par défaut.
* Connexion : un utilisateur sans 2FA configurée arrive sur la page de configuration `/2fa/setup` au lieu d'un code inexistant.
* Schéma Doctrine resynchronisé avec les migrations et validé en CI ; l'identifiant d'étude n'est plus unique que par workspace ; chaque entrée du journal d'audit a toujours un auteur.

### Sécurité

* Avis symfony/yaml CVE-2026-109413 et symfony/http-foundation CVE-2026-108082 corrigés ; 48 autres avis corrigés par la mise à jour des dépendances.

## `2.0.4`

Version interne, jamais publiée en release : son contenu est inclus dans `3.0.0`.

### Ajouté

* Simulateur d'autorisations **« what can this user do »** (RBAC).
* Documentation technique développeur bilingue.
* Favicon adaptatif (`prefers-color-scheme`).

### Modifié

* Page Accès redessinée ; KPI des centres basé sur le **taux d'inclusion moyen**.

### Corrigé

* KPI des centres sur toute la largeur ; bouton « Réinitialiser » masqué sans filtre.

***

> 📋 L'historique complet et détaillé est maintenu dans [`CHANGELOG.md`](https://github.com/stevenCayla/SYNAPSE-MEDICAL/blob/main/CHANGELOG.md). Pour les
> ruptures de compatibilité, voir [Changements incompatibles](/3.1/changelog/breaking-changes/).

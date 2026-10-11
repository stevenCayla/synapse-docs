---
title: "Release process"
description: "Préparer, valider, taguer et déployer une nouvelle version de Synapse Medical — branches, changelog, APP_VERSION, CI, build de production et rollback."
sidebar:
  label: "Processus de release"
  order: 2
---

> 🌐 Version française · [English version](/en/deployment/release-process/)

Cette page décrit le chemin complet d'une modification, de la branche de
fonctionnalité jusqu'à la mise en production. La politique de numérotation et
de publication (SemVer, tag, GitHub Release) est définie dans
**[Versions & processus de release](/changelog/releases/)** ; elle n'est pas
répétée ici.

:::note[Processus manuel]
À ce jour, **rien n'est automatisé** côté release : pas de workflow de tag, pas
de génération automatique de GitHub Release, pas de déploiement continu. La CI
(`.github/workflows/ci.yaml`) valide le build et le lint, mais le tag, la
release et le déploiement sont réalisés à la main en suivant cette page.
:::

## Vue d'ensemble

```
feature/*  ──PR──▶  develop  ──PR de release──▶  main  ──tag vX.Y.Z──▶  GitHub Release
                                                   │
                                                   └──▶ serveur : git pull + build frankenphp_prod + up -d
                                                                  (migrations appliquées au démarrage)
```

| Élément | Emplacement | Rôle |
|---------|-------------|------|
| Journal des modifications | `CHANGELOG.md` (racine) | Format [Keep a Changelog 1.1.0](https://keepachangelog.com/fr/1.1.0/), section `[Unreleased]` |
| Version applicative | `APP_VERSION` dans `.env` (actuellement `2.0.4`) | Exposée à Twig (`app_version`) et au site de documentation |
| Version de la doc | Dépôt `synapse-docs` : `astro.config.mjs` → `src/version.ts` | Dérivée de `APP_VERSION` au build |
| CI | `.github/workflows/ci.yaml` | Build Docker, smoke-tests HTTP/Mercure, `composer audit`, lint |
| Image de production | `Dockerfile`, cible `frankenphp_prod` + `compose.prod.yaml` | Image slim `debian:13-slim`, utilisateur `www-data` |
| Migrations | `frankenphp/docker-entrypoint.sh` | `doctrine:migrations:migrate --all-or-nothing` au démarrage du conteneur |

## 1. Branches

Le dépôt suit un flux à trois niveaux :

| Branche | Contenu | Alimentée par |
|---------|---------|---------------|
| `feature/*`, `fix/*`, `refactor/*`, `docs/*`, `chore/*` | Une modification isolée | Création depuis `develop` |
| `develop` | Prochaine version en cours d'intégration | Pull Requests des branches de travail |
| `main` | Dernière version publiée | Pull Request de release depuis `develop` |

- Chaque Pull Request doit passer la CI avant fusion (voir [§ 3](#3-ce-que-la-ci-vérifie)).
- Les messages de commit suivent [Conventional Commits](https://www.conventionalcommits.org/),
  en anglais (voir le [guide de contribution](/contribute/)).
- Un correctif urgent peut partir de `main` (`fix/*`) ; il doit ensuite être
  réintégré dans `develop` pour ne pas être perdu à la release suivante.

:::caution[Écart avec CONTRIBUTING.md]
`CONTRIBUTING.md` indique encore de créer les branches depuis `main` et d'ouvrir
les PR vers `main`. En pratique, les Pull Requests sont fusionnées dans
`develop`, et `main` ne reçoit que les releases.
:::

## 2. Tenir le changelog au fil de l'eau

Chaque PR qui change un comportement visible ajoute une ligne dans la section
`[Unreleased]` de `CHANGELOG.md`, sous la rubrique adaptée :

| Rubrique | Usage |
|----------|-------|
| `Added` | Nouvelle fonctionnalité |
| `Changed` | Modification d'un comportement existant |
| `Deprecated` | Fonctionnalité appelée à disparaître |
| `Removed` | Fonctionnalité supprimée |
| `Fixed` | Correction de bug |
| `Security` | Correction de vulnérabilité |

Un changement incompatible (qui impose un incrément **MAJOR**) doit aussi être
documenté dans [Changements incompatibles](/changelog/breaking-changes/).

## 3. Ce que la CI vérifie

Le workflow `CI` se déclenche sur chaque **Pull Request**, sur chaque **push sur
`main`** et manuellement (`workflow_dispatch`). Il ne se déclenche **pas** sur un
push direct sur `develop` ni sur un tag.

| Job | Étapes réellement exécutées |
|-----|-----------------------------|
| **Tests** | Build des images (`compose.yaml` + `compose.override.yaml`, donc la cible **dev**), `docker compose up --wait`, `curl` sur `http://localhost`, vérification du hub Mercure (`/.well-known/mercure`) |
| **Security** | `composer install` puis `composer audit` (PHP 8.4 via `setup-php`) |
| **Lint** | `super-linter/slim` (YAML, Markdown, Shell, GitHub Actions…) |

:::danger[PHPUnit et la validation du schéma ne tournent pas en CI]
Les étapes de création de la base de test, de migration, de **PHPUnit** et de
`doctrine:schema:validate` sont présentes dans `ci.yaml` mais **commentées**.
La CI ne construit pas non plus l'image `frankenphp_prod`. Ces contrôles
doivent donc être exécutés **localement** avant chaque release (voir la
checklist ci-dessous).
:::

## 4. Checklist de pré-release

À dérouler sur `develop`, dans l'environnement Docker de développement
(`make up`), avant d'ouvrir la PR de release :

- [ ] **Tests** : `make test` passe sans échec, sans dépréciation ni avertissement
      (PHPUnit est configuré avec `failOnDeprecation`, `failOnNotice`, `failOnWarning`).
- [ ] **Mapping Doctrine** : `make sf c="doctrine:schema:validate"` → mapping et base synchronisés.
- [ ] **Migrations sur base vierge** : les migrations s'appliquent sur une base
      vide, du début à la fin (voir ci-dessous).
- [ ] **Aucune migration manquante** : `make migration` ne génère pas de nouveau
      fichier (supprimer le fichier vide éventuellement créé).
- [ ] **Recette manuelle** : dérouler la [checklist QA de release](/qa/readme/#checklist-de-recette-manuelle).
- [ ] **Build de production** : l'image `frankenphp_prod` se construit sans erreur
      (voir [§ 6](#6-build-de-production)).
- [ ] **Changelog** : section `[Unreleased]` renommée en `[X.Y.Z] - AAAA-MM-JJ`,
      nouvelle section `[Unreleased]` vide ajoutée, liens de comparaison en bas de fichier mis à jour.
- [ ] **Version** : `APP_VERSION=X.Y.Z` dans `.env` (et `.env.local.example`).
- [ ] **Changements incompatibles** documentés si la version est MAJOR.

### Vérifier les migrations sur une base vierge

```bash
# Base de test isolée (suffixe _test, cf. config/packages/doctrine.yaml)
make sf c="-e test doctrine:database:drop --force --if-exists"
make sf c="-e test doctrine:database:create"
make sf c="-e test doctrine:migrations:migrate --no-interaction --all-or-nothing"
make sf c="-e test doctrine:schema:validate"
```

L'option `--all-or-nothing` est celle utilisée par l'entrypoint en production :
toutes les migrations en attente sont appliquées dans une seule transaction, ou
aucune.

:::caution[Migrations et données chiffrées]
Une migration qui touche des colonnes chiffrées (PII patient, secrets TOTP) doit
être testée sur une copie de base réaliste, pas seulement sur une base vide. Voir
[Déploiement en production](/deployment/production/#3-étapes-post-déploiement)
pour les commandes de backfill associées.
:::

## 5. Publier la version

0. **Archiver la documentation** de la version précédente (nouvelle version mineure ou
   majeure uniquement), dans le dépôt `synapse-docs`, **avant** le commit de release : ce
   commit déclenche la synchronisation du contenu, qui remplacerait les pages actuelles.
   ```bash
   make archive VERSION=2.0   # garde la doc 2.0 en ligne sous /2.0/
   ```
   Commiter le résultat sur `develop` (voir le README de `synapse-docs`).
1. **Commit de release** sur `develop` : changelog daté + `APP_VERSION` mis à jour, par exemple
   `chore(release): 2.1.0`.
2. **PR de release** `develop` → `main`. La CI s'exécute sur la PR ; fusionner une fois verte.
3. **Tag annoté** sur le commit de `main` :
   ```bash
   git switch main && git pull
   git tag -a v2.1.0 -m "Release 2.1.0"
   git push origin v2.1.0
   ```
4. **GitHub Release** créée à la main depuis le tag ; les notes reprennent mot pour mot la
   section du `CHANGELOG.md` (voir [Versions & processus de release](/changelog/releases/)).
5. **Resynchroniser** `develop` avec `main` si un correctif y a été fusionné directement.

:::tip[Mettre à jour APP_VERSION avant le build]
`APP_VERSION` est lue dans `.env` et **figée dans l'image** au build
(`composer dump-env prod` dans la cible `frankenphp_prod_builder`). Le site de
documentation la reçoit par la synchronisation du contenu (fichier `APP_VERSION` du dépôt
`synapse-docs`, lu au build par `astro.config.mjs` et injecté via `vite.define` en
`__DOCS_VERSION__`).
Elle doit donc être modifiée **dans le commit de release**, avant de taguer et de
construire, sans quoi l'application et le sélecteur de version de la doc
afficheront l'ancienne version.
:::

## 6. Build de production

L'image de production est construite depuis la cible `frankenphp_prod` du
`Dockerfile`, via `compose.prod.yaml` :

| Étape (Dockerfile) | Effet |
|--------------------|-------|
| `frankenphp_prod_builder` | `APP_ENV=prod`, `APP_DEBUG=0`, `DATABASE_URL` factice pour le warmup |
| `composer install --no-dev` | Dépendances de production uniquement |
| `composer dump-autoload --classmap-authoritative` | Autoloader optimisé |
| `composer dump-env prod` | Compile `.env` en `.env.local.php` (dont `APP_VERSION`) |
| `asset-map:compile` | Compilation des assets AssetMapper |
| `frankenphp_prod` | Image finale `debian:13-slim`, bits setuid retirés, exécution en `www-data` |

Le `.dockerignore` exclut `tests/`, `docs/`, `.env.local`, `.env.test` et les
fichiers `compose.*` : l'image ne contient ni les tests ni les secrets. Ceux-ci
sont injectés à l'exécution par `compose.prod.yaml` depuis `.env.local` sur le
serveur (voir [Secrets](/deployment/production/#1-secrets)).

```bash
docker compose -f compose.yaml -f compose.prod.yaml build --pull --no-cache
```

## 7. Déployer sur le serveur

```bash
# 0. Sauvegarde manuelle juste avant la mise à jour (en plus du service backup)
docker compose -f compose.yaml -f compose.prod.yaml exec database \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > pre-v2.1.0_$(date +%Y%m%d%H%M).sql.gz

# 1. Récupérer la version taguée
git fetch --tags && git checkout v2.1.0

# 2. Reconstruire l'image (sans cache)
docker compose -f compose.yaml -f compose.prod.yaml build --pull --no-cache

# 3. Redémarrer ; l'entrypoint attend la base puis applique les migrations
docker compose -f compose.yaml -f compose.prod.yaml up -d
docker compose -f compose.yaml -f compose.prod.yaml logs -f php   # attendre « PHP app ready! »
```

Au démarrage, `frankenphp/docker-entrypoint.sh` :

1. lance `composer install` si `vendor/` est vide ;
2. attend la base de données (60 tentatives, 1 s d'intervalle) ;
3. exécute `doctrine:migrations:migrate --no-interaction --all-or-nothing` si
   `migrations/` contient des fichiers PHP ;
4. affiche `PHP app ready!` puis démarre FrankenPHP.

Si une migration échoue, la transaction est annulée et le conteneur s'arrête
(`set -e`) : consulter `logs php` avant toute autre action.

Enchaîner ensuite les [étapes post-déploiement](/deployment/production/#3-étapes-post-déploiement)
propres à la version et un smoke-test :

- [ ] `curl -I https://<domaine>` → `200`.
- [ ] Connexion avec 2FA, ouverture d'une étude ; la nouvelle version s'affiche sur la page de connexion et dans le pied de page (`v{{ app_version }}`).
- [ ] Hub Mercure joignable (`/.well-known/mercure`).
- [ ] Tous les conteneurs `healthy` / `running`.

:::caution[Persistance de `private_uploads/`]
Les fichiers uploadés (avatars, pièces jointes, documents cliniques eCRF) sont
stockés dans `private_uploads/` à la racine de l'application. `compose.prod.yaml`
ne déclare de volume que pour `/app/var`, `/data` et `/config` : vérifier sur le
serveur que `private_uploads/` est bien persisté (volume ou bind-mount) **avant**
de recréer le conteneur, sous peine de perdre ces fichiers.
:::

## 8. Rollback

Il n'existe pas de commande de rollback automatisée. La stratégie dépend de la
présence de migrations dans la version :

| Situation | Procédure |
|-----------|-----------|
| **Aucune migration** dans la version | `git checkout v<précédente>`, rebuild, `up -d` |
| **Migration échouée** au démarrage | Rien n'a été appliqué (`--all-or-nothing`) : revenir au tag précédent, rebuild, `up -d` |
| **Migrations appliquées**, schéma à annuler | Restaurer le `pg_dump` pris à l'étape 0 (ou la sauvegarde du service `backup`), puis redéployer le tag précédent |

`doctrine:migrations:migrate prev` est possible si les méthodes `down()` sont
fiables, mais la restauration d'une sauvegarde reste la méthode de référence
pour des données cliniques. Voir [Politique de sauvegarde](/deployment/backup/)
pour la procédure de restauration.

## Voir aussi

- [Versions & processus de release](/changelog/releases/) · [Journal des modifications](/changelog/readme/) · [Changements incompatibles](/changelog/breaking-changes/)
- [Déploiement en production](/deployment/production/) · [Déploiement Debian + Apache + Docker](/deployment/debian-apache-docker/)
- [QA & stratégie de test](/qa/readme/)

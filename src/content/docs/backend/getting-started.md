---
title: "Guide de démarrage développeur"
description: "Installer, lancer et contribuer à l'application en local : mise en place Docker, clés de chiffrement, jeu de données de développement, tests et workflow Git."
---

> 🌐 Version française · [English version](/en/backend/getting-started/)

Mettre en place l'environnement, lancer l'application et contribuer en local.

> Public : développeurs rejoignant le projet. Pré-requis : Docker + Docker Compose, Git, et `make`.

---

## Table des matières

1. [Pré-requis](#1-pré-requis)
2. [Installation en local](#2-installation-en-local)
3. [Premier démarrage](#3-premier-démarrage)
4. [Jeu de données de développement](#4-jeu-de-données-de-développement)
5. [Cycle de développement au quotidien](#5-cycle-de-développement-au-quotidien)
6. [Tests](#6-tests)
7. [Workflow Git & contribution](#7-workflow-git--contribution)
8. [Dépannage](#8-dépannage)

---

## 1. Pré-requis

| Outil | Version | Rôle |
|-------|---------|------|
| Docker Engine | ≥ 24 | Conteneurisation |
| Docker Compose | v2 | Orchestration |
| Make | — | Raccourcis (voir makefile.md) |
| Git | ≥ 2.30 | Versioning |

> Aucune installation locale de PHP/Composer/Node n'est nécessaire : **tout s'exécute dans le conteneur** (`php`). Le front-end utilise **AssetMapper** (pas de build Node).

---

## 2. Installation en local

```bash
git clone <url-du-repo> synapse-medical
cd synapse-medical

# Copier et adapter la configuration locale
cp .env.local.example .env.local
# → renseigner DATABASE_URL et les clés de chiffrement (voir §3)

make build      # docker compose build --pull --no-cache
make up         # démarre les conteneurs en arrière-plan
```

Au premier démarrage, l'entrypoint (`frankenphp/docker-entrypoint.sh`) exécute automatiquement `composer install`, attend la base de données, puis applique les migrations.

### Clés de chiffrement (obligatoires)

L'application chiffre les données patient et les secrets TOTP. Générer les clés et les placer dans `.env.local` :

```bash
# Clé 32 octets base64 (à faire pour chaque clé)
php -r "echo base64_encode(random_bytes(32)).PHP_EOL;"
```

| Variable | Usage |
|----------|-------|
| `APP_SECRET` | Secret Symfony (CSRF, remember-me, signatures HMAC) |
| `APP_TOTP_ENCRYPTION_KEY` | Chiffrement des secrets 2FA au repos |
| `APP_PATIENT_ENCRYPTION_KEY` | Chiffrement des PII patient |
| `APP_PATIENT_SEARCH_HMAC_KEY` | Index aveugle pour la recherche sur données chiffrées |

> ⚠️ **La perte de `APP_PATIENT_ENCRYPTION_KEY` ou `APP_TOTP_ENCRYPTION_KEY` rend les données concernées irrécupérables.** Conserver ces clés dans un coffre.

---

## 3. Premier démarrage

```bash
make up
make logs          # suivre les logs (Ctrl-C pour quitter)
```

L'application est servie par FrankenPHP :

| URL | Description |
|-----|-------------|
| https://localhost | Application (HTTP/3 activé) |
| http://localhost:8025 | Mailpit — interface de consultation des emails (dev) |
| https://localhost/api/doc | Swagger UI (voir [api/README.md](/api/readme/)) |

> Le certificat TLS local est auto-signé par Caddy : accepter l'exception dans le navigateur.

---

## 4. Jeu de données de développement

Une seule commande génère un environnement complet (workspace, admin, sites, utilisateurs, patients, études, eCRF) :

```bash
make sf c="app:seed --reset"
```

Identifiants par défaut : `steven@example.com` / `Password1!` (voir [commands/README.md](/commands/readme/) pour toutes les options).

> La **2FA est obligatoire** : au premier login, l'application redirige vers l'enrôlement TOTP (`/2fa/setup`). Scanner le QR code avec une app TOTP, ou provisionner via `app:totp:provision-missing`.

---

## 5. Cycle de développement au quotidien

Le mode **worker FrankenPHP** est lancé avec `--watch` en dev : les modifications de `src/` sont rechargées à chaud.

```bash
make sh            # shell sh dans le conteneur php
make bash          # shell bash avec historique
make cc            # vider le cache Symfony
make sf c=<cmd>    # exécuter une commande console
make composer c="require <paquet>"   # ajouter une dépendance
```

### Base de données & migrations

```bash
make sf c="make:migration"                 # générer une migration depuis les entités
make sf c="doctrine:migrations:migrate"    # appliquer les migrations
make sf c="doctrine:schema:validate"       # vérifier la cohérence ORM ↔ schéma
```

> ⚠️ **Worker mode** : tout service à état request-scoped doit implémenter `ResetInterface`. Voir [structure du code](/backend/symfony-structure/#mode-worker--règles-à-respecter).

---

## 6. Tests

```bash
make test                                  # PHPUnit complet (APP_ENV=test)
make test c="--filter StudyVoterTest"      # un test ciblé
make test c="--group e2e"                  # un groupe
```

La couverture est orientée **sécurité, contrôle d'accès, chiffrement et conformité eCRF**. Tout ajout dans `src/Security/`, `src/Service/` ou `src/Voter/` doit être accompagné de tests.

---

## 7. Workflow Git & contribution

1. Brancher depuis `main` : `feature/<sujet>` ou `fix/<sujet>`.
2. Commits conventionnels : `feat(scope): …`, `fix(scope): …`, `docs: …`, `refactor: …`.
3. Avant push : `make test` au vert + `doctrine:schema:validate`.
4. Ouvrir une PR vers `main` ; la `.github/workflows/ci.yaml` build les images et lance les health checks.
5. Respecter les règles d'architecture critiques (voir checklist ci-dessous).

### Checklist avant PR

- [ ] Aucune requête ne charge une ressource **par ID seul** (toujours filtrer par `workspace`).
- [ ] Les nouveaux uploads passent par `SecureFileUploadService` (jamais `public/`).
- [ ] Les services request-scoped implémentent `ResetInterface`.
- [ ] Les entrées d'audit (`ActivityLog`, `SecurityAuditLog`) ne sont jamais modifiées/supprimées.
- [ ] Tests ajoutés/à jour, `make test` au vert.
- [ ] Documentation mise à jour si évolution structurante.

---

## 8. Dépannage

| Symptôme | Piste |
|----------|-------|
| `composer install` ne se lance pas | Supprimer `vendor/` puis `make up` (l'entrypoint réinstalle) |
| Migrations non appliquées | `make sf c="doctrine:migrations:migrate"` |
| Erreur de connexion DB | Vérifier que le conteneur `database` est `healthy` (`docker compose ps`) |
| Données patient illisibles | Clés de chiffrement absentes/incohérentes dans `.env.local` |
| Redirigé en boucle vers `/2fa/setup` | Normal tant que la 2FA n'est pas enrôlée |
| Modifications non prises en compte | `make cc`, vérifier le mode `--watch` (logs) |

Voir aussi troubleshooting.md et xdebug.md.

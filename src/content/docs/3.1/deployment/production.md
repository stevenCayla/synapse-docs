---
title: Déploiement en production
description: Déployer Synapse Medical en production — Apache en reverse proxy
  devant FrankenPHP/Caddy, secrets obligatoires, étapes post-déploiement et
  vérifications.
sidebar:
  label: Production
  order: 1
slug: 3.1/deployment/production
---

> 🌐 Version française · [English version](/en/3.1/deployment/production/)

Cette page est le **point d'entrée** d'un déploiement en production. Elle décrit
l'architecture cible, les secrets obligatoires et le flux complet de
déploiement / mise à jour. Pour la configuration serveur pas-à-pas (Debian,
Apache, TLS), suivre le guide détaillé référencé ici.

:::note[Ce n'est pas le tutoriel générique Symfony Docker]
Contrairement au template Symfony Docker d'origine, cette application **n'expose
pas** le HTTPS automatique de Caddy sur Internet. En production, **Apache (sur
l'hôte) termine le TLS** et fait office de reverse proxy vers FrankenPHP/Caddy
écoutant sur `127.0.0.1:8080`. Le déploiement doit être pensé selon ce modèle.
:::

## Architecture cible

```
Internet ──HTTPS──▶ Apache2 (hôte Debian, :443, TLS via Let's Encrypt)
                        │ ProxyPass (HTTP) + WebSocket (Mercure)
                        ▼
                 FrankenPHP/Caddy (conteneur, 127.0.0.1:8080 → :80, auto_https off)
                        │
                 Worker PHP 8.5 (Symfony 8)         Worker Messenger (conteneur `worker`)
                        │
                 PostgreSQL 18 (conteneur, réseau interne uniquement)
```

* Le **TLS** est géré par Apache sur l'hôte, pas dans le conteneur.
* **PostgreSQL n'est jamais exposé** sur l'hôte en production.
* Un service **`backup`** réalise des sauvegardes PostgreSQL automatiques, **désactivé par défaut** (profil Compose `backup`, à activer avec `--profile backup` ou `COMPOSE_PROFILES=backup` avant tout stockage de données réelles ; voir [Sauvegardes](/3.1/deployment/backup/)).

## Prérequis

| Élément | Détail |
|---------|--------|
| Debian 12 (Bookworm) | OS hôte recommandé |
| Docker Engine + Compose **≥ 2.24** | Requis pour le tag `!reset` de `compose.prod.yaml` |
| Apache2 | Modules : `proxy`, `proxy_http`, `proxy_wstunnel`, `ssl`, `rewrite`, `headers` |
| Certbot | Certificat TLS Let's Encrypt |
| Un nom de domaine | Exigé par Let's Encrypt (les IP nues ne sont pas supportées) |

:::tip[Configuration serveur complète]
La configuration hôte complète et prête à copier (VirtualHost Apache, Certbot,
découverte de la gateway Docker) se trouve dans
**[Déploiement Debian + Apache + Docker](/3.1/deployment/debian-apache-docker/)**. Cette page
reste au niveau de l'orchestration.
:::

## 1. Secrets

Créer `.env.local` sur le serveur (jamais committé) et renseigner **tous** les
secrets. `compose.prod.yaml` échoue immédiatement (`${VAR:?}`) si l'un manque.

```bash
cp .env.local.example .env.local
chmod 600 .env.local
```

Générer les valeurs :

```bash
openssl rand -hex 32                              # APP_SECRET
openssl rand -hex 32                              # CADDY_MERCURE_JWT_SECRET
openssl rand -base64 24                           # POSTGRES_PASSWORD
openssl rand -hex 24                              # POSTGRES_APP_PASSWORD
php -r "echo base64_encode(random_bytes(32));"    # APP_TOTP_ENCRYPTION_KEY
php -r "echo base64_encode(random_bytes(32));"    # APP_PATIENT_ENCRYPTION_KEY
php -r "echo base64_encode(random_bytes(32));"    # APP_PATIENT_SEARCH_HMAC_KEY
php -r "echo base64_encode(random_bytes(32));"    # APP_FILE_ENCRYPTION_KEY
```

| Variable | Rôle |
|----------|------|
| `APP_SECRET` | CSRF, remember-me, signatures HMAC (chaîne d'audit, e-signatures) |
| `APP_TOTP_ENCRYPTION_KEY` | Chiffre les secrets 2FA au repos |
| `APP_PATIENT_ENCRYPTION_KEY` | Chiffre les PII patient au repos |
| `APP_PATIENT_SEARCH_HMAC_KEY` | Index aveugle pour la recherche sur données chiffrées |
| `APP_FILE_ENCRYPTION_KEY` | Chiffre au repos l'archive des imports de données appliqués (`private_uploads/arc`) |
| `CADDY_MERCURE_JWT_SECRET` | JWT publisher/subscriber Mercure |
| `POSTGRES_PASSWORD` / `POSTGRES_USER` / `POSTGRES_DB` | Identifiants base de données (propriétaire : migrations et maintenance) |
| `POSTGRES_APP_PASSWORD` | Mot de passe du rôle restreint `app_runtime` que l'application utilise ([voir plus bas](#rôle-de-base-de-données-de-lapplication)) |
| `DOMAIN` | Domaine public (URL publique Mercure, URI par défaut) |
| `TRUSTED_PROXIES` | Défaut `127.0.0.1,172.16.0.0/12` (couvre les bridges Docker) |

:::danger[Clés de chiffrement irrécupérables en cas de perte]
La perte de `APP_PATIENT_ENCRYPTION_KEY`, `APP_TOTP_ENCRYPTION_KEY` ou `APP_FILE_ENCRYPTION_KEY` rend les
données concernées définitivement illisibles (pour la dernière : les fichiers archivés des imports). Conserver toutes les clés dans un
coffre de secrets et les sauvegarder **séparément** de la base de données.
:::

## Rôle de base de données de l'application

L'application ne se connecte **pas** avec le propriétaire de la base. `POSTGRES_USER` est un superutilisateur
PostgreSQL : il ignore les politiques de sécurité par ligne (RLS) des tables `study`, `patient` et `ecrf_record`,
même avec `FORCE ROW LEVEL SECURITY`. L'application utilise donc le rôle restreint `app_runtime` (ni propriétaire,
ni superuser, ni `BYPASSRLS`, droits DML seulement) via `DATABASE_URL` ; le propriétaire ne sert qu'aux migrations et
aux commandes de maintenance (`DATABASE_MIGRATIONS_URL`), et l'entrypoint le retire de l'environnement du serveur
web et du worker une fois les migrations passées. Le service `backup` garde le propriétaire : `pg_dump` doit lire
toutes les lignes.

Nouvelle variable obligatoire : `POSTGRES_APP_PASSWORD` (`openssl rand -hex 24`, hexadécimal pour rester valide
dans l'URL), distincte de `POSTGRES_PASSWORD`.

**Mise en place sur une base existante** (une fois, avant ou pendant le déploiement qui introduit ce rôle) :

```bash
DC="docker compose -f compose.yaml -f compose.prod.yaml"

# 0. Sauvegarde, puis état actuel (attendu avant : rolsuper = t)
$DC exec -T database psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c \
  "select rolname, rolsuper, rolbypassrls from pg_roles where rolname = current_user"

# 1. Ajouter POSTGRES_APP_PASSWORD à .env.local, puis récupérer le code
git pull

# 2. Recréer la base avec la nouvelle variable et le script monté (le volume est conservé)
$DC up -d database

# 3. Créer le rôle (idempotent : peut être relancé, met aussi à jour le mot de passe)
$DC exec -T database sh /docker-entrypoint-initdb.d/10-create-app-role.sh

# 4. Reconstruire et démarrer : la migration Version20261022100000 donne les droits DML au rôle
$DC build --pull --no-cache
$DC up -d

# 5. Vérifier la connexion réellement utilisée par l'application (attendu : app_runtime | f | f)
$DC exec php php bin/console dbal:run-sql \
  "select rolname, rolsuper, rolbypassrls from pg_roles where rolname = current_user"
```

Sur une base neuve (volume vide), le script du service `database` crée le rôle tout seul. Si `app_runtime` n'existe
pas quand la migration passe, celle-ci n'accorde rien et affiche un avertissement : créer le rôle (étape 3) puis
relancer `doctrine:migrations:migrate`. **Retour arrière** : remettre l'ancienne valeur de `DATABASE_URL` (propriétaire)
dans `compose.prod.yaml`, relancer `up -d` ; le rôle peut rester.

## 2. Build & démarrage

```bash
# Construire l'image de production (sans cache pour éviter les couches périmées)
docker compose -f compose.yaml -f compose.prod.yaml build --pull --no-cache

# Démarrer tous les services en arrière-plan
docker compose -f compose.yaml -f compose.prod.yaml up -d

# Vérifier que tout est sain
docker compose -f compose.yaml -f compose.prod.yaml ps
docker compose -f compose.yaml -f compose.prod.yaml logs -f php   # attendre « PHP app ready! »
```

L'entrypoint du conteneur lance `composer install` (au premier boot), attend la
base de données et **applique automatiquement les migrations Doctrine** lorsque
des fichiers de migration sont présents.

:::caution[Cache de build Docker]
Toujours construire avec `--no-cache` (ou vérifier l'empreinte de l'image) à
chaque release pour éviter d'embarquer une couche périmée.
:::

### Versions des images

Toutes les images sont épinglées sur une version explicite (aucun tag flottant), les images de production en plus sur une empreinte `@sha256:`. Dependabot propose les mises à jour.

| Image | Fichier | Version |
|-------|---------|---------|
| `dunglas/frankenphp` | `Dockerfile` | `1.13.1-php8.5.11` |
| `debian` (base `frankenphp_prod`) | `Dockerfile` | `13.7-slim@sha256:a29215f6…` |
| `postgres` | `compose.yaml` | `18.6-alpine` |
| `axllent/mailpit` (dev) | `compose.override.yaml` | `v1.31.6` |
| `nfrastack/db-backup` | `compose.prod.yaml` | `5.0.5@sha256:01212206…` |

Pour mettre à jour une image : changer le tag (et l'empreinte), reconstruire avec `--pull --no-cache`, puis valider la pile. Les changements de version majeure de PostgreSQL suivent une procédure dédiée : [Migration PostgreSQL 16 vers 18](/3.1/deployment/postgresql-18-upgrade/).

## Première installation : premier administrateur

Une base neuve ne contient aucun compte. `app:seed` est **refusé en `prod`** (il crée des données fictives) : le premier super-administrateur se crée avec `app:admin:create`, qui ne génère aucune donnée fictive, crée le premier workspace s'il n'en existe aucun et journalise la création (journal d'audit de sécurité, événement `account.created`).

```bash
PROD="docker compose -f compose.yaml -f compose.prod.yaml"

# 1. Packs réglementaires (idempotent) : sans eux, les packs sont vides
$PROD exec php php bin/console app:regulatory-packs:seed

# 2. Premier super-administrateur : mot de passe saisi (masqué, confirmé)
$PROD exec php php bin/console app:admin:create --email=prenom.nom@exemple.fr --workspace-name="Mon organisation"

# Variante non interactive : mot de passe lu dans ADMIN_PASSWORD (jamais en option de ligne de commande)
read -rs ADMIN_PASSWORD && export ADMIN_PASSWORD
$PROD exec -T -e ADMIN_PASSWORD php php bin/console app:admin:create --email=prenom.nom@exemple.fr --no-interaction
unset ADMIN_PASSWORD
```

Options : `--email` (obligatoire), `--username`, `--first-name`, `--last-name` (déduits de l'e-mail par défaut), `--workspace-name` (utilisé seulement si aucun workspace n'existe ; sinon le compte est rattaché aux workspaces existants). Le mot de passe doit respecter la politique de mot de passe ; la commande refuse un e-mail ou un nom d'utilisateur déjà pris.

Au premier login, le compte doit **changer son mot de passe** puis **activer la double authentification** (TOTP).

:::danger[`APP_ALLOW_FAKE_DATA=1` : jamais en production]
Un serveur de **développement ou de recette** qui exécute l'image de production peut autoriser `app:seed` en ajoutant `APP_ALLOW_FAKE_DATA=1` à son `.env.local`, puis en recréant les conteneurs (`up -d`). `app:seed --reset` **vide la base** et crée des données fictives : ne jamais définir cette variable sur un serveur de production. Sans elle, `app:seed` répond par une erreur qui nomme la variable.
:::

## 3. Étapes post-déploiement

À exécuter une fois par déploiement, dans le conteneur `php`
(`docker compose ... exec php php bin/console <commande>`) :

| Étape | Commande | Quand |
|-------|----------|-------|
| **Provisionner la 2FA** | `app:totp:provision-missing` (aperçu avec `--dry-run`) | Après activation de la 2FA obligatoire. Les utilisateurs sans TOTP sont redirigés vers `/2fa/setup` au prochain login (attendu, non bloquant). |
| **Charger les packs réglementaires** | `app:regulatory-packs:seed` | Après les migrations, à chaque déploiement : idempotent, ne crée que ce qui manque (jamais de modification des packs existants). Sans cette étape, les packs réglementaires sont vides. |
| **Chiffrer les PII patient** | `app:patient:encrypt-existing --batch-size=200` (idempotent ; `--dry-run` pour vérifier) | Backfill ponctuel lors de l'introduction du chiffrement patient. Faire un `pg_dump` au préalable. |
| **Vérifier la rétention** | `app:retention:check-studies` | Code de sortie `2` si des études dépassent la rétention — intégrable dans Nagios/Zabbix. |
| **Rappeler les certificats GCP** | `app:gcp:send-expiry-reminders` (aperçu avec `--dry-run`) | Planifier chaque jour (cron) : envoie un rappel unique avant l'expiration du certificat GCP d'un utilisateur. Informatif, ne bloque aucun accès. |
| **Vérifier les chaînes d'audit** | `app:verify-audit-chain` · `app:audit:verify-chain` | Contrôle d'intégrité périodique des journaux inviolables. |

:::note[Aucune suppression automatique de données cliniques]
Aucune donnée eCRF n'est jamais supprimée automatiquement — ICH E6 §5.15 exige
une autorisation explicite du sponsor. Les commandes de rétention **signalent** ;
un humain décide.
:::

## 4. Vérifications de santé

```bash
curl -I https://votre-domaine.example.com          # → HTTP/2 200
```

* Apache redirige HTTP → HTTPS (301) et proxy HTTPS → `127.0.0.1:8080`.
* Mercure est accessible sur `/.well-known/mercure` (upgrade WebSocket proxifié par Apache).
* Tous les conteneurs sont `healthy`/`running` (le `worker` est `healthy` tant que `messenger:consume` est son processus principal ; `logs worker` ne doit pas montrer d'erreur répétée).

## 5. Mises à jour & rollback

Suivre le **[Processus de release](/3.1/deployment/release-process/)** pour le flux de mise à
jour (pull, rebuild, migration, smoke-test) et la stratégie de rollback. En
résumé :

```bash
git pull
docker compose -f compose.yaml -f compose.prod.yaml build --pull --no-cache
docker compose -f compose.yaml -f compose.prod.yaml up -d   # migrations au boot, worker recréé
```

## 6. Sauvegardes

PostgreSQL est sauvegardé par le service `backup` (RPO ≤ 1h, rétention locale,
offload S3 optionnel). Cibles, chiffrement et tests de restauration sont
documentés dans **[Politique de sauvegarde](/3.1/deployment/backup/)** (HDS v1.1 §8.4 /
ISO 27001 A.12.3).

## Fichiers déposés (`private_uploads/`)

Les fichiers déposés (avatars, pièces jointes, documents cliniques eCRF, fichiers d'import archivés) sont stockés dans `/app/private_uploads`, qui est le volume nommé **`private_uploads`** dans `compose.prod.yaml`, partagé par `php` et `worker` et propriété de `www-data`. Ils survivent donc à la recréation des conteneurs (nouvelle image, `--force-recreate`).
Ils ne sont **pas** dans les sauvegardes PostgreSQL : voir [Politique de sauvegarde](/3.1/deployment/backup/#fichiers-déposés-private_uploads).

**Avant le premier déploiement avec ce volume** (les fichiers existants sont dans la couche inscriptible du conteneur `php` et disparaissent à sa recréation) :

```bash
# 1. Copier les fichiers hors du conteneur en cours d'exécution
docker compose -f compose.yaml -f compose.prod.yaml cp php:/app/private_uploads ./private_uploads-backup

# 2. Déployer (build puis up -d) : le volume est créé, vide, propriété de www-data
# 3. Copier les fichiers dans le volume et vérifier le propriétaire
docker compose -f compose.yaml -f compose.prod.yaml cp ./private_uploads-backup/. php:/app/private_uploads/
docker compose -f compose.yaml -f compose.prod.yaml exec -u root php chown -R www-data:www-data /app/private_uploads

# 4. Vérifier : un avatar téléversé avant le déploiement est toujours servi après
docker compose -f compose.yaml -f compose.prod.yaml up -d --force-recreate php worker
```

Ne supprimer `./private_uploads-backup` qu'une fois ce contrôle fait.

## Worker Messenger (imports en arrière-plan)

Le service **`worker`** (`bin/console messenger:consume async`, même image et mêmes variables que `php`, sans port ni Caddy) lit et valide en arrière-plan les imports de données volumineux (au moins `IMPORT_ASYNC_THRESHOLD` lignes, 2000 par défaut ; les petits fichiers restent traités dans la requête) et **applique à l'étude** les imports validés (signés), par lots de
`IMPORT_APPLY_BATCH` lignes (50 par défaut), une transaction par lot.
La file de messages est la table `messenger_messages` de **la même base PostgreSQL** : aucun service supplémentaire à héberger.

* Le worker s'arrête de lui-même après 1 h ou 256 Mo (`--time-limit`, `--memory-limit`) et `restart: unless-stopped` le relance ; s'il est tué en cours de lecture, Docker le relance et le message est repris après `redeliver_timeout` (300 s, dans `MESSENGER_TRANSPORT_DSN`).
* Un message en échec est retenté 3 fois (attentes de 2 s, 6 s puis 18 s), puis l'import passe en `failed` avec un motif générique (jamais une valeur ni un en-tête du fichier) et le message est déplacé dans la file `failed`.
* **À chaque déploiement, le worker doit repartir sur le nouveau code** : `docker compose -f compose.yaml -f compose.prod.yaml up -d` le recrée avec l'image reconstruite ; sans reconstruction (changement de variables seul), forcer avec `docker compose -f compose.yaml -f compose.prod.yaml up -d --force-recreate worker`. Il termine d'abord le message en cours (délai d'arrêt de 60 s).
* Un import appliqué laisse dans `private_uploads/arc/` une copie **chiffrée** avec `APP_FILE_ENCRYPTION_KEY` (copie expurgée de ses colonnes identifiantes ; le SHA-256 de l'original est conservé en base). Sans cette clé l'archive est illisible : la conserver dans le coffre et la sauvegarder séparément, comme les autres clés. Le fichier téléversé
  (`private_uploads/imp/`) est supprimé une fois l'import appliqué.
* Une application interrompue (échec, worker arrêté) reprend après le dernier lot validé ; après les 3 reprises automatiques, elle apparaît en échec sur l'écran d'import (« Reprendre l'application ») ou par `messenger:failed:retry`.
* Le worker lit les fichiers d'import archivés dans `private_uploads/` : ce dossier est le volume `private_uploads`, partagé par `php` et `worker` (voir [Fichiers déposés](#fichiers-déposés-private_uploads)).

Messages en échec (depuis le conteneur `php`) :

```bash
docker compose -f compose.yaml -f compose.prod.yaml exec php php bin/console messenger:failed:show
docker compose -f compose.yaml -f compose.prod.yaml exec php php bin/console messenger:failed:retry <id>
docker compose -f compose.yaml -f compose.prod.yaml exec php php bin/console messenger:failed:remove <id>
docker compose -f compose.yaml -f compose.prod.yaml logs -f worker
```

La file `failed` n'est volontairement pas consommée par le worker : une relance est une décision humaine, après avoir corrigé la cause.

## Checklist de production

* \[ ] `.env.local` présent, `chmod 600`, tous les secrets `${VAR:?}` renseignés.
* \[ ] Clés de chiffrement dans un coffre et sauvegardées séparément.
* \[ ] TLS Apache valide ; redirection HTTP→HTTPS OK ; `certbot renew --dry-run` OK.
* \[ ] `TRUSTED_PROXIES` correspond à la gateway Docker réelle.
* \[ ] PostgreSQL **non** exposé sur l'hôte.
* \[ ] Migrations appliquées ; `app:totp:provision-missing` et `app:regulatory-packs:seed` exécutés.
* \[ ] Premier administrateur créé (`app:admin:create`) ; `APP_ALLOW_FAKE_DATA` absent de `.env.local`.
* \[ ] Service `worker` actif (`ps` → `healthy`), volume `private_uploads` présent (`docker volume ls`), fichiers existants copiés dedans (voir ci-dessus).
* \[ ] Service `backup` actif (`--profile backup`, obligatoire avant toute donnée réelle) ; une restauration a été testée.
* \[ ] Vérification de la chaîne d'audit planifiée.

## Voir aussi

* [Déploiement Debian + Apache + Docker](/3.1/deployment/debian-apache-docker/) — configuration hôte complète
* [Politique de sauvegarde](/3.1/deployment/backup/) · [Processus de release](/3.1/deployment/release-process/)
* [Migration PostgreSQL 16 vers 18](/3.1/deployment/postgresql-18-upgrade/)
* [Sécurité](/en/3.1/security/readme/) · [Conformité](/en/3.1/security/compliance/)
* [Vue d'ensemble de l'architecture](/3.1/architecture/overview/)

---
title: Déploiement en production
description: Déployer Synapse Medical en production — Apache en reverse proxy devant FrankenPHP/Caddy, secrets obligatoires, étapes post-déploiement et vérifications.
sidebar:
  label: Production
  order: 1
---

> 🌐 Version française · [English version](/en/deployment/production/)

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
                 Worker PHP 8.5 (Symfony 8)
                        │
                 PostgreSQL 18 (conteneur, réseau interne uniquement)
```

- Le **TLS** est géré par Apache sur l'hôte, pas dans le conteneur.
- **PostgreSQL n'est jamais exposé** sur l'hôte en production.
- Un service **`backup`** réalise des sauvegardes PostgreSQL automatiques, **désactivé par défaut** (profil Compose `backup`, à activer avec `--profile backup` ou `COMPOSE_PROFILES=backup` avant tout stockage de données réelles ; voir [Sauvegardes](/deployment/backup/)).

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
**[Déploiement Debian + Apache + Docker](/deployment/debian-apache-docker/)**. Cette page
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
php -r "echo base64_encode(random_bytes(32));"    # APP_TOTP_ENCRYPTION_KEY
php -r "echo base64_encode(random_bytes(32));"    # APP_PATIENT_ENCRYPTION_KEY
php -r "echo base64_encode(random_bytes(32));"    # APP_PATIENT_SEARCH_HMAC_KEY
```

| Variable | Rôle |
|----------|------|
| `APP_SECRET` | CSRF, remember-me, signatures HMAC (chaîne d'audit, e-signatures) |
| `APP_TOTP_ENCRYPTION_KEY` | Chiffre les secrets 2FA au repos |
| `APP_PATIENT_ENCRYPTION_KEY` | Chiffre les PII patient au repos |
| `APP_PATIENT_SEARCH_HMAC_KEY` | Index aveugle pour la recherche sur données chiffrées |
| `CADDY_MERCURE_JWT_SECRET` | JWT publisher/subscriber Mercure |
| `POSTGRES_PASSWORD` / `POSTGRES_USER` / `POSTGRES_DB` | Identifiants base de données |
| `DOMAIN` | Domaine public (URL publique Mercure, URI par défaut) |
| `TRUSTED_PROXIES` | Défaut `127.0.0.1,172.16.0.0/12` (couvre les bridges Docker) |

:::danger[Clés de chiffrement irrécupérables en cas de perte]
La perte de `APP_PATIENT_ENCRYPTION_KEY` ou `APP_TOTP_ENCRYPTION_KEY` rend les
données concernées définitivement illisibles. Conserver toutes les clés dans un
coffre de secrets et les sauvegarder **séparément** de la base de données.
:::

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

Pour mettre à jour une image : changer le tag (et l'empreinte), reconstruire avec `--pull --no-cache`, puis valider la pile. Les changements de version majeure de PostgreSQL suivent une procédure dédiée : [Migration PostgreSQL 16 vers 18](/deployment/postgresql-18-upgrade/).

## 3. Étapes post-déploiement

À exécuter une fois par déploiement, dans le conteneur `php`
(`docker compose ... exec php php bin/console <commande>`) :

| Étape | Commande | Quand |
|-------|----------|-------|
| **Provisionner la 2FA** | `app:totp:provision-missing` (aperçu avec `--dry-run`) | Après activation de la 2FA obligatoire. Les utilisateurs sans TOTP sont redirigés vers `/2fa/setup` au prochain login (attendu, non bloquant). |
| **Chiffrer les PII patient** | `app:patient:encrypt-existing --batch-size=200` (idempotent ; `--dry-run` pour vérifier) | Backfill ponctuel lors de l'introduction du chiffrement patient. Faire un `pg_dump` au préalable. |
| **Vérifier la rétention** | `app:retention:check-studies` | Code de sortie `2` si des études dépassent la rétention — intégrable dans Nagios/Zabbix. |
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

- Apache redirige HTTP → HTTPS (301) et proxy HTTPS → `127.0.0.1:8080`.
- Mercure est accessible sur `/.well-known/mercure` (upgrade WebSocket proxifié par Apache).
- Tous les conteneurs sont `healthy`/`running`.

## 5. Mises à jour & rollback

Suivre le **[Processus de release](/deployment/release-process/)** pour le flux de mise à
jour (pull, rebuild, migration, smoke-test) et la stratégie de rollback. En
résumé :

```bash
git pull
docker compose -f compose.yaml -f compose.prod.yaml build --pull --no-cache
docker compose -f compose.yaml -f compose.prod.yaml up -d   # migrations au boot
```

## 6. Sauvegardes

PostgreSQL est sauvegardé par le service `backup` (RPO ≤ 1h, rétention locale,
offload S3 optionnel). Cibles, chiffrement et tests de restauration sont
documentés dans **[Politique de sauvegarde](/deployment/backup/)** (HDS v1.1 §8.4 /
ISO 27001 A.12.3).

## Checklist de production

- [ ] `.env.local` présent, `chmod 600`, tous les secrets `${VAR:?}` renseignés.
- [ ] Clés de chiffrement dans un coffre et sauvegardées séparément.
- [ ] TLS Apache valide ; redirection HTTP→HTTPS OK ; `certbot renew --dry-run` OK.
- [ ] `TRUSTED_PROXIES` correspond à la gateway Docker réelle.
- [ ] PostgreSQL **non** exposé sur l'hôte.
- [ ] Migrations appliquées ; `app:totp:provision-missing` exécuté.
- [ ] Service `backup` actif (`--profile backup`, obligatoire avant toute donnée réelle) ; une restauration a été testée.
- [ ] Vérification de la chaîne d'audit planifiée.

## Voir aussi

- [Déploiement Debian + Apache + Docker](/deployment/debian-apache-docker/) — configuration hôte complète
- [Politique de sauvegarde](/deployment/backup/) · [Processus de release](/deployment/release-process/)
- [Migration PostgreSQL 16 vers 18](/deployment/postgresql-18-upgrade/)
- [Sécurité](/en/security/readme/) · [Conformité](/en/security/compliance/)
- [Vue d'ensemble de l'architecture](/architecture/overview/)

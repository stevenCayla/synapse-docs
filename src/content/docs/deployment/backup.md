---
title: "Politique de sauvegarde — HDS v1.1 §8.4 / ISO 27001 A.12.3"
description: "PostgreSQL archive en continu ses fichiers WAL (Write-Ahead Log) vers le stockage objet. En cas d'incident, la restauration point-in-time (PITR) permet de…"
---

## Objectifs

| Indicateur | Cible |
|------------|-------|
| **RPO** (Recovery Point Objective) | ≤ 1 heure |
| **RTO** (Recovery Time Objective) | ≤ 4 heures |
| **Rétention des sauvegardes** | 30 jours glissants (quotidiennes) + 12 mois (mensuelles) |
| **Chiffrement des sauvegardes** | Obligatoire (GPG AES-256) |
| **Test de restauration** | Mensuel (procédure §4) |

---

## Architecture de sauvegarde

### Sauvegarde continue (WAL archiving)

PostgreSQL archive en continu ses fichiers WAL (Write-Ahead Log) vers le stockage objet. En cas d'incident, la restauration point-in-time (PITR) permet de revenir à n'importe quel instant dans la fenêtre de rétention.

```
PostgreSQL → WAL archiver → S3-compatible storage (chiffré)
                                   ↓
                         pg_basebackup (quotidien, 02:00 UTC)
```

### Variables d'environnement requises

```dotenv
# Stockage objet (S3-compatible — MinIO, OVH Object Storage, Scaleway…)
BACKUP_S3_ENDPOINT=https://s3.example.com
BACKUP_S3_REGION=fr-par
BACKUP_BUCKET=synapse-backups
BACKUP_S3_ACCESS_KEY=<access-key>
BACKUP_S3_SECRET_KEY=<secret-key>

# Chiffrement GPG (ID de la clé publique du destinataire)
BACKUP_GPG_KEY_ID=0xABCDEF1234567890

# Base de données source
DATABASE_URL=postgresql://user:pass@db:5432/app
```

> **Important** : ne jamais stocker `BACKUP_S3_SECRET_KEY` ou `BACKUP_GPG_KEY_ID` dans le dépôt git. Utilisez les secrets de votre CI/CD ou un vault.

---

## Déploiement avec Docker Compose (production)

Le service `backup` dans `compose.prod.yaml` exécute un pg_dump chiffré toutes les heures et l'envoie vers le stockage objet :

```yaml
# Extrait de compose.prod.yaml
services:
  backup:
    image: ghcr.io/tiredofit/db-backup:latest
    environment:
      DB_TYPE: pgsql
      DB_HOST: database
      DB_NAME: ${POSTGRES_DB}
      DB_USER: ${POSTGRES_USER}
      DB_PASS: ${POSTGRES_PASSWORD}
      DB_DUMP_FREQ: 60           # toutes les 60 minutes
      DB_DUMP_BEGIN: +0          # démarre immédiatement
      DB_CLEANUP_TIME: 10080     # conserve 7 jours en local (minutes)
      COMPRESSION: GZ
      SPLIT_DB: false
      # Upload S3
      S3_ENDPOINT: ${BACKUP_S3_ENDPOINT}
      S3_BUCKET: ${BACKUP_BUCKET}
      S3_PATH: /postgresql
      S3_ACCESS_KEY_ID: ${BACKUP_S3_ACCESS_KEY}
      S3_SECRET_ACCESS_KEY: ${BACKUP_S3_SECRET_KEY}
      S3_REGION: ${BACKUP_S3_REGION}
    volumes:
      - backup_data:/backup
    depends_on:
      - database
    restart: unless-stopped
```

---

## Procédures opérationnelles

### 1. Sauvegarde manuelle immédiate

```bash
# Depuis le serveur de production
docker compose exec backup /usr/local/bin/backup.sh

# Ou directement avec pg_dump
docker compose exec database pg_dump \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --format=custom \
  --compress=9 \
  > "backup_$(date +%Y%m%dT%H%M%S).pgdump"
```

### 2. Restauration complète (RTO ≤ 4h)

```bash
# 1. Télécharger la dernière sauvegarde depuis S3
aws s3 cp s3://${BACKUP_BUCKET}/postgresql/latest.pgdump ./restore.pgdump \
  --endpoint-url "${BACKUP_S3_ENDPOINT}"

# 2. Déchiffrer si GPG
gpg --decrypt restore.pgdump.gpg > restore.pgdump

# 3. Arrêter l'application
docker compose stop php

# 4. Supprimer et recréer la base
docker compose exec database psql -U postgres -c "DROP DATABASE IF EXISTS app;"
docker compose exec database psql -U postgres -c "CREATE DATABASE app OWNER app;"

# 5. Restaurer
docker compose exec database pg_restore \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --no-owner \
  --role="$POSTGRES_USER" \
  < restore.pgdump

# 6. Relancer l'application
docker compose start php

# 7. Vérifier l'intégrité
docker compose exec php bin/console doctrine:schema:validate
```

### 3. Restauration point-in-time (PITR)

Disponible uniquement si le WAL archiving est activé (`archive_mode = on` dans `postgresql.conf`).

```bash
# Restauration au timestamp 2026-04-17 14:30:00
docker compose exec database pg_restore \
  --recovery-target-time="2026-04-17 14:30:00" \
  ...
```

Référence : [PostgreSQL PITR documentation](https://www.postgresql.org/docs/current/continuous-archiving.html)

### 4. Test de restauration mensuel (obligatoire HDS)

Effectuer le 1er de chaque mois en environnement de staging :

```bash
# Environnement de test isolé
docker compose -f compose.yaml -f compose.restore-test.yaml up -d
# Suivre la procédure §2 ci-dessus
# Vérifier : connexion, migration status, lecture d'un enregistrement chiffré
docker compose exec php bin/console doctrine:migrations:status
docker compose exec php bin/console app:patient:encrypt-existing --dry-run
# Consigner le résultat dans le registre des tests (docs/rgpd/tests-restauration.log)
```

---

## Surveillance

| Alerte | Seuil | Canal |
|--------|-------|-------|
| Dernière sauvegarde > 2h | backup_age > 7200s | PagerDuty / Slack |
| Espace disque backup < 20 GB | disk_free < 20 GB | PagerDuty |
| Échec de pg_dump | exit code ≠ 0 | Email DBA + DPO |
| Test de restauration échoué | — | Email DBA + DPO |

---

## Responsabilités

| Rôle | Responsabilité |
|------|----------------|
| **Administrateur système** | Configuration, surveillance quotidienne, tests mensuels |
| **DBA** | Validation des procédures, revue trimestrielle de la politique |
| **DPO** | Validation de la conformité HDS, notification CNIL en cas d'incident |

---

*Ce document doit être révisé annuellement ou après tout incident de perte de données.*  
*Dernière révision : 2026-04-17*

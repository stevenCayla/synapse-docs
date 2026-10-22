---
title: "Deployment"
description: "Procédure de déploiement en production"
---

## Chiffrement des données patients

```bash
# 1. Générer les clés (une seule fois)
php -r "echo base64_encode(random_bytes(32));"  # → APP_PATIENT_ENCRYPTION_KEY
php -r "echo base64_encode(random_bytes(32));"  # → APP_PATIENT_SEARCH_HMAC_KEY
php -r "echo base64_encode(random_bytes(32));"  # → APP_FILE_ENCRYPTION_KEY

# 2. pg_dump avant migration
pg_dump $DATABASE_URL > backup_pre_encrypt_$(date +%Y%m%d).sql

# 3. Appliquer la migration
php bin/console doctrine:migrations:migrate

# 4. Backfill (idempotent, relançable)
php bin/console app:patient:encrypt-existing --batch-size=200

# 5. Vérifier (dry-run supplémentaire = doit afficher 0 encrypted, N skipped)
php bin/console app:patient:encrypt-existing --dry-run
```

### Limitation documentée

Les recherches partielles sur les noms (`LIKE %dupont%`) sont incompatibles avec le chiffrement au repos. Seule la recherche par IPP exact (`externalId`) et date de naissance exacte fonctionne via les colonnes de hash HMAC. Cette limitation est inhérente au chiffrement applicatif par colonne.

## Authentification à deux facteurs

```bash
# Avant déploiement : provisionner les secrets des utilisateurs existants
php bin/console app:totp:provision-missing --dry-run  # vérification
php bin/console app:totp:provision-missing            # exécution
```

Les utilisateurs existants sans TOTP configuré seront redirigés vers `/2fa/setup` à leur prochain login — comportement attendu et non bloquant.

## Rétention des données

Points de conception importants :

- Aucune donnée eCRF n'est supprimée automatiquement — ICH E6 §5.15 exige une autorisation sponsor explicite ; la commande signale, l'humain décide.
- La purge de `SecurityAuditLog` est paramétrable (`--older-than=P3M`) et toujours testable avec `--dry-run`.
- `app:retention:check-studies` retourne le code de sortie 2 si des études sont dépassées, ce qui permet de l'intégrer dans un monitoring Nagios/Zabbix.

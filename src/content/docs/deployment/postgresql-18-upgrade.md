---
title: "Migration PostgreSQL 16 vers 18"
description: "Migrer une base PostgreSQL 16 existante vers PostgreSQL 18 : sauvegarde, nouveau volume, restauration, vérifications, rollback et nettoyage."
sidebar:
  label: "Migration PostgreSQL 18"
  order: 3
---

> 🌐 Version française · [English version](/en/deployment/postgresql-18-upgrade/)

Le changement de version majeure de PostgreSQL (16 vers 18) ne permet **pas** de réutiliser le volume de données existant : le format de stockage change. La procédure ci-dessous passe par un dump / restore vers un **nouveau volume**. L'ancien volume n'est jamais modifié : il sert de sauvegarde de rollback.

## Ce qui change

| Élément | Avant (PostgreSQL 16) | Après (PostgreSQL 18) |
|---------|-----------------------|-----------------------|
| Image | `postgres:16.15-alpine` | `postgres:18.6-alpine` |
| Volume | `database_data` monté sur `/var/lib/postgresql/data` | `database_data_pg18` monté sur `/var/lib/postgresql` |
| `serverVersion` (`DATABASE_URL`) | `16.15` (variable `POSTGRES_VERSION`) | `18` (valeur fixe) |

Les images PostgreSQL 18 attendent un unique point de montage `/var/lib/postgresql` (les données vivent dans un sous-répertoire nommé d'après la version majeure). Le tag d'image est désormais littéral dans `compose.yaml` afin que Dependabot puisse proposer les mises à jour mineures. La variable `POSTGRES_VERSION` n'existe plus : vous pouvez la supprimer de votre `.env.local`.

## Chemin rapide : données fictives uniquement

Tant que la plateforme (dev ou prod) ne contient que des données fictives, il est inutile de migrer : récupérer le code, repartir d'un volume vierge et recharger les données de démonstration.

```bash
docker compose down            # ajouter -v pour supprimer aussi l'ancien volume (perte définitive)
git pull
docker compose up -d --wait    # nouveau volume database_data_pg18, migrations au démarrage
docker compose exec php bin/console app:seed --reset --admin=vous@example.com
```

En production, ajouter `-f compose.yaml -f compose.prod.yaml` aux commandes `docker compose`. La suite de ce document concerne les bases contenant des données à conserver.

## Procédure complète

Les commandes supposent le répertoire du projet et, en production, l'option `-f compose.yaml -f compose.prod.yaml` (notée `docker compose` ci-dessous pour alléger). Prévoir une fenêtre de maintenance : l'application est arrêtée entre le dump et la fin de la restauration.

### 1. Sauvegarder avec le serveur 16

Avec la pile encore sur PostgreSQL 16 (ancien `compose.yaml`), arrêter les écritures puis réaliser le dump :

```bash
docker compose stop php        # plus aucune écriture applicative
docker compose exec -T database pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > app-pg16.dump
docker compose exec -T database pg_dumpall -U "$POSTGRES_USER" --globals-only > globals-pg16.sql
```

`pg_dump -Fc` (format custom) contient le schéma et les données ; `pg_dumpall --globals-only` conserve les rôles s'il en existe d'autres que `$POSTGRES_USER`. Conserver ces fichiers hors du serveur, avec les mêmes protections que les sauvegardes (ils contiennent des données de santé).

Relever la référence de comparaison (nombre de lignes par table) :

```bash
docker compose exec -T database psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -At -F' ' -c "
SELECT table_name, (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %I.%I', table_schema, table_name), false, true, '')))[1]::text::int
FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY 1" > counts-pg16.txt
```

### 2. Basculer sur l'image 18 et le nouveau volume

```bash
docker compose down            # SANS -v : l'ancien volume database_data est conservé
git pull                       # compose.yaml : postgres:18.6-alpine + database_data_pg18
docker compose up -d --wait database
```

Le service `database` démarre sur un volume vierge (`<projet>_database_data_pg18`) ; seul ce service est lancé pour que l'application ne crée pas le schéma avant la restauration.

### 3. Restaurer

```bash
docker compose exec -T database pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --exit-on-error < app-pg16.dump
# Rôles supplémentaires éventuels (à faire avant pg_restore s'ils possèdent des objets) :
# docker compose exec -T database psql -U "$POSTGRES_USER" -d postgres < globals-pg16.sql
docker compose up -d --wait
```

### 4. Vérifier

```bash
docker compose exec database psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "SELECT version()"   # PostgreSQL 18.x
# Mêmes nombres de lignes qu'avant : relancer la requête de l'étape 1 vers counts-pg18.txt, puis
diff counts-pg16.txt counts-pg18.txt && echo OK
docker compose exec php bin/console doctrine:migrations:status      # Already at latest version, New = 0
docker compose exec php bin/console doctrine:schema:validate        # voir la note ci-dessous
curl -sk -o /dev/null -w "%{http_code}\n" https://localhost/login   # 200
```

:::note[doctrine:schema:validate]
La commande signale aujourd'hui un schéma « non synchronisé » avec le mapping (écarts d'identité et d'index, suivi dans l'issue #27). Ce n'est **pas** lié à la migration : le diff est strictement identique sur une base fraîchement migrée en PostgreSQL 18 et sur une base restaurée. L'objectif de la vérification est de constater l'absence de **nouveaux** écarts.
:::

Tester ensuite une connexion applicative (2FA incluse) et, si le service `backup` est actif, forcer une sauvegarde pour confirmer qu'il se connecte au nouveau serveur (`docker compose exec backup backup-now`).

### 5. Rollback

Tant que l'ancien volume existe, le retour est immédiat, **au prix des écritures faites depuis le dump** (elles ne sont pas reportées sur le volume 16) :

```bash
docker compose down
git checkout <commit-avant-migration> -- compose.yaml compose.prod.yaml   # image 16.15 + volume database_data
docker compose up -d --wait
```

Pour conserver les écritures faites sous 18, il faut les exporter (`pg_dump`) puis les réimporter manuellement dans le serveur 16 : un dump produit par une version plus récente n'est pas garanti restaurable sur une version plus ancienne.

### 6. Nettoyage

Une fois la migration validée (au moins un cycle de sauvegarde complet sous 18, quelques jours en pratique), supprimer l'ancien volume et les dumps :

```bash
docker volume ls | grep database_data                  # repérer <projet>_database_data (sans _pg18)
docker volume rm <projet>_database_data
shred -u app-pg16.dump globals-pg16.sql                # ou la procédure de destruction de vos sauvegardes
```

## Développeurs : volume local

Le volume local n'est pas migré automatiquement. Après `git pull`, `docker compose up` crée un volume `database_data_pg18` vide : la base est recréée par les migrations, il suffit de relancer `make seed` (ou `app:seed --reset`) pour retrouver les données de démonstration.
L'ancien volume `database_data` reste présent et inutilisé ; le supprimer avec `docker volume rm` quand il n'est plus utile. Si vous voulez conserver vos données locales, suivre la procédure complète ci-dessus.

## Voir aussi

- [Déploiement en production](/deployment/production/)
- [Politique de sauvegarde](/deployment/backup/)

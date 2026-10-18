---
title: PostgreSQL 16 to 18 migration
description: "Migrate an existing PostgreSQL 16 database to PostgreSQL 18:
  backup, new volume, restore, checks, rollback and cleanup."
sidebar:
  label: PostgreSQL 18 migration
  order: 3
slug: en/3.0/deployment/postgresql-18-upgrade
---

> 🌐 [Version française](/3.0/deployment/postgresql-18-upgrade/) · English version

A PostgreSQL major version change (16 to 18) does **not** allow reusing the existing data volume: the on-disk format changes. The procedure below goes through a dump / restore into a **new volume**. The old volume is never modified: it is the rollback backup.

## What changes

| Item | Before (PostgreSQL 16) | After (PostgreSQL 18) |
|------|------------------------|-----------------------|
| Image | `postgres:16.15-alpine` | `postgres:18.6-alpine` |
| Volume | `database_data` mounted on `/var/lib/postgresql/data` | `database_data_pg18` mounted on `/var/lib/postgresql` |
| `serverVersion` (`DATABASE_URL`) | `16.15` (`POSTGRES_VERSION` variable) | `18` (fixed value) |

PostgreSQL 18 images expect a single mount at `/var/lib/postgresql` (the data lives in a subdirectory named after the major version). The image tag is now a literal in `compose.yaml` so that Dependabot can propose minor updates. The `POSTGRES_VERSION` variable no longer exists: you can remove it from your `.env.local`.

## Quick path: fake data only

As long as the platform (dev or prod) only holds fake data, there is no need to migrate: pull the code, start from an empty volume and reload the demo data.

```bash
docker compose down            # add -v to also delete the old volume (permanent loss)
git pull
docker compose up -d --wait    # new database_data_pg18 volume, migrations at startup
docker compose exec php bin/console app:seed --reset --admin=you@example.com
```

In production, add `-f compose.yaml -f compose.prod.yaml` to the `docker compose` commands. The rest of this page covers databases whose data must be kept.

## Full procedure

The commands assume the project directory and, in production, the `-f compose.yaml -f compose.prod.yaml` option (written as `docker compose` below for brevity). Plan a maintenance window: the application is stopped between the dump and the end of the restore.

### 1. Back up with the 16 server

With the stack still on PostgreSQL 16 (previous `compose.yaml`), stop the writes and take the dump:

```bash
docker compose stop php        # no more application writes
docker compose exec -T database pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > app-pg16.dump
docker compose exec -T database pg_dumpall -U "$POSTGRES_USER" --globals-only > globals-pg16.sql
```

`pg_dump -Fc` (custom format) holds the schema and the data; `pg_dumpall --globals-only` keeps the roles if there are others than `$POSTGRES_USER`. Keep these files off the server, with the same protection as backups (they contain health data).

Record the comparison baseline (row count per table):

```bash
docker compose exec -T database psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -At -F' ' -c "
SELECT table_name, (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %I.%I', table_schema, table_name), false, true, '')))[1]::text::int
FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY 1" > counts-pg16.txt
```

### 2. Switch to the 18 image and the new volume

```bash
docker compose down            # WITHOUT -v: the old database_data volume is kept
git pull                       # compose.yaml: postgres:18.6-alpine + database_data_pg18
docker compose up -d --wait database
```

The `database` service starts on an empty volume (`<project>_database_data_pg18`); only this service is started so that the application does not create the schema before the restore.

### 3. Restore

```bash
docker compose exec -T database pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --exit-on-error < app-pg16.dump
# Extra roles, if any (do this before pg_restore if they own objects):
# docker compose exec -T database psql -U "$POSTGRES_USER" -d postgres < globals-pg16.sql
docker compose up -d --wait
```

### 4. Verify

```bash
docker compose exec database psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "SELECT version()"   # PostgreSQL 18.x
# Same row counts as before: rerun the step 1 query into counts-pg18.txt, then
diff counts-pg16.txt counts-pg18.txt && echo OK
docker compose exec php bin/console doctrine:migrations:status      # Already at latest version, New = 0
docker compose exec php bin/console doctrine:schema:validate        # [OK] The database schema is in sync
curl -sk -o /dev/null -w "%{http_code}\n" https://localhost/login   # 200
```

:::note[doctrine:schema:validate]
The command must answer "The database schema is in sync with the mapping files" on the restored database, as on a freshly migrated one. A difference means the restored schema is incomplete: do not switch over before understanding it.
:::

Then test an application login (2FA included) and, if the `backup` service is enabled, force a backup to confirm it connects to the new server (`docker compose exec backup backup-now`).

### 5. Rollback

As long as the old volume exists, going back is immediate, **at the cost of the writes made since the dump** (they are not carried over to the 16 volume):

```bash
docker compose down
git checkout <commit-before-migration> -- compose.yaml compose.prod.yaml   # 16.15 image + database_data volume
docker compose up -d --wait
```

To keep the writes made on 18, export them (`pg_dump`) and re-import them manually into the 16 server: a dump produced by a newer version is not guaranteed to restore on an older one.

### 6. Cleanup

Once the migration is validated (at least one full backup cycle on 18, a few days in practice), delete the old volume and the dumps:

```bash
docker volume ls | grep database_data                  # find <project>_database_data (without _pg18)
docker volume rm <project>_database_data
shred -u app-pg16.dump globals-pg16.sql                # or your backup destruction procedure
```

## Developers: local volume

The local volume is not migrated automatically. After `git pull`, `docker compose up` creates an empty `database_data_pg18` volume: the database is rebuilt by the migrations, and rerunning `make seed` (or `app:seed --reset`) restores the demo data.
The old `database_data` volume stays in place, unused; remove it with `docker volume rm` when no longer needed. If you want to keep your local data, follow the full procedure above.

## See also

* [Production deployment](/en/3.0/deployment/production/)
* [Backup policy](/3.0/deployment/backup/)

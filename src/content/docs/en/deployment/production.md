---
title: Production Deployment
description: Deploy Synapse Medical in production — Apache reverse proxy in front of FrankenPHP/Caddy, mandatory secrets, post-deploy steps and health checks.
sidebar:
  label: Production
  order: 1
---

> 🌐 English version · [Version française](/deployment/production/)

This page is the **entry point** for a production deployment. It describes the
target architecture, the mandatory secrets, and the full deploy / update flow.
For the step-by-step server setup (Debian, Apache, TLS), follow the detailed
guide it links to.

:::note[Not the generic Symfony Docker tutorial]
Unlike the upstream Symfony Docker template, this application does **not** expose
Caddy's automatic HTTPS to the internet. In production, **Apache (on the host)
terminates TLS** and reverse-proxies to FrankenPHP/Caddy bound to
`127.0.0.1:8080`. Plan your deployment around that model.
:::

## Target architecture

```
Internet ──HTTPS──▶ Apache2 (Debian host, :443, TLS via Let's Encrypt)
                        │ ProxyPass (HTTP) + WebSocket (Mercure)
                        ▼
                 FrankenPHP/Caddy (container, 127.0.0.1:8080 → :80, auto_https off)
                        │
                 PHP 8.5 worker (Symfony 8)         Messenger worker (`worker` container)
                        │
                 PostgreSQL 18 (container, internal network only)
```

- **TLS** is handled by Apache on the host, not inside the container.
- **PostgreSQL is never exposed** to the host in production.
- A **`backup`** service performs automated PostgreSQL dumps, **disabled by default** (Compose profile `backup`; enable it with `--profile backup` or `COMPOSE_PROFILES=backup` before any real data is stored; see [Backups](/deployment/backup/)).

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| Debian 12 (Bookworm) | Recommended host OS |
| Docker Engine + Compose **≥ 2.24** | Required for the `!reset` tag in `compose.prod.yaml` |
| Apache2 | Modules: `proxy`, `proxy_http`, `proxy_wstunnel`, `ssl`, `rewrite`, `headers` |
| Certbot | Let's Encrypt TLS certificate |
| A domain name | Required by Let's Encrypt (bare IPs are not supported) |

:::tip[Full server setup]
The complete, copy-pasteable host configuration (Apache VirtualHost, Certbot,
Docker gateway discovery) lives in
**[Debian + Apache + Docker deployment](/deployment/debian-apache-docker/)** (French).
This page stays at the orchestration level.
:::

## 1. Secrets

Create `.env.local` on the server (never committed) and fill **every** secret.
`compose.prod.yaml` fails fast (`${VAR:?}`) if any is missing.

```bash
cp .env.local.example .env.local
chmod 600 .env.local
```

Generate the values:

```bash
openssl rand -hex 32                              # APP_SECRET
openssl rand -hex 32                              # CADDY_MERCURE_JWT_SECRET
openssl rand -base64 24                           # POSTGRES_PASSWORD
openssl rand -hex 24                              # POSTGRES_APP_PASSWORD
php -r "echo base64_encode(random_bytes(32));"    # APP_TOTP_ENCRYPTION_KEY
php -r "echo base64_encode(random_bytes(32));"    # APP_PATIENT_ENCRYPTION_KEY
php -r "echo base64_encode(random_bytes(32));"    # APP_PATIENT_SEARCH_HMAC_KEY
```

| Variable | Purpose |
|----------|---------|
| `APP_SECRET` | CSRF, remember-me, HMAC signatures (audit chain, e-signatures) |
| `APP_TOTP_ENCRYPTION_KEY` | Encrypts 2FA secrets at rest |
| `APP_PATIENT_ENCRYPTION_KEY` | Encrypts patient PII at rest |
| `APP_PATIENT_SEARCH_HMAC_KEY` | Blind-index search over encrypted patient data |
| `CADDY_MERCURE_JWT_SECRET` | Mercure publisher/subscriber JWT |
| `POSTGRES_PASSWORD` / `POSTGRES_USER` / `POSTGRES_DB` | Database credentials (owner: migrations and maintenance) |
| `POSTGRES_APP_PASSWORD` | Password of the restricted role `app_runtime` the application uses ([see below](#application-database-role)) |
| `DOMAIN` | Public domain (Mercure public URL, default URI) |
| `TRUSTED_PROXIES` | Defaults to `127.0.0.1,172.16.0.0/12` (covers Docker bridges) |

:::danger[Encryption keys are unrecoverable if lost]
Losing `APP_PATIENT_ENCRYPTION_KEY` or `APP_TOTP_ENCRYPTION_KEY` makes the
corresponding data permanently unreadable. Store all keys in a secrets vault and
back them up **separately** from the database.
:::

## Application database role

The application does **not** connect as the database owner. `POSTGRES_USER` is a PostgreSQL superuser: it ignores the
row level security (RLS) policies of `study`, `patient` and `ecrf_record`, even with `FORCE ROW LEVEL SECURITY`. The
application therefore uses the restricted role `app_runtime` (not owner, not superuser, no `BYPASSRLS`, DML rights
only) through `DATABASE_URL`; the owner is only used by the migrations and the maintenance commands
(`DATABASE_MIGRATIONS_URL`), and the entrypoint removes it from the environment of the web server and of the worker
once the migrations ran. The `backup` service keeps the owner: `pg_dump` must read every row.

New mandatory variable: `POSTGRES_APP_PASSWORD` (`openssl rand -hex 24`, hexadecimal so that it stays valid in the
URL), different from `POSTGRES_PASSWORD`.

**Setting it up on an existing database** (once, before or during the deployment that introduces the role):

```bash
DC="docker compose -f compose.yaml -f compose.prod.yaml"

# 0. Back up, then the current state (expected before: rolsuper = t)
$DC exec -T database psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c \
  "select rolname, rolsuper, rolbypassrls from pg_roles where rolname = current_user"

# 1. Add POSTGRES_APP_PASSWORD to .env.local, then fetch the code
git pull

# 2. Recreate the database service with the new variable and the mounted script (the volume is kept)
$DC up -d database

# 3. Create the role (idempotent: can be run again, it also updates the password)
$DC exec -T database sh /docker-entrypoint-initdb.d/10-create-app-role.sh

# 4. Rebuild and start: migration Version20261022100000 grants the DML rights to the role
$DC build --pull --no-cache
$DC up -d

# 5. Check the connection the application really uses (expected: app_runtime | f | f)
$DC exec php php bin/console dbal:run-sql \
  "select rolname, rolsuper, rolbypassrls from pg_roles where rolname = current_user"
```

On a new database (empty volume) the script of the `database` service creates the role by itself. If `app_runtime`
does not exist when the migration runs, it grants nothing and prints a warning: create the role (step 3), then run
`doctrine:migrations:migrate` again. **Rollback**: put the previous `DATABASE_URL` value (owner) back in
`compose.prod.yaml` and run `up -d`; the role can stay.

## 2. Build & start

```bash
# Build the production image (no cache to avoid stale layers)
docker compose -f compose.yaml -f compose.prod.yaml build --pull --no-cache

# Start all services in the background
docker compose -f compose.yaml -f compose.prod.yaml up -d

# Verify everything is healthy
docker compose -f compose.yaml -f compose.prod.yaml ps
docker compose -f compose.yaml -f compose.prod.yaml logs -f php   # wait for "PHP app ready!"
```

The container entrypoint runs `composer install` (first boot), waits for the
database, and **applies Doctrine migrations automatically** when migration files
are present.

:::caution[Docker build cache]
Always build with `--no-cache` (or verify the image digest) for each release to
avoid shipping a stale layer.
:::

### Image versions

Every image is pinned to an explicit version (no floating tag); the production images are also pinned to an `@sha256:` digest. Dependabot proposes the updates.

| Image | File | Version |
|-------|------|---------|
| `dunglas/frankenphp` | `Dockerfile` | `1.13.1-php8.5.11` |
| `debian` (`frankenphp_prod` base) | `Dockerfile` | `13.7-slim@sha256:a29215f6…` |
| `postgres` | `compose.yaml` | `18.6-alpine` |
| `axllent/mailpit` (dev) | `compose.override.yaml` | `v1.31.6` |
| `nfrastack/db-backup` | `compose.prod.yaml` | `5.0.5@sha256:01212206…` |

To update an image: change the tag (and the digest), rebuild with `--pull --no-cache`, then validate the stack. PostgreSQL major upgrades follow a dedicated procedure: [PostgreSQL 16 to 18 migration](/en/deployment/postgresql-18-upgrade/).

## 3. Post-deployment steps

Run these once per deployment, inside the `php` container
(`docker compose ... exec php php bin/console <command>`):

| Step | Command | When |
|------|---------|------|
| **Provision 2FA** | `app:totp:provision-missing` (preview with `--dry-run`) | After enabling mandatory 2FA. Existing users without TOTP are redirected to `/2fa/setup` on next login (expected, non-blocking). |
| **Encrypt patient PII** | `app:patient:encrypt-existing --batch-size=200` (idempotent; `--dry-run` to check) | One-off backfill when introducing patient encryption. Take a `pg_dump` first. |
| **Check retention** | `app:retention:check-studies` | Exit code `2` if studies exceed retention — integrate into Nagios/Zabbix. |
| **Remind GCP certificates** | `app:gcp:send-expiry-reminders` (preview with `--dry-run`) | Schedule it daily (cron): sends a single reminder before the GCP certificate of a user expires. Informative, blocks no access. |
| **Verify audit chains** | `app:verify-audit-chain` · `app:audit:verify-chain` | Periodic integrity check of the tamper-evident logs. |

:::note[No automatic clinical data deletion]
No eCRF data is ever deleted automatically — ICH E6 §5.15 requires explicit
sponsor authorization. Retention commands **report**; a human decides.
:::

## 4. Health checks

```bash
curl -I https://your-domain.example.com            # → HTTP/2 200
```

- Apache redirects HTTP → HTTPS (301) and proxies HTTPS → `127.0.0.1:8080`.
- Mercure is reachable at `/.well-known/mercure` (WebSocket upgrade proxied by Apache).
- All containers report `healthy`/`running` (the `worker` is `healthy` while `messenger:consume` is its main process; `logs worker` should show no repeated error).

## 5. Updates & rollback

Follow the **[Release process](/deployment/release-process/)** (French) for the update
flow (pull, rebuild, migrate, smoke-test) and rollback strategy. In short:

```bash
git pull
docker compose -f compose.yaml -f compose.prod.yaml build --pull --no-cache
docker compose -f compose.yaml -f compose.prod.yaml up -d   # migrations run on boot, worker recreated
```

## 6. Backups

PostgreSQL is backed up by the `backup` service (RPO ≤ 1h, local retention,
optional S3 offload). Targets, encryption and restore drills are documented in
**[Backup policy](/deployment/backup/)** (HDS v1.1 §8.4 / ISO 27001 A.12.3).

## Uploaded files (`private_uploads/`)

Uploaded files (avatars, attachments, clinical eCRF documents, archived import files) are stored in `/app/private_uploads`, which is the **`private_uploads`** named volume of `compose.prod.yaml`, shared by `php` and `worker` and owned by `www-data`. They survive container recreation (new image, `--force-recreate`).
They are **not** in the PostgreSQL backups: see the [Backup policy](/deployment/backup/#fichiers-déposés-private_uploads) (French).

**Before the first deployment with this volume** (existing files sit in the writable layer of the `php` container and are lost when it is recreated):

```bash
# 1. Copy the files out of the running container
docker compose -f compose.yaml -f compose.prod.yaml cp php:/app/private_uploads ./private_uploads-backup

# 2. Deploy (build then up -d): the volume is created empty, owned by www-data
# 3. Copy the files into the volume and check the owner
docker compose -f compose.yaml -f compose.prod.yaml cp ./private_uploads-backup/. php:/app/private_uploads/
docker compose -f compose.yaml -f compose.prod.yaml exec -u root php chown -R www-data:www-data /app/private_uploads

# 4. Check: an avatar uploaded before the deployment is still served afterwards
docker compose -f compose.yaml -f compose.prod.yaml up -d --force-recreate php worker
```

Delete `./private_uploads-backup` only once this check has passed.

## Messenger worker (background imports)

The **`worker`** service (`bin/console messenger:consume async`, same image and variables as `php`, no port and no Caddy) reads and validates large data imports in the background (at least `IMPORT_ASYNC_THRESHOLD` rows, 2000 by default); small files are still processed inside the request. The message queue is the `messenger_messages` table of **the same PostgreSQL database**: no extra service to host.

- The worker stops by itself after 1 h or 256 MB (`--time-limit`, `--memory-limit`) and `restart: unless-stopped` starts it again; if it is killed while reading a file, Docker restarts it and the message is picked up again after `redeliver_timeout` (300 s, in `MESSENGER_TRANSPORT_DSN`).
- A failing message is retried 3 times (waits of 2 s, 6 s then 18 s), then the import is marked `failed` with a generic reason (never a value or a header from the file) and the message moves to the `failed` queue.
- **On every deployment the worker must restart on the new code**: `docker compose -f compose.yaml -f compose.prod.yaml up -d` recreates it with the rebuilt image; without a rebuild (a variable change only), force it with `docker compose -f compose.yaml -f compose.prod.yaml up -d --force-recreate worker`. It first finishes the message in progress (60 s stop grace period).
- The worker reads the archived import files in `private_uploads/`: that directory is the `private_uploads` volume, shared by `php` and `worker` (see [Uploaded files](#uploaded-files-private_uploads)).

Failed messages (from the `php` container):

```bash
docker compose -f compose.yaml -f compose.prod.yaml exec php php bin/console messenger:failed:show
docker compose -f compose.yaml -f compose.prod.yaml exec php php bin/console messenger:failed:retry <id>
docker compose -f compose.yaml -f compose.prod.yaml exec php php bin/console messenger:failed:remove <id>
docker compose -f compose.yaml -f compose.prod.yaml logs -f worker
```

The `failed` queue is deliberately not consumed by the worker: a retry is a human decision, taken once the cause is fixed.

## Production checklist

- [ ] `.env.local` present, `chmod 600`, all `${VAR:?}` secrets set.
- [ ] Encryption keys stored in a vault and backed up separately.
- [ ] Apache TLS valid; HTTP→HTTPS redirect works; `certbot renew --dry-run` OK.
- [ ] `TRUSTED_PROXIES` matches the actual Docker gateway.
- [ ] PostgreSQL **not** exposed on the host.
- [ ] Migrations applied; `app:totp:provision-missing` run.
- [ ] `worker` service running (`ps` → `healthy`), `private_uploads` volume present (`docker volume ls`), existing files copied into it (see above).
- [ ] `backup` service running (`--profile backup`, mandatory before any real data); a restore has been tested.
- [ ] Audit chain verification scheduled.

## See also

- [Debian + Apache + Docker deployment](/deployment/debian-apache-docker/) — full host setup (French)
- [Backup policy](/deployment/backup/) · [Release process](/deployment/release-process/)
- [PostgreSQL 16 to 18 migration](/en/deployment/postgresql-18-upgrade/)
- [Security overview](/en/security/readme/) · [Compliance](/en/security/compliance/)
- [Architecture overview](/en/architecture/overview/)

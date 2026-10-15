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
                 PHP 8.5 worker (Symfony 8)
                        │
                 PostgreSQL 16 (container, internal network only)
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
| `POSTGRES_PASSWORD` / `POSTGRES_USER` / `POSTGRES_DB` | Database credentials |
| `DOMAIN` | Public domain (Mercure public URL, default URI) |
| `TRUSTED_PROXIES` | Defaults to `127.0.0.1,172.16.0.0/12` (covers Docker bridges) |

:::danger[Encryption keys are unrecoverable if lost]
Losing `APP_PATIENT_ENCRYPTION_KEY` or `APP_TOTP_ENCRYPTION_KEY` makes the
corresponding data permanently unreadable. Store all keys in a secrets vault and
back them up **separately** from the database.
:::

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
| `postgres` | `compose.yaml` (`POSTGRES_VERSION`) | `16.15-alpine` |
| `axllent/mailpit` (dev) | `compose.override.yaml` | `v1.31.6` |
| `nfrastack/db-backup` | `compose.prod.yaml` | `5.0.5@sha256:01212206…` |

To update an image: change the tag (and the digest), rebuild with `--pull --no-cache`, then validate the stack. PostgreSQL major upgrades follow a dedicated procedure.

## 3. Post-deployment steps

Run these once per deployment, inside the `php` container
(`docker compose ... exec php php bin/console <command>`):

| Step | Command | When |
|------|---------|------|
| **Provision 2FA** | `app:totp:provision-missing` (preview with `--dry-run`) | After enabling mandatory 2FA. Existing users without TOTP are redirected to `/2fa/setup` on next login (expected, non-blocking). |
| **Encrypt patient PII** | `app:patient:encrypt-existing --batch-size=200` (idempotent; `--dry-run` to check) | One-off backfill when introducing patient encryption. Take a `pg_dump` first. |
| **Check retention** | `app:retention:check-studies` | Exit code `2` if studies exceed retention — integrate into Nagios/Zabbix. |
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
- All containers report `healthy`/`running`.

## 5. Updates & rollback

Follow the **[Release process](/deployment/release-process/)** (French) for the update
flow (pull, rebuild, migrate, smoke-test) and rollback strategy. In short:

```bash
git pull
docker compose -f compose.yaml -f compose.prod.yaml build --pull --no-cache
docker compose -f compose.yaml -f compose.prod.yaml up -d   # migrations run on boot
```

## 6. Backups

PostgreSQL is backed up by the `backup` service (RPO ≤ 1h, local retention,
optional S3 offload). Targets, encryption and restore drills are documented in
**[Backup policy](/deployment/backup/)** (HDS v1.1 §8.4 / ISO 27001 A.12.3).

## Production checklist

- [ ] `.env.local` present, `chmod 600`, all `${VAR:?}` secrets set.
- [ ] Encryption keys stored in a vault and backed up separately.
- [ ] Apache TLS valid; HTTP→HTTPS redirect works; `certbot renew --dry-run` OK.
- [ ] `TRUSTED_PROXIES` matches the actual Docker gateway.
- [ ] PostgreSQL **not** exposed on the host.
- [ ] Migrations applied; `app:totp:provision-missing` run.
- [ ] `backup` service running (`--profile backup`, mandatory before any real data); a restore has been tested.
- [ ] Audit chain verification scheduled.

## See also

- [Debian + Apache + Docker deployment](/deployment/debian-apache-docker/) — full host setup (French)
- [Backup policy](/deployment/backup/) · [Release process](/deployment/release-process/)
- [Security overview](/en/security/readme/) · [Compliance](/en/security/compliance/)
- [Architecture overview](/en/architecture/overview/)

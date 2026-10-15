---
title: "Developer Getting Started"
description: "Install, run and contribute to the application locally: Docker setup, encryption keys, development dataset, tests and Git workflow."
---

> 🌐 English version · [Version française](/backend/getting-started/)

Set up the environment, run the application and contribute locally.

> Audience: developers joining the project. Prerequisites: Docker + Docker Compose, Git, and `make`.

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [Local installation](#2-local-installation)
3. [First run](#3-first-run)
4. [Development dataset](#4-development-dataset)
5. [Day-to-day development loop](#5-day-to-day-development-loop)
6. [Tests](#6-tests)
7. [Git workflow & contributing](#7-git-workflow--contributing)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Prerequisites

| Tool | Version | Role |
|------|---------|------|
| Docker Engine | ≥ 24 | Containerization |
| Docker Compose | v2 | Orchestration |
| Make | — | Shortcuts (see makefile.md) |
| Git | ≥ 2.30 | Versioning |

> No local PHP/Composer/Node installation is required: **everything runs inside the `php` container**. The front-end uses **AssetMapper** (no Node build).

---

## 2. Local installation

```bash
git clone <repo-url> synapse-medical
cd synapse-medical

# Copy and adapt the local configuration
cp .env.local.example .env.local
# → fill in DATABASE_URL and the encryption keys (see §3)

make build      # docker compose build --pull --no-cache
make up         # start containers in the background
```

On first start, the entrypoint (`frankenphp/docker-entrypoint.sh`) automatically runs `composer install`, waits for the database, then applies migrations.

### Encryption keys (mandatory)

The application encrypts patient data and TOTP secrets. Generate the keys and place them in `.env.local`:

```bash
# 32-byte base64 key (repeat for each key)
php -r "echo base64_encode(random_bytes(32)).PHP_EOL;"
```

| Variable | Purpose |
|----------|---------|
| `APP_SECRET` | Symfony secret (CSRF, remember-me, HMAC signatures) |
| `APP_TOTP_ENCRYPTION_KEY` | Encryption of 2FA secrets at rest |
| `APP_PATIENT_ENCRYPTION_KEY` | Encryption of patient PII |
| `APP_PATIENT_SEARCH_HMAC_KEY` | Blind index for search over encrypted data |

> ⚠️ **Losing `APP_PATIENT_ENCRYPTION_KEY` or `APP_TOTP_ENCRYPTION_KEY` makes the related data unrecoverable.** Store these keys in a vault.

---

## 3. First run

```bash
make up
make logs          # follow logs (Ctrl-C to quit)
```

The application is served by FrankenPHP:

| URL | Description |
|-----|-------------|
| https://localhost | Application (HTTP/3 enabled) |
| http://localhost:8025 | Mailpit — email inbox viewer (dev) |
| https://localhost/api/doc | Swagger UI (see [api/README.md](/api/readme/)) |

> The local TLS certificate is self-signed by Caddy: accept the browser exception.

---

## 4. Development dataset

A single command generates a complete environment (workspace, admin, sites, users, patients, studies, eCRF):

```bash
make sf c="app:seed --reset"
```

The seed asks which super administrator to create (e-mail, first name, last name, password; there is no default administrator and `--admin=<email>` is required in non-interactive mode) and prints the generated password once at the end; it must be changed at first login (see [commands/README.md](/commands/readme/) for all options).

> **2FA is mandatory**: on first login, the app redirects to TOTP enrollment (`/2fa/setup`). Scan the QR code with a TOTP app, or provision via `app:totp:provision-missing`.

---

## 5. Day-to-day development loop

The **FrankenPHP worker mode** runs with `--watch` in dev: changes under `src/` are hot-reloaded.

```bash
make sh            # sh shell in the php container
make bash          # bash shell with history
make cc            # clear Symfony cache
make sf c=<cmd>    # run a console command
make composer c="require <package>"   # add a dependency
```

### Database & migrations

```bash
make sf c="make:migration"                 # generate a migration from entities
make sf c="doctrine:migrations:migrate"    # apply migrations
make sf c="doctrine:schema:validate"       # verify ORM ↔ schema consistency
```

> ⚠️ **Worker mode**: any request-scoped stateful service must implement `ResetInterface`. See [code structure](/en/backend/symfony-structure/#11-worker-mode--rules-to-follow).

---

## 6. Tests

```bash
make test                                  # full PHPUnit suite (APP_ENV=test)
make test c="--filter StudyVoterTest"      # a targeted test
make test c="--group e2e"                  # a group
```

Coverage focuses on **security, access control, encryption and eCRF compliance**. Any addition under `src/Security/`, `src/Service/` or `src/Voter/` must come with tests.

---

## 7. Git workflow & contributing

1. Branch from `develop`: `feature/<topic>` or `fix/<topic>`.
2. Conventional commits: `feat(scope): …`, `fix(scope): …`, `docs: …`, `refactor: …`.
3. Before pushing: `make test` green + `doctrine:schema:validate`.
4. Open a PR against `develop`; the `.github/workflows/ci.yaml` builds images and runs health checks.
5. Respect the critical architecture rules (checklist below).

### Pre-PR checklist

- [ ] No query loads a resource **by ID alone** (always filter by `workspace`).
- [ ] New uploads go through `SecureFileUploadService` (never `public/`).
- [ ] Request-scoped services implement `ResetInterface`.
- [ ] Audit entries (`ActivityLog`, `SecurityAuditLog`) are never modified/deleted.
- [ ] Tests added/updated, `make test` green.
- [ ] Documentation updated for structural changes.

---

## 8. Troubleshooting

| Symptom | Hint |
|---------|------|
| `composer install` does not run | Delete `vendor/` then `make up` (entrypoint reinstalls) |
| Migrations not applied | `make sf c="doctrine:migrations:migrate"` |
| DB connection error | Check the `database` container is `healthy` (`docker compose ps`) |
| Patient data unreadable | Encryption keys missing/inconsistent in `.env.local` |
| Looping redirect to `/2fa/setup` | Normal until 2FA is enrolled |
| Changes not picked up | `make cc`, check `--watch` mode (logs) |

See also troubleshooting.md and xdebug.md.

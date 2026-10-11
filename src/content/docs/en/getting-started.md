---
title: "🚀 Quick Start — Run Synapse Medical in 5 minutes"
description: "Quick start guide for developers: prerequisites, encryption keys, launching the Docker (FrankenPHP) containers, migrations, seed and first login. Up and running in 5 to 10 minutes."
sidebar:
  label: "🚦 Getting started"
  order: 1
  badge:
    text: New
    variant: tip
---

> 🌐 [Version française](/getting-started/) · English version

*For developers — local environment (Docker recommended).*
**Goal: a running application in 5 to 10 minutes.**

:::tip[One-liner]
In a hurry? After cloning and generating the keys (steps 1-2):
`make start && make seed c="--reset --all-sites"`, then open **https://localhost**.
:::

## 📌 Prerequisites

| Tool | Details |
|------|---------|
| **Docker** + **Docker Compose v2** | [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Compose v2.10+ included) |
| **Git** | [git-scm.com](https://git-scm.com/downloads) |
| **Make** | Project wrappers (preinstalled on macOS/Linux; on Windows via WSL2) |
| **A terminal** | macOS/Linux terminal, or **WSL2** on Windows |
| **An editor** | VS Code, PHPStorm… (optional) |

:::note
Synapse Medical runs **entirely in containers**: a single **FrankenPHP** application service
(PHP 8.5 + Caddy) embeds the web server, the worker, the **Mercure** hub and **Vulcain**. No
local install of PHP, Composer or PostgreSQL is required.
:::

## ✅ Step 1 — Clone the repository

```bash
git clone <repository-url> synapse-medical
cd synapse-medical
```

:::tip
No repository access? Ask the team or work from a **fork**. The source code will be published
on [GitHub](https://github.com/stevenCayla/SYNAPSE-MEDICAL).
:::

## ✅ Step 2 — Generate the encryption keys

The application encrypts health data at rest (libsodium) and signs sessions. Four keys
**must** be defined. Generate them into a `.env.local` file (Git-ignored):

```bash
{
  echo "APP_SECRET=$(openssl rand -hex 16)"
  echo "APP_TOTP_ENCRYPTION_KEY=$(openssl rand -base64 32)"
  echo "APP_PATIENT_ENCRYPTION_KEY=$(openssl rand -base64 32)"
  echo "APP_PATIENT_SEARCH_HMAC_KEY=$(openssl rand -base64 32)"
} >> .env.local
```

| Key | Expected format | Usage |
|-----|-----------------|-------|
| `APP_SECRET` | hex | Session / CSRF signing (Symfony) |
| `APP_TOTP_ENCRYPTION_KEY` | **base64, 32 bytes** | Encryption of 2FA (TOTP) secrets |
| `APP_PATIENT_ENCRYPTION_KEY` | **base64, 32 bytes** | Patient PII encryption (`crypto_secretbox`) |
| `APP_PATIENT_SEARCH_HMAC_KEY` | **base64, ≥ 32 bytes** | Blind HMAC index for encrypted search |

:::caution
The `POSTGRES_PASSWORD`, passwords and keys in the `.env` file are **development values**.
Never reuse them in production — see [Production deployment](/en/deployment/production/).
:::

## ✅ Step 3 — Start the containers

```bash
make start
```

`make start` builds the images then starts the services. On the first run, the container
automatically runs `composer install` **and applies the migrations** once PostgreSQL is
ready.

> 🔄 Expect **2 to 3 minutes** on the first start (build + dependencies + migrations).

:::note[TLS certificate]
FrankenPHP generates a **self-signed HTTPS** certificate in development. On your first visit to
`https://localhost`, accept the browser warning (local certificate).
:::

**Check the services status:**

```bash
make ps          # or: docker compose ps
```

You should see the `php`, `database` and `mailer` services running:

```
NAME                        SERVICE    STATUS    PORTS
synapse-medical-php-1       php        running   0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
synapse-medical-database-1  database   running   5432/tcp
synapse-medical-mailer-1    mailer     running   1025/tcp, 8025/tcp
```

## ✅ Step 4 — Initialize the data

Migrations are already applied at startup. Now load a **development dataset** (workspace,
admin, sites, users, patients, studies, eCRF):

```bash
make seed c="--reset --all-sites"
# equivalent: make sf c="app:seed --reset --all-sites"
```

:::tip
Need to run a migration manually? `make migrate`.
To start fresh: `make reset-database` (⚠️ destructive).
:::

**Check the database (optional):**

```bash
make pgsql       # opens psql, then type \dt to list the tables
```

You should see the `study`, `patient`, `ecrf_form`, `workspace`, `user`… tables.

## ✅ Step 5 — Log in

1. Open **https://localhost** in your browser.
2. Log in with the administrator created by the seed:

   | Field | Default value |
   |-------|---------------|
   | **Email** | `steven@example.com` |
   | **Password** | `Password1!` |

:::note[2FA mandatory]
Two-factor authentication (**TOTP**) is mandatory. On your first login, scan the QR code with
an authenticator app (Google Authenticator, Aegis, 1Password…), then enter the 6-digit code.
:::

**Login issue?**

```bash
make logs                    # follows the logs of all services
docker compose logs php      # logs of the application container only
```

## ✅ Step 6 — Explore the API (optional)

The internal API is documented via **Swagger UI** (authentication via **session + CSRF**, no
JWT):

👉 **https://localhost/api/doc**

For the endpoint details and OpenAPI conventions, see the [API reference](/en/api/readme/).

:::tip[Emails in dev]
Outgoing emails are captured by **Mailpit** (no real sending). Get its web UI URL with
`docker compose port mailer 8025`.
:::

## 🎯 Next steps

- 🏗️ Understand the architecture: [Overview](/en/architecture/overview/)
- 🗄️ Explore the data model: [Data model](/en/database/data-model/)
- ⌨️ All commands: [Console commands reference](/en/commands/readme/)
- 🔒 Security rules: [Security best practices](/en/security/best-practices/)
- 🤝 Get involved: [Contribution guide](/en/contribute/)

## 🔍 Final check

| Step | Status | Verification command |
|------|--------|----------------------|
| Repository cloned | ✅ | `ls` (shows `Makefile`, `compose.yaml`, `Dockerfile`…) |
| Keys generated | ✅ | `cat .env.local` (4 keys present) |
| Containers running | ✅ | `make ps` (`php`, `database`, `mailer` services `running`) |
| Database initialized | ✅ | `make pgsql` then `\dt` |
| Application reachable | ✅ | `curl -k https://localhost` (returns HTML) |
| Admin login | ✅ | https://localhost (`steven@example.com` / `Password1!`) |

---

:::tip[Did this guide help?]
A step is missing or a command fails? Report it on
[Discord](https://discord.com/channels/1521440528388984934/1521440528829382718) or via an
issue. See also [Troubleshooting](/en/troubleshooting/common-errors/).
:::

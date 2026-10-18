---
title: Console commands reference
description: "Reference for the app:* console commands: seed and test data,
  security maintenance, retention and audit-chain verification. Overview, common
  options and per-command details."
slug: en/3.0/commands/readme
---

All of the application's business commands are prefixed `app:*` and defined in
`src/Command`. This page is their complete reference: a tabulated [overview](#overview),
the [common options](#common-options) shared by several commands, then the details of each
command (description, options, examples).

:::note[How to run a command]
Every command runs through the PHP container. Two equivalents:

```bash
make sf c="<command> [options]"
# or directly:
docker compose exec php php bin/console <command> [options]
```

In the examples below we simply write `php bin/console <command>`.
:::

## Overview

```bash
php bin/console <command> [arguments] [--options]
```

### Data & environment

| Command | Description | Example |
|---|---|---|
| [`app:seed`](#appseed) | Full fake dataset (orchestrated pipeline) | `app:seed --reset --users=5 --studies=2` |
| [`app:reset-database`](#appreset-database) | Empties all application tables | `app:reset-database --force` |

### Security & compliance

| Command | Description | Example |
|---|---|---|
| [`app:users:auto-disable-inactive`](#appusersauto-disable-inactive) | Disables accounts inactive for N days | `app:users:auto-disable-inactive --days=60` |
| [`app:totp:provision-missing`](#apptotpprovision-missing) | Provisions missing TOTP secrets | `app:totp:provision-missing --dry-run` |
| [`app:matchid:renew-token`](#appmatchidrenew-token) | Renews the MatchID access token | `app:matchid:renew-token --force` |
| [`app:patient:encrypt-existing`](#apppatientencrypt-existing) | Encrypts plaintext PII data (backfill) | `app:patient:encrypt-existing --dry-run` |

### Retention & purge

| Command | Description | Example |
|---|---|---|
| [`app:retention:check-studies`](#appretentioncheck-studies) | Checks HDS retention of studies (15 years) | `app:retention:check-studies --warning-days=180` |
| [`app:retention:purge-security-logs`](#appretentionpurge-security-logs) | Purges expired security logs | `app:retention:purge-security-logs --older-than=P3M` |

### Test data (fixtures)

| Command | Description | Example |
|---|---|---|
| [`app:create-fake-sites`](#appcreate-fake-sites) | Creates fake investigator sites | `app:create-fake-sites -w 1 --all` |
| [`app:create-fake-users`](#appcreate-fake-users) | Creates fake users | `app:create-fake-users -w 1 -c 5` |
| [`app:create-fake-teams`](#appcreate-fake-teams) | Creates the 9 standard clinical-trial teams | `app:create-fake-teams -w 1` |
| [`app:create-fake-patients`](#appcreate-fake-patients) | Creates fake patients | `app:create-fake-patients -w 1 -c 50` |
| [`app:create-fake-studies`](#appcreate-fake-studies) | Creates complete clinical studies | `app:create-fake-studies -w 1 -c 2 --with-sites` |
| [`app:create-fake-study-members`](#appcreate-fake-study-members) | Adds fake members to studies | `app:create-fake-study-members -w 1 -m 5` |
| [`app:create-fake-study-patients`](#appcreate-fake-study-patients) | Enrolls fake patients in a study | `app:create-fake-study-patients -w 1 -s 5 -c 30` |
| [`app:create-fake-ecrf-templates`](#appcreate-fake-ecrf-templates) | Creates reusable eCRF templates | `app:create-fake-ecrf-templates --publish` |
| [`app:create-fake-ecrf-forms`](#appcreate-fake-ecrf-forms) | Creates eCRF forms for studies | `app:create-fake-ecrf-forms -w 1 --from-templates` |

## Common options

These options recur across several commands with the same meaning. They are not
systematically repeated in each command's details below.

### `-w, --workspace <id>`

Target workspace ID. If omitted and the command needs one, it is **prompted
interactively**. Guarantees isolation: every entity created is attached to this workspace.

### `--dry-run`

Simulates the run **without writing** anything to the database. Shows what would happen.
Recommended to validate a maintenance command before running it for real.

### `--force (-f)`

Runs **without interactive confirmation**. Use it in scripts and CI, where no input is
possible.

***

## `app:seed`

Main orchestration command. Generates a full fake dataset in a single command: workspace,
admin, sites, users, patients, studies, eCRF. Ideal to initialize a development or test
environment.

```bash
php bin/console app:seed [options]
```

### Flags

| Option | Type | Default | Description |
|---|---|---|---|
| `--reset` | flag | — | Fully empties the database before generating data |
| `--workspace-name` | string | `Développement` | Name of the workspace created after the reset |
| `--admin` | string (repeatable) | — | Email of an administrator to create (one per admin; first and last name derived from the email). Without it: interactive prompts, or the command is refused in non-interactive mode, before any data is wiped; there is no default administrator |
| `SEED_ADMIN_PASSWORD` | env variable | — | Password of the administrators in non-interactive mode. If unset, a random password is generated and printed once at the end |
| `-w, --workspace` | int | — | Target workspace ID (ignored if `--reset`) |
| `--users` | int | `10` | Number of investigator users to create |
| `--patients` | int | `30` | Number of patients to create |
| `--studies` | int | `3` | Number of studies to create |
| `--patients-per-study` | int | `10` | Patients enrolled per study |
| `--all-sites` | flag | — | Creates all sites from the catalog (otherwise the first 3) |

**Example:**

```bash
# Full reset + seed
php bin/console app:seed --reset --users=5 --studies=2

# Seed into an existing workspace
php bin/console app:seed -w 1 --patients=50 --all-sites
```

**Administrators:** with `--reset`, at least one super administrator must be named: there is no default administrator.
In interactive mode, the seed asks for the e-mail (required), first and last name (proposed from the e-mail, editable),
then the password (hidden input with confirmation, validated against the password policy; Enter to generate one),
and offers to add another administrator. In non-interactive mode, `--admin=<email>` is required: without it, the command
fails before wiping the database.
Each administrator is `ROLE_SUPER_ADMIN`, linked to both workspaces, and **must change the password at first login**. The command is refused in the `prod` environment.

**Internal pipeline:** reset (optional) → workspace + admin → sites → users (with site assignment) → teams (9 standard teams with members) → patients → studies (with enrolled patients and visit occurrences) → eCRF templates.

***

## `app:reset-database`

Empties all application tables and invalidates every active PHP session. **Irreversible.**
Keeps infrastructure tables (`messenger_messages`, `doctrine_migration_versions`).

```bash
php bin/console app:reset-database [--force]
```

### Flags

| Option | Type | Default | Description |
|---|---|---|---|
| `--force` | flag | — | Runs without interactive confirmation |

**Example:**

```bash
# With interactive confirmation
php bin/console app:reset-database

# Without confirmation (CI/scripts)
php bin/console app:reset-database --force
```

:::caution
Do not use in production.
:::

***

## `app:users:auto-disable-inactive`

Automatically disables user accounts inactive for more than N days. Every action is traced
via `SecurityAuditLogger`.

```bash
php bin/console app:users:auto-disable-inactive [options]
```

### Flags

| Option | Type | Default | Description |
|---|---|---|---|
| `--days` | int | `90` | Inactivity threshold in days |
| `--dry-run` | flag | — | Simulates without modifying the database |

**Example:**

```bash
# Disable after 60 days of inactivity
php bin/console app:users:auto-disable-inactive --days=60

# Simulation (audit only)
php bin/console app:users:auto-disable-inactive --dry-run
```

:::tip[Recommended cron]
Daily.
:::

***

## `app:totp:provision-missing`

Provisions a TOTP secret for users who don't have one yet (backfill P0-NC03 — mandatory
2FA enforcement). Idempotent: skips users already provisioned. Users verify their TOTP code
on their next login.

```bash
php bin/console app:totp:provision-missing [--dry-run]
```

### Flags

| Option | Type | Default | Description |
|---|---|---|---|
| `--dry-run` | flag | — | Simulates without writing to the database |

**Example:**

```bash
php bin/console app:totp:provision-missing --dry-run
php bin/console app:totp:provision-missing
```

***

## `app:matchid:renew-token`

Renews the MatchID API access token. Checks the expiry date and the renewal deadline. Fails
if the renewal is too late. Designed for daily cron execution.

```bash
php bin/console app:matchid:renew-token [--force]
```

### Flags

| Option | Type | Default | Description |
|---|---|---|---|
| `-f, --force` | flag | — | Renews even if the token is still valid |

**Example:**

```bash
php bin/console app:matchid:renew-token
php bin/console app:matchid:renew-token --force
```

:::tip[Recommended cron]
Daily.
:::

***

## `app:patient:encrypt-existing`

Encrypts plaintext PII fields of patients (first name, last name, birth name, external
identifier, dates) following the P0-NC01 migration. Operates directly via DBAL to bypass
the ORM listeners. Idempotent: skips already-encrypted fields (`ENC:` prefix). Recomputes
the search hashes on the external identifier and the date of birth.

```bash
php bin/console app:patient:encrypt-existing [options]
```

### Flags

| Option | Type | Default | Description |
|---|---|---|---|
| `--batch-size` | int | `100` | Patients processed per flush |
| `--dry-run` | flag | — | Simulates without writing to the database |

**Example:**

```bash
php bin/console app:patient:encrypt-existing --dry-run
php bin/console app:patient:encrypt-existing --batch-size=500
```

:::caution
One-shot post-migration command. Must not be run regularly.
:::

***

## `app:retention:check-studies`

Identifies clinical studies approaching or past their HDS retention date (15 years after
closure). Non-destructive — alerts only. Returns exit code `2` if any study is past its
deadline.

```bash
php bin/console app:retention:check-studies [options]
```

### Flags

| Option | Type | Default | Description |
|---|---|---|---|
| `--warning-days` | int | `90` | Days before expiry that trigger an alert |
| `--workspace` | int | — | Restrict the check to one workspace (ID) |

**Example:**

```bash
# Alert 6 months before expiry
php bin/console app:retention:check-studies --warning-days=180

# Check scoped to one workspace
php bin/console app:retention:check-studies --workspace=3
```

:::tip[Recommended cron]
Monthly. Monitor the exit code in CI/CD.
:::

***

## `app:retention:purge-security-logs`

Purges `SecurityAuditLog` entries past the legal retention period (6 months by default,
GDPR). Optionally supports purging `PatientErasureLog` entries older than 5 years.

```bash
php bin/console app:retention:purge-security-logs [options]
```

### Flags

| Option | Type | Default | Description |
|---|---|---|---|
| `--dry-run` | flag | — | Shows the number of rows without performing the purge |
| `--older-than` | string (ISO 8601) | `P6M` | Maximum age of entries to keep (`P6M`, `P3M`, `P1Y`…) |
| `--with-erasure-logs` | flag | — | Also purges `PatientErasureLog` entries older than 5 years |

**Example:**

```bash
# Simulation
php bin/console app:retention:purge-security-logs --dry-run

# Purge logs older than 3 months
php bin/console app:retention:purge-security-logs --older-than=P3M

# Full purge including erasure logs
php bin/console app:retention:purge-security-logs --with-erasure-logs
```

:::tip[Recommended cron]
Monthly.
:::

***

## `app:create-fake-sites`

Creates fake investigator sites (French hospitals) with unique codes, departments,
addresses and identification colors. The catalog contains 6 predefined sites.

```bash
php bin/console app:create-fake-sites [options]
```

### Flags

| Option | Type | Default | Description |
|---|---|---|---|
| `-w, --workspace` | int | — | Target workspace ID (prompted interactively if absent) |
| `--all` | flag | — | Creates all sites from the catalog (otherwise the first 3) |

**Example:**

```bash
php bin/console app:create-fake-sites -w 1
php bin/console app:create-fake-sites -w 1 --all
```

***

## `app:create-fake-users`

Creates fake users with realistic profiles (names, positions), a common password and
configurable roles. Adds the users to the workspace. Supports random assignment to
investigator sites (70% probability).

```bash
php bin/console app:create-fake-users [options]
```

### Flags

| Option | Type | Default | Description |
|---|---|---|---|
| `-c, --count` | int | `10` | Number of users to create |
| `-p, --password` | string | random | Common password for all users. If omitted, a random password is generated on each run and printed in the summary |
| `-r, --role` | string\[] | — | Role(s) to assign (`ROLE_USER`, `ROLE_ADMIN`, `ROLE_MODERATOR`) |
| `-w, --workspace` | int | — | Target workspace ID (prompted interactively if absent) |
| `--assign-sites` | flag | — | Randomly assigns users to sites of the workspace |

**Example:**

```bash
php bin/console app:create-fake-users -w 1 -c 5 --role=ROLE_ADMIN
php bin/console app:create-fake-users -w 1 --assign-sites
```

***

## `app:create-fake-teams`

Creates the 9 standard functional teams of a clinical trial with random members drawn from
the workspace. A team lead is automatically designated per team. The following teams are
created with their fixed identification colors:

| Team | Color |
|---|---|
| Clinical Operations | Purple `#6d4aff` |
| Data Management | Indigo `#6366f1` |
| Biostatistics | Emerald `#10b981` |
| Pharmacovigilance / Safety | Coral `#ef4444` |
| Regulatory Affairs | Amber `#f59e0b` |
| Monitoring / CRA | Cyan `#06b6d4` |
| Medical / Investigators | Lavender `#a78bfa` |
| Sponsor Management | Pink `#ec4899` |
| External CRO | Purple `#6d4aff` |

```bash
php bin/console app:create-fake-teams [options]
```

### Flags

| Option | Type | Default | Description |
|---|---|---|---|
| `-w, --workspace` | int | — | Target workspace ID (prompted interactively if absent) |
| `--min-members` | int | `2` | Minimum number of members per team |
| `--max-members` | int | `6` | Maximum number of members per team |
| `--clear` | flag | — | Removes existing teams before creating |

**Example:**

```bash
php bin/console app:create-fake-teams -w 1
php bin/console app:create-fake-teams -w 1 --min-members=3 --max-members=8
php bin/console app:create-fake-teams -w 1 --clear
```

:::note
Integrated into the `app:seed` pipeline at step 5 (after users, before patients).
:::

***

## `app:create-fake-patients`

Generates fake patients with realistic demographic data (last name, first name, sex, date
of birth, external identifier/IPP). Uses Faker with the French locale.

```bash
php bin/console app:create-fake-patients [options]
```

### Flags

| Option | Type | Default | Description |
|---|---|---|---|
| `-c, --count` | int | `20` | Number of patients to create |
| `-o, --owner` | string | — | Username of the patients' creator |
| `-w, --workspace` | int | — | Target workspace ID (prompted interactively if absent) |

**Example:**

```bash
php bin/console app:create-fake-patients -w 1 -c 50
php bin/console app:create-fake-patients -w 1 -o admin
```

***

## `app:create-fake-studies`

Creates complete clinical studies with protocol, visit schedule, eCRF forms (sections +
fields + visit mappings), investigator sites, members and enrolled patients. Includes 5
preconfigured study templates (MS, Type 2 diabetes, Heart failure, Colorectal cancer,
Post-stroke).

```bash
php bin/console app:create-fake-studies [options]
```

### Flags

| Option | Type | Default | Description |
|---|---|---|---|
| `-c, --count` | int | `3` | Number of studies to create (max depends on the catalog) |
| `-o, --owner` | string | — | Username of the studies' owner |
| `--patients-per-study` | int | `8` | Patients enrolled per study |
| `--members-per-study` | int | `3` | Members added per study |
| `--with-visit-occurrences` | flag | — | Generates visit occurrences for the enrolled patients |
| `--with-sites` | flag | — | Associates investigator sites and assigns patients per site |
| `-w, --workspace` | int | — | Target workspace ID (prompted interactively if absent) |

**Example:**

```bash
php bin/console app:create-fake-studies -w 1 -c 2 --with-sites --with-visit-occurrences
php bin/console app:create-fake-studies -w 1 --patients-per-study=20 --members-per-study=5
```

***

## `app:create-fake-study-members`

Adds members to existing studies with randomly assigned roles. Avoids duplicate members and
respects study ownership.

```bash
php bin/console app:create-fake-study-members [options]
```

### Flags

| Option | Type | Default | Description |
|---|---|---|---|
| `-m, --members-per-study` | int | `3` | Number of members to add per study |
| `-s, --study` | int | — | ID of a specific study (all studies if absent) |
| `-w, --workspace` | int | — | Target workspace ID (prompted interactively if absent) |

**Example:**

```bash
php bin/console app:create-fake-study-members -w 1 -m 5
php bin/console app:create-fake-study-members -w 1 -s 12 -m 2
```

***

## `app:create-fake-study-patients`

Enrolls fake patients into an existing study. Requires the study to have investigator sites
with the `ENROLLMENT_OPEN` status. Generates subject identifiers via `SubjectIdService`.

```bash
php bin/console app:create-fake-study-patients [options]
```

### Flags

| Option | Type | Default | Description |
|---|---|---|---|
| `-s, --study` | int | **required** | Target study ID |
| `-c, --count` | int | `10` | Number of patients to enroll |
| `-o, --owner` | string | — | Username of the user performing the enrollments |
| `-w, --workspace` | int | — | Target workspace ID (prompted interactively if absent) |

**Example:**

```bash
php bin/console app:create-fake-study-patients -w 1 -s 5 -c 30
php bin/console app:create-fake-study-patients -w 1 -s 5 --owner=investigateur1
```

***

## `app:create-fake-ecrf-templates`

Creates 5 reusable eCRF templates covering common clinical domains: demographics/inclusion,
standard biology, neurology, oncology and quality of life (SF-12). Each template includes
sections and fields with validation rules.

```bash
php bin/console app:create-fake-ecrf-templates [options]
```

### Flags

| Option | Type | Default | Description |
|---|---|---|---|
| `--creator` | string | — | Username of the templates' creator |
| `--publish` | flag | — | Publishes the templates after creation |

**Example:**

```bash
php bin/console app:create-fake-ecrf-templates --publish
php bin/console app:create-fake-ecrf-templates --creator=admin --publish
```

***

## `app:create-fake-ecrf-forms`

Creates eCRF forms for existing studies. Can generate forms from published templates or use
fallback definitions with standard clinical sections (inclusion, follow-up, closure).

```bash
php bin/console app:create-fake-ecrf-forms [options]
```

### Flags

| Option | Type | Default | Description |
|---|---|---|---|
| `-s, --study` | int | — | ID of a specific study (all studies if absent) |
| `--activate` | flag | — | Activates the forms after creation |
| `--from-templates` | flag | — | Generates from the published eCRF templates |
| `-w, --workspace` | int | — | Target workspace ID (prompted interactively if absent) |

**Example:**

```bash
php bin/console app:create-fake-ecrf-forms -w 1 --from-templates --activate
php bin/console app:create-fake-ecrf-forms -w 1 -s 3 --activate
```

***

## Recommended workflow — full initialization

```bash
# Option 1: a single command (recommended)
php bin/console app:seed --reset --all-sites --users=8 --studies=3 --patients=40

# Option 2: step by step (more control)
php bin/console app:reset-database --force
php bin/console app:create-fake-sites -w 1 --all
php bin/console app:create-fake-users -w 1 -c 8 --assign-sites
php bin/console app:create-fake-teams -w 1
php bin/console app:create-fake-patients -w 1 -c 40
php bin/console app:create-fake-ecrf-templates --publish
php bin/console app:create-fake-studies -w 1 -c 3 --with-sites --with-visit-occurrences
php bin/console app:create-fake-ecrf-forms -w 1 --from-templates --activate
```

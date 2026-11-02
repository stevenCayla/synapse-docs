---
title: "Environment variables: environment banner and mailer safeguards"
description: "APP_ENVIRONMENT_LABEL and MAILER_ALLOWED_RECIPIENTS variables: banner and mail safeguards outside production."
---

## `APP_ENVIRONMENT_LABEL`

Shows a discreet banner at the top of every page (the login and 2FA pages included) with the environment name and the version,
so nobody mistakes UAT or the development server for production.

| Value | Effect |
|-------|--------|
| empty (default) | no banner: **the production value** |
| `development` | blue banner "Development environment" (development server, `dev-app.synapse-medical.fr`) |
| `uat` | orange banner "UAT environment" (UAT, `uat-app.synapse-medical.fr`) |
| any other text | grey banner showing that text as is |

The `development` and `uat` labels are translated (French, English, following the interface language).
The banner is plain HTML and CSS served like the rest of the application: no inline script or style (Content Security Policy respected).

Example (server `.env.local`, read by `compose.prod.yaml`):

```dotenv
APP_ENVIRONMENT_LABEL=uat
```

Recreate the containers after changing it (`docker compose up -d`).

## `MAILER_ALLOWED_RECIPIENTS`

List of recipients allowed to receive e-mail, so that a UAT or development server never writes to real users.
Comma-separated values, spaces and case ignored:

| Entry | Effect |
|-------|--------|
| `example.org` or `@example.org` | the whole `example.org` domain (not its subdomains) |
| `first.last@example.org` | that address only |
| `*` | everyone |

Rules:

- recipients outside the list are removed from the sending and logged (warning, masked address `f***@domain` and subject, never the body); with no recipient left the message is not sent (no error on the application side);
- **fail closed**: when `APP_ENVIRONMENT_LABEL` is set and the list is empty, no e-mail is sent (a warning is logged);
- **production**: leave this variable **and** `APP_ENVIRONMENT_LABEL` empty, no filtering;
- **development server**: `*`, because its mail goes to a test mailbox; **UAT**: only the team domain or specific addresses;
- when `APP_ENVIRONMENT_LABEL` is set, the subject is prefixed with `[NAME]` (uppercase) and every e-mail ends with a notice saying it was sent from that environment, with fictitious data, not to be answered.

```dotenv
APP_ENVIRONMENT_LABEL=uat
MAILER_ALLOWED_RECIPIENTS=synapse-medical.fr,first.last@example.org
```

Recreate the containers after changing it (`docker compose up -d`).

## `APP_WEBSITE_URL`

Base URL of the public website that the "Request a demo" link of the login page points to (new tab). The application appends `/demo/` in French and `/en/demo/` in English, following the page language. Demo requests are handled by the public website only: the application exposes no form that sends e-mails.

- default: `https://synapse-medical.fr` (production); a trailing `/` is ignored;
- example: `APP_WEBSITE_URL=https://synapse-medical.fr` gives `https://synapse-medical.fr/demo/` and `https://synapse-medical.fr/en/demo/`.

---
title: "Environment variables: environment banner and mailer safeguards"
description: "APP_ENVIRONMENT_LABEL, APP_PROFILE_SWITCHER and MAILER_ALLOWED_RECIPIENTS variables: banner, profile switcher and mail safeguards outside production."
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

## `APP_PROFILE_SWITCHER`

Turns on the profile switcher ("Switch profile" entry of the user menu, right under "My profile"): a super administrator acts as another user of the active workspace to test their real permissions (workspace role, study role, sites).
It relies on Symfony's `switch_user`: no simulated role, voters and the site restriction apply as they do for that person.

| Condition | Effect |
|-----------|--------|
| `APP_PROFILE_SWITCHER=1` **and** `APP_ENVIRONMENT_LABEL` equal to `local` or `development` | the entry shows in the user menu of a super administrator (never on the two-factor setup or forced password change screens) |
| anything else (variable unset, empty or not `1`; label empty, `uat`, `production`, other text) | nothing is rendered, the `/dev/profile-switcher/*` routes answer 404, no profile switch is accepted |

- **Default: off** (`.env`). **UAT and production: always off**, even with the variable set, because the label of those environments is neither `local` nor `development`. `APP_ENV` is not used (the development server runs in `prod`).
- **User switching exists only on local and development** (Refs #349): without `APP_PROFILE_SWITCHER=1` and a `local` or `development` label, every `_switch_user` request is refused (403) for every role, and the links of the Users and Team pages are not rendered. **No more impersonation on UAT and production** (support staff must know). Leaving an impersonation stays possible.
- Restricted to `ROLE_SUPER_ADMIN`. Targets: the active users of the active workspace only (never another workspace, never yourself), checked again on the server at every switch. The list is loaded when the dialog opens, never on a page load.
- While switched, the environment banner says "You are acting as…" with the way back to your own profile, on every page, and the menu entry stays available to switch again. Switching opens the home page (the current page may be forbidden to the person picked); the way back returns to the current page.
- Switching is a `POST` with a CSRF token, and so is the way back. Each start and end is written to the security audit log (`impersonation.start`, `impersonation.end`, with the real user and the target).
- **No electronic signature while switched** (eCRF, configuration approvals, import signature, regulatory pack publication): it binds the real person. This applies to every impersonated session, including the ones started from the Users and Team pages.
- Two-factor authentication and the forced password change of the real user are required to start; while switched, the target's are not applied (as with the existing impersonation).

Development server (`.env.local`, read by `compose.prod.yaml`):

```dotenv
APP_ENVIRONMENT_LABEL=development
APP_PROFILE_SWITCHER=1
```

Local machine: `APP_ENVIRONMENT_LABEL=local` and `APP_PROFILE_SWITCHER=1` in `.env.local`. Recreate the containers after changing it (`docker compose up -d`).

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

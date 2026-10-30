<div align="center">

# Synapse Docs

**The documentation platform of [Synapse Medical](https://github.com/stevenCayla/synapse-app)**<br>
User guides, acceptance test books, compliance pages and technical reference, in French and English.

[![CI](https://github.com/stevenCayla/synapse-docs/actions/workflows/ci.yaml/badge.svg)](https://github.com/stevenCayla/synapse-docs/actions/workflows/ci.yaml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Astro](https://img.shields.io/badge/Astro-7-ff5d01.svg)](https://astro.build)
[![Starlight](https://img.shields.io/badge/Starlight-0.42-8b5cf6.svg)](https://starlight.astro.build)

[Production](https://docs.synapse-medical.fr) · [Development](https://dev-docs.synapse-medical.fr) · [Report an issue](https://github.com/stevenCayla/synapse-docs/issues) · [Security policy](SECURITY.md)

</div>

---

## Contents

- [Overview](#overview)
- [Environments](#environments)
- [Where to edit the pages](#where-to-edit-the-pages)
- [Page front matter](#page-front-matter)
- [Getting started](#getting-started)
- [Repository layout](#repository-layout)
- [Versioned documentation](#versioned-documentation)
- [Hosting and deployment](#hosting-and-deployment)
- [Branches and releases](#branches-and-releases)
- [Security](#security)
- [License](#license)

## Overview

Synapse Docs is a static site built with [Astro](https://astro.build) and
[Starlight](https://starlight.astro.build). It follows the *Synapse Docs* design:
custom theme, sidebar and search, reading progress, a glossary, a compliance FAQ,
a changelog timeline and printable A4 sheets of the guides.

| Area | What it provides |
|------|------------------|
| Guides | Step-by-step study guides with screenshots and a screenshot viewer, in French and English |
| Acceptance tests | Strategy, test kit and test books (REC-01, REC-01b) with a run mode: statuses, deviation notes, report and printable report |
| Reference | Architecture, backend, security, deployment, API, commands, database, GDPR, audit and compliance |
| Changelog | A timeline built from the `CHANGELOG.md` of the application |
| Reading aids | Glossary tooltips, contextual help links from the application, version banner and review badge |
| Diagrams | Mermaid diagrams with zoom, pan, source view, copy and SVG export |
| Feedback | A helpful-page widget that opens a pre-filled GitHub issue; nothing is sent without the reader |
| History | Contributors and edit history of each page, read from git at build time |

The repository builds on its own: clone it, install the dependencies and build.
No access to the application repository is needed.

## Environments

| Branch | Published at | Deployment |
|--------|--------------|------------|
| `develop` | https://dev-docs.synapse-medical.fr (not indexed) | Automatic on every push |
| `main` | https://docs.synapse-medical.fr | Manual only (see [Hosting and deployment](#hosting-and-deployment)) |

## Where to edit the pages

Content that describes the application is edited in **one place only**: the
`docs/` folder of [synapse-app](https://github.com/stevenCayla/synapse-app),
so the documentation evolves with the code.

| Pages | Edit them in |
|-------|--------------|
| `src/content/docs/audit/` (audit and compliance) | this repository |
| `src/content/docs/guides/`, `resources/`, `recette/` and their `en/` counterparts (guides, glossary, compliance FAQ, acceptance tests) | this repository **for now**: they describe the application and belong in the `docs/` folder of synapse-app, where they should move (then drop them from the exclusions of `scripts/sync-content.sh`) |
| `src/pages/recette/prospective-import.astro` and `src/components/recette-import/` (REC-01b test book) | this repository |
| `src/data/CHANGELOG.md`, `APP_VERSION` | nowhere: copied from `CHANGELOG.md` and the latest release tag of the application by the sync, never edited by hand |
| everything else in `src/content/docs/` | the `docs/` folder of synapse-app |

`src/content/docs/` (except `audit/`, `guides/`, `resources/` and `recette/`, French
and English) is a snapshot of the application's `docs/` folder, refreshed by
`scripts/sync-content.sh`. The CI runs it automatically when `docs/` changes on
`develop` in synapse-app, checks that the site still builds and commits the new
snapshot. Changes made directly to the synced pages here are overwritten by the next
sync. The `APP_VERSION` file (shown in the version menu) holds the latest release tag `vX.Y.Z` of the application, without the `v` (`-rc` tags ignored); it falls back to `APP_VERSION` of the application's `.env` when no tag is available (never `dev`), otherwise it is left unchanged. A checkout given as `SYNAPSE_DIR` needs its tags (`git fetch --tags`).

The synced pages get the design without any change to their Markdown:
`integrations/markdown-mockup.mjs` turns quotes into asides, the prerequisites table
into cards and ```` ```mermaid ```` blocks into diagrams; code blocks, lists and
tables are styled in `src/styles/page.css`.

The home pages (`src/pages/index.astro`, `src/components/home/`) and the changelog
timeline (`src/components/changelog/`, built from `src/data/CHANGELOG.md`) are part of
the site itself and live here.

## Page front matter

Besides the usual Starlight fields, pages can set (all optional):

| Field | Effect |
|-------|--------|
| `time` | Reading time shown in the page header (otherwise estimated from the length) |
| `introduced` | Version of the application that brings the feature; an "upcoming feature" notice is shown while the current version is older |
| `wip` | `true` flags a page being written (badge in the sidebar, notice in the header); nearly empty application pages are flagged automatically |
| `reviewed` | Last application version the page was reviewed for (the current version when missing); "not reviewed for N versions" beyond one |
| `sheet` | `true` adds the printable A4 sheet of a guide (`/fiches/<slug>/`, `/en/sheets/<slug>/`) |

## Getting started

Requires Node.js 24 (see `.nvmrc`; `nvm use` selects it). Run `make` to list the
available commands.

```bash
make install                              # install the npm dependencies
make dev                                  # dev server on http://localhost:4321
make build                                # build dist/
make preview                              # build, then serve dist/
make clean                                # remove dist/, caches and the temporary clone
make deploy-check                         # validate both Cloudflare deployments (dry run)

# Refresh the snapshot (maintainers, needs access to synapse-app)
make sync SYNAPSE_DIR=../symfony-docker   # from a local checkout
make sync SYNAPSE_REF=feat/my-branch      # from another branch of the application
```

`make sync` defaults to the `develop` branch of the application. Syncing from another
ref is a local maintainer tool (for example to preview a branch): the CI only syncs
`develop`, so commit such a snapshot only on a work branch that targets `develop`.

The equivalent npm commands are `npm ci`, `npm run dev`, `npm run build`,
`npm run preview` and `npm run sync-content`.

## Repository layout

```text
.
├── .github/workflows/ci.yaml       Build, sync and deployment pipeline
├── integrations/                   Astro integrations (Markdown design, CSP-safe inline scripts)
├── public/                         Static files: scripts, headers (_headers), test-book screenshots (public/recette/shots)
├── scripts/                        sync-content.sh, archive-version.sh, deploy.sh
├── worker/                         Password gate of the acceptance-test pages
├── src/
│   ├── components/                 Header, sidebar, page title, footer, home, changelog, sheets, REC-01b
│   ├── content/docs/               Pages (French at the root, English under en/, archived versions)
│   ├── data/CHANGELOG.md           Synced from the application
│   ├── pages/                      Home, changelog, printable sheets, 404, REC-01b
│   └── styles/                     Theme and page styles
├── APP_VERSION                     Current application version (synced)
├── versions.json                   Archived documentation versions
└── wrangler.jsonc                  Cloudflare Workers configuration
```

## Versioned documentation

Older releases of the documentation stay online next to the current one with
[starlight-versions](https://github.com/HiDeoo/starlight-versions). The plugin is
enabled as soon as `versions.json` lists an archived version.

At release time, **before** syncing the content of the new version:

```bash
make archive VERSION=2.0   # copies the current pages to src/content/docs/2.0/ (and en/2.0/)
git add versions.json src/content/docs/2.0 src/content/docs/en/2.0 src/content/versions
git commit -m "docs: archive version 2.0"
```

Archived pages are served under `/2.0/…`, a version menu appears in the header, and
search is limited to the selected version. Archived folders are never touched by the
content sync; the audit and compliance pages are not versioned.

## Hosting and deployment

The site is a Cloudflare Worker that serves the files of `dist/` (`wrangler.jsonc`).
A small script (`worker/index.js`) runs only for the acceptance-test pages (see below).

| Environment | Command | Domain |
|-------------|---------|--------|
| production | `wrangler deploy --env=""` | docs.synapse-medical.fr |
| development | `wrangler deploy --env dev` | dev-docs.synapse-medical.fr |

Security headers (including the Content Security Policy) and caching rules are
defined in `public/_headers`. The CSP enforces `script-src 'self'`, so no inline
script is allowed: `integrations/externalize-inline-scripts.mjs` moves every inline
script of the generated HTML into a `/_astro/inline.<hash>.js` file.

### Acceptance-test pages

`/recette/*` and `/en/recette/*` (test books, kit and screenshots in
`public/recette/shots/`) ask for a password. The Worker script `worker/index.js` runs
first for those paths only, checks the HTTP Basic password (any user name) against the
secret `RECETTE_PASSWORD` and then serves the file. Without the secret the pages stay
closed (503). The pages remain in the menu but are excluded from search, the sitemap
and `robots.txt`.

```bash
# After the first deployment of each environment
npx wrangler secret put RECETTE_PASSWORD --env=""    # production
npx wrangler secret put RECETTE_PASSWORD --env dev   # development
```

Locally, put `RECETTE_PASSWORD=...` in `.dev.vars` (ignored by git) and run
`npx wrangler dev` after a build. Any new file that must be protected goes under
`public/recette/`.

### CI pipeline

`.github/workflows/ci.yaml` builds the site on every pull request and deploys as
follows:

| Trigger | Result |
|---------|--------|
| pull request | build only |
| push to `develop` | build, then deploy to dev-docs (environment `development`) |
| *Run workflow* on `develop` | same; with "Refresh the content", the sync runs first |
| push to `main` | build only, **no deployment** |
| *Run workflow* on `main` | build, then deploy to docs (environment `production`) |

Production is deployed manually only. The plan has no "required reviewers"
environment rule, so running the workflow by hand on `main` is the approval gate:
*Actions → CI → Run workflow → branch `main`*, or `gh workflow run ci.yaml --ref main`.

**Content sync.** When `docs/` changes on `develop` in the application repository,
its `.github/workflows/docs.yaml` runs
`gh workflow run ci.yaml -R stevenCayla/synapse-docs --ref develop -f sync=true`. The
run executes on `develop`, refreshes the snapshot, commits it, then builds and
deploys that commit to dev-docs. The `sync` input is refused on any other branch.
(A `repository_dispatch` is not used: GitHub always runs it on the default branch
`main`, which the `development` environment rejects.)

Manual deployment if needed (after `npx wrangler login`):

```bash
npm run deploy:dev
npm run deploy:prod
```

### GitHub configuration

| Type | Name | Value |
|------|------|-------|
| Secret | `SYNAPSE_REPO_SSH_KEY` | Private key of a read-only deploy key of synapse-app (content sync only) |
| Secret | `CLOUDFLARE_API_TOKEN` | Cloudflare API token ("Edit Cloudflare Workers" template) |
| Variable | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

Environments `development` (branch `develop` only) and `production` (branch `main`
only) are set under *Settings → Environments*. In the application repository, the
secret `DOCS_DISPATCH_TOKEN` is a fine-grained token on this repository with
*Actions: Read and write* (required to run the workflow with `gh workflow run`).

## Branches and releases

- Work branches always start from `develop` (`feat/…`, `fix/…`, `docs/…`, `ci/…`,
  `chore/…`) and their pull request targets `develop`. Never commit to `main`, and no
  hotfix starts from `main`.
- `develop` is deployed automatically to dev-docs. Force-push and deletion are
  blocked; direct commits stay possible because the content sync commits to it.
- `main` is protected: changes go through a pull request whose `build` check passes;
  force-push and deletion are blocked.
- Promotion to `main` happens only on explicit request, through a
  `release/<YYYY-MM-DD>` branch created from `origin/develop` and a pull request
  `release/…` → `main`. Never open a pull request whose head is `develop`: with
  auto-delete of merged branches, merging it would delete `develop`.
- A push to `main` only builds. Production is deployed manually: *Actions → CI → Run
  workflow → branch `main`*, or `gh workflow run ci.yaml --ref main`.
- Merged branches are deleted automatically.
- `Closes #x` in a pull request only closes the issue when the merge goes into the
  default branch `main`. Pull requests into `develop` do not close it: close the issue
  by hand, or reference it again in the release pull request.

## Security

- Secret scanning with push protection, Dependabot alerts and security updates are
  enabled; Dependabot also opens weekly version updates on `develop`.
- The site is served with HSTS, a strict Content Security Policy, `nosniff`, frame and
  referrer policies (`public/_headers`).
- Workflows run with read-only permissions by default.

To report a vulnerability, see [SECURITY.md](SECURITY.md).

## License

Released under the [MIT License](LICENSE).

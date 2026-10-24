# Synapse Medical — documentation website (Astro + Starlight)

Source of [docs.synapse-medical.fr](https://docs.synapse-medical.fr), the
documentation of [Synapse Medical](https://github.com/stevenCayla/SYNAPSE-MEDICAL).
This repository builds on its own: clone it, install the dependencies and
build, no access to the application repository is needed.

| Branch | Published at |
|--------|--------------|
| `develop` | https://dev-docs.synapse-medical.fr (not indexed), deployed automatically |
| `main` | https://docs.synapse-medical.fr, deployed manually only |

See [Branches & releases](#branches--releases).

## Where to edit the pages

| Pages | Edit them in |
|-------|--------------|
| `src/content/docs/audit/` (Audit & compliance) | this repository |
| `src/content/docs/guides/`, `resources/`, `recette/` and their `en/` counterparts (user guides, glossary, compliance FAQ, acceptance tests) | this repository **for now**: they describe the application and belong in the `docs/` folder of SYNAPSE-MEDICAL, where they should move (then drop them from the exclusions of `scripts/sync-content.sh`) |
| `src/data/CHANGELOG.md`, `APP_VERSION` | nowhere: copied from `CHANGELOG.md` and `.env` of the application by the sync, never edited by hand |
| everything else in `src/content/docs/` | the `docs/` folder of [SYNAPSE-MEDICAL](https://github.com/stevenCayla/SYNAPSE-MEDICAL), so the documentation evolves with the code |

The application's pages get the design of the mockup without any change to their Markdown: `integrations/markdown-mockup.mjs` turns the quotes into asides and the prerequisites table into cards, and the code blocks, lists and tables are styled in `src/styles/page.css`.

The home pages (`src/pages/index.astro`, `src/components/home/`) and the
changelog timeline (`src/components/changelog/`, built from
`src/data/CHANGELOG.md`) are part of the site itself and live here.

`src/content/docs/` (except `audit/`, `guides/`, `resources/` and `recette/`, French and English) is a snapshot of the application's
`docs/` folder, refreshed by `scripts/sync-content.sh`: the CI runs it
automatically when `docs/` changes on `develop` in SYNAPSE-MEDICAL (the sync
only runs on `develop`),
checks that the site still builds and commits the new snapshot. Changes made
directly to the synced pages here are overwritten by the next sync. The
`APP_VERSION` file (shown in the version selector) is synced the same way.

## Page front matter

Besides the usual Starlight fields, the pages can set (all optional):

| Field | Effect |
|-------|--------|
| `time` | reading time shown in the page header (otherwise estimated from the length) |
| `introduced` | version of the application that brings the feature; an "upcoming feature" notice is shown while the current version is older |
| `wip` | `true` flags a page whose content is being written (badge in the sidebar, notice in the page header); the pages of the application that are almost empty are flagged automatically |
| `reviewed` | last version of the application the page was reviewed for (the current version when missing); "not reviewed for N versions" beyond one |

## Local development

Requires Node.js 24 (latest LTS, see `.nvmrc`; `nvm use` selects it).

Run `make` to list the available commands:

```bash
make install                             # install the npm dependencies
make dev                                 # dev server on http://localhost:4321
make build                               # build dist/
make preview                             # build, then serve dist/
make clean                               # remove dist/, caches and the temporary clone
make deploy-check                        # validate both Cloudflare deployments (dry run)

# Refresh the snapshot (maintainers, needs access to SYNAPSE-MEDICAL)
make sync SYNAPSE_DIR=../symfony-docker  # from a local checkout
make sync SYNAPSE_REF=feat/my-branch    # from another branch of the application
```

`make sync` defaults to the `develop` branch of the application. Syncing from
another ref is a local maintainer tool (for example to preview a branch): the
CI only syncs on `develop`, so commit such a snapshot only on a work branch
that targets `develop`.

The equivalent npm commands are `npm ci`, `npm run dev`, `npm run build`,
`npm run preview` and `npm run sync-content`.

## Versioned documentation

Older releases of the documentation can stay online next to the current one
with [starlight-versions](https://github.com/HiDeoo/starlight-versions). The
plugin is enabled as soon as `versions.json` lists an archived version (it is
empty until the next release).

At release time, **before** syncing the content of the new version:

```bash
make archive VERSION=2.0   # copies the current pages to src/content/docs/2.0/ (and en/2.0/)
git add versions.json src/content/docs/2.0 src/content/docs/en/2.0 src/content/versions
git commit -m "docs: archive version 2.0"
```

Archived pages are served under `/2.0/…`, a version picker appears in the
header, and search is limited to the selected version. Archived folders are
never touched by the content sync; the Audit & compliance pages are not
versioned (they always show their latest content).

## Hosting: Cloudflare Workers

The site is a Worker with no server-side code that serves the files of `dist/`
(`wrangler.jsonc`):

| Environment | Command | Domain |
|-------------|---------|--------|
| production | `wrangler deploy --env=""` | docs.synapse-medical.fr |
| dev | `wrangler deploy --env dev` | dev-docs.synapse-medical.fr |

Security headers (including the CSP) and caching rules are defined in
`public/_headers`. The CSP enforces `script-src 'self'`, so no inline script is
allowed: the `integrations/externalize-inline-scripts.mjs` integration moves
every inline script of the generated HTML into a `/_astro/inline.<hash>.js`
file.

### CI / deployment

The CI (`.github/workflows/ci.yaml`) builds the site on every pull request and
deploys as follows:

| Trigger | Result |
|---------|--------|
| pull request | build only |
| push to `develop` | build, then deploy to dev-docs (environment `development`) |
| *Run workflow* on `develop` | same; with "Refresh the content", the sync runs first |
| push to `main` | build only, **no deployment** |
| *Run workflow* on `main` | build, then deploy to docs (environment `production`) |

Production is deployed manually only. The plan has no "required reviewers"
environment rule, so running the workflow by hand on `main` is the approval
gate: *Actions → CI → Run workflow → branch `main`*, or
`gh workflow run ci.yaml --ref main`.

Content sync: when `docs/` changes on `develop` in the application repository,
its `.github/workflows/docs.yaml` runs
`gh workflow run ci.yaml -R stevenCayla/synapse-docs --ref develop -f sync=true`.
The run executes on `develop`, refreshes the snapshot, commits it, then builds
and deploys that commit to dev-docs. The `sync` input is refused on any other
branch. (A `repository_dispatch` is not used: GitHub always runs it on the
default branch `main`, which the `development` environment rejects.)

Manual deployment if needed (after `npx wrangler login`):

```bash
npm run deploy:dev
npm run deploy:prod
```

### GitHub configuration

In this repository:

| Type | Name | Value |
|------|------|-------|
| Secret | `SYNAPSE_REPO_SSH_KEY` | Private key of a read-only deploy key of SYNAPSE-MEDICAL (content sync only) |
| Secret | `CLOUDFLARE_API_TOKEN` | Cloudflare API token ("Edit Cloudflare Workers" template) |
| Variable | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

Environments `development` (branch `develop` only) and `production` (branch
`main` only), under *Settings → Environments*.

In the application repository: secret `DOCS_DISPATCH_TOKEN`, a fine-grained
token on this repository with *Actions: Read and write* (required to run the
workflow with `gh workflow run`).

## Branches & releases

- Work branches always start from `develop` (`feat/…`, `fix/…`, `docs/…`,
  `ci/…`, `chore/…`) and their pull request targets `develop`. Never commit to
  `main`, and no hotfix starts from `main`.
- `develop` is deployed automatically to dev-docs.
- Promotion to `main` happens only on explicit request, through a
  `release/<YYYY-MM-DD>` branch created from `origin/develop` and a pull request
  `release/…` → `main`. Never open a pull request whose head is `develop`: with
  auto-delete of merged branches, merging it would delete `develop`.
- A push to `main` only builds. Production is deployed manually: *Actions → CI →
  Run workflow → branch `main`*, or `gh workflow run ci.yaml --ref main`.
- `Closes #x` in a pull request only closes the issue when the merge goes into
  the default branch `main`. Pull requests into `develop` do not close it:
  close the issue by hand, or reference it again in the release pull request.

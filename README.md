# Synapse Medical — documentation website (Astro + Starlight)

Source of [docs.synapse-medical.fr](https://docs.synapse-medical.fr), the
documentation of [Synapse Medical](https://github.com/stevenCayla/SYNAPSE-MEDICAL).
This repository builds on its own: clone it, install the dependencies and
build, no access to the application repository is needed.

| Branch | Published at |
|--------|--------------|
| `develop` | https://dev-docs.synapse-medical.fr (not indexed) |
| `main` | https://docs.synapse-medical.fr |

## Where to edit the pages

| Pages | Edit them in |
|-------|--------------|
| `src/content/docs/audit/` (Audit & compliance) | this repository |
| everything else in `src/content/docs/` | the `docs/` folder of [SYNAPSE-MEDICAL](https://github.com/stevenCayla/SYNAPSE-MEDICAL), so the documentation evolves with the code |

`src/content/docs/` (except `audit/`) is a snapshot of the application's
`docs/` folder, refreshed by `scripts/sync-content.sh`: the CI runs it
automatically when `docs/` changes on `develop` or `main` in SYNAPSE-MEDICAL,
checks that the site still builds and commits the new snapshot. Changes made
directly to the synced pages here are overwritten by the next sync. The
`APP_VERSION` file (shown in the version selector) is synced the same way.

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
make sync SYNAPSE_REF=main               # from a branch of the application
```

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
deploys automatically:

- push to `develop` → GitHub environment `development` → dev-docs;
- push to `main` → GitHub environment `production` → docs;
- a change to `docs/` on `develop` or `main` in the application repository →
  content sync of the matching branch, then build and deployment
  (`repository_dispatch`, sent by the application's
  `.github/workflows/docs.yaml`). A sync can also be started manually:
  *Actions → CI → Run workflow* with "Refresh the content".

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
token on this repository with *Contents: Read and write* (required by
`repository_dispatch`).

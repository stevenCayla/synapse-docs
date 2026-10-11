# Synapse Medical — documentation website (Astro + Starlight)

This repository only contains the documentation **website**. The **content**
(the Markdown pages) lives in the `docs/` folder of the
[SYNAPSE-MEDICAL](https://github.com/stevenCayla/SYNAPSE-MEDICAL) application
repository (French at the root, English under `en/`), so the documentation
evolves together with the code.

| Branch | Content used | Published at |
|--------|--------------|--------------|
| `develop` | `docs/` from `develop` | https://dev-docs.synapse-medical.fr (not indexed) |
| `main` | `docs/` from `main` | https://docs.synapse-medical.fr |

## Local development

Run `make` to list the available commands:

```bash
make install                              # install the npm dependencies
make dev SYNAPSE_DIR=../symfony-docker    # dev server on a local checkout of the application
make build                                # build dist/ (docs/ cloned from develop)
make build SYNAPSE_REF=main               # build with the content of main
make preview                              # build, then serve dist/
make clean                                # remove dist/, caches and the cloned content
make deploy-check                         # validate both Cloudflare deployments (dry run)
```

The equivalent npm commands:

```bash
npm install

# Live editing: point to a local checkout of the application
SYNAPSE_DIR=../symfony-docker npm run dev

# Without a local checkout: docs/ from develop is cloned into .synapse/
npm run dev
SYNAPSE_REF=main npm run dev   # content from main
```

`scripts/sync-content.sh` (run automatically before `dev` and `build`) links
`src/content/docs` to the selected `docs/` folder. The version shown in the
version selector is read from `APP_VERSION` in the application's `.env`.

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
  rebuild of the matching branch (`repository_dispatch`, sent by the
  application's `.github/workflows/docs.yaml`).

Manual deployment if needed (after `npx wrangler login`):

```bash
npm run deploy:dev
npm run deploy:prod
```

### GitHub configuration

In this repository:

| Type | Name | Value |
|------|------|-------|
| Secret | `SYNAPSE_REPO_SSH_KEY` | Private key of a read-only deploy key of SYNAPSE-MEDICAL |
| Secret | `CLOUDFLARE_API_TOKEN` | Cloudflare API token ("Edit Cloudflare Workers" template) |
| Variable | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

Environments `development` (branch `develop` only) and `production` (branch
`main` only), under *Settings → Environments*.

In the application repository: secret `DOCS_DISPATCH_TOKEN`, a fine-grained
token on this repository with *Contents: Read and write* (required by
`repository_dispatch`).

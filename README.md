# Synapse Medical — site de documentation (Astro + Starlight)

Ce dépôt contient uniquement le **site** de documentation. Le **contenu** (les
pages Markdown) vit dans le dossier `docs/` du dépôt de l'application
[SYNAPSE-MEDICAL](https://github.com/stevenCayla/SYNAPSE-MEDICAL) (français à
la racine, anglais sous `en/`), afin que la documentation évolue avec le code.

| Branche | Contenu utilisé | Publication |
|---------|-----------------|-------------|
| `develop` | `docs/` de `develop` | https://dev-docs.synapse-medical.fr (non indexée) |
| `main` | `docs/` de `main` | https://docs.synapse-medical.fr |

## Développement local

```bash
npm install

# Édition en direct : pointer vers un checkout local de l'application
SYNAPSE_DIR=../symfony-docker npm run dev

# Sans checkout local : docs/ de develop est cloné dans .synapse/
npm run dev
SYNAPSE_REF=main npm run dev   # contenu de main
```

`scripts/sync-content.sh` (lancé automatiquement avant `dev` et `build`) relie
`src/content/docs` au dossier `docs/` choisi. La version affichée dans le
sélecteur est lue dans `APP_VERSION` du `.env` de l'application.

> Le dossier `check/` est une zone de triage hors site (non construite par Astro).

## Hébergement : Cloudflare Workers

Le site est un Worker sans code serveur qui sert les fichiers de `dist/`
(`wrangler.jsonc`) :

| Environnement | Commande | Domaine |
|---------------|----------|---------|
| production | `wrangler deploy --env=""` | docs.synapse-medical.fr |
| dev | `wrangler deploy --env dev` | dev-docs.synapse-medical.fr |

Les en-têtes de sécurité (CSP comprise) et le cache sont définis dans
`public/_headers`. La CSP impose `script-src 'self'` : aucun script inline
n'est permis. L'intégration `integrations/externalize-inline-scripts.mjs` sort
donc chaque script inline du HTML généré dans un fichier
`/_astro/inline.<hash>.js`.

### CI / déploiement

La CI (`.github/workflows/ci.yaml`) construit le site à chaque PR et déploie
automatiquement :

- push sur `develop` → environnement GitHub `development` → dev-docs ;
- push sur `main` → environnement GitHub `production` → docs ;
- modification de `docs/` sur `develop` ou `main` dans le dépôt de
  l'application → reconstruction de la branche correspondante
  (`repository_dispatch`, envoyé par `.github/workflows/docs.yaml` de
  l'application).

Déploiement manuel si besoin (après `npx wrangler login`) :

```bash
npm run deploy:dev
npm run deploy:prod
```

### Configuration GitHub

Dans ce dépôt :

| Type | Nom | Valeur |
|------|-----|--------|
| Secret | `SYNAPSE_REPO_SSH_KEY` | Clé privée d'une clé de déploiement en lecture seule de SYNAPSE-MEDICAL |
| Secret | `CLOUDFLARE_API_TOKEN` | Jeton API Cloudflare (modèle « Edit Cloudflare Workers ») |
| Variable | `CLOUDFLARE_ACCOUNT_ID` | Identifiant du compte Cloudflare |

Environnements `development` (branche `develop` uniquement) et `production`
(branche `main` uniquement), dans *Settings → Environments*.

Dans le dépôt de l'application : secret `DOCS_DISPATCH_TOKEN`, jeton
fine-grained sur ce dépôt avec *Contents: Read and write* (requis pour
`repository_dispatch`).

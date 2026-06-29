# Synapse Medical — site de documentation (Astro + Starlight)

Le contenu vit dans `../docs/` (disposition root-FR : français à la racine, anglais sous `en/`).
`src/content/docs` est un lien symbolique vers `../../../docs`.

```bash
npm install
npm run dev      # serveur local
npm run build    # build statique dans dist/
npm run preview  # prévisualiser le build
```

> Les dossiers `check/` et `client/` sont des zones de triage hors site (non construites par Astro).

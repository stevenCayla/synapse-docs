---
title: Aide contextuelle
description: Relier chaque écran de Synapse à la bonne page de documentation, via le bouton « ? ».
---

Relier chaque écran de Synapse à la bonne page de documentation, via le bouton « ? ». Cette page s'adresse aux développeurs de l'application.

## Format des liens

Chaque guide accepte deux paramètres :

- `step` : index de l'étape, à partir de 0. La page défile jusqu'à l'étape et la met en évidence. Les étapes sont les titres numérotés du guide.
- `from=app` : affiche un bandeau « Ouvert depuis Synapse » avec un lien vers le guide complet.

```twig
{# templates/_help_button.html.twig #}
<a href="{{ docs_url }}/guides/importer/?from=app"
   target="synapse-docs" data-controller="help"
   aria-label="Aide sur cet écran">?</a>
```

## Table des liens

| Écran | Lien |
|-------|------|
| Assistant · Type d'étude | [`/guides/creer-etude/?step=0&from=app`](/guides/creer-etude/?step=0&from=app) |
| Assistant · Informations | [`/guides/creer-etude/?step=1&from=app`](/guides/creer-etude/?step=1&from=app) |
| Assistant · Cadre réglementaire | [`/guides/creer-etude/?step=2&from=app`](/guides/creer-etude/?step=2&from=app) |
| Assistant · Design | [`/guides/design-population-sites/?step=0&from=app`](/guides/design-population-sites/?step=0&from=app) |
| Assistant · Sites | [`/guides/design-population-sites/?step=2&from=app`](/guides/design-population-sites/?step=2&from=app) |
| Assistant · Réglementaire | [`/guides/reglementaire-ecrf-equipe/?step=0&from=app`](/guides/reglementaire-ecrf-equipe/?step=0&from=app) |
| Assistant · Calendrier | [`/guides/reglementaire-ecrf-equipe/?step=2&from=app`](/guides/reglementaire-ecrf-equipe/?step=2&from=app) |
| Assistant · Import | [`/guides/importer/?from=app`](/guides/importer/?from=app) |
| Patients · Inclure | [`/guides/saisir-ecrf/?step=0&from=app`](/guides/saisir-ecrf/?step=0&from=app) |
| Formulaire eCRF | [`/guides/saisir-ecrf/?step=2&from=app`](/guides/saisir-ecrf/?step=2&from=app) |
| Requête | [`/guides/requetes-monitoring/?step=1&from=app`](/guides/requetes-monitoring/?step=1&from=app) |
| Randomisation | [`/guides/randomisation/?step=1&from=app`](/guides/randomisation/?step=1&from=app) |
| Clôture | [`/guides/gel-verrouillage/?step=1&from=app`](/guides/gel-verrouillage/?step=1&from=app) |
| Exports | [`/guides/exports/?from=app`](/guides/exports/?from=app) |

:::tip[Essayer]
Cliquez un lien du tableau : la page s'ouvre comme depuis Synapse.
:::

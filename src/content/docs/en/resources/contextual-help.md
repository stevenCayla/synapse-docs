---
title: Contextual help
description: Link each Synapse screen to the right documentation page, via the "?" button.
---

Link each Synapse screen to the right documentation page, via the "?" button. This page is intended for the application's developers.

## Link format

Each guide accepts two parameters:

- `step`: index of the step, starting at 0. The page scrolls to the step and highlights it. The steps are the numbered headings of the guide.
- `from=app`: displays an "Opened from Synapse" banner with a link to the full guide.

```twig
{# templates/_help_button.html.twig #}
<a href="{{ docs_url }}/guides/importer/?from=app"
   target="synapse-docs" data-controller="help"
   aria-label="Help on this screen">?</a>
```

## Link table

| Screen | Link |
|--------|------|
| Wizard · Study type | [`/en/guides/creer-etude/?step=0&from=app`](/en/guides/creer-etude/?step=0&from=app) |
| Wizard · Information | [`/en/guides/creer-etude/?step=1&from=app`](/en/guides/creer-etude/?step=1&from=app) |
| Wizard · Regulatory framework | [`/en/guides/creer-etude/?step=2&from=app`](/en/guides/creer-etude/?step=2&from=app) |
| Wizard · Design | [`/en/guides/design-population-sites/?step=0&from=app`](/en/guides/design-population-sites/?step=0&from=app) |
| Wizard · Sites | [`/en/guides/design-population-sites/?step=2&from=app`](/en/guides/design-population-sites/?step=2&from=app) |
| Wizard · Regulatory | [`/en/guides/reglementaire-ecrf-equipe/?step=0&from=app`](/en/guides/reglementaire-ecrf-equipe/?step=0&from=app) |
| Wizard · Schedule | [`/en/guides/reglementaire-ecrf-equipe/?step=2&from=app`](/en/guides/reglementaire-ecrf-equipe/?step=2&from=app) |
| Wizard · Import | [`/en/guides/importer/?from=app`](/en/guides/importer/?from=app) |
| Patients · Enroll | [`/en/guides/saisir-ecrf/?step=0&from=app`](/en/guides/saisir-ecrf/?step=0&from=app) |
| eCRF form | [`/en/guides/saisir-ecrf/?step=2&from=app`](/en/guides/saisir-ecrf/?step=2&from=app) |
| Query | [`/en/guides/requetes-monitoring/?step=1&from=app`](/en/guides/requetes-monitoring/?step=1&from=app) |
| Randomization | [`/en/guides/randomisation/?step=1&from=app`](/en/guides/randomisation/?step=1&from=app) |
| Closure | [`/en/guides/gel-verrouillage/?step=1&from=app`](/en/guides/gel-verrouillage/?step=1&from=app) |
| Exports | [`/en/guides/exports/?from=app`](/en/guides/exports/?from=app) |

:::tip[Try it]
Click a link in the table: the page opens as it would from Synapse.
:::

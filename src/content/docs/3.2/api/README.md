---
title: Référence de l'API
description: "Documentation de l'API : vue d'ensemble des endpoints, accès à
  Swagger UI, organisation des zones (interne / publique) et conventions OpenAPI
  (nelmio) pour documenter un endpoint."
slug: 3.2/api/readme
---

L'API expose des endpoints **internes** (AJAX, session + CSRF) documentés via OpenAPI
(nelmio). Cette page donne la [vue d'ensemble des endpoints](#endpoints-documentés), les
accès [Swagger UI](#accès-à-swagger-ui), l'[organisation des zones](#architecture-des-zones)
et les [conventions pour documenter un endpoint](#documenter-un-endpoint-existant).

## Endpoints documentés

| Endpoint | Méthode | Domaine | Auth | Description |
|---|---|---|---|---|
| `/api/feedback` | `POST` | Feedback | `SessionAuth` | Soumettre un feedback utilisateur |
| `/api/death-checker/{id}/search` | `POST` | Death Checker | `SessionAuth` | Recherche de correspondances de décès via MatchID |
| `/api/death-checker/{id}/confirm` | `POST` | Death Checker | `SessionAuth` | Confirmer la correspondance de décès d'un candidat |
| `…/ecrf/{formId}/autosave` | `POST` | eCRF Records | `SessionAuth` | Sauvegarde automatique d'un champ eCRF (AJAX) |

:::note
Liste générée à partir des attributs `#[OA\*]` présents dans `src/Controller`. La source de
vérité reste Swagger UI — voir ci-dessous. Pour ajouter un endpoint à ce tableau, le taguer
avec les attributs OpenAPI (section [Documenter un endpoint](#documenter-un-endpoint-existant)).
:::

## Accès à Swagger UI

| Environnement | URL | Zone |
|---------------|-----|------|
| Développement | http://localhost/api/doc | API interne (tous les `/api/*`) |
| Développement | http://localhost/api/v1/doc | Future API publique (vide pour l'instant) |
| Spec JSON brute | http://localhost/api/doc.json | Machine-readable |

:::caution[Production]
`/api/doc` n'est pas protégé par un rôle. Ajouter dans `security.yaml` :

```yaml
access_control:
    - { path: ^/api/doc, roles: ROLE_ADMIN }
```
:::

## Architecture des zones

```
config/packages/nelmio_api_doc.yaml
├── areas.default  → /api/* (hors /api/v{n}/)   → Swagger UI : /api/doc
└── areas.public   → /api/v1/, /api/v2/…        → Swagger UI : /api/v1/doc
```

* **Zone `default`** : endpoints AJAX internes (session cookie + CSRF).
* **Zone `public`** : réservée à la future API versionnée (JWT Bearer).
  Les routes `/api/v1/` seront ajoutées dans de futurs contrôleurs dédiés.

## Documenter un endpoint existant

### 1. Taguer le contrôleur

```php
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Mon Domaine', description: 'Description du groupe')]
#[Route('/api/mon-prefixe')]
class MonController extends AbstractController
```

### 2. Documenter une action

```php
#[OA\Post(
    path: '/api/mon-prefixe',
    operationId: 'monEndpointCreate',    // unique dans toute l'API
    summary: 'Résumé en une ligne',
    description: 'Description longue avec **markdown**.',
    tags: ['Mon Domaine'],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['name'],
            properties: [
                new OA\Property(property: 'name', type: 'string', example: 'test'),
            ],
        ),
    ),
    responses: [
        new OA\Response(response: 200, description: 'OK', content: new OA\JsonContent(
            properties: [new OA\Property(property: 'id', type: 'integer')],
        )),
        new OA\Response(response: 422, description: 'Invalide', content: new OA\JsonContent(
            ref: '#/components/schemas/ApiError',
        )),
    ],
    security: [['SessionAuth' => []]],
)]
#[Route('', name: 'app_mon_endpoint_create', methods: ['POST'])]
public function create(Request $request): JsonResponse
```

### 3. Schémas réutilisables

Les schémas partagés sont définis dans :

```
config/packages/nelmio_api_doc.yaml → documentation.components.schemas
```

Schémas disponibles : `ApiError`, `MatchIdPerson`, `PatientDeath`,
`EcrfAutosaveRequest`, `EcrfAutosaveResponse`, `FeedbackRequest`, `FeedbackResponse`.

Référencer un schéma existant :

```php
new OA\Response(response: 404, content: new OA\JsonContent(ref: '#/components/schemas/ApiError'))
```

Pour ajouter un schéma réutilisable, l'ajouter dans le fichier YAML sous `components.schemas`.

## Commandes utiles

| Commande | Description |
|---|---|
| `make openapi` | Exporter la spec de la zone `default` dans `openapi/openapi.json` |
| `make sf c="nelmio:apidoc:dump --format=json"` | Générer la spec JSON (validation) |
| `make sf c="nelmio:apidoc:dump --format=yaml"` | Générer la spec YAML |
| `make sf c="debug:router --show-aliases"` | Voir toutes les routes enregistrées |

### Schéma exporté (privé)

`openapi/openapi.json` (à la racine du dépôt) est la spec de la zone `default` (API
interne). Elle reste dans le dépôt privé et n'est jamais publiée sur le site de
documentation public, car `docs/` est synchronisé vers un dépôt public.

* Après toute modification d'un endpoint documenté (attributs `#[OA\*]` ou
  `nelmio_api_doc.yaml`), lancer `make openapi` et commiter le fichier.
* Le job **Tests** de la CI régénère la spec et échoue si elle diffère du fichier commité.
* Seule la zone `public`, quand elle aura des endpoints, pourra être publiée plus tard (décision séparée).

## Sécurité documentée

| Scheme | Type | Usage |
|--------|------|-------|
| `SessionAuth` | apiKey (cookie `PHPSESSID`) | Tous les endpoints actuels |
| `CsrfToken` | apiKey (header `X-CSRF-Token`) | Mutations sensibles (documenté en body `_token`) |
| `BearerAuth` | HTTP Bearer JWT | **Futur** — API publique `/api/v1/` |

La sécurité par défaut (`SessionAuth`) est appliquée à tous les endpoints.
Pour les endpoints qui acceptent le token CSRF en body, documenter le champ `_token` dans le `requestBody`.

## Futur : API publique (`/api/v1/`)

Pour exposer un endpoint en externe :

1. Créer le contrôleur sous `src/Controller/Api/V1/`
2. Préfixer la route avec `/api/v1/`
3. Utiliser `security: [['BearerAuth' => []]]` dans l'attribut `#[OA\...]`
4. L'endpoint apparaîtra automatiquement dans `/api/v1/doc`

La séparation est garantie par les `path_patterns` dans `nelmio_api_doc.yaml` :

* `^/api(?!/v\d)` → zone `default` (interne)
* `^/api/v\d+/` → zone `public` (externe)

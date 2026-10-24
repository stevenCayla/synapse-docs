---
title: "API reference"
description: "API documentation: endpoints overview, Swagger UI access, zone organization (internal / public) and OpenAPI (nelmio) conventions to document an endpoint."
---

The API exposes **internal** endpoints (AJAX, session + CSRF) documented via OpenAPI
(nelmio). This page gives the [endpoints overview](#documented-endpoints), the
[Swagger UI](#swagger-ui-access) access, the [zone organization](#zone-architecture) and the
[conventions to document an endpoint](#documenting-an-existing-endpoint).

## Documented endpoints

| Endpoint | Method | Domain | Auth | Description |
|---|---|---|---|---|
| `/api/feedback` | `POST` | Feedback | `SessionAuth` | Submit a user feedback |
| `/api/death-checker/{id}/search` | `POST` | Death Checker | `SessionAuth` | Search for death matches via MatchID |
| `/api/death-checker/{id}/confirm` | `POST` | Death Checker | `SessionAuth` | Confirm the death match of a candidate |
| `…/ecrf/{formId}/autosave` | `POST` | eCRF Records | `SessionAuth` | Autosave of an eCRF field (AJAX) |

:::note
This list is generated from the `#[OA\*]` attributes present in `src/Controller`. The
source of truth remains Swagger UI — see below. To add an endpoint to this table, tag it
with the OpenAPI attributes (section [Documenting an endpoint](#documenting-an-existing-endpoint)).
:::

## Swagger UI access

| Environment | URL | Zone |
|-------------|-----|------|
| Development | http://localhost/api/doc | Internal API (all `/api/*`) |
| Development | http://localhost/api/v1/doc | Future public API (empty for now) |
| Raw JSON spec | http://localhost/api/doc.json | Machine-readable |

:::caution[Production]
`/api/doc` is not protected by a role. Add to `security.yaml`:

```yaml
access_control:
    - { path: ^/api/doc, roles: ROLE_ADMIN }
```
:::

## Zone architecture

```
config/packages/nelmio_api_doc.yaml
├── areas.default  → /api/* (except /api/v{n}/)  → Swagger UI: /api/doc
└── areas.public   → /api/v1/, /api/v2/…          → Swagger UI: /api/v1/doc
```

- **`default` zone**: internal AJAX endpoints (session cookie + CSRF).
- **`public` zone**: reserved for the future versioned API (JWT Bearer).
  The `/api/v1/` routes will be added in future dedicated controllers.

## Documenting an existing endpoint

### 1. Tag the controller

```php
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'My Domain', description: 'Description of the group')]
#[Route('/api/my-prefix')]
class MyController extends AbstractController
```

### 2. Document an action

```php
#[OA\Post(
    path: '/api/my-prefix',
    operationId: 'myEndpointCreate',    // unique across the whole API
    summary: 'One-line summary',
    description: 'Long description with **markdown**.',
    tags: ['My Domain'],
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
        new OA\Response(response: 422, description: 'Invalid', content: new OA\JsonContent(
            ref: '#/components/schemas/ApiError',
        )),
    ],
    security: [['SessionAuth' => []]],
)]
#[Route('', name: 'app_my_endpoint_create', methods: ['POST'])]
public function create(Request $request): JsonResponse
```

### 3. Reusable schemas

Shared schemas are defined in:
```
config/packages/nelmio_api_doc.yaml → documentation.components.schemas
```

Available schemas: `ApiError`, `MatchIdPerson`, `PatientDeath`,
`EcrfAutosaveRequest`, `EcrfAutosaveResponse`, `FeedbackRequest`, `FeedbackResponse`.

Reference an existing schema:
```php
new OA\Response(response: 404, content: new OA\JsonContent(ref: '#/components/schemas/ApiError'))
```

To add a reusable schema, add it to the YAML file under `components.schemas`.

## Useful commands

| Command | Description |
|---|---|
| `make openapi` | Export the spec of the `default` area to `openapi/openapi.json` |
| `make sf c="nelmio:apidoc:dump --format=json"` | Generate the JSON spec (validation) |
| `make sf c="nelmio:apidoc:dump --format=yaml"` | Generate the YAML spec |
| `make sf c="debug:router --show-aliases"` | List all registered routes |

### Exported schema (private)

`openapi/openapi.json` (at the repository root) is the spec of the `default` area (internal
API). It stays in the private repository and is never published on the public
documentation site, because `docs/` is synced to a public repository.

- After changing a documented endpoint (`#[OA\*]` attributes or `nelmio_api_doc.yaml`),
  run `make openapi` and commit the file.
- The CI **Tests** job regenerates the spec and fails when it differs from the committed file.
- Only the `public` area, once it has endpoints, may be published later (separate decision).

## Documented security

| Scheme | Type | Usage |
|--------|------|-------|
| `SessionAuth` | apiKey (cookie `PHPSESSID`) | All current endpoints |
| `CsrfToken` | apiKey (header `X-CSRF-Token`) | Sensitive mutations (documented as `_token` in the body) |
| `BearerAuth` | HTTP Bearer JWT | **Future** — public API `/api/v1/` |

The default security (`SessionAuth`) is applied to all endpoints.
For endpoints that accept the CSRF token in the body, document the `_token` field in the `requestBody`.

## Future: public API (`/api/v1/`)

To expose an endpoint externally:

1. Create the controller under `src/Controller/Api/V1/`
2. Prefix the route with `/api/v1/`
3. Use `security: [['BearerAuth' => []]]` in the `#[OA\...]` attribute
4. The endpoint will automatically appear in `/api/v1/doc`

The separation is guaranteed by the `path_patterns` in `nelmio_api_doc.yaml`:
- `^/api(?!/v\d)` → `default` zone (internal)
- `^/api/v\d+/` → `public` zone (external)

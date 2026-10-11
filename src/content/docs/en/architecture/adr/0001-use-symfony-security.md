---
title: "0001 - Use the Symfony Security component"
description: "Decision to build authentication and authorization on the Symfony Security component (firewall, custom authenticator, voters)."
---

## Status
Accepted

## Context
The application manages authenticated access to sensitive clinical data, with
fine-grained, per-resource authorization (studies, patients, eCRF records) and
strict workspace isolation. We needed an authentication and authorization
foundation that is mature, auditable, well-documented, and compatible with the
FrankenPHP worker runtime.

Building a custom auth layer would increase risk (security bugs, maintenance
burden) and would not be acceptable in a regulated context (HDS, CNIL, ANSSI,
21 CFR Part 11).

## Decision
Use the **Symfony Security component** as the single foundation for:

- **Authentication** — a custom `UserAuthenticator` (form login by username or
  email, CSRF token, remember-me), with `UserChecker` blocking disabled and
  soft-deleted accounts.
- **Authorization** — the **Voter** pattern for every business resource
  (`StudyVoter`, `WorkspaceVoter`, `PatientVoter`, `EcrfRecordVoter`, …),
  resolving roles through `RoleHierarchyInterface` rather than raw `getRoles()`.
- **Firewall & access control** — a single `main` firewall plus
  `access_control` rules in `config/packages/security.yaml`.
- **Password hashing** — the `auto` algorithm.

Custom security concerns that the component does not cover (2FA enforcement,
workspace isolation, audit chaining) are layered on top via event subscribers
and services — see [ADR 0003](/en/architecture/adr/0003-security-foundations/).

## Consequences
- Battle-tested authentication/authorization, fewer bespoke security bugs.
- Voters give a consistent, testable place to enforce workspace isolation.
- Team must follow Symfony Security upgrade notes on major version bumps.
- Worker-mode caveat: request-scoped access services implement `ResetInterface`
  to avoid state leaking between requests.

## References
- `src/Security/` (authenticator, voters, checkers)
- `config/packages/security.yaml`
- [Security overview](/en/security/readme/) · [Permissions](/security/permissions/)

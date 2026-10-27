---
title: 0002 - Session timeout enforced server-side
description: Decision to enforce the session inactivity timeout server-side
  rather than relying on frontend timers.
slug: en/3.2/architecture/adr/0002-session-timeout-server-side
---

## Status

Accepted

## Context

The application handles sensitive data. Session expiration must not rely only on frontend timers.

## Decision

Session inactivity timeout is enforced server-side through Symfony request lifecycle controls.

## Consequences

* Better security
* More robust against bypass
* Slightly more implementation complexity

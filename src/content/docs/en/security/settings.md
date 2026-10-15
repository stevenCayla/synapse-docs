---
title: "Security Settings"
description: "Reference of the deploy-time security settings (password policy, lockout, session timeouts) exposed through SecuritySettingsProvider."
---

## Purpose

This document describes the application security settings available in the `security` section.

It provides:
- the setting name,
- its type,
- its purpose,
- its default value,
- expected limits,
- its security impact.

This file complements the general security documentation.

---

## Settings overview

| Setting | Type | Default | Required | Security impact |
|---|---|---:|---:|---|
| `session_inactivity_timeout_seconds` | integer | `900` | Yes | Defines how long an authenticated session may remain inactive before server-side expiration |
| `session_warning_countdown_seconds` | integer | `60` | Yes | Defines how long before session expiration the user warning modal is displayed |
| `password_min_length` | integer | `12` | Yes | Controls minimum password strength baseline |
| `password_require_uppercase` | boolean | `true` | Yes | Enforces uppercase letter presence in passwords |
| `password_require_lowercase` | boolean | `true` | Yes | Enforces lowercase letter presence in passwords |
| `password_require_digit` | boolean | `true` | Yes | Enforces numeric character presence in passwords |
| `password_require_special_char` | boolean | `true` | Yes | Enforces special character presence in passwords |
| `password_history_count` | integer | `5` | Yes | Prevents reuse of recent passwords |
| `force_password_change_on_first_login` | boolean | `true` | Yes | Requires users to change their password after first successful login |
| `password_rotation_days` | integer or `null` | `null` | No | Enables optional password renewal policy for specific account scopes |
| `max_failed_login_attempts` | integer | `5` | Yes | Defines how many failed attempts are tolerated before temporary lockout |
| `lockout_duration_minutes` | integer | `15` | Yes | Defines temporary lockout duration after repeated failures |
| `enable_login_throttling` | boolean | `true` | Yes | Enables login throttling protections |
| `audit_log_enabled` | boolean | `true` | Yes | Enables security-related audit logging |

---

## Detailed settings

### `session_inactivity_timeout_seconds`

**Type:** `integer`  
**Default:** `900`  
**Required:** Yes

Defines the maximum allowed inactivity duration, in seconds, before an authenticated session is considered expired.

#### Recommended bounds
- Minimum: `60`
- Recommended: `900`
- Maximum: depends on business requirements and risk profile

#### Security impact
- Lower values reduce session hijacking exposure on unattended workstations.
- Higher values improve user comfort but increase exposure if a session is left open.
- Must always be enforced server-side.

#### Notes
- This value should remain consistent with the session warning countdown.
- Must be greater than `session_warning_countdown_seconds`.

---

### `session_warning_countdown_seconds`

**Type:** `integer`  
**Default:** `60`  
**Required:** Yes

Defines how many seconds before session expiration the warning modal is displayed to the user.

#### Recommended bounds
- Minimum: `10`
- Recommended: `60`
- Maximum: must remain lower than session inactivity timeout

#### Security impact
- Gives the user a chance to extend the session explicitly.
- Improves usability without weakening server-side enforcement.
- Should never be the only mechanism controlling session expiration.

#### Notes
- This value must always be lower than `session_inactivity_timeout_seconds`.

---

### `password_min_length`

**Type:** `integer`  
**Default:** `12`  
**Required:** Yes

Defines the minimum number of characters required for a valid password.

#### Recommended bounds
- Minimum: `8`
- Recommended: `12`
- Higher values may be required for privileged accounts

#### Security impact
- Longer passwords significantly improve resistance to guessing and brute-force attempts.
- Excessively low values weaken account protection.

#### Notes
- Must be evaluated alongside throttling, lockout, and password composition rules.

---

### `password_require_uppercase`

**Type:** `boolean`  
**Default:** `true`  
**Required:** Yes

Requires at least one uppercase letter in passwords.

#### Security impact
- Increases password composition complexity.
- May slightly reduce user convenience.

#### Notes
- Should be combined with a reasonable minimum length.
- Must be validated server-side.

---

### `password_require_lowercase`

**Type:** `boolean`  
**Default:** `true`  
**Required:** Yes

Requires at least one lowercase letter in passwords.

#### Security impact
- Increases password composition diversity.
- Has limited impact alone, but strengthens the global policy when combined with other rules.

---

### `password_require_digit`

**Type:** `boolean`  
**Default:** `true`  
**Required:** Yes

Requires at least one numeric digit in passwords.

#### Security impact
- Increases password composition diversity.
- Must be part of a broader password quality policy.

---

### `password_require_special_char`

**Type:** `boolean`  
**Default:** `true`  
**Required:** Yes

Requires at least one special character in passwords.

#### Security impact
- Increases password composition diversity.
- Can slightly reduce usability if the UI does not clearly explain the requirement.

#### Notes
- Allowed special characters should be clearly documented and safely handled everywhere.

---

### `password_history_count`

**Type:** `integer`  
**Default:** `5`  
**Required:** Yes

Defines how many previous password hashes are checked to prevent password reuse.

#### Recommended bounds
- Minimum: `0`
- Recommended: `5`
- Higher values may be used for privileged accounts

#### Security impact
- Reduces repeated reuse of weak or familiar passwords.
- Improves long-term password hygiene.

#### Notes
- `0` disables password history checks.
- Only hashes must be stored, never plaintext passwords.

---

### `force_password_change_on_first_login`

**Type:** `boolean`  
**Default:** `true`  
**Required:** Yes

Forces a user to change the password after the first successful login.

#### Security impact
- Strongly recommended when accounts are provisioned with an initial or temporary password.
- Reduces risk from shared, default, or administrator-assigned credentials.

#### Notes
- Should also be reused for password reset or temporary password flows.

---

### `password_rotation_days`

**Type:** `integer` or `null`  
**Default:** `null`  
**Required:** No

Defines the number of days after which a password must be renewed.

#### Recommended bounds
- `null` for standard users unless a risk-based policy requires otherwise
- `30` to `180` only where justified by account sensitivity or internal policy

#### Security impact
- Can reduce exposure in some contexts, especially for privileged accounts.
- Blindly enforcing periodic rotation for all users may reduce usability without meaningful security benefit.

#### Notes
- Best used selectively for privileged accounts or risk-sensitive scopes.
- Should not be enabled globally without justification.

---

### `max_failed_login_attempts`

**Type:** `integer`  
**Default:** `5`  
**Required:** Yes

Defines the maximum number of failed login attempts allowed before temporary lockout logic is triggered.

#### Recommended bounds
- Minimum: `3`
- Recommended: `5`
- Maximum: depends on risk appetite and support model

#### Security impact
- Reduces brute-force and credential-stuffing effectiveness.
- Too high a value weakens protection.
- Too low a value may increase support burden.

---

### `lockout_duration_minutes`

**Type:** `integer`  
**Default:** `15`  
**Required:** Yes

Defines how long login is blocked after too many failed attempts.

#### Recommended bounds
- Minimum: `1`
- Recommended: `15`
- Higher values may be used for sensitive environments

#### Security impact
- Slows down repeated attack attempts.
- Longer lockouts improve protection but may frustrate legitimate users.

#### Notes
- Must be combined with non-revealing error messages.

---

### `enable_login_throttling`

**Type:** `boolean`  
**Default:** `true`  
**Required:** Yes

Enables rate limiting / throttling on login attempts.

#### Security impact
- Strongly reduces the feasibility of automated repeated login attempts.
- Should generally remain enabled in production.

#### Notes
- Recommended for all environments handling real user accounts.

---

### `audit_log_enabled`

**Type:** `boolean`  
**Default:** `true`  
**Required:** Yes

Enables security-oriented logging of relevant authentication and session events.

#### Security impact
- Improves traceability, incident response, and forensic analysis.
- Must remain proportionate and avoid logging secrets or excessive personal data.

#### Notes
- Should be paired with a defined retention and access policy.

---

## Validation rules

The following validation rules are recommended:

| Rule | Expected validation |
|---|---|
| `session_inactivity_timeout_seconds` | integer > 0 |
| `session_warning_countdown_seconds` | integer > 0 and < `session_inactivity_timeout_seconds` |
| `password_min_length` | integer >= 8 |
| `password_history_count` | integer >= 0 |
| `password_rotation_days` | `null` or integer > 0 |
| `max_failed_login_attempts` | integer >= 1 |
| `lockout_duration_minutes` | integer >= 1 |

Boolean fields must accept only strict boolean values.

---

## Recommended consistency rules

The following consistency checks should be enforced by the application:

- `session_warning_countdown_seconds < session_inactivity_timeout_seconds`
- `password_min_length >= 8`
- `password_history_count >= 0`
- `password_rotation_days = null` by default for standard users
- `max_failed_login_attempts >= 1`
- `lockout_duration_minutes >= 1`

---

## Security-sensitive settings

The following settings have the strongest direct security impact and should be restricted to authorized administrators only:

- `session_inactivity_timeout_seconds`
- `password_min_length`
- `password_history_count`
- `password_rotation_days`
- `max_failed_login_attempts`
- `lockout_duration_minutes`
- `enable_login_throttling`
- `audit_log_enabled`

Changes to these settings should be logged.

---

## Operational recommendations

### Recommended production baseline

```txt
session_inactivity_timeout_seconds = 900
session_warning_countdown_seconds = 60
password_min_length = 12
password_require_uppercase = true
password_require_lowercase = true
password_require_digit = true
password_require_special_char = true
password_history_count = 5
force_password_change_on_first_login = true
password_rotation_days = null
max_failed_login_attempts = 5
lockout_duration_minutes = 15
enable_login_throttling = true
audit_log_enabled = true
```


## Additional recommendations
Do not disable audit logging in production without a documented reason.
Do not lower password requirements below the agreed security baseline.
Avoid long inactivity timeouts on shared or sensitive workstations.
Restrict access to security setting administration.
Keep a trace of security setting changes.
Change management recommendations

## Any modification to security settings should

be restricted to authorized roles,
be logged,
be reviewed when it weakens the protection baseline,
be tested before deployment,
be documented in release notes if it changes application behavior.
Future settings that may be added

## The following settings may be introduced later if the project evolves

enforce_mfa_for_privileged_accounts
security_headers_enabled
csp_enabled
security_alerting_enabled
admin_session_timeout_seconds
password_breach_check_enabled
audit_log_retention_days


---

## Change log

| Date | Change | Author |
|---|---|---|
| YYYY-MM-DD | Initial security documentation | Team |

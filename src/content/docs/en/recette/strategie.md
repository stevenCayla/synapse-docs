---
title: Acceptance test strategy
description: "How Synapse acceptance testing is organised: scope, test books, criticality, statuses and acceptance criteria."
pagefind: false
---

Acceptance testing checks, on a dedicated environment, that each version of Synapse behaves as the documentation describes before it goes into production. This page sets the rules shared by all test books.

## Test books

| Test book | Scope | State |
|-----------|-------|-------|
| [REC-01 · Study creation](/en/recette/creation-etude/) | "New study" wizard, regulatory framework, go-live | Draft: 14 cases |
| [REC-02 · eCRF data entry](/en/recette/saisie-ecrf/) | Data entry in the forms | Being written |
| [REC-03 · Data import](/en/recette/import-donnees/) | Excel and CSV import | Being written |
| [REC-04 · Audit trail and e-signature](/en/recette/audit-trail-esignature/) | Traceability and electronic signature | Being written |

The [test kit](/en/recette/kit/) provides the test file and the issue template shared by all test books.

## Criticality levels

| Level | Meaning |
|-------|---------|
| <span class="crit h">High</span> | The case covers a regulatory or GxP requirement: it must pass for the version to be approved. |
| <span class="crit m">Medium</span> | The case covers an important functional rule; a deviation is analysed and traced. |
| <span class="crit l">Low</span> | The case covers comfort or presentation; a deviation does not block the version. |

## Execution statuses

Each case gets a status when its execution ends.

| Status | Meaning |
|--------|---------|
| Not executed | The case has not been played yet. |
| Passed | Every step gives the expected result. |
| Failed | At least one step gives a different result: an issue is opened. |
| Blocked | The case cannot be played (missing prerequisite, another issue). |

## How a campaign runs

1. Prepare the environment

   Dedicated test environment, release to validate deployed, test accounts and regulatory pack published, as listed in the prerequisites of each test book.

2. Execute the cases

   In each test book, tick the steps and choose the status of the case. What you enter stays in your browser and prepares the test report.

3. Report deviations

   Every result that differs from the expected one is reported with the template of the test kit, after checking the known issues.

4. Write the test report

   The "Prepare the report" button of a test book produces the summary of the statuses, to be filed in the quality system with the campaign identifier.

## Acceptance criteria

- 100% of <span class="crit h">High</span> cases passed.
- No blocking issue left open; minor issues traced with an action plan.
- Test report signed by the Data Manager and Quality Assurance.

:::caution[Reference document, not proof of execution]
The test books describe the tests and their expected results. Signed results (test reports, screenshots, deviations) are filed in the quality system, referenced by the campaign identifier.
:::

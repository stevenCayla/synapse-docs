---
title: "REC-01 · Study creation"
description: "Acceptance test scenarios for the \"New study\" wizard: prospective and retrospective paths, regulatory framework deduction and go-live."
time: "45 min"
introduced: "3.2.0"
---

<p class="rec-meta"><span class="rstat ok">Approved</span> Test book v1.3 · Written by S. Cayla · Reviewed by QA</p>

:::caution[Reference document, not proof of execution]
This page describes the tests and their expected results. Signed results (test reports, screenshots, deviations) are recorded in the quality system, referenced by the campaign ID.
:::

## Scope

<div class="kpis"><div><b>14</b><span>test cases</span></div><div><b>6</b><span>requirements covered</span></div><div><b>3</b><span>GxP-critical</span></div><div><b>~45 min</b><span>execution time</span></div></div>

| Requirement | Description | Cases | Criticality |
|----------|---------|-----|-----------|
| `EX-STU-01` | Create a prospective study in Essential mode | TC-01, TC-02 | <span class="crit h">High</span> |
| `EX-STU-02` | Deduce the regulatory category (RIPH 1/2/3, RNIPH) | TC-03 to TC-08 | <span class="crit h">High</span> |
| `EX-STU-03` | Trace every override of the framework in the audit trail | TC-09 | <span class="crit h">High</span> |
| `EX-STU-04` | Prohibit randomization in RIPH 3 | TC-10 | <span class="crit m">Medium</span> |
| `EX-STU-05` | Go-live after double e-signature | TC-11, TC-12 | <span class="crit h">High</span> |
| `EX-STU-06` | Bilingual FR / EN interface and PDF sheet | TC-13, TC-14 | <span class="crit l">Low</span> |

## Prerequisites

- Acceptance test environment `uat.synapse-medical.fr`, release `v3.2.0` deployed.
- Accounts `dm@synapse.local` (Data Manager) and `sponsor@synapse.local` (Sponsor), GCP training up to date.
- Regulatory pack `FR-2026.2` published.

## Test cases

During a session, tick each step and record the status. Your entries stay local to your browser and are used to prepare the test report.

<div class="runbar"><span id="runProg" role="status">0 / 3 cases executed</span><span class="sp"></span><button type="button" class="kit-btn" id="runReset">Reset</button><button type="button" class="kit-btn pri" id="runExport">Prepare the report</button></div>
<div class="tc" data-tc="TC-01"><div class="tc-h"><code>TC-01</code><b>Create a prospective study (Essential mode)</b><span class="crit h">High</span><select class="tc-s" aria-label="Status of TC-01"><option value="">Not executed</option><option value="ok">Compliant</option><option value="ko">Non-compliant</option><option value="na">Blocked</option></select></div><table class="steps-t"><thead><tr><th></th><th>#</th><th>Action</th><th>Expected result</th></tr></thead><tbody><tr><td><input type="checkbox" aria-label="Step 1 done"></td><td>1</td><td>Studies → <b>New study</b> → Prospective</td><td>The wizard opens in Essential mode, step 1/6</td></tr><tr><td><input type="checkbox" aria-label="Step 2 done"></td><td>2</td><td>Enter acronym <code>REC-PRO-01</code>, title, sponsor</td><td>The Next button is enabled; acronym uniqueness checked</td></tr><tr><td><input type="checkbox" aria-label="Step 3 done"></td><td>3</td><td>Answer the Framework questions: intervention not justified by standard care, minimal risk</td><td>Suggested category: <b>RIPH 2</b>, with justification</td></tr><tr><td><input type="checkbox" aria-label="Step 4 done"></td><td>4</td><td>Confirm the Review → <b>Create the study</b></td><td>Study in <b>Setup</b> status, 4-step checklist displayed</td></tr></tbody></table></div>
<div class="tc" data-tc="TC-09"><div class="tc-h"><code>TC-09</code><b>Override the regulatory category</b><span class="crit h">High</span><select class="tc-s" aria-label="Status of TC-09"><option value="">Not executed</option><option value="ok">Compliant</option><option value="ko">Non-compliant</option><option value="na">Blocked</option></select></div><table class="steps-t"><thead><tr><th></th><th>#</th><th>Action</th><th>Expected result</th></tr></thead><tbody><tr><td><input type="checkbox" aria-label="Step 1 done"></td><td>1</td><td>At the Framework step, click <b>Change category</b> → RIPH 3</td><td>A reason is required (min. 20 characters)</td></tr><tr><td><input type="checkbox" aria-label="Step 2 done"></td><td>2</td><td>Enter a reason and confirm</td><td>"Overridden" badge visible on the Review</td></tr><tr><td><input type="checkbox" aria-label="Step 3 done"></td><td>3</td><td>Open the study's Audit trail</td><td>Entry: old / new value, reason, user, UTC timestamp</td></tr></tbody></table></div>
<div class="tc" data-tc="TC-10"><div class="tc-h"><code>TC-10</code><b>Randomization prohibited in RIPH 3</b><span class="crit m">Medium</span><select class="tc-s" aria-label="Status of TC-10"><option value="">Not executed</option><option value="ok">Compliant</option><option value="ko">Non-compliant</option><option value="na">Blocked</option></select></div><table class="steps-t"><thead><tr><th></th><th>#</th><th>Action</th><th>Expected result</th></tr></thead><tbody><tr><td><input type="checkbox" aria-label="Step 1 done"></td><td>1</td><td>Study in RIPH 3, Advanced mode → Design step</td><td>Randomization option disabled, tooltip with the rule</td></tr><tr><td><input type="checkbox" aria-label="Step 2 done"></td><td>2</td><td>Switch back to RIPH 2 with randomization enabled, then return to RIPH 3</td><td>Blocking alert: randomization must be removed</td></tr></tbody></table></div>

TC-02 to TC-08 and TC-11 to TC-14 follow the same format.

## Acceptance criteria

- 100% of <span class="crit h">High</span> cases compliant.
- No blocking defect open; minor defects tracked with an action plan.
- Test report signed by the Data Manager and Quality Assurance.

---
name: acceptance-orchestrator
description: Acceptance orchestrator skill. Covers orchestrating acceptance tests, readiness gates, evidence collection, stakeholder sign-off, and reliable pass/fail outcomes.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Acceptance Orchestrator

## Overview

An acceptance orchestrator coordinates the final step of delivering value: verifying that the work meets agreed acceptance criteria.

This skill focuses on reliable acceptance orchestration:
- mapping acceptance criteria to checks/tests
- executing verification steps in a safe order
- collecting evidence
- producing a clear pass/fail result
- handling partial failures and remediation loops

---

## When to Use

Use this skill when:
- you have defined acceptance criteria per feature/task
- you need consistent “definition of done” behavior across teams
- acceptance depends on multiple verifications (tests + security + contract + docs)
- stakeholders must review evidence (not only results)
- you want to reduce regressions at the final gate

---

## Core Concepts

### Acceptance Criteria as a Contract
Acceptance criteria should be:
- specific and measurable
- mapped to deliverables and user value
- versioned/linked to the work item

Each criterion should ideally have:
- **check type** (test, manual verification, contract validation, etc.)
- **required evidence**
- **owner** (who executes or verifies)
- **pass/fail rule**

---

## Orchestration Strategy

### Step 1: Plan Acceptance Checks
Create a checklist from acceptance criteria.

Example mapping:
- Functional behavior → integration/contract tests
- API shape → schema validation / OpenAPI checks
- Security requirements → authZ/authN tests + dependency scans
- UX acceptance → smoke test + scripted UI verification (if applicable)
- Documentation → doc presence + updated examples

---

### Step 2: Execute Checks in a Safe Order
A recommended execution order:

1. **Build & lint gates** (fast fail)
2. **Unit tests** (fast correctness)
3. **Contract/schema checks** (compatibility)
4. **Integration tests** (boundary correctness)
5. **Security/quality gates** (risk reduction)
6. **E2E smoke tests** (value validation)
7. **Manual verification** (only where required)

Why this order:
- cheap checks fail early
- deeper checks run only if the surface area is plausible

---

### Step 3: Evidence Collection
For each check store:
- what was executed (command/job name/test name)
- results (pass/fail + logs summary)
- artifacts/links (screenshots, HTML reports, coverage, JSON outputs)

Evidence is what you attach for stakeholders and future debugging.

---

### Step 4: Determine Pass/Fail Outcome
Define the outcome rules:

- **Pass**: all required checks pass and no critical issues exist
- **Fail**: any required check fails
- **Block/Needs Remediation**: optional checks failed but are not critical
- **Unknown/Partial**: checks did not run due to environment/setup failures

Key principle:
- avoid marking “accepted” when required evidence is missing.

---

## Failure Handling

### Categorize Failures
Common categories:
- Test failure (logic/regression)
- Contract mismatch (schema/version)
- Security gate failure (auth/validation)
- Environment failure (missing dependencies/infra)
- Timeout/flaky tests

### Remediation Loop
Recommended loop:
- fix the root cause
- rerun only impacted checks (when possible)
- update evidence and rerun acceptance outcome

If failures are flaky:
- rerun with a controlled retry policy
- require stability before acceptance

---

## Stakeholder Sign-off Integration

Acceptance orchestrator should produce:
- a concise acceptance summary
- a full evidence list (links)
- any known risks (optional gates)
- recommendation: accept / reject / request changes

---

## Implementation Checklist

- [ ] Acceptance criteria are mapped to explicit checks with pass/fail rules
- [ ] Checks execute in a safe dependency order (fast gates first)
- [ ] Evidence is collected per check (logs, artifacts, reports)
- [ ] Outcome rules clearly distinguish fail/block/unknown
- [ ] Failure handling categorizes environment vs logic vs security vs flakiness
- [ ] Stakeholder summary includes pass/fail + evidence links
- [ ] Remediation loop reruns impacted checks and updates evidence

---

## Limitations

- Acceptance quality depends on well-written criteria
- Manual verification still carries subjectivity unless structured and evidenced

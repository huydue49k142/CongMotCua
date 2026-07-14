---
name: verification-before-completion
description: Verification-before-completion workflow skill. Covers adding explicit verification gates, evidence collection, preventing “done” without proof, and reducing regressions before finalizing tasks.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Verification Before Completion

## Overview

“Verification before completion” is a workflow discipline: a task is not considered finished until verification gates pass.

This skill focuses on:
- defining verification gates per deliverable
- collecting evidence (logs, tests, artifacts)
- preventing false “done”
- avoiding regressions with targeted checks
- producing consistent completion criteria

---

## When to Use

- You finish engineering tasks (features, refactors, infra changes)
- You want to reduce “it works on my machine” issues
- You have multiple stakeholders and need proof of correctness
- You manage risk (security, reliability, performance)
- You ship to production or customer environments

---

## Core Concepts

### 1) Verification Gates
A verification gate is a checkpoint that must pass before you proceed.

Common gate types:
- **Unit/Component tests**: fast correctness checks
- **Integration tests**: boundary correctness
- **Contract checks**: API/schema compatibility
- **Security checks**: linting, dependency scanning, auth tests
- **Performance smoke**: latency sanity + resource limits
- **Manual verification**: UI/UX checks (when required)

---

## 2) Evidence over Assertions
Verification should produce evidence:
- test reports / coverage
- build artifacts
- logs and command outputs (when useful)
- screenshot/recording for UI changes
- benchmark summaries for perf changes

Avoid marking complete based only on “I think it’s fine”.

---

## 3) Completion Criteria (Definition of Done)
Completion criteria should be explicit:
- what must be true
- what checks prove it
- who accepts it (optional)

Example DoD:
- tests pass: `unit` + `integration`
- no critical security warnings
- API schema unchanged (except documented versions)
- changelog updated

---

## Verification Framework

## Step 1: Map Deliverables to Checks
For each deliverable, define:
- deliverable type (code, migration, dashboard, docs)
- required verification gates
- acceptable evidence

Example mapping:
- PR code changes -> unit + lint + security gate
- DB migration -> migration + rollback simulation + integration test
- API changes -> contract test + schema validation + backward-compat checks
- UI change -> smoke test + screenshot comparison (optional)

---

## Step 2: Create a Verification Checklist
A checklist reduces missed steps.

Recommended checklist sections:

### Code Health
- [ ] Lint/format passes
- [ ] Static analysis passes (if used)

### Correctness
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Regression tests for known bug paths pass

### Safety (Risk-based)
- [ ] AuthZ/AuthN tests for protected endpoints
- [ ] Dependency security scan (SCA)
- [ ] Input validation checks for new entry points

### Compatibility
- [ ] API contract tests pass
- [ ] Migration forward compatibility validated
- [ ] Versioning policy respected

### Operations
- [ ] Build succeeds in CI environment
- [ ] Observability hooks are present (logs/metrics/traces)
- [ ] Feature flags / rollback plan exists (if required)

---

## Step 3: Fail Fast with Clear Categories
When a gate fails, categorize the failure so resolution is fast:
- validation error (fix test expectation or logic)
- environment/setup error (fix CI dependencies)
- contract mismatch (update versioning/documentation)
- security/auth error (audit code and authorization)

Store failure context in the task notes.

---

## Step 4: “Only Complete When Verified”
Define a rule:
- If any *required* verification gate fails, completion is blocked.
- Optional verification can be marked “known risk” with explicit owner sign-off.

---

## Implementation Checklist

- [ ] Each deliverable has verification gates
- [ ] Completion criteria are explicit and measurable
- [ ] Evidence is collected (not just pass/fail claims)
- [ ] Required gates block completion
- [ ] Verification checklist includes correctness, safety, compatibility, operations
- [ ] Failures are categorized for faster remediation

---

## Limitations

- More gates increase effort; keep them risk-based
- Over-verification without automation can slow shipping
- Manual verification must still be structured and evidenced

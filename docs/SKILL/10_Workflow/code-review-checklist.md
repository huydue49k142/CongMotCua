---
name: code-review-checklist
description: Code review checklist skill. Covers consistent review criteria, quality gates, correctness, security, performance, maintainability, testing expectations, and actionable feedback writing.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Code Review Checklist

## Overview

A strong code review checklist ensures reviews are consistent, fast to evaluate, and high-signal—focused on correctness, safety, and long-term maintainability.

This skill provides a reusable review checklist and guidance for writing actionable feedback.

---

## When to Use

- Every PR (especially for production-critical changes)
- Refactors and architecture changes
- Security-sensitive endpoints or data access
- Performance-critical code
- Changes affecting APIs/contracts

---

## Core Principles

### High-Signal Feedback
- Focus on behavior and risk, not style preference
- Prefer “why” + “how” corrections
- Mention severity: blocking vs non-blocking

### Consistency
- Apply the same categories to every PR
- Avoid “review drift” across reviewers

---

## Review Categories (Recommended)

### 1) Correctness & Intent
- [ ] Does the PR solve the stated problem?
- [ ] Does it match expected behavior and edge cases?
- [ ] Are invariants preserved (domain rules, validation rules)?
- [ ] Are unit tests or examples updated accordingly?

### 2) Tests & Verification Evidence
- [ ] Unit tests added/updated
- [ ] Integration/contract tests added/updated if boundaries changed
- [ ] Tests cover critical paths and bug regression
- [ ] CI checks pass or are expected to pass
- [ ] No “test-only success” (tests should validate real behavior)

### 3) API/Contract Compatibility (If Applicable)
- [ ] Request/response schema changes documented
- [ ] Backward compatibility preserved or versioned
- [ ] Deprecations communicated
- [ ] Error contract remains consistent (status codes + error shape)

### 4) Security & Safety
- [ ] Input validation at boundaries
- [ ] AuthN/AuthZ enforced for protected actions
- [ ] Secrets not logged or committed
- [ ] SQL injection / command injection concerns reviewed
- [ ] SSRF/XSS risks considered where relevant
- [ ] Rate limiting / abuse considerations if endpoints are public

### 5) Performance & Resource Use
- [ ] No obvious O(n²) or unbounded loops in hot paths
- [ ] Query patterns avoid N+1 issues
- [ ] Memory usage reasonable (no large in-memory accumulation)
- [ ] External calls have timeouts
- [ ] Caching used appropriately (and invalidation is considered)

### 6) Maintainability
- [ ] Code is readable and responsibilities are separated
- [ ] Naming is clear and consistent with repo conventions
- [ ] New complexity is justified (and documented)
- [ ] Duplication is avoided or intentionally introduced (with rationale)

### 7) Observability & Operability
- [ ] Logging is meaningful (structured fields where possible)
- [ ] Metrics/tracing hooks added if it’s a critical flow
- [ ] Errors are handled with stable messages/codes
- [ ] Failures have clear behavior (retry, fallback, or fail-fast)

### 8) Documentation & Change Management
- [ ] README/docs updated for user-visible changes
- [ ] Migrations described (if DB changes)
- [ ] ADR/notes referenced when architecture decisions change

---

## Severity Labels (Suggested)
- **Blocker**: correctness/security/contract broken, missing tests for critical behavior
- **Major**: likely future bugs, performance hazards, missing observability for critical flows
- **Minor**: style, small improvements, non-urgent clarity

---

## Writing Actionable Review Comments

### Use Structure: Context → Issue → Impact → Suggestion
Example template:
- Context: “In `X` function…”
- Issue: “The input `Y` can be empty…”
- Impact: “This could cause a validation error at runtime…”
- Suggestion: “Add a guard and a unit test for empty input…”

### Prefer Minimal Changes
- Suggest small diffs
- If multiple options exist, list tradeoffs

### Avoid Ambiguity
- Don’t say “this is wrong”
- Say what’s wrong and exactly what to change

---

## Implementation Checklist

- [ ] Review checklist categories are applied consistently
- [ ] Blocking issues are clearly labeled
- [ ] Feedback includes impact and concrete suggestions
- [ ] Tests/verification evidence is required for behavior changes
- [ ] Security and contract risks are reviewed intentionally

---

## Limitations

- Checklists can’t replace domain expertise
- Over-reliance on checklists can hide nuanced issues—use judgment

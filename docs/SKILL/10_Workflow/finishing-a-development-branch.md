---
name: finishing-a-development-branch
description: Finishing a development branch workflow skill. Covers branch lifecycle, final integration steps, rebase/merge strategy, resolving last-mile conflicts, and preparing a PR-ready branch for acceptance.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Finishing a Development Branch

## Overview

Finishing a development branch is the last-mile workflow before merging changes.

This skill covers:
- ensuring the branch is up to date
- resolving conflicts early and safely
- running final checks (tests, lint, build, security gates)
- writing/refreshing documentation and changelogs
- preparing a PR that is reviewable and merge-ready

---

## When to Use

- Before opening or finalizing a PR
- After long-lived development work
- Before release preparation or hotfix stabilization
- After refactors that may require contract or integration verification

---

## Core Concepts

### Branch Lifecycle Mindset
Treat the development branch as:
- a working integration area
- not a permanent state
- something that must become PR-ready

Goal: reduce review and merge risk by converging toward a stable integration point.

---

## Step-by-Step Workflow

### Step 1: Update Your Branch (Avoid Large Diffs)
Update the branch before finalizing:

- fetch latest target branch (e.g., `main`)
- rebase or merge target updates into your branch
- resolve conflicts while the context is fresh

Prefer rebasing if your team expects linear history; otherwise merge with a merge commit.

---

### Step 2: Stabilize the Code (Last Mile)
Run final checks:
- build/compile
- lint/format
- unit tests
- integration tests (if applicable)
- contract/schema validation (if API changes)
- security/quality gates (dependency scan, authZ tests when relevant)

Stop and fix failures immediately—don’t “push and pray”.

---

### Step 3: Resolve Conflicts with Strategy
When conflicts occur:
- resolve logically (not mechanically)
- ensure both sides still satisfy requirements
- add/adjust tests to cover conflict areas
- avoid removing necessary changes “to make it compile”

Document conflict resolutions in PR notes if they affect behavior.

---

### Step 4: Verify Behavioral Compatibility
For risky changes:
- add regression tests
- validate migrations forward/backward compatibility
- ensure API contracts remain compatible or properly versioned

If you changed a public contract, ensure docs and examples are updated.

---

### Step 5: Review the PR for Merge Readiness
Prepare the PR so reviewers can approve quickly:
- keep commits coherent (squash if your workflow prefers)
- ensure commit messages describe intent
- update description with:
  - summary of changes
  - risk level
  - how verification was performed
  - screenshots or logs if needed
- ensure all checks required by CI are green

---

## Merge Strategy Notes

### Rebase vs Merge
- **Rebase**: cleaner history, but requires care (force push may be needed)
- **Merge**: preserves history, can be safer for shared branches

Use the strategy your team agreed on.

---

## Implementation Checklist

- [ ] Branch is up to date with target branch
- [ ] Conflicts resolved with intent and tests updated
- [ ] Build passes
- [ ] Lint/format passes
- [ ] Unit + integration tests pass as required
- [ ] Security/contract gates pass for relevant changes
- [ ] Docs/changelog updated for user-visible changes
- [ ] PR description includes verification evidence and risk notes
- [ ] CI checks are green (or marked with a known acceptable exception)

---

## Limitations

- Workflow quality depends on CI reliability and review standards
- Highly coupled changes require extra verification to avoid hidden regressions

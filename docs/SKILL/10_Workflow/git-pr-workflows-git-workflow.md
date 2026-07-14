---
name: git-pr-workflows-git-workflow
description: Git PR workflows skill. Covers git branching strategies, pull request workflows, CI integration expectations, merge/rebase practices, and review/approval gates for reliable collaboration.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Git PR Workflows (Git Workflow)

## Overview

Git PR workflows standardize how code changes move from a branch to the main line.

This skill covers:
- branching and PR strategy
- keeping PRs small and reviewable
- CI expectations and required checks
- merge strategies (merge, squash, rebase)
- handling conflicts and keeping history clean
- reliable release readiness

---

## When to Use

- Any team using pull requests for collaboration
- Teams with CI pipelines and required status checks
- Projects requiring consistent merge history and stable releases
- Repos with multiple contributors and frequent PR traffic

---

## Core Concepts

### 1) Branch Strategy
A common pattern is:
- `main`: protected, always deployable
- `develop` (optional): integration branch
- feature branches: short-lived topic branches
- hotfix branches: urgent production fixes

Goal:
- keep `main` stable
- keep feature branches focused and mergeable quickly

---

### 2) Pull Requests as Review Units
A PR should represent:
- one coherent change set
- clear intent in the title/description
- verification evidence (tests/CI)
- minimal “noise” commits

Rules of thumb:
- keep PRs small enough to review fast
- avoid mixing unrelated refactors with features unless necessary

---

## PR Workflow (Step-by-Step)

### Step 1: Create a Topic Branch
- branch from the latest `main` (or agreed base)
- name branches consistently (e.g., `feature/<topic>`, `fix/<topic>`)

---

### Step 2: Implement with Verification in Mind
During development:
- run unit tests frequently
- keep formatting/linting compliant
- avoid large unreviewed changes late in the branch

---

### Step 3: Open a PR with Good Metadata
PR description should include:
- summary of changes
- why the change is needed
- risk level (low/medium/high)
- testing performed (commands / test types / environment)
- screenshots or links if UI changes

---

### Step 4: CI and Required Checks
Set required checks so merges are reliable:
- lint/format checks
- unit tests
- integration tests (if relevant)
- security checks (SCA, dependency scanning, secrets scanning)
- contract tests (if API changes)
- build/compile checks

Policy:
- only merge when required checks pass
- allow optional checks with explicit rationale when needed

---

### Step 5: Review & Approval Gates
Review process should be consistent:
- reviewers validate correctness + safety
- keep feedback actionable (suggest fixes, not just comments)
- ensure required approvals are satisfied per repo rules

---

### Step 6: Update Branch Before Merge (Last Mile)
Right before merge:
- rebase/merge from latest base to reduce conflicts
- resolve conflicts locally with tests passing
- avoid force-push unless your team allows it

---

## Merge Strategy

### Merge Options
Choose based on team policy:
- **Merge commit**: preserves full history, simpler for teams
- **Squash merge**: cleaner history, one commit per PR
- **Rebase merge**: linear history, requires careful conflict handling

Guideline:
- match merge strategy to how your team reads history and performs releases

---

## Conflict Handling

### Reduce Conflicts Early
- keep branch short-lived
- pull latest base changes regularly
- keep PR scope focused

### Resolve Conflicts Safely
- resolve with intent (preserve behavior)
- rerun tests after conflict resolution
- ensure no accidental deletions or partial merges

---

## Release Readiness

### Ensure Deployability
Before merging to `main`:
- ensure migrations are compatible
- verify backward compatibility where needed
- confirm rollback plan exists for risky changes

---

## Implementation Checklist

- [ ] Branch is based on latest protected branch
- [ ] PR scope is coherent and reviewable
- [ ] Tests are run and described in PR
- [ ] Required CI checks pass
- [ ] Security checks (if required) pass
- [ ] Required approvals obtained
- [ ] Branch is updated to minimize merge conflicts
- [ ] Merge strategy follows repo policy (merge/squash/rebase)

---

## Limitations

- Workflows must be tuned per team size and release process
- PR hygiene matters: large or noisy PRs reduce review effectiveness

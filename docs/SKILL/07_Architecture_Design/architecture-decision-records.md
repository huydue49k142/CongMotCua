---
name: architecture-decision-records
description: Architecture Decision Records (ADRs) skill. Covers how to capture architecture choices, context, alternatives, tradeoffs, status, and how to maintain ADRs over time.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Architecture Decision Records (ADRs)

## Overview

Architecture Decision Records (ADRs) are lightweight documents that record important architecture decisions along with the rationale and tradeoffs.

This skill focuses on:
- Choosing which decisions should be recorded
- Writing ADRs in a consistent format
- Updating ADRs over time (superseding, status, migration paths)
- Using ADRs effectively in review and onboarding

---

## When to Use

Use ADRs when:
- Decisions have long-term impact
- Multiple people must understand tradeoffs quickly
- You need a historical trail for audits, incidents, and compliance
- The team is growing and onboarding matters
- Architecture is evolving and you want consistency over time

---

## ADR Core Structure (Recommended Template)

An ADR typically includes:

- **Title**: short decision statement
- **Status**: Proposed / Accepted / Superseded / Rejected
- **Date**
- **Context**: what problem and constraints exist
- **Decision**: what you chose (and how)
- **Consequences**: pros/cons, expected impact
- **Alternatives considered**: 2–5 key options

---

## ADR Lifecycle

### Status Values
- `Proposed` — waiting for approval
- `Accepted` — decision is in force
- `Rejected` — decision declined
- `Superseded` — replaced by a newer ADR
- `Deprecated` — still exists but discouraged

### When to Supersede
When a decision:
- becomes outdated due to new constraints,
- is partially wrong,
- fails to meet reliability/performance requirements,
- conflicts with new product direction.

---

## Practical Writing Guidelines

### Keep Context Specific
Good context answers:
- What triggered the decision?
- What constraints existed? (timeline, team skill, cost, compliance)
- What “done” looks like for success?

### Decision Should Be Actionable
Avoid vague statements like “we should use X”.
Write:
- “We will use X with Y configuration because Z.”

### Consequences Must Include Tradeoffs
List measurable impacts where possible:
- latency, reliability, team ownership,
- migration complexity,
- operational burden,
- cost and performance scaling.

---

## ADR Template (Copyable Structure)

```markdown
# ADR-001: Use Event Sourcing for Order History

- **Status:** Accepted
- **Date:** 2026-07-11

## Context
The order domain requires an immutable audit trail and replayable history.

Constraints:
- Must support schema evolution
- Must support rebuilding read models
- Team prefers strong separation between write and read paths

## Decision
We will implement event sourcing for the Order aggregate with:
- commands validating invariants
- events persisted append-only
- projections stored in a dedicated read database

## Consequences
Positive:
- Full audit history and replay support
- Projections can be rebuilt for query changes

Negative:
- Increased complexity in operational tooling
- Requires careful schema evolution strategy
```

---

## Alternatives Section (What to Include)

Include alternatives that:
- represent real engineering choices,
- were reviewed by the team,
- matter for cost/reliability/maintenance.

Example alternatives:
- CRUD + audit table (rejected due to lack of replay)
- Event sourcing without snapshots (rejected due to replay performance concerns)
- CQRS with only read-model events (rejected due to domain invariants need)

---

## ADR Maintenance Practices

### Update Where Needed (But Avoid Rewrite)
When the world changes:
- create a new ADR if the decision materially changes
- reference the older ADR and mark it `Superseded`

### Link ADRs to Implementation
Add references:
- PR links
- repository paths
- tickets
- follow-up ADRs

### Review ADRs in Architecture Sessions
Include ADR review cadence:
- monthly/quarterly for accepted ADRs
- before major changes

---

## Implementation Checklist

- [ ] ADR template includes context, decision, alternatives, consequences
- [ ] Decision statement is specific and testable
- [ ] Tradeoffs are documented (not only pros)
- [ ] ADR status lifecycle is used consistently
- [ ] Superseding ADRs reference the prior decision
- [ ] ADRs link to code PRs/tickets or implementation notes
- [ ] ADRs are reviewed as part of architecture governance

---

## Limitations

- ADRs can become stale without ownership and maintenance
- If too many decisions are recorded, the system becomes noise
- ADRs do not replace experiments or metrics; they explain rationale

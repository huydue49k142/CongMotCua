---
name: cqrs-implementation
description: CQRS implementation skill. Covers commands vs queries separation, read/write models, projections, consistency tradeoffs, and practical architecture patterns.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# CQRS Implementation

## Overview

CQRS (Command Query Responsibility Segregation) separates write operations (commands) from read operations (queries).

This skill focuses on practical CQRS architecture:
- designing command handlers and query handlers
- choosing read model strategies (projections/materialized views)
- handling consistency tradeoffs
- keeping it simple and operable in production

---

## When to Use

Use CQRS when:
- Reads and writes have very different performance characteristics
- You need independent scaling for query traffic
- You want flexible read models optimized for UI/use-cases
- Your domain benefits from clear separation of intent (commands)
- You need denormalized views or event-driven projections

---

## Core Concepts

### Commands (Write Side)

Commands represent intent to change state:
- validate invariants
- call domain logic
- emit events (optional but common)
- persist changes

Key traits:
- **no return value** except success/failure
- focus on domain correctness

### Queries (Read Side)

Queries represent intent to fetch data:
- return DTOs/view models
- optimized for performance and usability
- ideally don’t mutate state

Key traits:
- may return “eventually consistent” results
- focus on fast retrieval

---

## Typical CQRS Architecture

### Option A: CQRS with a Separate Read Model (Common)
- Write side uses domain aggregates + event store / database writes
- Read side uses projections/read tables optimized for queries

### Option B: CQRS without Event Sourcing (Still Useful)
- Write side persists to DB
- Read side uses denormalized tables/materialized views updated in the background

---

## Read Model Strategies

### Projection / Materialized View (Recommended)
- projections are updated from:
  - domain events
  - or change-data-capture / async workers
- query handlers read from these optimized structures

### Keep Read Models Idempotent
Projection consumers must be safe for:
- retries
- redelivery
- replays/backfills

Rules:
- upsert based on deterministic keys
- track processed event versions or offsets

---

## Consistency Tradeoffs

### Strong Consistency (Harder)
If you require immediate query consistency after a command:
- either update read model synchronously (limited benefits)
- or accept additional complexity

### Eventual Consistency (Common in CQRS)
Accept that:
- query results might lag behind writes
- UI may need loading/spinner states or “read-your-writes” strategies

Mitigations:
- read-your-writes via short-lived caches
- wait-for-index strategies in critical paths
- show progress/optimistic UI

---

## Command Side Implementation Patterns

### Command Handler Contract
- validate input
- load current state (aggregate or equivalent)
- run domain logic
- persist
- emit events (if using events)

### Idempotency for Commands
For safe retries:
- use idempotency keys per command
- store processed keys or deterministic outcomes

---

## Query Side Implementation Patterns

### Query Handler Contract
- map to DTO/view model
- keep queries bounded:
  - pagination
  - explicit filters
  - limits

### Query Performance Tips
- precompute expensive joins in read model
- index fields used in filters/sorts
- cache hot read endpoints (with correct invalidation)

---

## Integration Patterns

### API Layer Routing
- POST/PUT routes => commands
- GET routes => queries
- keep controllers thin and route to handlers

### Event-Driven Projection Update
- command side publishes events
- read side subscribes and updates projections

---

## Operational Concerns

### Projection Lag Monitoring
Track:
- consumer lag
- projection update error rates
- rebuild status
- data freshness indicators

### Backfill / Rebuild Strategy
Design for:
- versioned projection schemas
- rebuild jobs
- migration steps without breaking queries

---

## Implementation Checklist

- [ ] Commands validate invariants and express intent clearly
- [ ] Query handlers return DTOs optimized for read use-cases
- [ ] Read model strategy (projections/materialized views) is defined
- [ ] Projection consumers are idempotent and replay-safe
- [ ] Consistency model is documented (strong vs eventual)
- [ ] Pagination/limits are enforced for queries
- [ ] Projection lag and failures are monitored
- [ ] Rebuild/backfill procedure is planned and tested

---

## Limitations

- CQRS can add complexity (two models, projection pipelines)
- Overuse leads to “architecture overhead” without benefit
- Requires discipline in data ownership and consistency expectations

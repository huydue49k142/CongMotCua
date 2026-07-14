---
name: event-sourcing-architect
description: Event Sourcing architecture skill. Covers event store design, commands vs events, aggregates, projections/read models, snapshots, schema evolution, replay, and operational considerations.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Event Sourcing (Architect)

## Overview

Event Sourcing stores an application's state as a sequence of immutable events. Instead of persisting “current state”, the system persists the facts that happened, then derives state by replaying events.

This skill covers the architecture decisions needed to design an event-sourced system: event store modeling, aggregates, projections, and operational practices.

---

## When to Use

Use this skill when:

- You need an audit trail / immutable history
- Business rules depend on a timeline of changes
- You want to rebuild read models without changing the write model
- You need robust replay for debugging, migrations, and analytics
- You want to support complex workflows with eventual consistency

---

## Core Concepts

### Commands vs Events

- **Command**: intent to change state (e.g., `PlaceOrder`)
- **Event**: something that happened (e.g., `OrderPlaced`)

A command handler validates business rules and emits one or more events. Events are persisted first.

### Aggregates

An **aggregate** is the consistency boundary.

- A single aggregate is rebuilt by replaying events
- Command processing targets one aggregate at a time
- Aggregates encapsulate invariants and validation

### Event Immutability

Events are immutable:
- Never edit past events
- Prefer new events or compensating events

---

## Event Store Design

### Event Envelope

Use a consistent event wrapper to support metadata:

```json
{
  "eventId": "uuid",
  "aggregateId": "order-123",
  "aggregateType": "Order",
  "eventType": "OrderPlaced",
  "version": 1,
  "occurredAt": "2026-07-11T10:00:00Z",
  "payload": {
    "customerId": "cust-9",
    "items": [{ "sku": "A1", "qty": 2 }]
  }
}
```

### Storage Strategy

Common approaches:
- Single stream per aggregate (append-only)
- Partition streams by aggregate type or tenant
- Ensure ordering per stream

### Concurrency Control

Use **optimistic concurrency**:
- track an expected `streamVersion`
- reject or retry when version mismatches

---

## Aggregates Implementation Pattern

### Pseudocode

```text
handle(command):
  load aggregate by replaying events
  validate invariants
  emit new events
  append events to store
```

### Rebuilding State

State is derived by applying events in order:
- `aggregate.apply(event)` updates in-memory state
- snapshots can reduce replay time

---

## Projections / Read Models

Event sourcing typically splits:
- **Write model**: aggregates + event store
- **Read model**: projections (denormalized views)

### Projection Types

- **Sync projection** (during command handling): immediate but less decoupled
- **Async projection** (consumer updates): decoupled and scalable

### Idempotent Consumers

Projections should be safely repeatable:
- store last processed position/version
- treat replays as normal operations

---

## Snapshots

Snapshots store occasional state to speed up replay.

- Take snapshot after N events
- Snapshots must be versioned and compatible
- On load: snapshot + events after snapshot

---

## Schema Evolution

You will change event schemas over time.

Strategies:
- **Version event types** (e.g., `OrderPlacedV2`)
- Backward compatible payload changes
- Maintain mapping logic for older versions
- Use transform/replay during migrations when needed

Rule of thumb:
- prioritize **read compatibility** and **write immutability**

---

## Replay and Rebuild

The system should support rebuilding read models by replaying events:

- Create a fresh projection database/schema
- Re-run projection consumers from the beginning (or from snapshot)
- Validate invariants and data correctness

Operationally:
- schedule rebuilds off-peak
- monitor consumer lag

---

## Reliability & Operational Considerations

- Ensure at-least-once delivery to projections
- Make projection updates idempotent
- Handle poison events (dead-letter queues)
- Monitor consumer lag, error rates, and replay durations
- Design for backfills and schema upgrades

---

## Implementation Checklist

- [ ] Commands target a single aggregate consistency boundary
- [ ] Events are immutable and appended-only
- [ ] Optimistic concurrency with stream versioning is in place
- [ ] Aggregates validate invariants before emitting events
- [ ] Projections are designed for idempotency and replay
- [ ] Event schema evolution strategy is defined
- [ ] Snapshots used to keep replay time manageable
- [ ] Monitoring exists for consumer lag and projection health
- [ ] Rebuild strategy is tested (dry-run on staging)

---

## Limitations

- Complexity increases (events, projections, eventual consistency)
- Debugging can be harder without good tooling
- Read models must be kept in sync (eventual consistency)

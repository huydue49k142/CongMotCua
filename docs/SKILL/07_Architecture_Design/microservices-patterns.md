---
name: microservices-patterns
description: Microservices architecture patterns. Covers service boundaries, communication patterns, data management, resilience, scaling, observability, and operational best practices.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Microservices Patterns

## Overview

Microservices patterns provide repeatable solutions for designing and operating a distributed system as a set of independently deployable services. This skill focuses on practical patterns for boundaries, communication, data consistency, resilience, and operations.

## When to Use

- Splitting monoliths into services
- Designing service boundaries
- Choosing synchronous vs asynchronous communication
- Managing service-to-data relationships
- Building resilient systems under partial failures
- Standardizing observability and operations

---

## 1. Service Boundaries

### Pattern: Bounded Context (DDD-aligned)
Keep each service aligned with a business capability.

- Define a clear responsibility per service
- Avoid “shared business logic” across multiple services
- Prefer explicit ownership of data and workflows

### Anti-pattern: Shared Database for “Convenience”
- Shared schemas increase coupling
- Changes become breaking changes for many services

---

## 2. Communication Patterns

### Pattern: Synchronous (HTTP/gRPC) for Queries
Use when you need immediate answers.

- Request/response
- Timeouts are mandatory
- Contract-first APIs and versioning are required

### Pattern: Asynchronous (Events) for Workflows
Use when you can tolerate eventual consistency.

- Event-driven choreography or orchestration
- Retries, idempotency, and dead-letter handling are critical

### Pattern: API Gateway
Centralize:
- auth
- routing
- rate limiting
- request shaping

---

## 3. Data Management in Microservices

### Pattern: Database per Service
- each service owns its data
- no direct cross-service reads/writes

### Pattern: Materialized Views / Read Models
For cross-service queries:
- maintain a local read model
- update it from events

### Pattern: Saga for Distributed Transactions
Replace “one big transaction” with a saga:

- **Orchestration**: a saga coordinator drives steps
- **Choreography**: services publish events and react to them

---

## 4. Resilience Patterns

### Pattern: Timeouts + Retries (with backoff)
- use timeouts on every outbound call
- retry only idempotent operations
- exponential backoff + jitter to avoid thundering herd

### Pattern: Circuit Breaker
When failures spike:
- stop trying temporarily
- fail fast with clear error semantics

### Pattern: Bulkheads
- isolate resources per dependency
- prevent one failure domain from exhausting everything

### Pattern: Idempotency Keys
For “at least once” delivery and retries:
- include a unique key per command
- store processed keys or use deterministic handlers

---

## 5. Scaling Patterns

### Pattern: Independent Scaling
Scale each service based on load.

- autoscaling policies per service
- deploy services independently

### Pattern: Stateless Services
Prefer statelessness for easy scaling:
- store state in a database/cache/object store
- use sessions carefully (or externalize them)

---

## 6. Observability Patterns

### Pattern: Correlation IDs
- propagate trace/span IDs across HTTP/gRPC and events
- include IDs in logs, metrics, and traces

### Pattern: RED/USE Metrics
Track:
- **R**ate
- **E**rrors
- **D**uration

and/or:
- **U**tilization
- **S**aturation
- **E**rrors

### Pattern: Distributed Tracing
- trace request flows across services
- use OpenTelemetry-compatible tooling

---

## 7. Operational Patterns

### Pattern: Deployment Strategies
- rolling updates
- blue/green
- canary releases

### Pattern: Feature Flags
- decouple release from behavior change
- enable safe rollback

### Pattern: Health Checks and Readiness Gates
- liveness vs readiness
- readiness must reflect dependency availability

---

## Implementation Checklist

- [ ] Clear service ownership and bounded contexts
- [ ] No shared database coupling (prefer per-service data ownership)
- [ ] API contracts/versioning defined
- [ ] Events designed with schema evolution in mind
- [ ] Resilience: timeouts, retries, circuit breakers, bulkheads
- [ ] Idempotency for commands and consumers
- [ ] Saga pattern chosen for cross-service workflows
- [ ] Observability: correlation IDs, logs/metrics/traces wired
- [ ] Deployment and rollback strategy standardized

---

## Limitations

- Microservices add operational complexity (more moving parts)
- Data consistency is harder than monoliths
- Strong versioning and observability discipline is required

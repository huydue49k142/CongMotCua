---
name: graphql-architect
description: GraphQL architecture skill. Covers schema design, resolvers, authorization, pagination, caching, batching (DataLoader), federation considerations, and operational best practices.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# GraphQL Architecture

## Overview

GraphQL shifts the API contract from fixed REST endpoints to a queryable schema. This skill focuses on designing GraphQL systems that are safe, scalable, and operable in production.

---

## When to Use

- Building query-flexible APIs with evolving requirements
- Reducing over-fetching/under-fetching compared to REST
- Need strong typing and schema-driven development
- Designing APIs that benefit from tooling (GraphiQL, schema docs, codegen)
- You must implement robust authorization and performance controls

---

## Core Concepts

### Schema-First Design
Prefer defining the schema early:

- types (objects, input types, enums)
- queries and mutations
- scalars
- relationships (fields)

Schema is the contract:
- version changes intentionally
- document behavior in schema descriptions

---

## Resolver Architecture

### Thin Resolvers
Keep resolvers as orchestration layers:

- parse inputs
- call services/use-cases
- return typed outputs

Avoid placing business logic inside resolvers.

### Service / Use-Case Layer
Put business rules behind application services:

- unit testable
- reuse across transport layers

---

## Authorization (Must-Have)

### Field-Level vs Object-Level
- Object-level checks: verify user can access the object
- Field-level checks: hide/deny specific fields when required

### Never Trust Client Claims
Always compute access based on server-side context:

- identity (JWT/session)
- roles/scopes/ownership
- tenant boundaries (if multi-tenant)

### Consistent Error Strategy
Use consistent patterns:
- return `null` + errors for partial failures (optional depending on policy)
- avoid leaking sensitive data through error messages

---

## Pagination Patterns

GraphQL pagination commonly uses:
- Cursor-based pagination (recommended)
- Offset-based pagination (use cautiously)

### Cursor Pagination Shape
Example:

```graphql
type Query {
  users(first: Int, after: String): UserConnection!
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
}

type PageInfo {
  hasNextPage: Boolean!
  endCursor: String
}
```

---

## Performance Engineering

### Avoid N+1 Query Problems
Batch and cache data fetching in resolvers.

Use **DataLoader** (or equivalent):
- batch keys per request tick
- cache results per request context

---

## Caching Strategy

### Query Complexity & Cost Analysis
Before expensive queries run:
- apply complexity scoring
- cap depth, cost, and returned size

### CDN/HTTP Cache (Carefully)
GraphQL responses are query-dependent:
- consider persisting queries
- include auth cache-vary rules if applicable

---

## Validation & Safety Controls

### Depth Limiting
Prevents deeply nested queries that explode execution.

### Rate Limiting
- per IP / per user / per token
- apply at gateway layer

### Query Timeout / Execution Limits
- ensure resolvers respect cancellation
- set server-side timeouts

---

## Schema Evolution

### Backward-Compatible Changes
- add new fields (safe)
- keep old fields working while deprecating
- prefer optional fields for gradual rollout

### Deprecation
Use `@deprecated` in schema with clear replacement:
- include guidance in description
- schedule removal after a sunset date

---

## Operational Best Practices

### Observability
Track:
- request count, error rate
- resolver timings (field-level metrics)
- complexity score distribution
- top slow queries / top expensive operations

### Contract Testing
Validate:
- schema changes don’t break clients unexpectedly
- authorization policies behave consistently

### Documentation
Publish:
- schema docs
- examples
- pagination behavior and filter semantics

---

## Federation Considerations (If Relevant)

If using Apollo Federation or similar:
- define ownership boundaries per subgraph
- ensure entity keys are stable
- handle cross-service authorization carefully

---

## Implementation Checklist

- [ ] Schema-first workflow (documented contract)
- [ ] Resolvers are thin; business logic in services/use-cases
- [ ] Authorization is implemented (ownership/tenant + field policy)
- [ ] Pagination uses cursor-based patterns where possible
- [ ] DataLoader/batching prevents N+1
- [ ] Query cost/depth limits and rate limiting exist
- [ ] Errors do not leak sensitive data
- [ ] Deprecation policy and schema evolution strategy defined
- [ ] Observability captures resolver timings and complexity

---

## Limitations

- GraphQL requires more safety controls than typical REST
- Performance tuning often depends on resolver behavior and batching discipline

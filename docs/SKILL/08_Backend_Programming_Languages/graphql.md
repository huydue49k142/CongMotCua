---
name: graphql
description: GraphQL backend development skill. Covers schema design, resolvers, type system, authorization, pagination, batching, caching, and safe operational practices.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# GraphQL Backend Development

## Overview

GraphQL is a query language and runtime that exposes a strongly-typed schema. This skill focuses on implementing GraphQL servers that are safe, maintainable, and performant.

---

## When to Use

- You want a flexible client-driven API contract
- You need to reduce over-fetching/under-fetching vs REST
- Your schema can model your domain clearly
- You can enforce authorization and safety constraints

---

## Core Concepts

### Schema & Types

A GraphQL schema defines:
- object types
- input types
- enums/scalars
- queries and mutations
- relationships between entities

Rules:
- keep schema aligned with domain meaning
- prefer explicit input types over “raw args”
- use enums for bounded values

Example:

```graphql
input CreateUserInput {
  email: String!
  name: String!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
}
```

---

## Resolver Architecture

### Resolver Responsibilities

Resolvers should:
- validate/cast inputs
- call application/service layer
- map results to GraphQL types

Avoid:
- business rules inside resolvers
- direct DB access from resolvers (prefer repositories/services)

---

## Authorization

### Apply Authorization Consistently
Common patterns:
- object-level checks (can user see object?)
- field-level checks (can user see specific field?)
- tenant boundary checks (multi-tenant isolation)

Implementation notes:
- authorization must run on the server
- never trust client-side filtering

---

## Pagination

### Prefer Cursor Pagination
Cursor pagination yields stable pagination under inserts/updates.

Example pattern:

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

## Performance: Avoid N+1 Queries

### Batching & Caching
Use DataLoader (or equivalent):
- batch keys per request
- cache results per request context

Operationally:
- ensure loaders do not leak cache across requests
- set max batch sizes/timeouts if needed

---

## Caching Strategy

Caching options:
- response caching (be careful: auth affects output)
- persisted queries (reduce parsing/validation overhead)
- server-side caching for specific resolvers (e.g., public content)

Rule:
- never serve cached data across users unless authorization and cache keying are correct

---

## Safety Controls (Must-Have)

### Complexity / Depth Limiting
Prevent expensive queries by limiting:
- query depth
- field count / cost
- timeouts

### Rate Limiting
Apply at gateway/server:
- per API key/user
- per IP (optional)
- separate limits for read vs expensive mutations

### Query Timeouts & Cancellation
- ensure resolvers respect cancellation
- enforce timeouts on outbound calls

---

## Testing GraphQL

### Schema Tests
- validate schema changes don’t break contract
- snapshot expected SDL outputs (optional)

### Resolver Tests
- unit test service calls with mocked repositories
- integration test authorization behavior

### Query/Mutation Tests
- execute real queries against test server
- validate response shape and errors format

---

## Error Handling

### Consistent Error Format
GraphQL errors typically include:
- `message`
- `path`
- `extensions` (custom fields)

Guidelines:
- avoid leaking sensitive data in error messages
- include stable error codes in `extensions.code`

Example error extensions:
```json
{
  "extensions": {
    "code": "UNAUTHORIZED",
    "details": { "reason": "missing scope" }
  }
}
```

---

## Observability

Track:
- request counts and error rates
- resolver timings (especially slow fields)
- query complexity distribution
- top expensive operations (by cost metrics)

---

## Implementation Checklist

- [ ] Schema is designed intentionally (types/input types/enums)
- [ ] Resolvers are thin and call service/use-case layer
- [ ] Authorization enforced server-side for objects/fields
- [ ] Pagination is cursor-based (when applicable)
- [ ] N+1 problems mitigated with batching (DataLoader)
- [ ] Complexity/depth limits and query timeouts exist
- [ ] Rate limiting is configured
- [ ] Errors are stable and safe (no sensitive leaks)
- [ ] Tests cover schema + resolver behavior
- [ ] Observability includes resolver performance metrics

---

## Limitations

- GraphQL safety/complexity controls must be implemented deliberately
- Performance depends heavily on resolver implementation and data access patterns

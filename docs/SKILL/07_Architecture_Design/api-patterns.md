---
name: api-patterns
description: API design patterns skill. Covers REST conventions, versioning, pagination, filtering, idempotency, error handling, authentication/authorization, and contract consistency.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# API Patterns

## Overview

API patterns are reusable design approaches that help teams build consistent, evolvable, and operationally friendly APIs.

This skill covers:
- REST conventions (and how to apply them pragmatically)
- Resource modeling and URL design
- Pagination, filtering, sorting
- Versioning strategies
- Idempotency and safe retries
- Error response design
- Authentication/authorization integration
- Contract consistency and change management

---

## When to Use

Use this skill when:
- Building a new API from scratch
- Standardizing API styles across services
- Improving reliability (retries, idempotency)
- Reducing client integration friction
- Making APIs easier to version and evolve

---

## 1. Resource Modeling & URL Design

### Prefer Resource-Oriented URLs
- Treat URLs as resource identifiers
- Use nouns, not verbs

Good:
- `GET /users`
- `GET /users/{userId}`
- `POST /users`

Avoid:
- `GET /getUsers`
- `POST /createUser`

### Use Proper HTTP Methods
- `GET` => read (safe)
- `POST` => create or custom actions
- `PUT` => full replace
- `PATCH` => partial update
- `DELETE` => remove

### Avoid “action verbs” in paths (except where justified)
If you must model actions, prefer:
- `POST /orders/{id}/cancel`
instead of
- `POST /cancelOrder`

---

## 2. Pagination Patterns

### Choose Pagination Strategy
Common options:
- **Offset pagination** (`page`, `size`) — simple but fragile under changing data
- **Cursor pagination** (`cursor`, `limit`) — stable under inserts/updates
- **Keyset pagination** — cursor-like using indexed keys

Cursor pagination is often best for user-facing feeds.

### Pagination Response Shape
Include metadata:

- `items[]`
- `nextCursor` (or `hasMore`)
- `limit`
- optional `totalCount` (only if cheap/reliable)

Example:
```json
{
  "items": [
    { "id": "u1", "name": "Alice" }
  ],
  "limit": 20,
  "nextCursor": "eyJpZCI6..."
}
```

---

## 3. Filtering / Sorting

### Filtering via Query Parameters
Examples:
- `GET /orders?status=PAID`
- `GET /orders?createdAfter=2026-01-01`

### Sorting
- `sort=createdAt:desc`
or multiple:
- `sort=createdAt:desc&sort=id:asc`

### Avoid Arbitrary SQL
Validate query parameters:
- allowed fields
- allowed operators
- max limits

---

## 4. Idempotency & Safe Retries

### When to Use Idempotency
- payment endpoints
- order placement
- “create” requests that must not duplicate work

### Idempotency Key Header
Use a header like:
- `Idempotency-Key: <uuid>`

Rules:
- same key + same request body => same result
- different key => new processing
- store outcomes for a retention window

---

## 5. Error Handling Patterns

### Consistent Error Format
Return a structured error body, for example:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid request",
    "details": [
      { "field": "email", "reason": "must be a valid address" }
    ]
  }
}
```

### HTTP Status Code Discipline
- `400` => malformed input / validation errors
- `401` => unauthenticated
- `403` => unauthorized
- `404` => not found
- `409` => conflict (state mismatch)
- `422` => semantic validation (optional, many teams use)
- `429` => rate limit
- `500` => unexpected failures

### Problem Details (RFC 7807) (Optional)
If you use it, ensure your `type`, `title`, `status`, and `detail` are consistent.

---

## 6. Authentication & Authorization Integration

### Separate Concerns
- Authentication: who you are
- Authorization: what you can do

### Prefer Scopes / Roles
Examples:
- `scope: orders:read`
- role-based checks for admin capabilities

### Always Validate
- token expiry
- audience/issuer (if JWT)
- permissions per endpoint and method

---

## 7. Versioning Strategies

### Common Approaches
- **URI versioning**: `/v1/users`
- **Header versioning**: `Accept: application/vnd.api+json;version=1`
- **Deprecation-driven evolution**: keep backward-compatible responses and mark fields deprecated

Recommendation:
- Use versioning when breaking changes are expected
- Otherwise evolve via backward-compatible changes + deprecation

### Add Deprecation Metadata
- response header like `Deprecation` or a warning field
- public changelog
- sunset timelines

---

## 8. API Contracts & Change Management

### Use OpenAPI / Contract-First
- generate SDKs
- validate server responses
- enforce schema compatibility

### Backward Compatibility Rules
- never remove fields without versioning
- keep field names stable
- make new fields optional when possible

---

## Implementation Checklist

- [ ] Resource naming uses nouns and clear identifiers
- [ ] HTTP methods match intent (safe vs unsafe)
- [ ] Pagination strategy is chosen and documented
- [ ] Filtering/sorting is validated and bounded
- [ ] Idempotency keys supported for critical create/submit endpoints
- [ ] Error responses are consistent and machine-readable
- [ ] AuthN/AuthZ are enforced consistently
- [ ] Versioning and deprecation policy is documented
- [ ] OpenAPI/contract tooling is used to validate changes

---

## Limitations

- No single standard fits every domain; apply principles pragmatically
- Contracts require discipline to keep consistent over time

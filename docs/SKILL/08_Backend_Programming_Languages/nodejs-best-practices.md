---
name: nodejs-best-practices
description: Node.js best practices skill. Covers project structure, async patterns, error handling, security basics, testing, performance, and production hardening.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Node.js Best Practices

## Overview

Node.js is great for I/O-heavy workloads, but production reliability depends on disciplined patterns.

This skill covers production-ready Node.js practices:
- project structure and module boundaries
- async/await and error handling
- input validation and security basics
- logging and observability
- testing strategy
- performance and reliability hardening

---

## When to Use

- Building backend services in Node.js
- Creating REST/GraphQL APIs
- Need consistent engineering standards across projects
- Improving performance and reducing production incidents

---

## Core Concepts

### 1) Project Structure

Common structure:

```text
src/
  app/
    server.js
  routes/
    users.js
  controllers/
  services/
  repositories/
  middleware/
  utils/
tests/
config/
```

Rules:
- separate routing vs controller/service logic
- keep side effects (DB, network) in repository/infrastructure layers
- avoid “fat” route handlers

---

## 2) Async/Await Patterns

### Prefer async/await over promise chains
- clearer control flow
- easier error handling

Example:

```js
app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await userService.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'not_found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});
```

### Centralized Async Error Handling
Use a wrapper (or framework features) to avoid repeating try/catch in every route.

---

## 3) Error Handling Convention

### Define an Error Shape
Use an error object pattern:

- `code` (stable machine-readable)
- `message` (safe for clients)
- `status` (HTTP status)
- `details` (optional)

Example:

```js
class AppError extends Error {
  constructor({ code, message, status, details }) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
```

### Global Error Middleware
Ensure every error maps to a consistent response:
- correct HTTP status
- no stack traces in production responses
- log stack trace internally

---

## 4) Input Validation

Always validate external input:
- request body
- query params
- headers
- path variables

Prefer schema validation libraries and fail fast with clear 400 responses.

---

## 5) Security Basics (Minimum Viable)

### AuthN/AuthZ
- verify tokens/signatures
- enforce authorization checks per resource/operation

### Rate Limiting
- protect expensive endpoints
- reduce brute force and abuse impact

### Headers
- `helmet`-style hardening (CSP/No sniff/etc.)
- CORS allowlist
- avoid permissive wildcard policies

### Secrets Management
- never commit secrets
- read from environment/secret manager

---

## 6) Logging & Observability

### Structured Logging
Log JSON with consistent fields:
- `timestamp`
- `level`
- `requestId` / `traceId`
- `service`
- `message`
- `errorCode` (if applicable)

### Metrics
At minimum track:
- request count
- latency (p95/p99)
- error rate
- saturation indicators (queue length, event loop lag)

### Tracing (Optional but powerful)
Adopt OpenTelemetry to connect logs, metrics, traces.

---

## 7) Performance & Reliability

### Avoid blocking the event loop
- no heavy CPU work in request handlers
- use worker threads or external services for CPU-bound tasks

### Timeouts everywhere
- DB/HTTP client timeouts
- request timeouts / abort controllers

### Backpressure
- limit concurrency per endpoint
- reject early when overloaded (HTTP 429/503)

---

## 8) Testing Strategy

### Unit Tests
- services/controllers logic
- validation functions
- pure utilities

### Integration Tests
- real HTTP server with test DB
- contract-level response validation

### End-to-End (Optional)
- smoke tests for critical paths

---

## Implementation Checklist

- [ ] Clear layering (routes vs services vs repositories)
- [ ] Centralized and consistent error handling
- [ ] Input validation is enforced on every external boundary
- [ ] Security basics are implemented (auth, rate limits, headers)
- [ ] Structured logging includes request/trace identifiers
- [ ] Timeouts and backpressure prevent resource exhaustion
- [ ] Tests cover unit + integration boundaries
- [ ] Performance verified (no event loop blocking in hot paths)

---

## Limitations

- Node.js concurrency requires careful avoidance of CPU-bound blocking
- Production hardening is framework-dependent (Express/Fastify/NestJS, etc.)

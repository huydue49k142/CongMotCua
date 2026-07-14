---
name: csharp-pro
description: C# production-ready skill. Covers .NET project architecture, async/await, error handling, DI, testing, performance, and production hardening.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# C# Pro (.NET Production Ready)

## Overview

C#/.NET is a mature platform for backend services. Production readiness comes from disciplined architecture, correct async usage, strong error handling, and operational hardening.

This skill covers:
- practical .NET project structure
- dependency injection patterns
- async/await and cancellation
- error handling and consistent API errors
- testing strategy (unit/integration)
- performance, profiling, and benchmarking
- production hardening (timeouts, retries, observability)

---

## When to Use

- Building backend services and APIs with .NET
- Designing maintainable service architectures for teams
- Needing reliable async and cancellation behavior
- Establishing engineering standards for production hardening

---

## Core Concepts

### 1) Project / Solution Structure

A typical architecture using layered folders/projects:

- `Api/` (controllers/endpoints)
- `Application/` (use cases, orchestration)
- `Domain/` (entities, aggregates, invariants)
- `Infrastructure/` (DB, external services, messaging)
- `Tests/` (unit + integration)

Guidance:
- keep controllers thin
- keep domain free from infrastructure concerns
- wire everything in a composition root (e.g., `Program.cs`)

---

### 2) Dependency Injection (DI)

Use constructor injection:

```csharp
public class UsersController : ControllerBase
{
    private readonly IUserService _users;

    public UsersController(IUserService users)
    {
        _users = users;
    }
}
```

Rules:
- prefer interfaces for dependencies
- keep service lifetimes intentional:
  - `Singleton` for stateless/threads-safe services
  - `Scoped` for per-request dependencies
  - `Transient` for lightweight objects

---

### 3) Async/Await and Cancellation

Always pass `CancellationToken` for operations that can be cancelled:

```csharp
public async Task<UserDto> GetUserAsync(string id, CancellationToken ct)
{
    var user = await _repo.GetByIdAsync(id, ct);
    return _mapper.Map<UserDto>(user);
}
```

Checklist:
- never use `.Result` / `.Wait()` in request paths
- avoid blocking calls inside async methods
- use timeouts for external calls (HTTP/DB clients)

---

### 4) Error Handling

### Consistent API Error Shape
Return stable machine-readable errors:

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

Implementation practice:
- use global exception middleware/handlers
- map domain/application errors to HTTP status codes
- log exceptions with correlation identifiers, but do not leak sensitive data to clients

---

### 5) Resilience Patterns

- **Timeouts** on outbound calls
- **Retries** with exponential backoff + jitter for idempotent operations
- **Circuit breaker** to stop cascading failures
- **Bulkheads** to isolate resource usage

---

## Testing Strategy

### Unit Tests
- domain and application logic
- validate invariants and error mapping

### Integration Tests
- test API endpoints with a real test host and test DB (or containers)
- verify serialization, auth, and persistence behaviors

---

## Observability

Minimum:
- structured logs
- request latency metrics
- error rate metrics

Optional:
- distributed tracing (OpenTelemetry)
- correlation IDs propagated through logs/headers

---

## Implementation Checklist

- [ ] Controllers/endpoints are thin
- [ ] Domain contains invariants and has no infrastructure dependencies
- [ ] DI is consistent and uses appropriate lifetimes
- [ ] Async operations use cancellation tokens
- [ ] Global error handling returns stable error contracts
- [ ] Resilience patterns (timeouts/retries/circuit breaker) are applied where appropriate
- [ ] Unit + integration tests exist for critical paths
- [ ] Observability includes logs + metrics (and optional traces)

---

## Limitations

- Production readiness depends on the rest of the stack (Kestrel settings, hosting, DB, auth)
- Async correctness requires careful review and load testing

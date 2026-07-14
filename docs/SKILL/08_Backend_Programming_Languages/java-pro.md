---
name: java-pro
description: Java production-ready skill. Covers JVM concepts, concurrency, error handling, project structure, testing, performance, and production hardening for enterprise services.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Java Pro (Production-Ready Java)

## Overview

Java powers a large ecosystem of backend services and enterprise systems. This skill covers practical production-grade Java practices:
- JVM fundamentals
- project structure and layering
- concurrency and thread safety
- robust error handling
- testing strategy (unit/integration)
- performance tuning and profiling
- production hardening (timeouts, retries, observability)

---

## When to Use

- Building backend services in Java
- Designing concurrent server-side components
- Needing reliable error handling and consistent API behavior
- Performance-sensitive applications running on the JVM
- Teams adopting standard engineering practices for production

---

## Core Concepts

### 1) JVM Fundamentals (Practical)

Focus on the things that affect production behavior:

- **Garbage Collection**: pause times and throughput tradeoffs
- **Heap sizing** and memory pressure
- **Thread behavior** and synchronization overhead
- **Class loading** and startup time implications

Checklist:
- monitor heap usage, GC time, and allocation rates
- keep thread pools bounded
- ensure you understand which objects dominate memory

---

## 2) Project Structure & Layering

Recommended layering (adapt to your stack):

- **API layer**: controllers/handlers
- **Service layer**: business use-cases
- **Domain layer**: entities/value objects/invariants
- **Data access layer**: repositories/clients
- **Infrastructure**: messaging/HTTP clients/DB implementations

Rules:
- controllers should not contain business logic
- domain should not depend on infrastructure
- data access should be the boundary for persistence concerns

---

## 3) Error Handling

### Prefer Exceptions with Meaning
- use specific exceptions for predictable failures
- map exceptions to consistent API error responses

### Avoid Catch-All Patterns
- catch exceptions you can handle
- let unexpected failures bubble to global error handlers

### Design Error Payloads
- stable error codes
- clear message
- details only when safe and useful

Example error mapping (pseudo):
```text
ValidationError -> 400
AuthError -> 401/403
NotFound -> 404
Conflict -> 409
DownstreamError -> 502/503
```

---

## 4) Concurrency & Thread Safety

Production server code is concurrent by default.

### ExecutorService / Thread Pools
- do not create unbounded threads
- configure pool sizes based on CPU + I/O characteristics
- always set reasonable queue limits

### Avoid Shared Mutable State
- prefer immutable objects
- synchronize only when necessary
- use concurrent collections when appropriate

### CompletableFuture (Async Flows)
- combine futures safely
- handle exceptions with `exceptionally/handle`
- avoid blocking `.get()` in request threads unless you must

---

## 5) Testing Strategy

### Unit Tests
- focus on domain/service logic
- use mocks sparingly (mock external boundaries, not behavior)

### Integration Tests
- test real persistence and HTTP flows using test containers / staging databases
- verify contracts, serialization, and error mapping

### Contract Testing (Optional)
- if you interact with other services, use contract tests to prevent breaking changes

---

## 6) Performance Tuning & Profiling

### Measure First
- use profiling tools (JFR, async-profiler, etc.)
- identify bottlenecks (CPU, lock contention, GC)

### GC and Allocation Awareness
- reduce allocation in hot paths
- avoid excessive boxing/unboxing
- be careful with large collections retained longer than needed

### Thread Pool Saturation
- track queue length and active threads
- reject or shed load early when saturation is detected

---

## 7) Production Hardening

### Timeouts Everywhere
- HTTP client timeouts
- DB query timeouts
- message consumer timeouts
- circuit breaker integration

### Retries with Discipline
- retry only idempotent operations
- use exponential backoff + jitter
- stop retrying after max attempts

### Graceful Shutdown
- stop accepting new requests
- finish in-flight work within deadlines
- close resources

---

## Implementation Checklist

- [ ] Layering keeps controllers thin and domain clean
- [ ] Error handling is consistent and mapped to stable API codes
- [ ] Concurrency uses bounded executors and avoids shared mutable state
- [ ] Tests cover unit + integration boundaries
- [ ] Production observability exists (logs, metrics, tracing)
- [ ] Timeouts and retries follow safe patterns
- [ ] Profiling informs performance changes
- [ ] Graceful shutdown is implemented

---

## Limitations

- Production reliability requires stack-specific configuration (framework, container, JVM flags)
- Concurrency bugs are subtle; test and review carefully

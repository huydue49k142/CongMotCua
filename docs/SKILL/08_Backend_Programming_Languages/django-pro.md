---
name: django-pro
description: Django pro skill. Covers production-ready Django patterns: project structure, ORM best practices, caching, auth/security, async considerations, testing, and observability.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Django Pro

## Overview

Django is a full-featured Python web framework. Production-grade Django requires disciplined patterns for:
- project structure
- ORM efficiency
- authentication and authorization
- caching and performance
- safe handling of async/WSGI concerns
- testing strategy
- observability and reliability hardening

---

## When to Use

- Building production web apps in Django
- Need strong admin, ORM, migrations, and batteries-included ecosystem
- Teams want consistent backend conventions and maintainability

---

## Core Concepts

### 1) Project Structure

A typical production-friendly layout:

```text
config/                  # project settings
  settings/
    base.py
    dev.py
    prod.py
apps/
  accounts/
    models.py
    views.py
    urls.py
    services.py
  catalog/
    models.py
    views.py
    urls.py
templates/
static/
tests/
scripts/
manage.py
```

Rules:
- keep settings modular
- keep views thin; move business logic to services
- avoid fat models (but models should be authoritative for persistence rules)

---

## 2) ORM Best Practices

### Avoid N+1 Queries
- always inspect query counts
- use `select_related` for foreign keys
- use `prefetch_related` for many-to-many / reverse relations

### Prefer QuerySet Composition
Build querysets incrementally and let Django optimize.

### Use Indexes for Hot Paths
- add indexes for fields used in filters/sorts
- understand composite indexes when needed

### Don’t Load Unbounded Result Sets
- use pagination
- limit fields with `.only()` / `.values()` where appropriate

---

## 3) Authentication & Security

### Use Django Auth Properly
- rely on built-in password hashing
- use proper session/cookie settings
- enforce secure defaults in production

### Authorization Checks
- validate permissions at the boundary (views/handlers)
- avoid relying only on UI hiding

### CSRF / CORS / Headers
- ensure CSRF protection where applicable
- configure CORS allowlists
- add security headers (e.g., via middleware)

---

## 4) Caching & Performance

### Cache What’s Expensive
- expensive queries
- computed aggregates
- external API responses (with proper invalidation/TTL)

### Cache Invalidation Strategy
Pick a strategy:
- TTL-based
- event-driven invalidation
- write-through updates

Avoid stale caching that breaks authorization boundaries.

---

## 5) Async Considerations

Django can support async views in newer versions, but production must respect:
- use async only where I/O bound
- ensure your DB driver supports async properly
- test concurrency behavior under load

Rule of thumb:
- keep async usage intentional
- don’t mix patterns accidentally in hot paths

---

## 6) Testing Strategy

### Unit Tests
- test domain/service logic
- validate permissions and authorization helpers

### Integration Tests
- test views/handlers with Django test client
- test ORM behavior with a test database

### Performance Tests (Optional but Valuable)
- measure query count and latency for critical endpoints

---

## 7) Observability

Minimum production signals:
- structured logs
- request timing (latency histograms)
- error rate
- database query timing
- cache hit/miss rates

Prefer:
- OpenTelemetry-compatible tracing when available
- middleware-based instrumentation for request/response metrics

---

## Implementation Checklist

- [ ] View/handler logic is thin; business logic is in services
- [ ] ORM queries are optimized (no N+1)
- [ ] Pagination/limits are applied
- [ ] Authentication and authorization are enforced correctly
- [ ] Security headers/CSRF/CORS are configured appropriately
- [ ] Caching is used safely with invalidation/TTL strategy
- [ ] Testing covers unit + integration boundaries
- [ ] Observability includes logs, metrics, and (optional) traces

---

## Limitations

- Django provides defaults, but performance still depends on ORM discipline
- Async usage requires careful validation for your specific stack

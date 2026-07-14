---
name: fastapi-pro
description: FastAPI pro skill. Covers production-ready FastAPI apps: dependency injection, security, background tasks, pagination, validation, testing, and observability.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# FastAPI Pro

## Overview

FastAPI is a modern, fast Python web framework built around type hints and Pydantic validation.

This skill focuses on production-ready FastAPI patterns:
- application structure
- dependency injection with `Depends`
- validation and serialization
- security (authn/authz) integration
- pagination, filtering, and consistent responses
- background tasks and async best practices
- testing, documentation, and observability

---

## When to Use

- Building HTTP APIs in Python
- Needing fast validation via Pydantic
- Designing OpenAPI/Swagger contracts automatically
- Creating async endpoints for I/O-heavy workloads
- Production hardening (logging, security, tests)

---

## Core Concepts

### 1) Project Structure

Recommended layout:

- `app/` application code
- `routers/` API route modules
- `services/` business logic
- `repositories/` data access
- `schemas/` Pydantic models (request/response DTOs)
- `dependencies/` shared DI providers
- `tests/` integration/unit tests

---

## 2) Dependencies (`Depends`)

### Dependency Provider Pattern
```python
from fastapi import Depends

def get_settings():
    return {"jwt_secret": "..."}

def auth_dependency(settings=Depends(get_settings)):
    return settings

@app.get("/secure")
def secure_endpoint(auth=Depends(auth_dependency)):
    return {"ok": True}
```

Prefer:
- small, testable dependency providers
- pure functions for providers where possible
- request-scoped dependencies for per-request context

---

## 3) Validation with Pydantic

### Request Schemas
```python
from pydantic import BaseModel, EmailStr, Field

class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
```

Use:
- `Field` constraints
- regex/pattern validations
- `constr`, `conint` when needed
- `model_config` for consistent behavior

---

## 4) Consistent Response Design

Use explicit response models to stabilize contracts:
- always define output DTOs
- avoid returning raw ORM objects directly
- keep error responses structured

---

## 5) Pagination / Filtering

### Simple Pagination Model
```python
from pydantic import BaseModel

class Pagination(BaseModel):
    limit: int = 20
    offset: int = 0
```

Best practices:
- enforce max `limit`
- default to stable ordering (e.g., `created_at desc`)
- include pagination metadata in responses

---

## 6) Security Integration

Common approaches:
- OAuth2 password flow / bearer tokens
- JWT validation (signature + claims)
- API keys for internal services

Checklist:
- validate token signature
- enforce audience/issuer (if using JWT)
- check roles/permissions per endpoint
- keep secrets in environment/config, not code

---

## 7) Background Tasks & Async

### Use BackgroundTasks for Post-Response Work
```python
from fastapi import BackgroundTasks

def notify_user(email: str):
    # send email, publish event, etc.
    ...

@app.post("/signup")
def signup(payload: dict, bg: BackgroundTasks):
    # create user
    bg.add_task(notify_user, payload["email"])
    return {"status": "created"}
```

Guidelines:
- keep background tasks short
- for heavy jobs, use a queue (Celery/RQ/etc.)

---

## 8) Error Handling

### Global Exception Handler
Implement application-wide handlers for:
- validation / domain errors
- auth errors
- unexpected exceptions

Keep:
- machine-readable error codes
- user-friendly messages
- structured `details` when relevant

---

## 9) Testing

### Unit Tests
- test services and schemas
- test dependency providers in isolation

### Integration Tests
- use `TestClient` for HTTP layer
- mock repositories/external systems

Example approach:
- start app
- call endpoints
- assert response codes and schemas

---

## 10) Observability

Add:
- structured logging (request id / correlation id)
- metrics (latency, error rate)
- tracing for distributed systems

---

## Implementation Checklist

- [ ] Clear separation: routers vs services vs repositories
- [ ] Pydantic schemas for request/response contracts
- [ ] Dependency injection via `Depends`
- [ ] Security implemented (authn/authz) consistently
- [ ] Pagination/filtering supported with bounds
- [ ] Background tasks used appropriately (short + safe)
- [ ] Global error handling with stable response format
- [ ] Unit + integration tests present
- [ ] Logging/metrics/tracing integrated

---

## Limitations

- Async endpoints help I/O-bound workloads; don’t assume CPU-bound speedups
- Production hardening requires careful security review

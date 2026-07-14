---
name: php-pro
description: PHP production-ready skill. Covers modern PHP practices, OOP, error handling, dependency injection patterns, security basics, testing, performance, and deployment hardening.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# PHP Pro (Production-Ready PHP)

## Overview

PHP powers many production systems. Production readiness comes from strong engineering practices:
- clean OOP design and maintainable architecture
- consistent error handling
- security hardening (auth, validation, secure headers)
- correct testing strategy
- performance awareness (caching, avoiding bottlenecks)
- reliable deployment and operational discipline

---

## When to Use

- Building backend services and APIs in PHP
- Using modern PHP (namespaces, strict types, traits carefully)
- Need consistent patterns across projects and teams
- Want secure and testable code, not just “it works”

---

## Core Concepts

### 1) Modern PHP Style

Prefer:
- namespaces
- strict typing (`declare(strict_types=1);`)
- small classes with clear responsibilities
- immutable value objects when possible

Example:

```php
<?php
declare(strict_types=1);

namespace App\Domain;

final class Email {
    public function __construct(private string $value) {
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Invalid email');
        }
    }

    public function value(): string {
        return $this->value;
    }
}
```

---

### 2) Architecture & Layering

Recommended separation:
- **Domain**: business rules, invariants (no framework dependencies)
- **Application**: use-cases / orchestration
- **Infrastructure**: DB, HTTP clients, queues, external systems
- **Interface/Transport**: controllers/handlers (HTTP, CLI)

Rules:
- keep controllers thin
- keep domain free of persistence/framework concerns
- wire dependencies in a composition root (framework config / container)

---

### 3) Dependency Injection (DI)

Prefer constructor injection and interface-based dependencies.

```php
interface UserRepository {
    public function findById(string $id): ?User;
}

final class UserService {
    public function __construct(private UserRepository $repo) {}

    public function getUser(string $id): User {
        $user = $this->repo->findById($id);
        if ($user === null) throw new \RuntimeException('User not found');
        return $user;
    }
}
```

---

### 4) Error Handling

Use exceptions for unexpected failures and return stable error responses at boundaries.

Guidelines:
- catch and map exceptions only at transport boundary (controllers/middleware)
- do not leak sensitive info (SQL, secrets, stack traces) in production responses
- define consistent API error shape (code/message/details)

Example error payload:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid request",
    "details": [{ "field": "email", "reason": "must be a valid address" }]
  }
}
```

---

### 5) Security Basics (Minimum Viable)

Checklist:
- input validation and output escaping (XSS prevention)
- CSRF protection where cookies/sessions are used
- SQL injection prevention (prepared statements / ORM)
- secure authentication (hash passwords with modern algorithms, enforce rate limits)
- authorization checks on every sensitive endpoint
- secure headers (CSP, HSTS, etc.) via middleware

---

### 6) Testing Strategy

Unit tests:
- domain logic
- services/use-cases with mocked repositories

Integration tests:
- HTTP endpoints using test server
- DB interactions with dedicated test database/containers
- auth flows

Prefer:
- contract tests for API response shapes
- regression tests for bug fixes

---

### 7) Performance & Operational Concerns

- cache expensive computations and external API results
- avoid N+1 query patterns
- ensure DB queries are indexed for hot paths
- add timeouts to outbound network calls
- use background jobs for heavy/slow tasks

Observability:
- structured logs
- request IDs/correlation IDs
- error rate and latency monitoring

---

## Implementation Checklist

- [ ] Code uses strict types and modern PHP practices
- [ ] Clear layering (domain vs application vs infrastructure)
- [ ] DI is used consistently (constructor injection)
- [ ] Error handling returns stable API error contracts
- [ ] Security checks exist (authn/authz, validation, XSS/SQLi protections)
- [ ] Tests exist (unit + integration) for critical paths
- [ ] Performance is addressed (caching, query discipline, timeouts)
- [ ] Logging/observability is in place

---

## Limitations

- “Production-ready” depends on the framework ecosystem (Symfony/Laravel/other)
- Ensure your hosting/runtime (PHP-FPM/NGINX) is tuned and monitored

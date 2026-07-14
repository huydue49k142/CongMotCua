---
name: api-security-testing
description: API security testing workflow for REST and GraphQL APIs covering authentication, authorization, rate limiting, input validation, and security best practices.
---

# API Security Testing

## Overview

API security testing workflow for REST and GraphQL APIs covering authentication, authorization, rate limiting, input validation, and security best practices.

## When to Use

- Testing REST API security
- Assessing GraphQL endpoints
- Validating API authentication
- Testing API rate limiting
- Bug bounty API testing
- Security audits

## Testing Phases

### Phase 1: API Discovery

1. Enumerate endpoints
2. Document API methods
3. Identify parameters
4. Map data flows
5. Review documentation

**Tools:**
- Postman/Insomnia for manual exploration
- Swagger/OpenAPI specs
- API scanning tools

### Phase 2: Authentication Testing

Test API key validation, JWT tokens, OAuth2 flows, token expiration, and refresh tokens.

**Checks:**
- [ ] API keys properly validated
- [ ] JWT signatures verified
- [ ] Token expiration enforced
- [ ] Refresh tokens rotated
- [ ] OAuth2 flows secure

### Phase 3: Authorization Testing

Test object-level authorization, function-level authorization, role-based access, privilege escalation, and multi-tenant isolation.

**Checks:**
- [ ] IDOR vulnerabilities tested
- [ ] Function-level access control
- [ ] Role-based access enforced
- [ ] No privilege escalation
- [ ] Multi-tenant data isolated

### Phase 4: Input Validation

Test parameter validation, SQL injection, NoSQL injection, command injection, and XXE injection.

**Checks:**
- [ ] SQL injection tested
- [ ] NoSQL injection tested
- [ ] Command injection tested
- [ ] XXE injection tested
- [ ] Input sanitization implemented

### Phase 5: Rate Limiting

Test rate limit headers, brute force protection, resource exhaustion, bypass techniques.

**Checks:**
- [ ] Rate limits enforced
- [ ] Brute force protection active
- [ ] Resource exhaustion prevented
- [ ] No bypass techniques found

### Phase 6: GraphQL Testing

Test introspection, query depth, query complexity, batch queries, field suggestions.

**Checks:**
- [ ] Introspection disabled in production
- [ ] Query depth limiting
- [ ] Query complexity analysis
- [ ] Batch query limits
- [ ] Field suggestions disabled

### Phase 7: Error Handling

Test error messages, information disclosure, stack traces, logging.

**Checks:**
- [ ] No sensitive data in errors
- [ ] Stack traces hidden
- [ ] Generic error messages
- [ ] Proper logging implemented

## Common Vulnerabilities

### Broken Authentication

```python
# ❌ Bad: Weak API key
api_key = "12345"

# ✅ Good: Strong API key
api_key = secrets.token_urlsafe(32)
```

### IDOR (Insecure Direct Object Reference)

```python
# ❌ Bad: No authorization check
@app.get("/api/orders/{order_id}")
def get_order(order_id: int):
    return db.get_order(order_id)

# ✅ Good: Verify ownership
@app.get("/api/orders/{order_id}")
def get_order(order_id: int, user: User):
    order = db.get_order(order_id)
    if order.user_id != user.id:
        raise HTTPException(403, "Not authorized")
    return order
```

### SQL Injection

```python
# ❌ Bad: String concatenation
query = f"SELECT * FROM users WHERE id = {user_id}"

# ✅ Good: Parameterized query
query = "SELECT * FROM users WHERE id = %s"
cursor.execute(query, (user_id,))
```

### Rate Limit Bypass

```python
# ❌ Bad: Client-controlled headers
if request.headers.get('X-RateLimit-Limit') == '1000':
    allow_request()

# ✅ Good: Server-side rate limiting
if redis.get(f"rate_limit:{user_id}") > LIMIT:
    raise HTTPException(429, "Rate limit exceeded")
```

## Testing Tools

### Automated Scanning

- **OWASP ZAP**: Open-source security scanner
- **Burp Suite**: Professional security testing
- **Postman**: API testing with security tests
- **k6**: Load testing with security scenarios

### Manual Testing

```bash
# Test for SQL injection
curl "https://api.example.com/users?id=1' OR '1'='1"

# Test for IDOR
curl "https://api.example.com/orders/1001" # Try accessing other user's order

# Test rate limiting
for i in {1..100}; do
  curl "https://api.example.com/api/endpoint"
done
```

## Security Headers

```python
# Implement security headers
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000"
    return response
```

## Best Practices

1. **Use HTTPS**: Always encrypt API traffic
2. **Validate all input**: Never trust client data
3. **Implement rate limiting**: Prevent abuse
4. **Use proper authentication**: OAuth2, JWT, API keys
5. **Authorization checks**: Verify permissions on every request
6. **Log security events**: Monitor for attacks
7. **Keep dependencies updated**: Patch vulnerabilities
8. **Use security headers**: Protect against common attacks

## Anti-Patterns

- **Trusting client input**: Always validate server-side
- **Weak authentication**: Use strong, proven methods
- **No rate limiting**: Vulnerable to DoS
- **Exposing stack traces**: Hide implementation details
- **Hardcoded secrets**: Use environment variables
- **No input sanitization**: SQL/NoSQL injection risk

## Verification

- [ ] Authentication tested
- [ ] Authorization tested
- [ ] Input validation tested
- [ ] Rate limiting configured
- [ ] Error handling secure
- [ ] Security headers implemented
- [ ] Logging enabled
- [ ] Vulnerability scan completed

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
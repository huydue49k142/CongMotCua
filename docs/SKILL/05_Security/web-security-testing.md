---
name: web-security-testing
description: "Web application security testing covering OWASP Top 10, penetration testing, vulnerability scanning, and security assessment techniques."
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Web Security Testing

Web application security testing covering OWASP Top 10, penetration testing, and vulnerability assessment.

## 🧠 Core Philosophy
> "Test security like an attacker thinks — find vulnerabilities before they do."

## When to Use
Use this skill when:
- **Testing web applications** for security vulnerabilities
- **Conducting penetration tests** on web apps
- **Validating security controls** and defenses
- **Assessing OWASP Top 10** compliance
- **Security auditing** before deployment

---

## 1. OWASP Top 10 Testing

### A01: Broken Access Control
```python
# Test for horizontal privilege escalation
def test_horizontal_access_control():
    # Login as user1
    user1_token = login("user1", "password")
    
    # Try to access user2's data
    response = get(f"/api/users/2/profile", headers={"Authorization": user1_token})
    
    # Should return 403 Forbidden
    assert response.status_code == 403

# Test for vertical privilege escalation
def test_vertical_access_control():
    # Login as regular user
    user_token = login("user", "password")
    
    # Try to access admin endpoint
    response = get(f"/api/admin/users", headers={"Authorization": user_token})
    
    # Should return 403 Forbidden
    assert response.status_code == 403
```

### A02: Cryptographic Failures
```python
# Test for sensitive data exposure
def test_sensitive_data_exposure():
    response = get("/api/users/1")
    data = response.json()
    
    # Check that sensitive data is not exposed
    assert "password" not in data
    assert "ssn" not in data
    assert "credit_card" not in data
    
    # Check that HTTPS is enforced
    assert response.url.startswith("https://")

# Test for weak encryption
def test_weak_encryption():
    # Check for MD5, SHA1 usage
    code = inspect.getsource(hash_function)
    assert "md5" not in code.lower()
    assert "sha1" not in code.lower()
```

### A03: Injection
```python
# SQL Injection
def test_sql_injection():
    payload = "' OR '1'='1"
    response = get(f"/api/users?name={payload}")
    
    # Should not return all users
    assert len(response.json()) == 0 or response.status_code == 400

# Command Injection
def test_command_injection():
    payload = "; ls -la"
    response = post("/api/process", {"filename": payload})
    
    # Should not execute command
    assert "Permission denied" in response.text or response.status_code == 400

# XSS
def test_xss():
    payload = "<script>alert('XSS')</script>"
    response = post("/api/comments", {"text": payload})
    
    # Script should be escaped
    assert "<script>" not in response.text
    assert "<script>" in response.text
```

### A04: Insecure Design
```python
# Test for business logic flaws
def test_business_logic():
    # Try to manipulate price in cart
    response = post("/api/cart/add", {
        "product_id": 1,
        "quantity": 1,
        "price": 0.01  # Manipulated price
    })
    
    # Should reject or use server-side price
    cart = response.json()
    assert cart["price"] != 0.01
```

### A05: Security Misconfiguration
```python
# Test for default credentials
def test_default_credentials():
    response = login("admin", "admin")
    assert response.status_code == 401

# Test for verbose error messages
def test_error_messages():
    response = get("/api/nonexistent")
    
    # Should not reveal stack trace or internal paths
    assert "Traceback" not in response.text
    assert "File "/" not in response.text
```

### A06: Vulnerable Components
```bash
# Check for known vulnerabilities
npm audit
pip check
snyk test

# Check dependency versions
npm outdated
pip list --outdated
```

### A07: Authentication Failures
```python
# Test for weak password policy
def test_weak_password():
    response = register("user", "123")
    assert response.status_code == 400
    assert "password too weak" in response.text.lower()

# Test for brute force protection
def test_brute_force():
    for i in range(10):
        response = login("admin", f"wrong_password_{i}")
        if i > 5:
            # Should be rate limited
            assert response.status_code == 429
```

### A08: Data Integrity Failures
```python
# Test for insecure deserialization
def test_insecure_deserialization():
    malicious_pickle = create_malicious_pickle()
    response = post("/api/deserialize", {"data": malicious_pickle})
    
    # Should reject malicious data
    assert response.status_code == 400
```

### A09: Logging Failures
```python
# Test for security event logging
def test_security_logging():
    response = login("user", "wrong_password")
    
    # Check that failed login is logged
    logs = get_logs()
    assert "Failed login attempt" in logs
    assert "user" in logs
```

### A10: SSRF
```python
# Test for SSRF
def test_ssrf():
    payload = "http://internal-server:8080/admin"
    response = post("/api/fetch-url", {"url": payload})
    
    # Should block internal URLs
    assert response.status_code == 400
    assert "internal" in response.text.lower()
```

## 2. Penetration Testing Tools

### Automated Scanning
```bash
# OWASP ZAP
zap-cli quick-scan --spider --self-contained

# Nikto
nikto -h https://example.com

# SQLMap
sqlmap -u "https://example.com/page?id=1" --batch

# Burp Suite
# Use Burp Proxy to intercept and modify requests
```

### Manual Testing Checklist
- [ ] Test all input fields for injection
- [ ] Test authentication and authorization
- [ ] Test session management
- [ ] Test for sensitive data exposure
- [ ] Test business logic flaws
- [ ] Test for SSRF, XXE, deserialization
- [ ] Test CORS configuration
- [ ] Test security headers

## 3. Security Headers

```python
# Required security headers
SECURITY_HEADERS = {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'self'",
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
}

def test_security_headers():
    response = get("/")
    
    for header, value in SECURITY_HEADERS.items():
        assert header in response.headers
        assert response.headers[header] == value
```

## 4. Authentication Testing

```python
# Test JWT security
def test_jwt_security():
    # Test with expired token
    expired_token = create_expired_token()
    response = get("/api/protected", headers={"Authorization": f"Bearer {expired_token}"})
    assert response.status_code == 401
    
    # Test with tampered token
    tampered_token = tamper_with_token(valid_token)
    response = get("/api/protected", headers={"Authorization": f"Bearer {tampered_token}"})
    assert response.status_code == 401
    
    # Test with no algorithm (alg: none)
    none_alg_token = create_none_alg_token()
    response = get("/api/protected", headers={"Authorization": f"Bearer {none_alg_token}"})
    assert response.status_code == 401
```

## 🛠️ Implementation Checklist
- [ ] Are all OWASP Top 10 vulnerabilities tested?
- [ ] Is input validation tested (injection, XSS)?
- [ ] Is authentication and authorization tested?
- [ ] Are security headers configured?
- [ ] Is sensitive data encrypted in transit and at rest?
- [ ] Are error messages generic (no stack traces)?
- [ ] Is there rate limiting and brute force protection?
- [ ] Are dependencies scanned for vulnerabilities?

## Limitations
- Automated scanners miss business logic flaws
- Manual testing is time-consuming
- This skill is not a substitute for professional penetration testing
- Security is a continuous process, not one-time testing
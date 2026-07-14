---
name: security-audit
description: "Comprehensive security audit covering OWASP Top 10, threat modeling, code review, and infrastructure security assessment."
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Security Audit

Comprehensive security audit covering OWASP Top 10, threat modeling, code review, and infrastructure security.

## 🧠 Core Philosophy
> "Security is not a feature — it's a property of the entire system. Think like an attacker, build like a defender."

## When to Use
Use this skill when:
- **Auditing applications** for security vulnerabilities
- **Reviewing code** for security issues
- **Implementing security best practices** in development
- **Conducting threat modeling** for new features
- **Preparing for security assessments** or penetration tests

---

## 1. OWASP Top 10 (2021)

| # | Vulnerability | Description | Prevention |
|---|---------------|-------------|------------|
| **A01** | Broken Access Control | Users can act outside their permissions | Implement proper authorization checks |
| **A02** | Cryptographic Failures | Sensitive data exposed | Encrypt data at rest and in transit |
| **A03** | Injection | SQL, NoSQL, OS command injection | Use parameterized queries, ORMs |
| **A04** | Insecure Design | Flawed architecture | Threat modeling, secure design patterns |
| **A05** | Security Misconfiguration | Default configs, verbose errors | Harden configurations, disable debug |
| **A06** | Vulnerable Components | Outdated dependencies | Dependency scanning, regular updates |
| **A07** | Authentication Failures | Weak passwords, session issues | MFA, secure session management |
| **A08** | Data Integrity Failures | Insecure deserialization | Validate all input, use signatures |
| **A09** | Logging Failures | Insufficient logging | Log security events, monitor logs |
| **A10** | SSRF | Server-side request forgery | Validate URLs, whitelist domains |

## 2. Authentication & Authorization

### JWT Best Practices
```python
import jwt
from datetime import datetime, timedelta

def create_access_token(user_id: int) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=1),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthenticationError("Token expired")
    except jwt.InvalidTokenError:
        raise AuthenticationError("Invalid token")
```

### Password Hashing
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

## 3. Input Validation

```python
import re
from pydantic import BaseModel, validator

class UserInput(BaseModel):
    username: str
    email: str
    age: int
    
    @validator('username')
    def validate_username(cls, v):
        if not re.match(r'^[a-zA-Z0-9_]{3,20}$', v):
            raise ValueError('Invalid username format')
        return v
    
    @validator('email')
    def validate_email(cls, v):
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v):
            raise ValueError('Invalid email format')
        return v
```

## 4. SQL Injection Prevention

```python
# ✅ Good: Parameterized queries
cursor.execute(
    "SELECT * FROM users WHERE email = %s",
    (user_email,)
)

# ✅ Good: ORM
user = session.query(User).filter(User.email == user_email).first()

# ❌ Bad: String concatenation
cursor.execute(f"SELECT * FROM users WHERE email = '{user_email}'")
```

## 5. XSS Prevention

```typescript
// ✅ Good: React auto-escapes
function Comment({ text }) {
  return <div>{text}</div>;  // Safe
}

// ❌ Bad: dangerouslySetInnerHTML
function Comment({ text }) {
  return <div dangerouslySetInnerHTML={{ __html: text }} />;  // Dangerous!
}
```

## 6. Security Headers

```python
from flask import Flask
from flask_talisman import Talisman

app = Flask(__name__)
Talisman(app, 
    force_https=True,
    strict_transport_security=True,
    content_security_policy={
        'default-src': "'self'",
        'script-src': "'self' 'unsafe-inline'",
    }
)
```

## 🛠️ Implementation Checklist
- [ ] Are all user inputs validated and sanitized?
- [ ] Is HTTPS enforced everywhere?
- [ ] Are passwords hashed with bcrypt/argon2?
- [ ] Is JWT used correctly (short expiry, secure storage)?
- [ ] Are SQL queries parameterized?
- [ ] Is output encoded to prevent XSS?
- [ ] Are security headers configured (CSP, HSTS, X-Frame-Options)?
- [ ] Are dependencies regularly scanned for vulnerabilities?
- [ ] Is error handling generic (no stack traces to users)?
- [ ] Is logging comprehensive for security events?

## Limitations
- Security is a continuous process, not a one-time audit
- This skill covers common vulnerabilities, not exhaustive testing
- Penetration testing requires specialized expertise
- Compliance requirements vary by industry and region
---
name: error-handling
description: "Master error handling patterns across languages including exceptions, Result types, error propagation, and graceful degradation to build resilient applications."
risk: safe
source: "Adapted from error-handling-patterns skill"
date_added: "2026-07-11"
---

# Error Handling Patterns

Master error handling patterns across languages including exceptions, Result types, error propagation, and graceful degradation.

## 🧠 Core Philosophy
> "Fail fast, fail clearly, and never let your users see a cryptic error message."

## When to Use
Use this skill when:
- **Implementing error handling** in new features
- **Designing error-resilient APIs**
- **Debugging production issues**
- **Improving application reliability**
- **Creating better error messages** for users and developers
- **Implementing retry and circuit breaker patterns**

---

## 1. Error Handling Philosophies

| Approach | Description | Best For |
|----------|-------------|----------|
| **Exceptions** | Traditional try-catch, disrupts control flow | Unexpected errors, exceptional conditions |
| **Result Types** | Explicit success/failure, functional approach | Expected errors, validation failures |
| **Error Codes** | C-style return values, requires discipline | Low-level systems, performance-critical code |

### When to Use Each
- **Exceptions**: Unexpected errors, exceptional conditions (e.g., database connection lost)
- **Result Types**: Expected errors, validation failures (e.g., invalid user input)
- **Panics/Crashes**: Unrecoverable errors, programming bugs (e.g., null pointer, out of memory)

## 2. Error Categories

### Recoverable Errors
Errors that can be handled gracefully without crashing:
- Network timeouts
- Missing files
- Invalid user input
- API rate limits
- Temporary service unavailability

### Unrecoverable Errors
Errors that indicate a fundamental problem:
- Out of memory
- Stack overflow
- Programming bugs (null pointer, etc.)
- Corrupted data

## 3. Best Practices

### 1. Fail Fast
Validate input early, fail quickly rather than propagating bad data.

```python
# ✅ Good — validate early
def process_order(order_id: str):
    if not order_id:
        raise ValidationError("Order ID is required")
    # ... proceed with processing

# ❌ Bad — fail later, harder to debug
def process_order(order_id: str):
    # ... 50 lines of code before realizing order_id is invalid
```

### 2. Preserve Context
Include stack traces, metadata, timestamps in errors.

```python
class ApplicationError(Exception):
    def __init__(self, message: str, code: str, status_code: int = 500, details: dict = None):
        super().__init__(message)
        self.code = code
        self.status_code = status_code
        self.details = details or {}
        self.timestamp = datetime.utcnow()
```

### 3. Meaningful Messages
Explain what happened and how to fix it.

```
✅ Good:   "Failed to connect to database 'orders'. Check that the database server is running."
❌ Bad:    "Error occurred"
❌ Bad:    "Something went wrong"
```

### 4. Handle at the Right Level
Catch errors where you can meaningfully handle them.

```python
async def fetch_user_orders(user_id: str):
    try:
        user = await getUser(userId)
        orders = await getOrders(user.id)
        return orders
    except NotFoundError:
        return []  # Return empty array for not found
    except NetworkError:
        return retry_fetch_orders(userId)  # Retry
    except Exception:
        raise  # Re-throw unexpected errors
```

### 5. Don't Swallow Errors
Log or re-throw — never silently ignore errors.

```python
# ❌ Bad — silently swallowed
try:
    await process_payment(order)
except Error:
    pass  # Error is lost forever!

# ✅ Good — log and re-throw
try:
    await process_payment(order)
except Error as e:
    logger.error(f"Payment failed for order {order.id}: {e}")
    raise PaymentError("Payment processing failed", order_id=order.id)
```

## 4. Universal Patterns

### Circuit Breaker
Prevent cascading failures in distributed systems.

```python
from enum import Enum
from datetime import datetime, timedelta

class CircuitState(Enum):
    CLOSED = "closed"       # Normal operation
    OPEN = "open"          # Failing, reject requests
    HALF_OPEN = "half_open"  # Testing if recovered

class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60, success_threshold=2):
        self.failure_threshold = failure_threshold
        self.timeout = timedelta(seconds=timeout)
        self.success_threshold = success_threshold
        self.failure_count = 0
        self.state = CircuitState.CLOSED
        self.last_failure_time = None

    def call(self, func):
        if self.state == CircuitState.OPEN:
            if datetime.now() - self.last_failure_time > self.timeout:
                self.state = CircuitState.HALF_OPEN
            else:
                raise Exception("Circuit breaker is OPEN")

        try:
            result = func()
            self.on_success()
            return result
        except Exception as e:
            self.on_failure()
            raise

    def on_success(self):
        self.failure_count = 0
        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1
            if self.success_count >= self.success_threshold:
                self.state = CircuitState.CLOSED

    def on_failure(self):
        self.failure_count += 1
        self.last_failure_time = datetime.now()
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN
```

### Graceful Degradation
Provide fallback functionality when errors occur.

```python
def with_fallback(primary, fallback):
    """Try primary function, fall back to fallback on error."""
    try:
        return primary()
    except Exception as e:
        logger.error(f"Primary function failed: {e}")
        return fallback()

# Usage: Cache-first with database fallback
def get_user_profile(user_id):
    return with_fallback(
        primary=lambda: fetch_from_cache(user_id),
        fallback=lambda: fetch_from_database(user_id)
    )
```

## 🛠️ Implementation Checklist
- [ ] Have I categorized errors as recoverable vs unrecoverable?
- [ ] Am I using the right approach (exceptions vs Result types) for each case?
- [ ] Is there a clear error hierarchy (base error → specific errors)?
- [ ] Do I fail fast on invalid input?
- [ ] Are error messages meaningful and actionable?
- [ ] Is context preserved (stack trace, metadata, timestamp)?
- [ ] Are resources properly cleaned up (try-finally, context managers)?
- [ ] Have I implemented retry with backoff for transient failures?
- [ ] Do I need a circuit breaker for external service calls?
- [ ] Are errors logged at the appropriate level?

## Limitations
- Error handling patterns vary by language and paradigm
- Over-engineering error handling can add unnecessary complexity
- This skill is not a substitute for environment-specific validation
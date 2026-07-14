---
name: systematic-debugging
description: "Systematic debugging methodology to efficiently diagnose and fix bugs. Covers root cause analysis, debugging strategies, and prevention techniques."
risk: safe
source: "obra/superpowers"
date_added: "2026-07-11"
---

# Systematic Debugging

Systematic debugging methodology to efficiently diagnose and fix bugs.

## 🧠 Core Philosophy
> "Debugging is not about guessing — it's about systematically eliminating possibilities until you find the root cause."

## When to Use
Use this skill when:
- **Investigating bugs** in production or development
- **Diagnosing performance issues** and slowdowns
- **Troubleshooting complex systems** with multiple components
- **Finding root causes** of intermittent issues
- **Preventing bugs** through better debugging practices

---

## 1. The Scientific Method of Debugging

```
1. OBSERVE: Gather evidence (logs, errors, symptoms)
2. HYPOTHESIZE: Form a theory about the cause
3. TEST: Design an experiment to prove/disprove
4. ANALYZE: Review results
5. ITERATE: Refine hypothesis or implement fix
```

## 2. Debugging Strategies

### Strategy 1: Binary Search (Divide and Conquer)
```python
# Find where the bug occurs by halving the search space
def debug_binary_search():
    # Test first half
    if test_first_half():
        # Bug is in first half
        debug_first_half()
    else:
        # Bug is in second half
        debug_second_half()
```

### Strategy 2: Rubber Duck Debugging
Explain the code line-by-line to someone else (or a rubber duck). Often you'll spot the issue while explaining.

### Strategy 3: Time Travel Debugging
```python
# Add checkpoints to trace execution
def process_order(order_id):
    logger.info(f"Starting process_order: {order_id}")
    
    order = get_order(order_id)
    logger.debug(f"Order retrieved: {order}")
    
    if not order:
        logger.error(f"Order not found: {order_id}")
        raise OrderNotFoundError()
    
    # Continue processing...
```

### Strategy 4: Minimal Reproduction
```python
# Strip away complexity to isolate the bug
def minimal_repro():
    # Start with just the failing component
    result = simple_function()
    
    # Add back pieces one at a time
    result = add_dependency(result)
    result = add_another_dependency(result)
    
    # Identify which addition caused the failure
```

## 3. Common Bug Patterns

### Off-by-One Errors
```python
# ❌ Bad: Off-by-one
for i in range(len(items) + 1):  # Will cause IndexError
    print(items[i])

# ✅ Good: Correct range
for i in range(len(items)):
    print(items[i])
```

### Null/None Handling
```python
# ❌ Bad: No null check
user = get_user(user_id)
print(user.name)  # AttributeError if user is None

# ✅ Good: Defensive programming
user = get_user(user_id)
if user is None:
    logger.error(f"User not found: {user_id}")
    return None
print(user.name)
```

### Race Conditions
```python
# ❌ Bad: Race condition
if not file_exists(path):
    create_file(path)  # Another thread might create it here

# ✅ Good: Atomic operation
try:
    create_file(path)
except FileExistsError:
    pass  # Already created
```

## 4. Debugging Tools

### Logging Best Practices
```python
import logging

logger = logging.getLogger(__name__)

# Levels: DEBUG < INFO < WARNING < ERROR < CRITICAL
logger.debug("Detailed info for debugging")
logger.info("Normal operation")
logger.warning("Unexpected but handled")
logger.error("Error occurred")
logger.critical("System failure")
```

### Assertions
```python
def calculate_discount(price, discount_percent):
    assert price > 0, "Price must be positive"
    assert 0 <= discount_percent <= 100, "Discount must be 0-100%"
    
    return price * (1 - discount_percent / 100)
```

### Debugger Usage
```python
# Python debugger (pdb)
import pdb

def buggy_function(x):
    pdb.set_trace()  # Breakpoint
    result = complex_calculation(x)
    return result

# In debugger:
# - n: next line
# - s: step into function
# - c: continue
# - p variable: print variable
# - q: quit
```

## 5. Root Cause Analysis

### The 5 Whys Technique
```
Problem: Server crashed
1. Why? → Out of memory
2. Why? → Memory leak in application
3. Why? → Connections not being closed
4. Why? → Missing finally block
5. Why? → Developer didn't know about the requirement
→ Root cause: Missing documentation/training
```

### Fishbone Diagram Categories
- **People**: Human error, lack of training
- **Process**: Missing procedures, poor practices
- **Technology**: Bugs, outdated libraries
- **Code**: Logic errors, edge cases

## 6. Prevention Strategies

| Strategy | Implementation |
|----------|----------------|
| **Type Safety** | Use TypeScript, mypy, type hints |
| **Testing** | Unit tests, integration tests, TDD |
| **Code Review** | Peer review before merge |
| **Linting** | ESLint, Pylint, RuboCop |
| **Monitoring** | Logging, metrics, alerts |
| **Documentation** | Clear comments, runbooks |

## 🛠️ Implementation Checklist
- [ ] Have I gathered all available evidence (logs, errors, metrics)?
- [ ] Can I reproduce the bug consistently?
- [ ] Have I formed a clear hypothesis?
- [ ] Have I designed a test to prove/disprove the hypothesis?
- [ ] Am I using version control to track changes?
- [ ] Have I checked for common patterns (null, off-by-one, race conditions)?
- [ ] Is the fix tested and verified?
- [ ] Have I documented the root cause and solution?

## Limitations
- Some bugs are intermittent and hard to reproduce
- Legacy code without tests is harder to debug
- Distributed systems require distributed tracing
- This skill is not a substitute for domain expertise
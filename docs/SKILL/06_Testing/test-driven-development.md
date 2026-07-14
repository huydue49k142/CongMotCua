---
name: test-driven-development
description: "Test-Driven Development (TDD) practice: write failing tests first, then production code, then refactor. Covers unit tests, integration tests, and testing patterns."
risk: safe
source: "obra/superpowers"
date_added: "2026-07-11"
---

# Test-Driven Development

Test-Driven Development (TDD) practice: write failing tests first, then production code, then refactor.

## 🧠 Core Philosophy
> "TDD is not about testing — it's about design. Tests force you to think about how your code will be used."

## When to Use
Use this skill when:
- **Implementing new features** with TDD approach
- **Refactoring legacy code** with test coverage
- **Designing APIs** with consumer-first thinking
- **Improving code quality** and reducing bugs
- **Building maintainable** and testable code

---

## 1. The TDD Cycle

```
RED → GREEN → REFACTOR

1. RED:    Write a failing test
2. GREEN:  Write minimal code to pass
3. REFACTOR: Improve code while keeping tests green
```

### Example: Building a Calculator

```python
# Step 1: RED - Write failing test
def test_add_two_numbers():
    calc = Calculator()
    assert calc.add(2, 3) == 5

# Step 2: GREEN - Minimal implementation
class Calculator:
    def add(self, a, b):
        return a + b

# Step 3: REFACTOR - Improve if needed
# (Already simple, no refactoring needed)

# Step 1: RED - Next test
def test_add_negative_numbers():
    calc = Calculator()
    assert calc.add(-1, 1) == 0
```

## 2. Testing Patterns

### Unit Tests
```python
import pytest

class TestUserService:
    def test_create_user_success(self):
        user = UserService.create_user("john@example.com", "password123")
        assert user.email == "john@example.com"
        assert user.id is not None
    
    def test_create_user_duplicate_email(self):
        UserService.create_user("john@example.com", "password123")
        with pytest.raises(DuplicateEmailError):
            UserService.create_user("john@example.com", "password456")
    
    def test_create_user_invalid_email(self):
        with pytest.raises(ValidationError):
            UserService.create_user("invalid-email", "password123")
```

### Mocking Dependencies
```python
from unittest.mock import Mock, patch

def test_send_welcome_email():
    # Mock the email service
    mock_email_service = Mock()
    
    user_service = UserService(email_service=mock_email_service)
    user = user_service.create_user("john@example.com", "password123")
    
    # Verify email was sent
    mock_email_service.send.assert_called_once_with(
        to="john@example.com",
        subject="Welcome!",
        template="welcome"
    )
```

### Fixtures
```python
@pytest.fixture
def sample_user():
    return User(
        id=1,
        email="test@example.com",
        name="Test User"
    )

def test_user_validation(sample_user):
    assert sample_user.is_valid()
    assert sample_user.email == "test@example.com"
```

## 3. Test Structure (AAA Pattern)

```python
def test_transfer_money():
    # Arrange - Set up test data
    source_account = Account(balance=1000)
    destination_account = Account(balance=500)
    transfer_service = TransferService()
    
    # Act - Execute the code under test
    transfer_service.transfer(source_account, destination_account, 200)
    
    # Assert - Verify the results
    assert source_account.balance == 800
    assert destination_account.balance == 700
```

## 4. Integration Tests

```python
def test_user_registration_flow():
    # Test the entire flow
    response = client.post("/api/register", json={
        "email": "new@example.com",
        "password": "SecurePass123!"
    })
    
    assert response.status_code == 201
    assert response.json()["email"] == "new@example.com"
    
    # Verify user was created in database
    user = db.query(User).filter_by(email="new@example.com").first()
    assert user is not None
```

## 5. TDD Best Practices

| Principle | Description |
|-----------|-------------|
| **One assertion per test** | Each test should verify one thing |
| **Descriptive test names** | `test_create_user_with_duplicate_email_raises_error` |
| **Fast tests** | Unit tests should run in milliseconds |
| **Independent tests** | Tests should not depend on each other |
| **Repeatable** | Same result every time |

## 🛠️ Implementation Checklist
- [ ] Do I write the test before the implementation?
- [ ] Is the test failing before I write code?
- [ ] Does the test have a single clear purpose?
- [ ] Is the test name descriptive?
- [ ] Am I mocking external dependencies?
- [ ] Are tests fast and independent?
- [ ] Do I refactor after the test passes?

## Limitations
- TDD has a learning curve
- Not suitable for all scenarios (exploratory coding)
- Can slow initial development
- Requires discipline and practice
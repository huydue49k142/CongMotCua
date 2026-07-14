---
name: pytest-skill
description: Pytest testing framework for Python. Write unit tests, integration tests, and fixtures with powerful assertion introspection and plugin ecosystem.
---

# Pytest Testing

## Overview

Pytest is a mature full-featured Python testing framework. This skill covers writing tests, fixtures, mocking, and best practices for pytest.

## When to Use

- Unit testing Python code
- Integration testing
- API testing
- Database testing
- Test automation
- Continuous integration testing

## Core Concepts

### Pytest Philosophy

```yaml
Principles:
  - Simple tests: Just functions with assert
  - Powerful features: Fixtures, parametrize, markers
  - Less boilerplate: No need for classes
  - Better errors: Detailed assertion introspection
  - Extensible: Rich plugin ecosystem
```

### Test Discovery

Pytest automatically discovers tests:
- Files named `test_*.py` or `*_test.py`
- Functions named `test_*`
- Classes named `Test*` (no need to inherit from unittest.TestCase)

## Installation & Setup

### Install Pytest

```bash
# Basic installation
pip install pytest

# With common plugins
pip install pytest-cov pytest-mock pytest-asyncio

# Development dependencies
pip install -e ".[dev]"
```

### Configuration

```ini
# pytest.ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short --strict-markers
markers =
    slow: marks tests as slow
    integration: marks integration tests
    unit: marks unit tests
```

```toml
# pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
addopts = [
    "-v",
    "--tb=short",
    "--cov=src",
    "--cov-report=html",
]
markers = [
    "slow: marks tests as slow",
    "integration: marks integration tests",
]
```

## Writing Tests

### Basic Test

```python
# test_calculator.py
def test_addition():
    assert 2 + 3 == 5

def test_subtraction():
    assert 5 - 3 == 2

def test_division():
    assert 10 / 2 == 5.0
```

### Test Classes (Optional)

```python
# test_user.py
class TestUser:
    def test_create_user(self):
        user = User(name="John", email="john@example.com")
        assert user.name == "John"

    def test_user_email(self):
        user = User(name="John", email="john@example.com")
        assert "@" in user.email
```

## Fixtures

### Basic Fixtures

```python
# conftest.py
import pytest

@pytest.fixture
def user():
    """Create a test user."""
    return User(name="Test User", email="test@example.com")

@pytest.fixture
def database():
    """Setup database connection."""
    db = Database.connect("test_db")
    yield db
    db.disconnect()

# test_user.py
def test_user_name(user):
    assert user.name == "Test User"

def test_user_email(user):
    assert user.email == "test@example.com"

def test_database_query(database):
    result = database.query("SELECT * FROM users")
    assert len(result) > 0
```

### Fixture Scopes

```python
import pytest

# Function scope (default) - runs for each test
@pytest.fixture(scope="function")
def db_connection():
    conn = create_connection()
    yield conn
    conn.close()

# Class scope - runs once per class
@pytest.fixture(scope="class")
def database():
    db = setup_database()
    yield db
    teardown_database(db)

# Module scope - runs once per module
@pytest.fixture(scope="module")
def api_client():
    client = APIClient()
    yield client
    client.close()

# Session scope - runs once per test session
@pytest.fixture(scope="session")
def app_config():
    config = load_config()
    yield config
```

### Fixture Dependencies

```python
import pytest

@pytest.fixture
def database():
    db = Database.connect()
    yield db
    db.close()

@pytest.fixture
def user_repository(database):
    """Depends on database fixture."""
    return UserRepository(database)

@pytest.fixture
def user_service(user_repository):
    """Depends on user_repository fixture."""
    return UserService(user_repository)

def test_create_user(user_service):
    user = user_service.create_user("John", "john@example.com")
    assert user.id is not None
```

### Parametrized Fixtures

```python
import pytest

@pytest.fixture(params=["sqlite", "postgresql", "mysql"])
def database(request):
    db = Database.connect(request.param)
    yield db
    db.close()

# Test runs 3 times with different databases
def test_query(database):
    result = database.query("SELECT 1")
    assert result is not None
```

## Assertions

### Basic Assertions

```python
def test_assertions():
    # Equality
    assert 2 + 2 == 4
    assert "hello".upper() == "HELLO"

    # Truthiness
    assert True
    assert not False
    assert [1, 2, 3]
    assert "hello" in "hello world"

    # Comparisons
    assert 5 > 3
    assert 3 <= 3
    assert 5 != 3

    # Type checking
    assert isinstance(5, int)
    assert isinstance("hello", str)
```

### Advanced Assertions

```python
def test_advanced_assertions():
    # Approximate equality (floating point)
    assert 0.1 + 0.2 == pytest.approx(0.3)

    # Containment
    assert 3 in [1, 2, 3]
    assert {"a": 1, "b": 2}.items() >= {"a": 1}.items()

    # Exceptions
    with pytest.raises(ValueError):
        int("not a number")

    with pytest.raises(ValueError, match="invalid literal"):
        int("not a number")

    # Warnings
    with pytest.warns(UserWarning):
        deprecated_function()

    # Context managers
    with pytest.raises(ZeroDivisionError):
        1 / 0
```

## Mocking

### Using unittest.mock

```python
from unittest.mock import Mock, patch, MagicMock
import pytest

def test_api_call():
    # Create mock
    mock_api = Mock()
    mock_api.get_user.return_value = {"id": 1, "name": "John"}

    # Use mock
    user = mock_api.get_user(1)
    assert user["name"] == "John"
    mock_api.get_user.assert_called_once_with(1)

def test_with_patch():
    # Patch function
    with patch('module.get_user') as mock_get_user:
        mock_get_user.return_value = {"id": 1, "name": "John"}

        user = get_user_from_api(1)
        assert user["name"] == "John"
        mock_get_user.assert_called_once_with(1)
```

### Using pytest-mock

```python
def test_with_mocker(mocker):
    # Mock function
    mock_get_user = mocker.patch('module.get_user')
    mock_get_user.return_value = {"id": 1, "name": "John"}

    user = get_user_from_api(1)
    assert user["name"] == "John"
    mock_get_user.assert_called_once_with(1)
```

## Parametrize

### Basic Parametrize

```python
import pytest

@pytest.mark.parametrize("input,expected", [
    (2, 4),
    (3, 9),
    (4, 16),
    (5, 25),
])
def test_square(input, expected):
    assert input ** 2 == expected
```

### Multiple Parameters

```python
@pytest.mark.parametrize("a,b,expected", [
    (1, 2, 3),
    (2, 3, 5),
    (3, 4, 7),
])
def test_addition(a, b, expected):
    assert a + b == expected
```

### Parametrize with IDs

```python
@pytest.mark.parametrize("input,expected", [
    pytest.param(2, 4, id="even"),
    pytest.param(3, 9, id="odd"),
    pytest.param(0, 0, id="zero"),
])
def test_square(input, expected):
    assert input ** 2 == expected
```

## Markers

### Built-in Markers

```python
import pytest

@pytest.mark.skip(reason="Not implemented yet")
def test_future_feature():
    pass

@pytest.mark.skipif(sys.platform == "win32", reason="Unix only")
def test_unix_feature():
    pass

@pytest.mark.xfail(reason="Known bug")
def test_buggy_feature():
    assert buggy_function() == "expected"

@pytest.mark.slow
def test_slow_operation():
    time.sleep(10)
    assert True
```

### Custom Markers

```python
# pytest.ini
markers =
    unit: Unit tests
    integration: Integration tests
    slow: Slow tests

# test_example.py
@pytest.mark.unit
def test_unit():
    pass

@pytest.mark.integration
def test_integration():
    pass

# Run only unit tests
# pytest -m unit

# Run all except slow
# pytest -m "not slow"
```

## Async Testing

### Using pytest-asyncio

```python
import pytest
import asyncio

@pytest.mark.asyncio
async def test_async_function():
    result = await async_function()
    assert result == "expected"

@pytest.mark.asyncio
async def test_async_api():
    async with APIClient() as client:
        user = await client.get_user(1)
        assert user.id == 1
```

## Fixtures with Setup/Teardown

### Using yield

```python
import pytest

@pytest.fixture
def database():
    # Setup
    db = Database.connect("test_db")
    db.create_tables()
    yield db
    # Teardown
    db.drop_tables()
    db.close()

@pytest.fixture
def temp_file():
    # Setup
    file = open("temp.txt", "w")
    yield file
    # Teardown
    file.close()
    os.remove("temp.txt")
```

### Using addfinalizer

```python
@pytest.fixture
def database():
    db = Database.connect("test_db")

    def cleanup():
        db.drop_tables()
        db.close()

    request.addfinalizer(cleanup)
    return db
```

## Coverage

### Run with Coverage

```bash
# Basic coverage
pytest --cov=src

# Coverage with report
pytest --cov=src --cov-report=term-missing

# HTML report
pytest --cov=src --cov-report=html

# XML report (for CI)
pytest --cov=src --cov-report=xml
```

### Configuration

```ini
# pytest.ini
[pytest]
addopts = --cov=src --cov-report=html --cov-report=term-missing
```

## Best Practices

1. **Use descriptive test names**: `test_user_creation_with_valid_email`
2. **One assertion per test**: Keep tests focused
3. **Use fixtures for setup**: DRY principle
4. **Parametrize similar tests**: Reduce code duplication
5. **Mock external dependencies**: Isolate unit under test
6. **Use markers for categorization**: Unit, integration, slow
7. **Run tests in CI**: Catch regressions early
8. **Use type hints**: Better IDE support

## Common Patterns

### Testing Exceptions

```python
def test_raises():
    with pytest.raises(ValueError):
        validate_email("invalid")

    with pytest.raises(ValueError, match="Invalid email"):
        validate_email("invalid")
```

### Testing Warnings

```python
def test_warning():
    with pytest.warns(UserWarning, match="deprecated"):
        deprecated_function()
```

### Testing stdout

```python
def test_output(capsys):
    print("Hello")
    captured = capsys.readouterr()
    assert captured.out == "Hello\n"
```

### Testing temporary files

```python
def test_file_operations(tmp_path):
    file = tmp_path / "test.txt"
    file.write_text("Hello")
    assert file.read_text() == "Hello"
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -e ".[dev]"
      - run: pytest --cov=src --cov-report=xml
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml
```

## Best Practices

1. **Use fixtures**: For setup and teardown
2. **Parametrize tests**: Reduce duplication
3. **Mock external services**: Fast, reliable tests
4. **Use markers**: Categorize tests
5. **Run in CI**: Catch regressions early
6. **Use type hints**: Better IDE support
7. **Keep tests fast**: Unit tests < 100ms
8. **Test edge cases**: Not just happy path

## Anti-Patterns

- **Testing implementation details**: Test behavior, not internals
- **Over-mocking**: Mock only external dependencies
- **Flaky tests**: Tests that fail intermittently
- **No assertions**: Tests that don't verify anything
- **Hardcoded values**: Use fixtures and factories
- **Test interdependencies**: Tests should be independent

## Verification

- [ ] Pytest installed and configured
- [ ] Tests follow best practices
- [ ] Fixtures properly scoped
- [ ] Coverage thresholds met
- [ ] Tests passing consistently
- [ ] CI/CD integration configured
- [ ] No flaky tests

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
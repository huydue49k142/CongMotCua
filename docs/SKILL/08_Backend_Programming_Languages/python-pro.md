---
name: python-pro
description: "Advanced Python programming patterns covering async/await, decorators, context managers, metaclasses, and production-ready code organization."
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Advanced Python Programming

Advanced Python programming patterns for production-ready applications.

## 🧠 Core Philosophy
> "Python is about writing readable, maintainable code that leverages the language's full power — from simple scripts to complex systems."

## When to Use
Use this skill when:
- **Writing production Python** applications
- **Implementing advanced patterns** (async, decorators, metaclasses)
- **Optimizing performance** of Python code
- **Designing Python libraries** and frameworks
- **Debugging complex** Python issues

---

## 1. Async/Await

### Basic Async Patterns
```python
import asyncio
from typing import List

async def fetch_user(user_id: int) -> dict:
    """Fetch user data asynchronously."""
    await asyncio.sleep(0.1)  # Simulate I/O
    return {"id": user_id, "name": f"User {user_id}"}

async def fetch_all_users(user_ids: List[int]) -> List[dict]:
    """Fetch multiple users concurrently."""
    tasks = [fetch_user(uid) for uid in user_ids]
    return await asyncio.gather(*tasks)

# Usage
async def main():
    users = await fetch_all_users([1, 2, 3, 4, 5])
    print(f"Fetched {len(users)} users")

asyncio.run(main())
```

### Async Context Managers
```python
from asyncpg import create_pool

class AsyncDatabaseConnection:
    def __init__(self, dsn: str):
        self.dsn = dsn
        self.pool = None
    
    async def __aenter__(self):
        self.pool = await create_pool(self.dsn)
        return self.pool
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.pool.close()

# Usage
async def query_users():
    async with AsyncDatabaseConnection("postgresql://...") as pool:
        async with pool.acquire() as conn:
            return await conn.fetch("SELECT * FROM users")
```

### Async Iterators
```python
class AsyncPaginatedReader:
    def __init__(self, file_path: str, batch_size: int = 100):
        self.file_path = file_path
        self.batch_size = batch_size
    
    async def __aiter__(self):
        self.file = await aiofiles.open(self.file_path, 'r')
        return self
    
    async def __anext__(self):
        lines = []
        for _ in range(self.batch_size):
            line = await self.file.readline()
            if not line:
                await self.file.close()
                raise StopAsyncIteration
            lines.append(line)
        return lines

# Usage
async def process_large_file():
    async for batch in AsyncPaginatedReader("large_file.txt"):
        await process_batch(batch)
```

## 2. Decorators

### Function Decorators
```python
from functools import wraps
import time

def retry(max_attempts: int = 3, delay: float = 1.0):
    """Retry decorator with exponential backoff."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    time.sleep(delay * (2 ** attempt))
            return None
        return wrapper
    return decorator

@retry(max_attempts=3, delay=1.0)
def fetch_data(url: str):
    """This function will be retried on failure."""
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

# Usage
data = fetch_data("https://api.example.com/data")
```

### Class Decorators
```python
def singleton(cls):
    """Make a class a singleton."""
    instances = {}
    
    @wraps(cls)
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    
    return get_instance

@singleton
class DatabaseConnection:
    def __init__(self):
        self.connection = create_connection()
    
    def query(self, sql: str):
        return self.connection.execute(sql)

# Usage - always returns same instance
db1 = DatabaseConnection()
db2 = DatabaseConnection()
assert db1 is db2  # True
```

### Property Decorators
```python
class Circle:
    def __init__(self, radius: float):
        self._radius = radius
        self._area = None
    
    @property
    def radius(self) -> float:
        """Getter for radius."""
        return self._radius
    
    @radius.setter
    def radius(self, value: float):
        """Setter for radius with validation."""
        if value <= 0:
            raise ValueError("Radius must be positive")
        self._radius = value
        self._area = None  # Invalidate cache
    
    @property
    def area(self) -> float:
        """Computed property (cached)."""
        if self._area is None:
            self._area = 3.14159 * self._radius ** 2
        return self._area

# Usage
circle = Circle(5)
print(circle.area)  # 78.53975
circle.radius = 10
print(circle.area)  # 314.159 (recalculated)
```

## 3. Context Managers

### Custom Context Manager
```python
class Timer:
    """Context manager for timing code blocks."""
    
    def __enter__(self):
        self.start = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end = time.time()
        self.elapsed = self.end - self.start
        print(f"Elapsed time: {self.elapsed:.2f}s")
        return False  # Don't suppress exceptions

# Usage
with Timer():
    time.sleep(1)
# Output: Elapsed time: 1.00s
```

### Database Connection Context Manager
```python
class DatabaseConnection:
    def __init__(self, dsn: str):
        self.dsn = dsn
        self.connection = None
    
    def __enter__(self):
        self.connection = psycopg2.connect(self.dsn)
        return self.connection
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.connection:
            if exc_type:
                self.connection.rollback()
            else:
                self.connection.commit()
            self.connection.close()

# Usage
with DatabaseConnection("postgresql://...") as conn:
    cursor = conn.cursor()
    cursor.execute("INSERT INTO users (name) VALUES (%s)", ("John",))
```

## 4. Metaclasses

### Basic Metaclass
```python
class SingletonMeta(type):
    """Metaclass for singleton pattern."""
    _instances = {}
    
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Database(metaclass=SingletonMeta):
    def __init__(self):
        self.connection = create_connection()

# Usage
db1 = Database()
db2 = Database()
assert db1 is db2  # True
```

### Validation Metaclass
```python
class ValidatedMeta(type):
    """Metaclass that validates methods have type hints."""
    
    def __new__(mcs, name, bases, namespace):
        for key, value in namespace.items():
            if callable(value) and not key.startswith('_'):
                # Check if method has type hints
                if not value.__annotations__:
                    raise TypeError(f"Method {key} must have type hints")
        return super().__new__(mcs, name, bases, namespace)

class User(metaclass=ValidatedMeta):
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age
    
    def greet(self) -> str:  # Type hints required!
        return f"Hello, {self.name}"
```

## 5. Generators & Iterators

### Generators
```python
def read_large_file(file_path: str):
    """Memory-efficient file reading."""
    with open(file_path, 'r') as f:
        for line in f:
            yield line.strip()

# Usage
for line in read_large_file("large_file.txt"):
    process(line)

# Generator expression
squares = (x**2 for x in range(1000000))  # Memory efficient
```

### Infinite Generators
```python
def fibonacci():
    """Infinite Fibonacci sequence generator."""
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

# Usage - get first 10 Fibonacci numbers
fib = fibonacci()
first_10 = [next(fib) for _ in range(10)]
# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

## 6. Best Practices

| Practice | Description |
|----------|-------------|
| **Type hints** | Use type annotations for better IDE support |
| **Docstrings** | Document functions, classes, modules |
| **Error handling** | Use specific exceptions, not bare `except:` |
| **Async properly** | Don't mix sync and async code |
| **Context managers** | Use `with` for resource management |
| **Generators** | Use for memory-efficient iteration |
| **Dataclasses** | Use for data containers (Python 3.7+) |
| **Enums** | Use for fixed sets of values |

### Type Hints Best Practices
```python
from typing import List, Dict, Optional, Union
from dataclasses import dataclass

# ✅ Good: Specific types
def process_users(users: List[User]) -> Dict[int, str]:
    return {user.id: user.name for user in users}

# ✅ Good: Optional types
def find_user(user_id: int) -> Optional[User]:
    return db.query(User).filter_by(id=user_id).first()

# ✅ Good: Union types
def parse_value(value: Union[str, int, float]) -> float:
    return float(value)

# ✅ Good: Callable types
from typing import Callable
def apply_function(func: Callable[[int], int], x: int) -> int:
    return func(x)
```

## 🛠️ Implementation Checklist
- [ ] Are type hints used throughout the codebase?
- [ ] Are async functions properly awaited?
- [ ] Are context managers used for resource management?
- [ ] Are decorators used for cross-cutting concerns?
- [ ] Are generators used for memory efficiency?
- [ ] Is error handling specific and informative?
- [ ] Are docstrings provided for public APIs?

## Limitations
- Python is slower than compiled languages
- GIL limits multi-threading for CPU-bound tasks
- Dynamic typing can lead to runtime errors
- This skill is not a substitute for Python documentation
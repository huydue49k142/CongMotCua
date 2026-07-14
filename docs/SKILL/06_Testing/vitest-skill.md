---
name: vitest-skill
description: Vitest testing framework for JavaScript/TypeScript with Vite-native speed. Write unit tests, integration tests, and component tests with Jest-compatible API.
---

# Vitest Testing

## Overview

Vitest is a blazing fast unit test framework powered by Vite. This skill covers writing tests, configuration, mocking, and best practices for Vitest.

## When to Use

- Unit testing JavaScript/TypeScript
- Integration testing
- Component testing
- Testing Vite projects
- Migrating from Jest
- Fast test execution needed

## Core Concepts

### Vitest vs Jest

```yaml
Similarities:
  - Same API (describe, it, expect)
  - Compatible with Jest matchers
  - Snapshot testing
  - Mocking support

Differences:
  - Vite-powered (much faster)
  - Native ESM support
  - Hot Module Replacement (HMR)
  - TypeScript-first
  - Built-in coverage
```

## Installation & Setup

### Install Vitest

```bash
# npm
npm install -D vitest

# yarn
yarn add -D vitest

# pnpm
pnpm add -D vitest
```

### Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist'],
  },
});
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## Writing Tests

### Basic Test

```typescript
import { describe, it, expect } from 'vitest';

describe('Calculator', () => {
  it('adds two numbers', () => {
    expect(2 + 3).toBe(5);
  });

  it('subtracts two numbers', () => {
    expect(5 - 3).toBe(2);
  });
});
```

### Using Test Fixtures

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('User Service', () => {
  let userService: UserService;

  beforeEach(() => {
    // Runs before each test
    userService = new UserService();
  });

  afterEach(() => {
    // Runs after each test
  });

  it('creates a user', () => {
    const user = userService.create({
      name: 'John',
      email: 'john@example.com'
    });
    expect(user.id).toBeDefined();
    expect(user.name).toBe('John');
  });
});
```

## Assertions

### Common Assertions

```typescript
import { expect } from 'vitest';

// Equality
expect(value).toBe(expected);
expect(value).toEqual(expected); // Deep equality
expect(value).toStrictEqual(expected); // Strict deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3);
expect(value).toBeLessThan(5);
expect(value).toBeLessThanOrEqual(5);
expect(value).toBeCloseTo(0.3, 5); // Floating point

// Strings
expect('Hello World').toMatch(/World/);
expect('Hello World').toContain('World');
expect('Hello').toHaveLength(5);

// Arrays
expect([1, 2, 3]).toContain(2);
expect([1, 2, 3]).toHaveLength(3);

// Objects
expect({ name: 'John' }).toHaveProperty('name');
expect({ name: 'John' }).toMatchObject({ name: 'John' });

// Exceptions
expect(() => {
  throw new Error('Error');
}).toThrow('Error');
expect(() => {
  throw new Error('Error');
}).toThrowError(Error);
```

## Mocking

### Mock Functions

```typescript
import { vi, describe, it, expect } from 'vitest';

describe('User Service', () => {
  it('should call API', async () => {
    // Create mock function
    const mockApi = vi.fn();
    mockApi.mockResolvedValue({ id: 1, name: 'John' });

    const service = new UserService(mockApi);
    const user = await service.getUser(1);

    expect(mockApi).toHaveBeenCalledWith(1);
    expect(user.name).toBe('John');
  });

  it('should mock implementation', () => {
    const mockFn = vi.fn()
      .mockReturnValue(42)
      .mockImplementation((x) => x * 2);

    expect(mockFn(5)).toBe(42); // Returns mockReturnValue
    expect(mockFn()).toBe(42); // Returns mockReturnValue
  });
});
```

### Mock Modules

```typescript
import { vi, describe, it, expect } from 'vitest';

// Mock entire module
vi.mock('./database', () => ({
  getUser: vi.fn().mockResolvedValue({ id: 1, name: 'John' }),
  saveUser: vi.fn().mockResolvedValue(true),
}));

describe('User Service', () => {
  it('fetches user from database', async () => {
    const { getUser } = await import('./database');
    const service = new UserService();
    const user = await service.fetchUser(1);
    
    expect(getUser).toHaveBeenCalledWith(1);
    expect(user.name).toBe('John');
  });
});
```

### Spy on Methods

```typescript
import { vi, describe, it, expect } from 'vitest';

describe('Logger', () => {
  it('should log messages', () => {
    const logger = {
      log: vi.fn(),
      error: vi.fn(),
    };

    const service = new Service(logger);
    service.doSomething();

    expect(logger.log).toHaveBeenCalledWith('Doing something');
    expect(logger.log).toHaveBeenCalledTimes(1);
  });

  it('should spy on console', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    console.log('Hello');
    
    expect(spy).toHaveBeenCalledWith('Hello');
    spy.mockRestore();
  });
});
```

## Async Testing

### Promises

```typescript
import { describe, it, expect } from 'vitest';

describe('Async Operations', () => {
  it('resolves with data', async () => {
    const data = await fetchData();
    expect(data).toBeDefined();
  });

  it('rejects with error', async () => {
    await expect(fetchData()).rejects.toThrow('Error');
  });
});
```

### Async/Await

```typescript
import { describe, it, expect } from 'vitest';

describe('API Service', () => {
  it('fetches user', async () => {
    const response = await api.getUser(1);
    expect(response.id).toBe(1);
    expect(response.name).toBeDefined();
  });
});
```

## Snapshot Testing

```typescript
import { describe, it, expect } from 'vitest';

describe('User Component', () => {
  it('matches snapshot', () => {
    const user = { name: 'John', email: 'john@example.com' };
    expect(user).toMatchSnapshot();
  });

  it('matches inline snapshot', () => {
    const user = { name: 'John', email: 'john@example.com' };
    expect(user).toMatchInlineSnapshot(`
      {
        "email": "john@example.com",
        "name": "John"
      }
    `);
  });
});
```

## Test Organization

### Grouping Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('User Service', () => {
  describe('createUser', () => {
    it('should create user with valid data', () => {
      // Test
    });

    it('should throw error with invalid email', () => {
      // Test
    });
  });

  describe('deleteUser', () => {
    it('should delete existing user', () => {
      // Test
    });

    it('should throw error for non-existent user', () => {
      // Test
    });
  });
});
```

### Hooks

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

describe('Database Tests', () => {
  beforeAll(async () => {
    // Runs once before all tests
    await setupDatabase();
  });

  afterAll(async () => {
    // Runs once after all tests
    await teardownDatabase();
  });

  beforeEach(() => {
    // Runs before each test
    clearDatabase();
  });

  afterEach(() => {
    // Runs after each test
  });

  it('test', () => {
    // Test code
  });
});
```

## Coverage

### Generate Coverage Report

```bash
# Run tests with coverage
vitest run --coverage

# Coverage report in terminal
vitest run --coverage --reporter=text

# HTML report
vitest run --coverage --reporter=html
```

### Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.{test,spec}.{ts,tsx}', 'node_modules/'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
      },
    },
  },
});
```

## Best Practices

1. **Use descriptive test names**: Should describe what's being tested
2. **Follow AAA pattern**: Arrange, Act, Assert
3. **One assertion per test**: Keep tests focused
4. **Use beforeEach/afterEach**: Setup and teardown
5. **Mock external dependencies**: Isolate unit under test
6. **Avoid test interdependence**: Tests should run in any order
7. **Use TypeScript**: Better type safety and IDE support
8. **Run tests in CI**: Catch regressions early

## Anti-Patterns

- **Testing implementation details**: Test behavior, not internals
- **Over-mocking**: Mock only external dependencies
- **Flaky tests**: Tests that fail intermittently
- **Large test files**: Split into focused test files
- **No assertions**: Tests that don't verify anything
- **Hardcoded values**: Use test fixtures

## Verification

- [ ] Vitest installed and configured
- [ ] Tests follow best practices
- [ ] Coverage thresholds met
- [ ] Tests passing consistently
- [ ] CI/CD integration configured
- [ ] No flaky tests

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
---
name: typescript
description: "TypeScript mastery covering type system, generics, advanced patterns, and best practices for building type-safe applications."
risk: safe
source: "community"
date_added: "2026-07-11"
---

# TypeScript Mastery

TypeScript mastery covering type system, generics, advanced patterns, and best practices.

## 🧠 Core Philosophy
> "TypeScript is not just about adding types — it's about making impossible states unrepresentable."

## When to Use
Use this skill when:
- **Building large-scale applications** that need type safety
- **Writing libraries** with public APIs
- **Refactoring** with confidence (compiler catches errors)
- **Improving developer experience** with IntelliSense
- **Preventing runtime errors** at compile time

---

## 1. Type System Fundamentals

### Basic Types
```typescript
// Primitives
let name: string = "John";
let age: number = 30;
let isActive: boolean = true;

// Arrays
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["John", "Jane"];

// Tuples
let tuple: [string, number] = ["John", 30];

// Enums
enum Status {
  Active,
  Inactive,
  Pending
}

// Any, Unknown, Never
let anything: any = "anything";  // Avoid!
let unknown: unknown = "unknown";  // Safer
let never: never = (() => { throw new Error(); })();
```

### Interfaces vs Types
```typescript
// Interface - for object shapes
interface User {
  id: number;
  name: string;
  email: string;
}

// Type - for unions, intersections, aliases
type ID = string | number;
type UserWithRole = User & { role: string };
```

## 2. Generics

```typescript
// Generic function
function identity<T>(value: T): T {
  return value;
}

const num = identity<number>(42);
const str = identity<string>("hello");

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

const userResponse: ApiResponse<User> = {
  data: { id: 1, name: "John", email: "john@example.com" },
  status: 200,
  message: "Success"
};

// Generic constraints
interface HasId {
  id: number;
}

function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}
```

## 3. Advanced Patterns

### Utility Types
```typescript
// Partial - make all properties optional
type PartialUser = Partial<User>;

// Required - make all properties required
type RequiredUser = Required<User>;

// Pick - select specific properties
type UserPreview = Pick<User, 'id' | 'name'>;

// Omit - exclude specific properties
type UserWithoutEmail = Omit<User, 'email'>;

// Record - create object type with specific keys
type UserRoles = Record<string, 'admin' | 'user' | 'guest'>;

// Readonly - make all properties readonly
type ReadonlyUser = Readonly<User>;
```

### Discriminated Unions
```typescript
type Success<T> = {
  status: 'success';
  data: T;
};

type Error = {
  status: 'error';
  error: string;
};

type Result<T> = Success<T> | Error;

function handleResult<T>(result: Result<T>) {
  if (result.status === 'success') {
    console.log(result.data);  // TypeScript knows this is Success
  } else {
    console.log(result.error);  // TypeScript knows this is Error
  }
}
```

### Conditional Types
```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false

// Infer keyword
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getUser() {
  return { id: 1, name: "John" };
}

type User = ReturnType<typeof getUser>;  // { id: number, name: string }
```

## 4. Type Guards

```typescript
// typeof guard
function process(value: string | number) {
  if (typeof value === 'string') {
    console.log(value.toUpperCase());  // TypeScript knows it's string
  } else {
    console.log(value.toFixed(2));  // TypeScript knows it's number
  }
}

// instanceof guard
class Dog {
  bark() { console.log('woof'); }
}

class Cat {
  meow() { console.log('meow'); }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark();
  } else {
    animal.meow();
  }
}

// Custom type guard
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'number' && typeof obj.name === 'string';
}
```

## 5. Best Practices

| Practice | Description |
|----------|-------------|
| **Avoid `any`** | Use `unknown` instead, or proper types |
| **Use strict mode** | Enable `"strict": true` in tsconfig.json |
| **Prefer interfaces** | For object shapes, use interfaces over types |
| **Use type inference** | Let TypeScript infer types when obvious |
| **Avoid type assertions** | Use type guards instead of `as` |
| **Use readonly** | Prevent accidental mutations |
| **Use const assertions** | `as const` for literal types |

## 6. Common Patterns

### Builder Pattern
```typescript
class UserBuilder {
  private user: Partial<User> = {};

  withName(name: string): this {
    this.user.name = name;
    return this;
  }

  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  build(): User {
    if (!this.user.name || !this.user.email) {
      throw new Error('Name and email required');
    }
    return this.user as User;
  }
}

const user = new UserBuilder()
  .withName("John")
  .withEmail("john@example.com")
  .build();
```

### Factory Pattern
```typescript
interface Shape {
  area(): number;
}

class Circle implements Shape {
  constructor(private radius: number) {}
  area(): number { return Math.PI * this.radius ** 2; }
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  area(): number { return this.width * this.height; }
}

function createShape(type: 'circle' | 'rectangle', ...args: any[]): Shape {
  switch (type) {
    case 'circle': return new Circle(args[0]);
    case 'rectangle': return new Rectangle(args[0], args[1]);
  }
}
```

## 🛠️ Implementation Checklist
- [ ] Is `strict` mode enabled in tsconfig.json?
- [ ] Am I avoiding `any` type?
- [ ] Are complex types properly documented?
- [ ] Am I using type inference where appropriate?
- [ ] Are there type guards for union types?
- [ ] Is the code properly typed (no implicit any)?

## Limitations
- TypeScript adds compilation overhead
- Learning curve for advanced types
- Not a substitute for runtime validation
- Over-engineering types can reduce readability
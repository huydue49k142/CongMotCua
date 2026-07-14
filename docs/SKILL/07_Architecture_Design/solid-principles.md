---
name: solid-principles
description: "The 5 Object-Oriented Design Principles known as SOLID by Robert C. Martin (Uncle Bob). Design flexible, maintainable, and extensible software systems."
risk: safe
source: "Adapted from Robert C. Martin's SOLID principles"
date_added: "2026-07-11"
---

# SOLID Principles

The 5 Object-Oriented Design Principles known as SOLID by Robert C. Martin (Uncle Bob).

## 🧠 Core Philosophy
> "A principle is a fundamental truth that serves as the foundation for a system of belief or behavior."

SOLID helps developers build software that is:
- **Easy to maintain** over time
- **Easy to extend** with new features
- **Easy to test** with automated tests
- **Easy to understand** by other developers

## When to Use
Use this skill when:
- **Designing new systems/architectures**: Ensure a solid foundation
- **Refactoring existing code**: Identify violations and restructure
- **Reviewing Pull Requests**: Provide principle-based feedback
- **Reducing technical debt**: Eliminate rigidity, fragility, and immobility

---

## S — Single Responsibility Principle (SRP)

> **"A class should have only one reason to change."**

Every class, module, or function should have **only one responsibility**.

```typescript
// ❌ Bad: Multiple responsibilities
class Employee {
  calculatePay(): number { /* ... */ }
  saveToDatabase(): void { /* ... */ }
  generateReport(): string { /* ... */ }
}

// ✅ Good: Separated responsibilities
class Employee { /* Employee data only */ }
class PayCalculator { calculatePay(employee: Employee): number { /* ... */ } }
class EmployeeRepository { save(employee: Employee): void { /* ... */ } }
class ReportGenerator { generate(employee: Employee): string { /* ... */ } }
```

## O — Open/Closed Principle (OCP)

> **"A class should be open for extension but closed for modification."**

You should be able to add new functionality **without changing existing code**.

```typescript
// ❌ Bad: Must modify class for each new payment method
class PaymentProcessor {
  process(type: string, amount: number) {
    if (type === "credit") { /* ... */ }
    else if (type === "paypal") { /* ... */ }
    else if (type === "bank") { /* ... */ }
  }
}

// ✅ Good: Extend via interfaces
interface PaymentMethod { pay(amount: number): void; }

class CreditCardPayment implements PaymentMethod { pay(amount: number) { /* ... */ } }
class PayPalPayment implements PaymentMethod { pay(amount: number) { /* ... */ } }

class PaymentProcessor {
  process(method: PaymentMethod, amount: number) {
    method.pay(amount);
  }
}
```

## L — Liskov Substitution Principle (LSP)

> **"Derived classes must be substitutable for their base classes."**

If you have a function that works with a base class, it should also work **correctly** with any subclass.

```typescript
// ❌ Bad: Square breaks Rectangle behavior
class Rectangle {
  setWidth(w: number) { this.width = w; }
  setHeight(h: number) { this.height = h; }
}

class Square extends Rectangle {
  setWidth(w: number) { this.width = w; this.height = w; }
  setHeight(h: number) { this.width = h; this.height = h; }
}

// ✅ Good: Separate interfaces
interface Shape { area(): number; }

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  area(): number { return this.width * this.height; }
}

class Square implements Shape {
  constructor(private side: number) {}
  area(): number { return this.side * this.side; }
}
```

## I — Interface Segregation Principle (ISP)

> **"No client should be forced to depend on methods it does not use."**

Large, "fat" interfaces should be split into smaller, more specific ones.

```typescript
// ❌ Bad: Fat interface
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
}

class RobotWorker implements Worker {
  work() { /* ... */ }
  eat() { throw new Error("Robots don't eat"); }
  sleep() { throw new Error("Robots don't sleep"); }
}

// ✅ Good: Segregated interfaces
interface Workable { work(): void; }
interface Eatable { eat(): void; }

class HumanWorker implements Workable, Eatable {
  work() { /* ... */ }
  eat() { /* ... */ }
}

class RobotWorker implements Workable {
  work() { /* ... */ }
}
```

## D — Dependency Inversion Principle (DIP)

> **"High-level modules should not depend on low-level modules. Both should depend on abstractions."**

Instead of concrete classes depending on other concrete classes, both should depend on **interfaces**.

```typescript
// ❌ Bad: Tight coupling
class MySQLDatabase {
  save(data: any) { /* MySQL-specific save logic */ }
}

class UserService {
  private db = new MySQLDatabase();  // Tight coupling!
  saveUser(user: User) { this.db.save(user); }
}

// ✅ Good: Dependency injection
interface Database {
  save(data: any): void;
}

class MySQLDatabase implements Database {
  save(data: any) { /* MySQL-specific save logic */ }
}

class UserService {
  constructor(private db: Database) {}  // Dependency Injection!
  saveUser(user: User) { this.db.save(user); }
}

// Usage: Easy to swap implementations
const service = new UserService(new MySQLDatabase());
const service2 = new UserService(new PostgreSQLDatabase());
```

## 🛠️ Implementation Checklist

### SRP
- [ ] Does this class have only one reason to change?
- [ ] Can I describe its responsibility in one sentence?

### OCP
- [ ] Can I add a new feature without modifying existing classes?
- [ ] Are extension points defined via interfaces/abstract classes?

### LSP
- [ ] Can any subclass replace the base class without breaking the system?
- [ ] Do subclasses preserve the base class's contracts?

### ISP
- [ ] Are interfaces small and focused on a single concern?
- [ ] Do all implementors use ALL methods in the interface?

### DIP
- [ ] Do high-level modules depend on abstractions, not concrete implementations?
- [ ] Are dependencies injected (via constructor, setter, or parameter)?

## Limitations
- Principles are guidelines, not rigid rules — context matters
- Over-applying SOLID can lead to unnecessary complexity
- This skill is not a substitute for code review, testing, or expert validation
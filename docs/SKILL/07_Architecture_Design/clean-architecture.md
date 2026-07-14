---
name: clean-architecture
description: "Structure software around the Dependency Rule: source code dependencies point inward from frameworks to use cases to entities. Covers architecture layers, dependency rule, ports and adapters (hexagonal), component principles, boundaries, and SOLID."
risk: safe
source: "Adapted from Clean Architecture skill (wondelai) — based on Robert C. Martin's 'Clean Architecture'"
date_added: "2026-07-11"
---

# Clean Architecture

Structure software around the Dependency Rule: source code dependencies point inward from frameworks to use cases to entities.

## 🧠 Core Philosophy
> "The job of an architect is to define the shape of the system — the boundaries that separate high-level policy from low-level detail, and the dependency arrows that cross them pointing inward."

## When to Use
Use this skill when:
- **Designing system architecture**: Structuring layers, defining module boundaries
- **Reviewing code**: Detecting framework/DB coupling in business logic
- **Deciding where code belongs**: Which layer? Entity, Use Case, Adapter, Framework?
- **Isolating core logic**: Decoupling from the database, web framework, or message queue
- **Refactoring legacy systems**: Untangling business rules from infrastructure

---

## 1. The Dependency Rule

**Source code dependencies must point inward** — toward higher-level policies. Nothing in an inner circle can know anything about an outer circle.

### The Four Circles

```
          ┌─────────────────────────────────┐
          │     Frameworks & Drivers        │
          │   (Web, DB, UI, Devices)        │
          │   ┌─────────────────────────┐   │
          │   │   Interface Adapters   │   │
          │   │  (Controllers,        │   │
          │   │   Presenters,         │   │
          │   │   Gateways)           │   │
          │   │   ┌───────────────┐   │   │
          │   │   │  Use Cases   │   │   │
          │   │   │ (App Rules)  │   │   │
          │   │   │ ┌─────────┐ │   │   │
          │   │   │ │Entities │ │   │   │
          │   │   │ │(Biz     │ │   │   │
          │   │   │ │ Rules)  │ │   │   │
          │   │   │ └─────────┘ │   │   │
          │   │   └───────────────┘   │   │
          │   └─────────────────────────┘   │
          └─────────────────────────────────┘
```

## 2. Entities (Enterprise Business Rules)

Encapsulate enterprise-wide business rules — rules that would exist even without software.

```typescript
// ✅ Good — Entity with zero framework dependencies
class Order {
  constructor(
    public readonly id: string,
    public readonly items: OrderItem[],
    public readonly customerId: string,
    private status: OrderStatus = OrderStatus.PENDING
  ) {}

  calculateTotal(): Money {
    return this.items.reduce(
      (total, item) => total.add(item.price.multiply(item.quantity)),
      Money.zero()
    );
  }

  approve(): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new Error('Only pending orders can be approved');
    }
    this.status = OrderStatus.APPROVED;
  }
}

// ❌ Bad — Entity coupled to framework/ORM
@Entity({ name: 'orders' })
class Order {
  @PrimaryGeneratedColumn()
  id!: number;
}
```

## 3. Use Cases (Application Business Rules)

Contain application-specific rules that orchestrate data flow to and from Entities.

```typescript
// ✅ Good — Use Case
class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly inventoryService: InventoryService,
    private readonly paymentGateway: PaymentGateway
  ) {}

  async execute(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    const customer = await this.customerRepository.findById(request.customerId);
    if (!customer) throw new Error('Customer not found');

    const order = new Order(
      generateId(),
      request.items.map(i => new OrderItem(i.productId, i.quantity, i.price)),
      request.customerId
    );

    const total = order.calculateTotal();
    await this.paymentGateway.charge(customer.id, total);
    await this.orderRepository.save(order);

    return new CreateOrderResponse(order.id, total);
  }
}
```

## 4. Interface Adapters

Convert data between the form convenient for Use Cases/Entities and the form required by external agencies.

| Component | Role |
|-----------|------|
| **Controller** | Translates HTTP request → Use Case input (DTO) |
| **Presenter** | Translates Use Case output → view model (JSON/HTML) |
| **Gateway** | Implements repository interfaces defined by Use Cases |

```typescript
// Controller — delivery mechanism → Use Case input
class OrderController {
  constructor(private readonly createOrder: CreateOrderUseCase) {}

  async create(req: Request): Promise<Response> {
    const request = new CreateOrderRequest(
      req.body.customerId,
      req.body.items,
    );

    const response = await this.createOrder.execute(request);

    return new Response(201, response);
  }
}
```

## 5. Frameworks & Drivers

The outermost layer — glue code to the outside world. Frameworks are details, not architecture.

```typescript
// main.ts (composition root)
function main() {
  const db = createDatabaseConnection();
  const orderRepository = new PostgresOrderRepository(db);
  const paymentGateway = new StripePaymentGateway(stripe);

  const createOrder = new CreateOrderUseCase(
    orderRepository,
    paymentGateway,
  );

  const orderController = new OrderController(createOrder);

  const app = express();
  app.post('/orders', (req, res) => orderController.create(req, res));
  app.listen(3000);
}
```

## 6. Component Principles

### Cohesion Principles
| Principle | Rule |
|-----------|------|
| **REP** | Reuse/Release Equivalence — classes in a component must be versionable and releasable as a unit |
| **CCP** | Common Closure — classes that change for the same reason at the same time belong together |
| **CRP** | Common Reuse — don't force users to depend on classes they don't use |

### Coupling Principles
| Principle | Rule |
|-----------|------|
| **ADP** | Acyclic Dependencies — component dependency graph must have no cycles |
| **SDP** | Stable Dependencies — depend in the direction of stability |
| **SAP** | Stable Abstractions — stable components should be abstract; unstable ones concrete |

## 🛠️ Implementation Checklist
- [ ] Do all source code dependencies point inward?
- [ ] Are inner circles free from outer circle names (no framework, no DB, no HTTP)?
- [ ] Are Entities free of any framework, database, or delivery mechanism dependencies?
- [ ] Do Use Cases accept/return plain DTOs (not framework objects)?
- [ ] Is the framework confined to the outermost circle?
- [ ] Is the component graph cycle-free (ADP)?
- [ ] Does Main (composition root) wire all dependencies?

## Limitations
- Clean Architecture adds complexity — apply it where the long-term value outweighs the upfront cost
- Not every project needs all four circles; start with the boundaries that matter most
- Premature boundaries are expensive — draw them at points of likely volatility
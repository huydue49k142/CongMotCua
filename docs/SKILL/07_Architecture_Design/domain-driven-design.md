---
name: domain-driven-design
description: "Domain-Driven Design (DDD) patterns for modeling complex business domains, including entities, value objects, aggregates, repositories, and bounded contexts."
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Domain-Driven Design (DDD)

Domain-Driven Design patterns for modeling complex business domains and aligning code with business logic.

## 🧠 Core Philosophy
> "The domain is the heart of software — model it with precision, language, and patterns that experts understand."

## When to Use
Use this skill when:
- **Building complex business applications** with rich domain logic
- **Aligning technical and business** terminology
- **Designing microservices** with clear boundaries
- **Refactoring legacy systems** with unclear business rules
- **Communicating with domain experts** using ubiquitous language

---

## 1. Core Concepts

### Ubiquitous Language
> "Use the same language in code as in conversations with domain experts."

```python
# ❌ Bad: Technical jargon
class OrderManager:
    def process_order_item(self, sku, qty):
        pass

# ✅ Good: Domain language
class Order:
    def add_item(self, product: Product, quantity: int):
        """Add a product to this order."""
        if quantity <= 0:
            raise ValueError("Quantity must be positive")
        
        order_line = OrderLine(product, quantity)
        self.order_lines.append(order_line)
```

### Bounded Context
> "Split the domain into separate models, each with its own explicit boundaries."

```
E-Commerce System:
├── Sales Context (Orders, Customers, Pricing)
├── Inventory Context (Products, Stock, Warehouses)
├── Shipping Context (Shipments, Carriers, Tracking)
└── Billing Context (Invoices, Payments, Refunds)
```

## 2. Building Blocks

### Entities
> "Objects with identity that runs through time and different representations."

```python
class Order:
    def __init__(self, order_id: str, customer: Customer):
        self.order_id = order_id  # Identity
        self.customer = customer
        self.order_lines: list[OrderLine] = []
        self.status = OrderStatus.PENDING
        self.created_at = datetime.now()
    
    def add_item(self, product: Product, quantity: int):
        """Business logic lives in the entity."""
        if self.status != OrderStatus.PENDING:
            raise OrderAlreadyConfirmedError()
        
        order_line = OrderLine(product, quantity)
        self.order_lines.append(order_line)
    
    def total_amount(self) -> Money:
        """Encapsulate calculations."""
        return sum(line.subtotal() for line in self.order_lines)
    
    def confirm(self):
        """State transitions with validation."""
        if not self.order_lines:
            raise EmptyOrderError()
        self.status = OrderStatus.CONFIRMED
```

### Value Objects
> "Objects that describe characteristics of a thing, with no identity."

```python
from dataclasses import dataclass

@dataclass(frozen=True)  # Immutable!
class Address:
    street: str
    city: str
    state: str
    zip_code: str
    country: str
    
    def __post_init__(self):
        """Validation in constructor."""
        if not self.zip_code:
            raise ValueError("ZIP code is required")
    
    def is_international(self) -> bool:
        """Behavior without identity."""
        return self.country != "USA"

# Usage - can be freely replaced if values match
address1 = Address("123 Main St", "NYC", "NY", "10001", "USA")
address2 = Address("123 Main St", "NYC", "NY", "10001", "USA")
assert address1 == address2  # Equal because same values
```

### Aggregates
> "A cluster of entities and value objects with a boundary protecting invariants."

```python
class Order(AggregateRoot):  # Aggregate Root
    def __init__(self, order_id: str, customer: Customer):
        self.order_id = order_id
        self.customer = customer
        self._order_lines: list[OrderLine] = []
        self._status = OrderStatus.PENDING
    
    @property
    def order_lines(self) -> list[OrderLine]:
        """Return copy to prevent external modification."""
        return self._order_lines.copy()
    
    def add_order_line(self, product: Product, quantity: int):
        """Only way to modify the aggregate."""
        # Invariant: Can't add to confirmed order
        if self._status == OrderStatus.CONFIRMED:
            raise OrderAlreadyConfirmedError()
        
        # Invariant: Quantity must be positive
        if quantity <= 0:
            raise ValueError("Quantity must be positive")
        
        # Invariant: Can't exceed stock
        if not product.has_stock(quantity):
            raise InsufficientStockError(product.sku)
        
        order_line = OrderLine(product, quantity)
        self._order_lines.append(order_line)
    
    def total_amount(self) -> Money:
        return sum(line.subtotal() for line in self._order_lines)
```

### Repositories
> "Collection-like interface for accessing aggregate roots."

```python
from abc import ABC, abstractmethod

class OrderRepository(ABC):
    """Interface defined by domain layer."""
    
    @abstractmethod
    def find_by_id(self, order_id: str) -> Order | None:
        pass
    
    @abstractmethod
    def save(self, order: Order):
        pass
    
    @abstractmethod
    def find_by_customer(self, customer_id: str) -> list[Order]:
        pass

# Implementation in infrastructure layer
class PostgresOrderRepository(OrderRepository):
    def __init__(self, db: Database):
        self.db = db
    
    def find_by_id(self, order_id: str) -> Order | None:
        row = self.db.query("SELECT * FROM orders WHERE id = ?", order_id)
        if not row:
            return None
        return Order(row['id'], row['customer_id'])
    
    def save(self, order: Order):
        self.db.execute(
            "INSERT INTO orders (id, customer_id, status) VALUES (?, ?, ?)",
            order.order_id, order.customer.id, order.status.value
        )
```

### Domain Events
> "Something that happened in the domain that other parts care about."

```python
@dataclass
class DomainEvent:
    occurred_at: datetime
    event_id: str

@dataclass
class OrderConfirmed(DomainEvent):
    order_id: str
    customer_id: str
    total_amount: Money
    
    @staticmethod
    def create(order: Order) -> 'OrderConfirmed':
        return OrderConfirmed(
            occurred_at=datetime.now(),
            event_id=str(uuid.uuid4()),
            order_id=order.order_id,
            customer_id=order.customer.id,
            total_amount=order.total_amount()
        )

class Order(AggregateRoot):
    def __init__(self, order_id: str, customer: Customer):
        self.order_id = order_id
        self.customer = customer
        self._events: list[DomainEvent] = []
    
    def confirm(self):
        self._status = OrderStatus.CONFIRMED
        # Publish domain event
        event = OrderConfirmed.create(self)
        self._events.append(event)
    
    def pull_events(self) -> list[DomainEvent]:
        events = self._events.copy()
        self._events.clear()
        return events
```

## 3. Strategic Patterns

### Context Mapping
| Pattern | Description | Example |
|---------|-------------|---------|
| **Shared Kernel** | Shared code between contexts | Common value objects |
| **Customer-Supplier** | One context upstream, one downstream | Sales → Shipping |
| **Conformist** | Downstream conforms to upstream | Use external API as-is |
| **Anti-Corruption Layer** | Adapter to protect from external model | Wrap legacy system |
| **Published Language** | Shared protocol/format | REST API, events |

### Aggregate Design Rules
1. **Small aggregates**: Keep them small for performance
2. **Reference by ID**: Don't hold references to other aggregates
3. **Consistency boundary**: One transaction per aggregate
4. **Eventual consistency**: Between aggregates is okay

## 4. Application Layer

### Application Services
> "Orchestrate domain objects to fulfill use cases."

```python
class OrderService:
    def __init__(
        self,
        order_repo: OrderRepository,
        product_repo: ProductRepository,
        payment_gateway: PaymentGateway,
        event_bus: EventBus
    ):
        self.order_repo = order_repo
        self.product_repo = product_repo
        self.payment_gateway = payment_gateway
        self.event_bus = event_bus
    
    def place_order(self, customer_id: str, items: list[dict]) -> Order:
        """Use case: Place a new order."""
        # 1. Load aggregates
        customer = self.customer_repo.find_by_id(customer_id)
        
        # 2. Execute business logic
        order = Order(generate_id(), customer)
        for item in items:
            product = self.product_repo.find_by_id(item['product_id'])
            order.add_order_line(product, item['quantity'])
        
        # 3. Persist
        self.order_repo.save(order)
        
        # 4. Publish events
        for event in order.pull_events():
            self.event_bus.publish(event)
        
        return order
```

## 🛠️ Implementation Checklist
- [ ] Is there a ubiquitous language shared with domain experts?
- [ ] Are bounded contexts clearly defined?
- [ ] Are entities, value objects, and aggregates properly distinguished?
- [ ] Do aggregates protect their invariants?
- [ ] Are repositories abstracting persistence?
- [ ] Are domain events used for cross-context communication?
- [ ] Is the domain layer independent of frameworks?

## Limitations
- DDD has a learning curve
- Over-engineering for simple domains
- Requires collaboration with domain experts
- This skill is not a substitute for domain expertise
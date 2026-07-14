---
name: c4-architecture-c4-architecture
description: C4 model architecture visualization skill. Covers context, containers, components, and code-level diagrams with clear audience-focused documentation.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# C4 Architecture (C4 Model)

## Overview

The C4 Model is a hierarchical way to visualize software architecture using diagrams at different levels of abstraction:

1. **Context** (what systems exist and how they interact)
2. **Containers** (major deployable units, e.g., web app, API, database)
3. **Components** (key parts inside a container)
4. **Code** (optional deeper detail when needed)

This skill focuses on producing diagrams that are accurate, maintainable, and audience-appropriate.

---

## When to Use

- Aligning stakeholders on system shape
- New team onboarding
- Architecture review and change proposals
- Incident postmortems (understand dependencies)
- Communication across engineering, product, and ops

---

## Core Concepts

### 1) Level of Detail Matters

- **Context**: for “big picture”
- **Containers**: for deployment and major interactions
- **Components**: for design decisions within a container
- **Code**: when explaining tricky behavior, algorithms, or critical paths

---

## Step-by-Step Diagram Workflow

### Step A: Create Context Diagram

Elements:
- System boundary (the system you’re documenting)
- People/roles
- External systems

Example (structure):

```text
[User] -> (Web App System) -> [Payment Provider]
[Web App System] -> (Auth Provider)
[Web App System] -> (Notifications System)
```

Rules:
- Keep it readable (few elements)
- Label interactions with protocols/types when useful (HTTP, events, etc.)

---

### Step B: Create Container Diagram

Containers are deployable units:
- Web frontend
- Backend API
- Background workers
- Databases
- Caches
- Message brokers

Example:

```text
[Browser]
   -> Web Frontend (Container)
   -> Backend API (Container)
        -> Postgres (Container)
        -> Redis Cache (Container)
        -> Queue/Events (Container)
```

Guidance:
- Show major responsibilities per container
- Prefer “what it does” over “how it’s implemented”

---

### Step C: Create Component Diagrams (Inside a Container)

Pick one container and break down into components:
- Controllers/handlers
- Services/use cases
- Repositories/gateways
- External adapter components

Example:

```text
Backend API Container
  - Order Controller
  - Order Service
  - Payment Gateway Adapter
  - Order Repository
```

Rules:
- Components should communicate via well-defined interfaces
- Focus on behavior that changes or needs explanation

---

### Step D: Optional Code-Level Diagram

Use when:
- There’s a critical algorithm
- A complex flow needs deeper clarity
- You must discuss error handling, concurrency, or invariants

Rules:
- Do not overdo it—prefer components
- Keep it small and decision-focused

---

## Documentation Practices

### Use a Consistent Naming Convention
- Container names: `Frontend`, `API`, `Worker`, `Database`, etc.
- Component names: `OrderService`, `PaymentAdapter`, etc.

### Add “Notes” for Key Decisions
Example:
- Why an event-driven approach was chosen
- How idempotency is handled
- Which data ownership rule applies

### Keep Diagrams Updated
- Link diagrams to ADRs or design docs
- Mark “last updated” and owner

---

## Implementation Checklist

- [ ] Context diagram includes key external systems and actors
- [ ] Container diagram reflects deployable units and dependencies
- [ ] Component diagram explains key responsibilities and interfaces
- [ ] Diagram labels are audience-friendly
- [ ] Diagrams are tied to decisions (ADRs/design docs)
- [ ] Complexity is controlled by choosing the right level (don’t jump to code too early)
- [ ] Diagrams are reviewed in architecture sessions

---

## Limitations

- C4 is a visualization tool; it doesn’t replace design rationale
- Over-documenting can slow iteration—keep diagrams lean and decision-driven

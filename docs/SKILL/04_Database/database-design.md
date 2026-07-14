---
name: database-design
description: "Database schema design principles covering normalization, data modeling, relationships, and best practices for scalable databases."
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Database Design

Database schema design principles covering normalization, data modeling, and relationships.

## 🧠 Core Philosophy
> "Good database design is the foundation of scalable applications — design for today's data and tomorrow's growth."

## When to Use
Use this skill when:
- **Designing new database schemas** for applications
- **Modeling relationships** between entities
- **Normalizing data** to reduce redundancy
- **Planning for scale** and performance
- **Refactoring existing** database structures

---

## 1. Data Modeling

### Entity-Relationship Diagram
```
Users (1) ──── (N) Orders
  │                  │
  │                  │ (1)
  │                  │
  └── (1)         (N) OrderItems
                    │
                    │ (N)
                    │
                 Products
```

### Table Design Principles
```sql
-- ✅ Good: Clear primary key, appropriate data types
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ✅ Good: Foreign keys with proper constraints
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ✅ Good: Index on foreign key
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

## 2. Normalization

### Normal Forms

| Normal Form | Rule | Example |
|-------------|------|---------|
| **1NF** | Atomic columns, no repeating groups | `phone1`, `phone2` → separate table |
| **2NF** | No partial dependencies on composite keys | Move non-key attributes to separate table |
| **3NF** | No transitive dependencies (non-key → non-key) | `user_id → user_name` should be in users table |
| **BCNF** | Every determinant is a candidate key | Stricter than 3NF |

### Denormalization (When Appropriate)
```sql
-- Denormalize for read performance
CREATE TABLE order_summaries (
    order_id INTEGER PRIMARY KEY,
    user_name VARCHAR(100),  -- Denormalized from users
    user_email VARCHAR(255), -- Denormalized from users
    item_count INTEGER,
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP,
    
    -- Updated via trigger or application logic
);

-- Use case: Reporting, analytics, read-heavy workloads
```

## 3. Relationship Patterns

### One-to-Many
```sql
-- One user has many orders
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    total DECIMAL(10,2)
);

-- Query with JOIN
SELECT u.email, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.email;
```

### Many-to-Many
```sql
-- Users can have many roles, roles can have many users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Junction table
CREATE TABLE user_roles (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (user_id, role_id)
);

-- Query many-to-many
SELECT u.email, array_agg(r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.email;
```

### One-to-One
```sql
-- User has one profile (optional)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE user_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    avatar_url VARCHAR(255),
    website VARCHAR(255)
);
```

## 4. Data Types

### Choosing the Right Type
```sql
-- ✅ Good: Appropriate data types
CREATE TABLE products (
    id SERIAL PRIMARY KEY,              -- Integer for IDs
    name VARCHAR(255) NOT NULL,         -- Variable length string
    price DECIMAL(10,2) NOT NULL,       -- Exact precision for money
    quantity INTEGER NOT NULL DEFAULT 0, -- Whole numbers
    is_active BOOLEAN DEFAULT true,      -- Boolean flags
    tags TEXT[],                         -- Array (PostgreSQL)
    metadata JSONB,                      -- Flexible JSON data
    created_at TIMESTAMP NOT NULL,       -- Timestamps
    category_id INTEGER REFERENCES categories(id)
);

-- ❌ Bad: Wrong data types
CREATE TABLE products_bad (
    id BIGINT,                           -- Overkill
    name TEXT,                           -- Use VARCHAR for fixed length
    price FLOAT,                         -- Precision issues for money
    quantity NUMBER,                     -- Ambiguous
    created_at DATETIME                  -- Use TIMESTAMP
);
```

## 5. Constraints & Indexes

### Constraints
```sql
-- Primary Key
id SERIAL PRIMARY KEY

-- Foreign Key
user_id INTEGER REFERENCES users(id)

-- Unique
email VARCHAR(255) UNIQUE

-- Check
age INTEGER CHECK (age >= 18)

-- Not Null
name VARCHAR(100) NOT NULL

-- Default
status VARCHAR(20) DEFAULT 'active'
```

### Indexes
```sql
-- Single column index
CREATE INDEX idx_users_email ON users(email);

-- Composite index (order matters!)
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);

-- Partial index
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';

-- Unique index
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);
```

## 6. Schema Evolution

### Migration Strategy
```sql
-- Migration 1: Create table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL
);

-- Migration 2: Add column (nullable first)
ALTER TABLE users ADD COLUMN name VARCHAR(100);

-- Migration 3: Make non-null (after backfilling)
ALTER TABLE users ALTER COLUMN name SET NOT NULL;

-- Migration 4: Add index
CREATE INDEX idx_users_name ON users(name);
```

## 🛠️ Implementation Checklist
- [ ] Are all tables normalized to at least 3NF?
- [ ] Are primary keys defined for all tables?
- [ ] Are foreign keys properly constrained?
- [ ] Are appropriate indexes created?
- [ ] Are data types chosen correctly?
- [ ] Are constraints enforcing business rules?
- [ ] Is there a migration strategy for schema changes?
- [ ] Are relationships properly documented?

## Limitations
- Normalization can impact read performance
- Denormalization requires careful planning
- This skill is not a substitute for domain modeling
- Different databases have different capabilities
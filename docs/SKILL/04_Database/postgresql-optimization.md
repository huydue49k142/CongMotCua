---
name: postgresql-optimization
description: "PostgreSQL performance optimization including indexing, query tuning, connection pooling, and database design patterns."
risk: safe
source: "community"
date_added: "2026-07-11"
---

# PostgreSQL Optimization

PostgreSQL performance optimization including indexing, query tuning, connection pooling, and database design patterns.

## 🧠 Core Philosophy
> "A well-optimized database is not just fast — it's maintainable, predictable, and scales with your data."

## When to Use
Use this skill when:
- **Tuning slow queries** in PostgreSQL
- **Designing indexes** for optimal performance
- **Optimizing database schema** for scalability
- **Implementing connection pooling** (PgBouncer)
- **Analyzing query plans** with EXPLAIN

---

## 1. Indexing Strategies

### B-Tree Indexes (Default)
```sql
-- Single column index
CREATE INDEX idx_users_email ON users(email);

-- Composite index (order matters!)
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);

-- Partial index (index only active rows)
CREATE INDEX idx_users_active ON users(email) WHERE status = 'active';
```

### Covering Indexes
```sql
-- Include non-key columns to avoid table lookups
CREATE INDEX idx_orders_covering 
ON orders(user_id, created_at) 
INCLUDE (total_amount, status);
```

### GIN Indexes (Full-text, JSONB)
```sql
-- Full-text search
CREATE INDEX idx_posts_search ON posts 
USING GIN(to_tsvector('english', title || ' ' || content));

-- JSONB queries
CREATE INDEX idx_metadata ON products 
USING GIN(metadata jsonb_path_ops);
```

## 2. Query Optimization

### Use EXPLAIN ANALYZE
```sql
EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name;

-- Look for:
-- - Seq Scan on large tables (should be Index Scan)
-- - High cost estimates
-- - Large row counts
```

### Avoid N+1 Queries
```sql
-- ❌ Bad: N+1 query problem
SELECT * FROM users;
-- Then for each user:
SELECT * FROM orders WHERE user_id = ?;

-- ✅ Good: Single JOIN
SELECT u.*, o.*
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
```

### Window Functions
```sql
-- Rank users by order count
SELECT 
    user_id,
    COUNT(*) as order_count,
    RANK() OVER (ORDER BY COUNT(*) DESC) as rank
FROM orders
GROUP BY user_id;
```

## 3. Connection Pooling

```python
# Using psycopg2 with connection pooling
from psycopg2.pool import SimpleConnectionPool

pool = SimpleConnectionPool(
    minconn=5,
    maxconn=20,
    host='localhost',
    database='myapp',
    user='user',
    password='pass'
)

def get_connection():
    return pool.getconn()

def return_connection(conn):
    pool.putconn(conn)
```

## 4. Database Design

### Normalization Levels
| Level | Rule | When to Use |
|-------|------|-------------|
| **1NF** | Atomic columns, no repeating groups | Always |
| **2NF** | No partial dependencies on composite keys | OLTP systems |
| **3NF** | No transitive dependencies | Most OLTP systems |
| **Denormalized** | Intentionally duplicate for reads | OLAP, reporting |

### Data Types
```sql
-- ✅ Good: Use appropriate types
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    metadata JSONB
);

-- ❌ Bad: Inefficient types
CREATE TABLE users (
    id BIGINT,  -- Overkill for most apps
    email TEXT,  -- Use VARCHAR for fixed length
    status TEXT  -- Use ENUM or CHECK constraint
);
```

## 🛠️ Implementation Checklist
- [ ] Are queries using indexes (check with EXPLAIN)?
- [ ] Are there composite indexes for common query patterns?
- [ ] Is connection pooling configured?
- [ ] Are partial indexes used for filtered queries?
- [ ] Is the schema normalized appropriately (3NF for OLTP)?
- [ ] Are JSONB columns indexed when queried?
- [ ] Is there monitoring for slow queries (pg_stat_statements)?

## Limitations
- Indexes speed up reads but slow down writes
- Over-indexing can hurt INSERT/UPDATE performance
- Query optimization is workload-specific
- This skill is not a substitute for load testing
---
name: sql-optimization
description: "Universal SQL performance optimization for query tuning, indexing strategies, and database performance analysis across MySQL, PostgreSQL, SQL Server, Oracle."
risk: safe
source: "Adapted from sql-optimization skill"
date_added: "2026-07-11"
---

# SQL Performance Optimization

Universal SQL performance optimization for query tuning, indexing strategies, and database performance analysis.

## 🧠 Core Philosophy
> "A well-optimized query is not just fast — it's maintainable, predictable, and scales with your data."

## When to Use
Use this skill when:
- **Writing or reviewing SQL queries**: Ensure they are efficient and scalable
- **Designing database schemas**: Normalization, data types, constraints
- **Tuning query performance**: Analyzing execution plans, identifying bottlenecks
- **Implementing pagination**: Avoiding OFFSET performance pitfalls
- **Batch operations**: Optimizing bulk inserts, updates, deletes

---

## 1. Query Performance Analysis

### Key Principles
| Principle | Description |
|-----------|-------------|
| **Sargable WHERE** | Avoid wrapping indexed columns in functions — use range conditions |
| **Explicit columns** | Never use `SELECT *` in production — only fetch what you need |
| **Early filtering** | Apply the most selective filters first to reduce rows early |
| **Proper JOINs** | Use INNER JOIN when possible (faster than LEFT JOIN) |

### ❌ Bad vs ✅ Good
```sql
-- ❌ Bad: Function on indexed column prevents index usage
SELECT * FROM orders WHERE YEAR(created_at) = 2024;

-- ✅ Good: Sargable WHERE clause
SELECT id, customer_id, total_amount FROM orders 
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

-- ❌ Bad: SELECT * retrieves unnecessary columns
SELECT * FROM large_table;

-- ✅ Good: Explicit columns
SELECT id, name, email FROM users;
```

## 2. Index Strategy Optimization

### Composite Index Design
```sql
-- ❌ Bad: Too many columns in one index
CREATE INDEX idx_user_data ON users(email, first_name, last_name, created_at);

-- ✅ Good: Focused composite indexes
-- For queries filtering by email first, then sorting by created_at
CREATE INDEX idx_users_email_created ON users(email, created_at);

-- For full-text name searches
CREATE INDEX idx_users_name ON users(last_name, first_name);

-- Partial index for active users
CREATE INDEX idx_users_active ON users(email) WHERE status = 'active';
```

### Covering Index
```sql
-- Include all columns needed by the query to avoid table lookups
CREATE INDEX idx_orders_covering 
ON orders(customer_id, created_at) 
INCLUDE (total_amount, status);
```

## 3. JOIN Optimization

```sql
-- ❌ Bad: Inefficient JOIN order
SELECT o.*, c.name, p.product_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.created_at > '2024-01-01';

-- ✅ Good: Optimized JOIN with early filtering
SELECT o.id, o.total_amount, c.name, p.product_name
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id AND c.status = 'active'
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.created_at > '2024-01-01';
```

## 4. Pagination Optimization

```sql
-- ❌ Bad: OFFSET-based pagination (slower as offset grows)
SELECT * FROM products ORDER BY created_at DESC LIMIT 20 OFFSET 10000;

-- ✅ Good: Cursor-based pagination (keyset pagination)
SELECT * FROM products 
WHERE created_at < '2024-06-15 10:30:00'
ORDER BY created_at DESC LIMIT 20;

-- Or using ID-based cursor (fastest)
SELECT * FROM products WHERE id > 1000 ORDER BY id LIMIT 20;
```

## 5. Subquery Optimization

```sql
-- ❌ Bad: Correlated subquery (executed once per row)
SELECT p.product_name, p.price
FROM products p
WHERE p.price > (
    SELECT AVG(price) FROM products p2 WHERE p2.category_id = p.category_id
);

-- ✅ Good: Window function (single pass)
SELECT product_name, price
FROM (
    SELECT product_name, price,
           AVG(price) OVER (PARTITION BY category_id) as avg_category_price
    FROM products
) ranked
WHERE price > avg_category_price;
```

## 6. Batch Operations

```sql
-- ❌ Bad: Row-by-row operations (N round trips)
INSERT INTO products (name, price) VALUES ('Product 1', 10.00);
INSERT INTO products (name, price) VALUES ('Product 2', 15.00);
INSERT INTO products (name, price) VALUES ('Product 3', 20.00);

-- ✅ Good: Batch insert (1 round trip)
INSERT INTO products (name, price) VALUES 
('Product 1', 10.00),
('Product 2', 15.00),
('Product 3', 20.00);
```

## 7. Query Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **SELECT *** | Retrieves all columns, prevents covering index | Select only needed columns |
| **Function in WHERE** | Prevents index usage | Use range conditions |
| **OR conditions** | May not use indexes efficiently | Use UNION ALL |
| **N+1 queries** | Multiple round trips | Use JOINs |

## 🛠️ Implementation Checklist
- [ ] Avoiding `SELECT *` in production queries?
- [ ] Using appropriate JOIN types (INNER vs LEFT/RIGHT)?
- [ ] Filtering early in WHERE clauses?
- [ ] Using EXISTS instead of IN for subqueries when appropriate?
- [ ] Avoiding functions in WHERE clauses that prevent index usage?
- [ ] Using cursor-based pagination for large datasets?
- [ ] Using batch operations for bulk data changes?
- [ ] Avoiding N+1 query problems?

## Limitations
- SQL syntax varies between databases — adapt to your specific DBMS
- Always test optimizations with realistic data volumes
- Over-optimization can lead to unmaintainable queries
- This skill is not a substitute for environment-specific validation
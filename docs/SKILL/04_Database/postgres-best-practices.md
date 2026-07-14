---
name: postgres-best-practices
description: Postgres performance optimization and best practices from Supabase. Use this skill when writing, reviewing, or optimizing Postgres queries, schema designs, or database configurations.
---

# Postgres Best Practices

## Overview

Comprehensive performance optimization guide for Postgres, maintained by Supabase. Contains rules across 8 categories, prioritized by impact to guide automated query optimization and schema design.

## When to Use

- Writing SQL queries or designing schemas
- Implementing indexes or query optimization
- Reviewing database performance issues
- Configuring connection pooling or scaling
- Optimizing for Postgres-specific features
- Working with Row-Level Security (RLS)

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Query Performance | CRITICAL | `query-` |
| 2 | Connection Management | CRITICAL | `conn-` |
| 3 | Security & RLS | CRITICAL | `security-` |
| 4 | Schema Design | HIGH | `schema-` |
| 5 | Concurrency & Locking | MEDIUM-HIGH | `lock-` |
| 6 | Data Access Patterns | MEDIUM | `data-` |
| 7 | Monitoring & Diagnostics | LOW-MEDIUM | `monitor-` |
| 8 | Advanced Features | LOW | `advanced-` |

## Query Performance

### Index Usage

```sql
-- ✅ Good: Index supports query
CREATE INDEX idx_users_email ON users(email);
SELECT * FROM users WHERE email = 'user@example.com';

-- ❌ Bad: Function prevents index usage
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';

-- ✅ Good: Expression index for function queries
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
```

### Avoid SELECT *

```sql
-- ❌ Bad: Fetches unnecessary columns
SELECT * FROM users WHERE id = 123;

-- ✅ Good: Fetch only needed columns
SELECT id, name, email FROM users WHERE id = 123;
```

### Use LIMIT

```sql
-- ❌ Bad: Returns all rows
SELECT * FROM posts ORDER BY created_at DESC;

-- ✅ Good: Limit results
SELECT * FROM posts ORDER BY created_at DESC LIMIT 10;
```

## Connection Management

### Connection Pooling

```sql
-- Configure PgBouncer
-- max_connections: 100
-- default_pool_size: 20
-- min_pool_size: 5
```

### Avoid Connection Leaks

```python
# ✅ Good: Context manager
with psycopg2.connect(DATABASE_URL) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM users")
        results = cur.fetchall()

# ❌ Bad: Manual connection management
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()
# Forgot to close!
```

## Schema Design

### Use Appropriate Data Types

```sql
-- ✅ Good: Use specific types
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB
);

-- ❌ Bad: Generic types
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL,
    created_at TEXT,
    is_active TEXT
);
```

### Normalization

```sql
-- ✅ Good: Normalized structure
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    street VARCHAR(255),
    city VARCHAR(100)
);

-- ❌ Bad: Denormalized without need
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    address_street VARCHAR(255),
    address_city VARCHAR(100)
);
```

## Indexing Strategy

### Composite Indexes

```sql
-- ✅ Good: Composite index for common query
CREATE INDEX idx_orders_user_date 
ON orders(user_id, created_at DESC);

-- Query uses index
SELECT * FROM orders 
WHERE user_id = 123 
ORDER BY created_at DESC 
LIMIT 10;
```

### Partial Indexes

```sql
-- ✅ Good: Index only active users
CREATE INDEX idx_active_users_email 
ON users(email) 
WHERE is_active = true;

-- Smaller index, faster queries
SELECT * FROM users 
WHERE is_active = true 
AND email = 'user@example.com';
```

### Covering Indexes

```sql
-- ✅ Good: Include all needed columns
CREATE INDEX idx_users_email_covering 
ON users(email) 
INCLUDE (name, created_at);

-- Query satisfied entirely from index
SELECT name, created_at 
FROM users 
WHERE email = 'user@example.com';
```

## Query Optimization

### Use EXPLAIN ANALYZE

```sql
-- Check query plan
EXPLAIN ANALYZE
SELECT * FROM orders 
WHERE user_id = 123 
ORDER BY created_at DESC;

-- Look for:
-- - Seq Scan on large tables (missing index)
-- - High execution time
-- - Large row estimates
```

### Avoid N+1 Queries

```sql
-- ❌ Bad: N+1 query pattern
SELECT * FROM users;
-- Then for each user:
SELECT * FROM orders WHERE user_id = ?;

-- ✅ Good: Single query with JOIN
SELECT 
    u.id, u.name,
    o.id as order_id, o.total
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;
```

### Use CTEs for Complex Queries

```sql
-- ✅ Good: CTE for readability
WITH active_users AS (
    SELECT id, name, email
    FROM users
    WHERE is_active = true
),
user_orders AS (
    SELECT user_id, COUNT(*) as order_count
    FROM orders
    GROUP BY user_id
)
SELECT 
    u.name,
    COALESCE(o.order_count, 0) as orders
FROM active_users u
LEFT JOIN user_orders o ON o.user_id = u.id;
```

## Row-Level Security (RLS)

### Enable RLS

```sql
-- Enable RLS on table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY user_isolation ON users
    FOR ALL
    TO authenticated_users
    USING (id = current_user_id());

-- Users can only see their own data
```

## Performance Monitoring

### Slow Query Log

```sql
-- Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1 second
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();
```

### Active Queries

```sql
-- See currently running queries
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC;
```

## Best Practices

1. **Index strategically**: Index for queries, not just columns
2. **Use appropriate data types**: Choose specific types over generic
3. **Avoid SELECT ***: Fetch only needed columns
4. **Use LIMIT**: Always limit result sets
5. **Connection pooling**: Use PgBouncer for web apps
6. **Monitor slow queries**: Enable and review slow query log
7. **Regular VACUUM**: Prevent table bloat
8. **Use CTEs**: For complex query readability

## Anti-Patterns

- **Missing indexes**: Slow queries on large tables
- **Over-indexing**: Too many indexes slow down writes
- **SELECT ***: Fetches unnecessary data
- **No LIMIT**: Returns entire table
- **Connection per request**: Doesn't scale
- **Ignoring EXPLAIN**: Not understanding query plans

## Verification

- [ ] Indexes created for common queries
- [ ] No missing index warnings in EXPLAIN
- [ ] Connection pooling configured
- [ ] Slow query log enabled
- [ ] RLS policies tested
- [ ] Query performance acceptable
- [ ] Regular VACUUM scheduled

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
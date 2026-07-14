---
name: database-migration
description: "Database migration strategies and tools for schema versioning, zero-downtime deployments, and data migrations."
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Database Migration

Database migration strategies for schema versioning, zero-downtime deployments, and data migrations.

## 🧠 Core Philosophy
> "Database migrations are like Git for your database — every change is tracked, versioned, and reversible."

## When to Use
Use this skill when:
- **Versioning database schemas** across environments
- **Deploying schema changes** without downtime
- **Migrating data** between schemas
- **Rolling back** failed migrations
- **Coordinating** database changes with application deployments

---

## 1. Migration Tools

### Popular Tools
| Tool | Language | Best For |
|------|----------|----------|
| **Flyway** | Java, SQL | SQL-based migrations, version control |
| **Liquibase** | Java, XML/YAML/JSON/SQL | Complex changes, rollbacks |
| **Alembic** | Python | SQLAlchemy projects |
| **Prisma Migrate** | TypeScript | Prisma ORM projects |
| **Django Migrations** | Python | Django projects |
| **Rails Migrations** | Ruby | Rails projects |

### Flyway Example
```sql
-- V1__create_users_table.sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- V2__add_user_profiles.sql
CREATE TABLE user_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    bio TEXT,
    avatar_url VARCHAR(255)
);

-- V3__add_index_to_users_email.sql
CREATE INDEX idx_users_email ON users(email);
```

## 2. Migration Best Practices

### Atomic Migrations
```sql
-- ✅ Good: Single operation, atomic
ALTER TABLE users ADD COLUMN age INTEGER;

-- ❌ Bad: Multiple operations (not atomic)
ALTER TABLE users ADD COLUMN age INTEGER;
ALTER TABLE users ADD COLUMN status VARCHAR(20);
```

### Backward-Compatible Changes
```sql
-- Step 1: Add column (nullable)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Step 2: Deploy application code that writes to new column

-- Step 3: Backfill existing data
UPDATE users SET phone = '000-000-0000' WHERE phone IS NULL;

-- Step 4: Make column non-null (if needed)
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
```

### Zero-Downtime Migrations

| Pattern | Use Case | Example |
|---------|----------|---------|
| **Add column** | New feature | `ALTER TABLE ADD COLUMN new_col` |
| **Drop column** | Remove feature | Deploy code → Drop column later |
| **Rename column** | Rename field | Add new → Copy data → Drop old |
| **Change type** | Type change | Add new → Migrate → Drop old |
| **Add index** | Performance | `CREATE INDEX CONCURRENTLY` (PostgreSQL) |

## 3. Data Migrations

### Simple Data Migration
```sql
-- Migrate data from old format to new
UPDATE users 
SET email = LOWER(TRIM(email))
WHERE email != LOWER(TRIM(email));
```

### Complex Data Migration (Python + Alembic)
```python
from alembic import op
import sqlalchemy as sa

def upgrade():
    # Add new column
    op.add_column('users', sa.Column('full_name', sa.String(200)))
    
    # Migrate data
    connection = op.get_bind()
    users = connection.execute(sa.text("SELECT id, first_name, last_name FROM users"))
    
    for user in users:
        full_name = f"{user.first_name} {user.last_name}"
        connection.execute(
            sa.text("UPDATE users SET full_name = :name WHERE id = :id"),
            {"name": full_name, "id": user.id}
        )
    
    # Drop old columns
    op.drop_column('users', 'first_name')
    op.drop_column('users', 'last_name')

def downgrade():
    # Reverse migration
    op.add_column('users', sa.Column('first_name', sa.String(100)))
    op.add_column('users', sa.Column('last_name', sa.String(100)))
    
    # ... reverse data migration
    
    op.drop_column('users', 'full_name')
```

### Batch Migrations (Large Tables)
```python
def batch_migrate(batch_size=1000):
    """Migrate large tables in batches to avoid locking."""
    offset = 0
    
    while True:
        # Fetch batch
        users = session.query(User)\
            .order_by(User.id)\
            .offset(offset)\
            .limit(batch_size)\
            .all()
        
        if not users:
            break
        
        # Process batch
        for user in users:
            user.new_field = transform(user.old_field)
        
        session.commit()
        offset += batch_size
```

## 4. Rollback Strategies

### Automatic Rollbacks
```yaml
# CI/CD pipeline with automatic rollback
deploy:
  script:
    - npm run migrate:up
    - npm run deploy
  on_failure:
    - npm run migrate:down
    - npm run deploy:previous
```

### Manual Rollback
```sql
-- V4__add_user_status.sql (failed)
ALTER TABLE users ADD COLUMN status VARCHAR(20);

-- Rollback: V3__remove_user_status.sql
ALTER TABLE users DROP COLUMN status;
```

## 5. Migration Safety

### Pre-Migration Checklist
- [ ] Backup database before migration
- [ ] Test migration on staging first
- [ ] Ensure migration is idempotent (can run multiple times)
- [ ] Keep migrations small and focused
- [ ] Never modify committed migrations
- [ ] Use transactions when possible

### Idempotent Migrations
```sql
-- ✅ Good: Idempotent (can run multiple times)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ✅ Good: Check before adding column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone'
    ) THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20);
    END IF;
END $$;
```

## 6. Production Considerations

### Monitoring
```python
class MigrationMonitor:
    def __init__(self):
        self.start_time = None
        self.rows_affected = 0
    
    def start(self):
        self.start_time = datetime.now()
    
    def log_progress(self, rows_processed):
        self.rows_affected = rows_processed
        elapsed = (datetime.now() - self.start_time).total_seconds()
        rate = rows_processed / elapsed
        print(f"Processed {rows_processed} rows ({rate:.0f} rows/sec)")
    
    def complete(self):
        elapsed = (datetime.now() - self.start_time).total_seconds()
        print(f"Migration completed in {elapsed:.2f}s ({self.rows_affected} rows)")
```

### Lock Management
```sql
-- PostgreSQL: Use CONCURRENTLY for zero-downtime
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- Check for locks
SELECT * FROM pg_locks WHERE relation = 'users'::regclass;
```

## 🛠️ Implementation Checklist
- [ ] Is there a migration tool configured (Flyway, Alembic, etc.)?
- [ ] Are migrations versioned and tracked?
- [ ] Are migrations tested on staging?
- [ ] Is there a rollback strategy?
- [ ] Are large migrations batched?
- [ ] Is there monitoring during migration?
- [ ] Are migrations idempotent?
- [ ] Is there a backup before migration?

## Limitations
- Large migrations can lock tables
- Rollbacks are not always possible
- Requires coordination across teams
- This skill is not a substitute for DBA expertise
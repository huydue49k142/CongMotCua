---
name: docker-expert
description: "Master Docker containerization including Dockerfiles, multi-stage builds, networking, volumes, and Docker Compose for development and production."
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Docker Expert

Master Docker containerization including Dockerfiles, multi-stage builds, networking, volumes, and Docker Compose.

## 🧠 Core Philosophy
> "Containers package applications with their dependencies — build once, run anywhere."

## When to Use
Use this skill when:
- **Creating Dockerfiles** for applications
- **Optimizing image size** and build times
- **Setting up Docker Compose** for multi-container apps
- **Debugging container issues** (networking, volumes, permissions)
- **Implementing CI/CD** with Docker

---

## 1. Dockerfile Best Practices

### Multi-Stage Builds
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Layer Optimization
```dockerfile
# ✅ Good: Leverage layer caching
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# ❌ Bad: Invalidate cache on every change
COPY . .
RUN npm ci
```

## 2. Docker Compose

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
    depends_on:
      - db
    volumes:
      - ./src:/app/src  # Development hot-reload
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 3. Networking

| Mode | Description | Use Case |
|------|-------------|----------|
| **bridge** | Default, isolated network | Multi-container apps |
| **host** | Share host network | Performance-critical |
| **none** | No network | Batch jobs, security |

## 4. Volumes & Bind Mounts

```yaml
volumes:
  # Named volume (managed by Docker)
  - postgres_data:/var/lib/postgresql/data
  
  # Bind mount (development)
  - ./src:/app/src
  
  # Anonymous volume (cache, temp files)
  - /app/node_modules
```

## 5. Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

## 🛠️ Implementation Checklist
- [ ] Is the base image minimal (alpine, slim)?
- [ ] Are non-root users used for security?
- [ ] Are secrets managed via environment variables (not in image)?
- [ ] Is .dockerignore configured?
- [ ] Are health checks defined?
- [ ] Is logging configured (JSON driver)?
- [ ] Are resource limits set (CPU, memory)?

## Limitations
- Docker adds operational complexity
- Windows/Mac performance overhead
- Networking can be tricky for beginners
- Image security scanning is essential
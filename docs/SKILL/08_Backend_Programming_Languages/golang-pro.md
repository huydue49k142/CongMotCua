---
name: golang-pro
description: Golang production-ready skill. Covers concurrency, error handling, interfaces, project layout, testing, performance, and production hardening for Go services.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Golang Pro (Production-Ready Go)

## Overview

Go is designed for efficient concurrency, straightforward tooling, and maintainable services.

This skill focuses on production-grade Go practices:
- clean project organization
- interfaces and dependency injection patterns
- concurrency (goroutines/channels) without leaks
- error handling conventions
- testing and benchmarking
- performance and observability
- production hardening (timeouts, retries, graceful shutdown)

---

## When to Use

- Writing backend services in Go
- Building concurrent systems (workers, pipelines, fan-out/fan-in)
- Designing stable interfaces for maintainability
- Achieving predictable performance with benchmarks
- Hardening services for real production traffic

---

## Core Concepts

### 1) Project Layout (Opinionated but Practical)

Common approach:

```text
cmd/
  api/
    main.go
internal/
  app/
  domain/
  service/
  repository/
pkg/
  clients/
  observability/
  middleware/
  config/
test/
  integration/
```

Rules:
- `cmd/` contains wiring / composition root
- `internal/` contains app logic not meant for external import
- `pkg/` contains reusable libraries (only if truly reusable)

---

### 2) Interfaces & Dependency Injection

Use interfaces to decouple implementations:

```go
type UserRepository interface {
  FindByID(ctx context.Context, id string) (*User, error)
}
```

Inject dependencies at construction time:

```go
type Service struct {
  repo UserRepository
}

func NewService(repo UserRepository) *Service {
  return &Service{repo: repo}
}
```

Keep interfaces small and intention-revealing.

---

### 3) Error Handling

#### Sentinel vs Wrapped Errors
- Sentinel errors: compare with `errors.Is`
- Wrapped errors: preserve context with `%w`

```go
var ErrNotFound = errors.New("not found")

func (r *Repo) FindByID(ctx context.Context, id string) (*User, error) {
  u, ok := r.data[id]
  if !ok {
    return nil, fmt.Errorf("%w: user %s", ErrNotFound, id)
  }
  return u, nil
}

// Usage
u, err := repo.FindByID(ctx, id)
if errors.Is(err, ErrNotFound) {
  // handle not found
}
```

#### Error Messages
- avoid capitalized strings
- include context at the boundary where possible

---

## Concurrency Patterns

### 1) Goroutines With Context (Always)

Every long-running operation should accept `context.Context`:

- cancel upstream work
- enforce timeouts

```go
ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel()
res, err := client.Call(ctx, req)
```

### 2) Worker Pool (Fan-out / Fan-in)

```go
jobs := make(chan Job)
results := make(chan Result)

var wg sync.WaitGroup
for i := 0; i < workerCount; i++ {
  wg.Add(1)
  go func() {
    defer wg.Done()
    for j := range jobs {
      r := process(j)
      results <- r
    }
  }()
}

go func() {
  for _, j := range input {
    jobs <- j
  }
  close(jobs)
  wg.Wait()
  close(results)
}()
```

### 3) Avoid Goroutine Leaks

- ensure channels are closed properly
- ensure goroutines exit on `ctx.Done()`
- use bounded queues if producer can outpace consumer

---

## Testing & Benchmarking

### Unit Tests

Use table-driven tests:

```go
func TestCalculate(t *testing.T) {
  cases := []struct {
    name string
    in   int
    want int
  }{
    {"zero", 0, 0},
    {"two", 2, 4},
  }

  for _, tc := range cases {
    t.Run(tc.name, func(t *testing.T) {
      got := Calculate(tc.in)
      if got != tc.want {
        t.Fatalf("want %d got %d", tc.want, got)
      }
    })
  }
}
```

### Integration Tests

- run against test containers or local dependencies
- keep them in `test/` or separate package
- avoid mocking when validating real behavior

### Benchmarks

```go
func BenchmarkCalculate(b *testing.B) {
  for i := 0; i < b.N; i++ {
    _ = Calculate(42)
  }
}
```

Use `pprof` for profiling when needed.

---

## Performance & Observability

### Structured Logging

Prefer structured logging with consistent fields:
- `request_id`, `trace_id`
- `service`, `method`, `status`

### Metrics
Track at minimum:
- request count
- latency histogram
- error rates
- queue depth / worker utilization (if relevant)

### Tracing
Adopt OpenTelemetry (or equivalent) for distributed traces.

---

## Production Hardening

### Timeouts Everywhere
- HTTP client timeouts
- DB query timeouts
- context deadlines for handlers and jobs

### Retries With Backoff + Jitter
- retry only safe/idempotent operations
- cap max attempts
- avoid retry storms (jitter + circuit breaker)

### Graceful Shutdown
- stop accepting new requests
- drain in-flight work with deadline
- close resources

---

## Implementation Checklist

- [ ] Project layout separates wiring (`cmd/`) from logic (`internal/`)
- [ ] Interfaces are small and injected
- [ ] Errors use `errors.Is` / wrapping correctly
- [ ] Concurrency uses `context` to prevent leaks
- [ ] Tests include unit + integration coverage
- [ ] Benchmarks guide optimizations
- [ ] Logging/metrics/tracing are present
- [ ] Timeouts, retries, and graceful shutdown are implemented

---

## Limitations

- Go helps with performance predictability, but correctness still depends on proper concurrency reasoning
- Over-concurrency can increase latency and resource usage if not benchmarked

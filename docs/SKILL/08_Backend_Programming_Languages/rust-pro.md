---
name: rust-pro
description: Rust production-ready skill. Covers ownership/borrowing, error handling, async, concurrency, project structure, testing, performance, and safe systems programming practices.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Rust Pro (Production-Ready Rust)

## Overview

Rust enables memory safety and fearless concurrency through ownership, borrowing, and type-driven design.

This skill focuses on production-grade Rust practices:
- ownership/borrowing patterns
- error handling conventions (`Result`, `thiserror`, `anyhow`)
- async/await and runtimes
- concurrency patterns (threads, channels, shared state)
- project organization, testing, and linting
- performance tuning and profiling
- secure systems programming habits

---

## When to Use

- Building backend services in Rust
- Implementing performance-critical components
- Writing safe concurrent code without data races
- Developing libraries/SDKs with strong invariants
- Networking, parsing, and systems tooling

---

## Core Concepts

### 1) Ownership & Borrowing Patterns

Key rules:
- each value has a single owner
- borrowing is explicit (immutable/mutable)
- lifetimes ensure references remain valid

Common production patterns:
- Prefer immutable borrows (`&T`) by default
- Use mutable borrows (`&mut T`) only when mutation is necessary and localized
- Use `Arc<T>` for shared immutable ownership across threads
- Use `Mutex<T>` / `RwLock<T>` for interior mutability with synchronization

Example:

```rust
fn greet(name: &str) -> String {
    format!("Hello {name}")
}
```

Mutable update:

```rust
fn increment(counter: &mut i64) {
    *counter += 1;
}
```

---

## 2) Error Handling

### Use `Result` Everywhere
Avoid panics in production paths.

```rust
fn parse_port(s: &str) -> Result<u16, String> {
    s.parse::<u16>().map_err(|_| format!("invalid port: {s}"))
}
```

### Typed Errors (Recommended)
Use `thiserror` for ergonomic custom error types:

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ApiError {
    #[error("invalid input: {0}")]
    InvalidInput(String),
    #[error("downstream failure")]
    Downstream,
}
```

### Error Context
When wrapping errors, keep context:

- `anyhow` for app-level error handling
- typed errors for libraries

---

## 3) Concurrency Patterns

### Threads + Channels
Good for parallel work with message passing.

```rust
use std::sync::mpsc;
use std::thread;

let (tx, rx) = mpsc::channel();

let handle = thread::spawn(move || {
    tx.send(42).unwrap();
});

let value = rx.recv().unwrap();
handle.join().unwrap();
```

### Async Concurrency
Use an async runtime (Tokio is common):

- tasks for concurrent I/O
- timeouts for bounded waits
- cancellation via dropping tasks / select! patterns

---

## 4) Project Structure

Production-friendly layout:

```text
my-crate/
  src/
    lib.rs
    main.rs            # if binary
    api/
    domain/
    service/
    repository/
  tests/
  benches/
  examples/
  Cargo.toml
```

Guidelines:
- separate domain logic from transport (HTTP, CLI)
- keep modules small and purpose-driven
- make public API minimal and stable

---

## 5) Async Best Practices

- Add explicit timeouts around external calls
- Avoid blocking in async tasks
- Use connection pools for DB/HTTP clients
- Prefer streaming for large payloads

Timeout example:

```rust
use tokio::time::{timeout, Duration};

let result = timeout(Duration::from_secs(2), async {
    // call external service
    Ok::<_, anyhow::Error>(42)
}).await;
```

---

## 6) Testing

### Unit Tests
Test pure domain functions directly.

### Integration Tests
Test boundaries:
- HTTP handlers
- repository implementations
- full request/response flows

### Property-Based Tests (Optional)
Consider `proptest` for invariants and edge cases.

---

## 7) Performance & Profiling

Production optimization workflow:
- measure first (benchmarks, profiler)
- optimize hotspots with targeted changes
- avoid premature micro-optimizations

Use:
- `cargo bench`
- `perf` / `pprof` (depending on environment)
- `tracing` for runtime insight

---

## 8) Security & Safety Habits

- validate all external input (size, format, bounds)
- avoid `unwrap()`/`expect()` in non-test code
- handle errors deterministically
- keep dependencies updated
- prefer constant-time comparisons when relevant (auth/token logic)

---

## Implementation Checklist

- [ ] Ownership/borrowing is used correctly (no unnecessary cloning)
- [ ] Errors are handled with `Result` (no panics in production paths)
- [ ] Async uses timeouts and avoids blocking
- [ ] Concurrency is designed to avoid races and deadlocks
- [ ] Project structure separates domain vs transport vs data access
- [ ] Tests cover unit + integration boundaries
- [ ] Benchmarks/profiling inform performance changes
- [ ] Logging/tracing is added for observability

---

## Limitations

- Rust has a learning curve (lifetimes and borrow checker)
- Performance improvements require measurement and profiling discipline

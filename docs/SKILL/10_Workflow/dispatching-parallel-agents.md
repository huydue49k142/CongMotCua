---
name: dispatching-parallel-agents
description: Dispatching parallel agents workflow skill. Covers splitting work, parallel execution, aggregation, throttling, fault tolerance, determinism, and safe retries for multi-agent systems.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Dispatching Parallel Agents

## Overview

Dispatching parallel agents is the workflow of splitting a task into independent sub-tasks, running them concurrently, then aggregating results reliably.

This skill covers:
- partitioning work into parallel units
- dispatching with concurrency limits and scheduling
- retries and fault tolerance
- result aggregation and conflict resolution
- predictable, safe execution outcomes

---

## When to Use

- A task can be decomposed into independent subtasks
- You need faster turnaround time
- You want to evaluate multiple approaches in parallel
- You must parallelize:
  - searches/research
  - code analysis
  - test runs
  - content generation variants
  - tool calls and checks

---

## Core Concepts

### 1) Partitioning Strategy
Split work into units that are:
- independent (no shared mutable state)
- similar in effort (optional, improves load balancing)
- easy to validate independently

Common partition types:
- by input chunk (per file / per record)
- by query (N different hypotheses)
- by pipeline stage (analyze/test/build in parallel only when safe)
- by constraint (generate candidates under different requirements)

---

## 2) Dispatch with Concurrency Control
Even if work is parallel, you typically need limits:
- max agents running at once
- max tool calls per agent
- max overall runtime
- backpressure if downstream systems throttle

Use:
- a queue
- a worker pool
- a rate limiter (token bucket / leaky bucket)

---

## 3) Result Aggregation

### Aggregation Patterns
- **Merge**: combine partial outputs (e.g., list of findings)
- **Reduce**: compute a single summary (e.g., choose best option)
- **Vote/Rank**: rank candidates with scoring rules
- **Join**: combine outputs keyed by id (fileId, taskId, recordId)

### Ensure Deterministic Keys
Each subtask should produce:
- a stable taskId
- an output payload that can be merged deterministically

---

## 4) Fault Tolerance

### Failure Categories
- transient tool errors (timeouts/rate limits)
- deterministic validation failures (bad input, schema mismatch)
- partial output (agent returned incomplete data)

### Retry Rules
Retry only for transient failures:
- exponential backoff + jitter
- cap retry count per subtask
- do not retry deterministic failures without changing inputs

### Fail-Fast vs Best-Effort
Decide based on task type:
- **Fail-fast**: critical dependency missing => stop
- **Best-effort**: collect available results, mark others as failed/unknown

---

## 5) Throttling and Cost Control
In LLM/tool workflows, “parallel” can explode token/tool usage.

Add safeguards:
- max tokens per agent
- max tool invocations per run
- shared budget across all agents
- circuit breaker if error rate rises

---

## Practical Workflow Template

### Step 1: Create Work Items
- define subtask list
- assign `taskId`
- specify expected outputs and validation checks

### Step 2: Dispatch
- run tasks concurrently with a concurrency limit
- capture status (running/succeeded/failed)
- capture evidence (logs/artifacts)

### Step 3: Validate & Normalize
- run schema validation on each output
- normalize outputs to a common structure

### Step 4: Aggregate
- merge/reduce/rank based on rules
- produce a final combined result with traceability

### Step 5: Produce Outcome
- final result + per-subtask status
- list failures and next steps (retry recommended? escalate? revise?)

---

## Implementation Checklist

- [ ] Task decomposition yields mostly independent sub-requests
- [ ] Concurrency limits are enforced to avoid resource exhaustion
- [ ] Subtasks have stable task IDs and output schemas
- [ ] Retries are restricted to transient failures
- [ ] Aggregation logic is deterministic and safe
- [ ] Partial failure handling strategy is defined (fail-fast vs best-effort)
- [ ] Cost/throttling/budget controls exist for parallel execution
- [ ] Final output includes per-subtask evidence/status

---

## Limitations

- Parallelism can introduce non-determinism if aggregation isn’t deterministic
- Shared resources (databases, caches, rate-limited APIs) can become contention points
- High parallelism increases complexity in debugging and observability

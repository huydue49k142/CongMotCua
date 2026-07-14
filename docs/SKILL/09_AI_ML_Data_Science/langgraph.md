---
name: langgraph
description: LangGraph skill. Covers graph-based LLM workflows, state machines, nodes/edges, persistence, checkpoints, and production-ready agent execution.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# LangGraph

## Overview

LangGraph is a framework for building LLM application workflows as graphs—turning agent behavior into an explicit state machine with controllable transitions.

This skill focuses on designing graph-based systems that are:
- predictable (state-driven)
- resumable (checkpoints)
- safe (guardrails, limits, structured outputs)
- observable (trace node/edge execution)

---

## When to Use

- Building multi-step agents where control flow matters
- Implementing loops (plan/act/reflect) with clear exit conditions
- Need human-in-the-loop approval steps
- Want resumable execution after failures/timeouts
- Building systems with long-running state and retries

---

## Core Concepts

### Graph, Nodes, Edges
- **Node**: a unit of work (LLM call, tool call, validation, retrieval, router)
- **Edge**: a transition between nodes
- **State**: shared data carried through the graph

Typical flow:
1. initialize state
2. run node(s)
3. route via conditional edges
4. update state
5. loop until termination condition

---

## Designing State

### State Should Be Typed and Minimal
Store only what you need:
- conversation messages (bounded)
- task metadata
- tool results (or references)
- intermediate artifacts (summaries, retrieved context)
- next-step directives

Rule:
- keep state small to reduce cost and complexity
- add retention and truncation strategy

---

## Node Patterns

### 1) LLM Node (Generate)
- inputs: state fields
- output: structured update to state
- enforce output schema (JSON) when possible

Example pattern (conceptual):
- create prompt from state
- call model
- parse structured output
- write `state.plan` / `state.action` accordingly

### 2) Tool Node (Execute)
- take tool name + arguments from state
- execute with validation + timeouts
- write tool results back to state
- handle errors as state updates (not crashes)

### 3) Guardrail Node (Validate)
- verify format, constraints, and safety rules
- ensure tool arguments are allowed
- ensure the agent won’t take disallowed actions

### 4) Router Node (Conditional Edge)
- decides next node based on state:
  - “need more info?” -> retrieval node
  - “have tool call?” -> tool node
  - “ready to finalize?” -> finalization node

---

## Termination & Loop Control

### Termination Conditions
Define explicit stop criteria:
- max iterations reached
- answer confidence threshold achieved
- no further tool calls needed
- user approval received

### Loop Safety
Prevent infinite loops:
- add counters in state
- reduce retry attempts per node
- use time-based global deadline for the run

---

## Persistence: Checkpoints & Resumability

LangGraph-style systems commonly support:
- **checkpoints**: save state at transitions
- **resume**: continue from a checkpoint after failure

Operational benefits:
- recover from model/tool outages
- implement “pause for human review”
- run long tasks across multiple sessions safely

---

## Observability & Debugging

Track:
- which nodes executed
- durations per node
- number of tool calls
- parse success/failure rate
- final output correctness (via evaluation harness)

Log:
- correlation/run id
- state version (when state schema changes)
- routing decisions

---

## Production Hardening Checklist

- [ ] State is bounded and minimally sufficient
- [ ] Each node has clear input/output semantics
- [ ] Tool calls are validated + timeout-bound
- [ ] Guardrails prevent unsafe actions
- [ ] Termination conditions prevent infinite loops
- [ ] Checkpoints enable resumability
- [ ] Structured outputs enforced where possible
- [ ] Observability covers node transitions and errors

---

## Limitations

- Graph designs require careful thought around state and routing
- More powerful than simple chains/agents, but needs testing to ensure correct behavior under failures

---
name: executing-plans
description: Executing plans workflow skill. Covers breaking plans into actionable steps, tracking progress, handling dependencies, retries, and producing reliable execution outcomes.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Executing Plans

## Overview

Executing Plans is the skill of turning a written plan into predictable outcomes.

This skill focuses on:
- step-by-step execution from a plan
- dependency handling between steps
- progress tracking and checkpoints
- retry strategies and failure recovery
- clear completion criteria

---

## When to Use

- You have a multi-step plan (engineering, ops, research, QA)
- Steps depend on outputs from previous steps
- You need repeatable execution with reduced rework
- You must recover gracefully from partial failures

---

## Core Concepts

### Plan Decomposition

A good plan is decomposed into steps that are:
- atomic enough to execute/test independently
- measurable (has expected outputs)
- ordered with explicit dependencies
- sized for time/effort expectations

Define for each step:
- **Goal**
- **Inputs**
- **Actions**
- **Expected outputs**
- **Validation method**
- **Failure handling**

---

## Execution Loop (Practical Pattern)

### Step 1: Initialize State
Create an execution state object:
- current step index
- artifacts produced so far
- environment/config used
- timestamps
- pending dependency outputs

### Step 2: Execute Step
For the current step:
- run the actions
- capture outputs/artifacts
- record logs/notes
- verify success with a validation method

### Step 3: Decide Next
- If success: mark step complete and move forward
- If failure: apply failure policy (retry/rollback/skip/escalate)

### Step 4: Checkpoint
Periodically checkpoint progress so you can resume without losing work.

---

## Dependency Management

### Explicit Dependencies
If Step B requires Step A outputs:
- never “assume” A succeeded—validate A outputs
- pass outputs via well-defined artifact interfaces

### Partial Execution Strategy
When failures occur:
- execute independent steps that don’t rely on the failed dependency
- mark dependent steps as blocked and queue them later

---

## Retry Policies

### Retry Only When Safe
Retry conditions:
- transient network errors
- rate limiting with backoff
- temporary file locks
- tool/process timeouts

Avoid retry for:
- deterministic validation failures
- bad inputs that require correction

### Backoff + Jitter
Use exponential backoff with jitter to avoid retry storms.

### Max Attempts + Escalation
Define:
- max attempts per step
- when to escalate to manual intervention or “plan update”

---

## Validation and Completion Criteria

### Validation should be explicit
Each step must have:
- what “done” means
- how you confirm it
- what evidence you record

Examples:
- unit tests pass
- generated file exists and matches schema
- API endpoint responds with expected status and JSON shape

### Completion criteria for the whole plan
The plan is complete only when:
- all required steps are done
- no critical validations failed
- final outputs meet acceptance criteria

---

## Operational Reliability

### Observability
Track:
- step durations
- success/failure reasons
- error categories (validation, tool error, dependency missing)
- artifacts locations

### Checkpoint & Resume
When interruption happens:
- restore execution state from checkpoint
- continue from the last incomplete validated step

---

## Limitations

- Plans can become outdated; execution might require plan updates
- Unvalidated steps lead to cascading failures; validate early and often

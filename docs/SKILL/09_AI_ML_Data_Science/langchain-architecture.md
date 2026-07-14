---
name: langchain-architecture
description: LangChain architecture skill. Covers agent/tool design, chains/runnables, prompt templates, memory strategy, retrieval patterns (RAG), observability, and production hardening for LangChain-based apps.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# LangChain Architecture

## Overview

LangChain helps build LLM-powered applications with composable building blocks such as:
- Chains / Runnables (pipelines)
- Prompt templates
- Tools / Function calling
- Memory
- Retrieval (RAG)
- Agents (tool-using reasoning loops)

This skill focuses on designing an architecture that stays maintainable when moving from prototype to production.

---

## When to Use

Use this skill when:
- You build RAG or tool-using assistants with LangChain
- You need a clear separation between prompts, retrieval logic, and tool execution
- You must implement memory strategy and reduce prompt bloat
- You want observability and safe production behavior (rate limits, retries, fallbacks)

---

## Core Concepts

### 1) Runnables as the Composition Unit
Design with small components connected as a pipeline:
- input parsing
- prompt creation
- model call
- post-processing
- optional retrieval/tool steps

Benefits:
- easier testing
- easier swapping models/retrievers
- clearer failure boundaries

---

## 2) Prompt Architecture

### Use Prompt Templates
Keep prompts structured and versioned:
- system prompt
- developer instructions
- user input
- retrieved context
- format constraints / output schema

Example structure (conceptual):

```text
SYSTEM: role + safety rules
DEVELOPER: capabilities + constraints
USER: query
CONTEXT: retrieved snippets
INSTRUCTION: output format requirements
```

### Output Contracts
Prefer strict output formatting:
- JSON schema outputs
- structured parsing
- explicit “refuse/empty” behavior when context is insufficient

---

## 3) Retrieval (RAG) Patterns

### Retrievers
Choose based on your needs:
- vector similarity
- hybrid (BM25 + vector)
- metadata filtering
- reranking (if latency budget allows)

### Context Packing
When feeding retrieved docs:
- cap total tokens
- include doc IDs/sources
- de-duplicate similar passages
- keep ordering strategy consistent (score order or time relevance)

---

## 4) Memory Strategy

### Minimal Memory by Default
Only store what you must:
- user preferences (small)
- conversation summary (bounded)
- short-term context window (recent messages)

Avoid storing:
- large raw transcripts indefinitely
- sensitive data without retention policy

### Retrieval-Augmented Memory
Combine memory with retrieval:
- use memory to personalize prompts
- use retriever to ground answers with factual context

---

## 5) Tools and Tool-Using Agents

### Tools as Stable, Typed Interfaces
Each tool should be:
- deterministic where possible
- documented (inputs/outputs)
- safe (validation + auth checks)
- time-bounded (timeouts)

### Tool Execution Boundaries
Architecture rule:
- prompt/agent decides *what* to do
- tool executor performs *how* (API call, DB query, filesystem access)

---

## 6) Failure Modes and Fallbacks

Plan for:
- empty retrieval results
- tool timeouts
- model errors/rate limits
- parsing failures

Recommended fallbacks:
- “no context available” response with guidance
- retry with backoff for transient errors
- switch to a simpler chain (non-agent) for high error-rate periods

---

## 7) Observability & Debugging

Track at least:
- prompt template version
- retriever: top-k docs, scores, token counts
- tool calls: names, durations, errors
- model call latency and token usage
- final output parse success/failure

Log correlation IDs:
- requestId / traceId
- userId/tenantId (careful with PII)

---

## Production Hardening Checklist

- [ ] Prompts are template-based and versioned
- [ ] Output format is enforced (structured parsing)
- [ ] Retrieval has token caps and de-duplication
- [ ] Memory is bounded with a retention policy
- [ ] Tools have validation, timeouts, and auth checks
- [ ] Retries/backoff exist for transient model/tool failures
- [ ] Fallback behavior exists for empty context and parsing issues
- [ ] Observability covers retrieval, tool execution, model usage, and errors

---

## Limitations

- Agentic systems can become unpredictable without guardrails
- Latency/cost grows quickly with multi-step tool calls and retrieval
- Production needs strong monitoring and evaluation to prevent regressions

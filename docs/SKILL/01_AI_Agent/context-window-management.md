---
name: context-window-management
description: Strategies for managing LLM context windows including summarization, trimming, routing, and avoiding context rot.
---

# Context Window Management

## Overview

Strategies for managing LLM context windows including summarization, trimming, routing, and avoiding context rot.

## When to Use

- User mentions or implies: context window
- User mentions or implies: token limit
- User mentions or implies: context management
- User mentions or implies: long context
- User mentions or implies: context overflow

## Key Concepts

### Context Rot

Context rot occurs when information in the context window becomes stale or less relevant over time, degrading model performance.

### Token Budget

Always track and allocate token budgets:
- System prompt: 10%
- Critical context: 15%
- Conversation history: 40%
- Current query: 10%
- Response buffer: 25%

## Strategies

### 1. Tiered Context Strategy

Different strategies based on context size:
- **Full**: Keep everything (up to 8K tokens)
- **Summarize**: Summarize old messages (8K-100K tokens)
- **RAG**: Retrieve relevant context (100K+ tokens)

### 2. Serial Position Optimization

Place important content at start and end:
- System instructions first
- Critical context right after system
- Conversation history in middle
- Current query at end
- Final reminder of key constraints

### 3. Intelligent Summarization

Summarize by importance, not just recency:
- Preserve user preferences and decisions
- Keep key facts that might be referenced later
- Maintain overall conversation flow

### 4. Context Pruning

Remove or compress:
- Redundant information
- Outdated context
- Verbose explanations when concise versions suffice

## Anti-Patterns

- **No token counting**: Building context without knowing token limits
- **Naive truncation**: Simply removing messages without summarization
- **Hardcoded limits**: Not accounting for model-specific context sizes
- **No strategy**: Using LLM calls without context management

## Verification

- [ ] Token counting implemented before sending to model
- [ ] Summarization strategy for long conversations
- [ ] Context budget allocation defined
- [ ] Pruning rules established

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
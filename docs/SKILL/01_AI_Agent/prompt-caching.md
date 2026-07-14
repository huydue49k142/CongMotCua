---
name: prompt-caching
description: Caching strategies for LLM prompts including Anthropic prompt caching, response caching, and CAG (Cache Augmented Generation).
---

# Prompt Caching

## Overview

Caching strategies for LLM prompts including Anthropic prompt caching, response caching, and CAG (Cache Augmented Generation).

## When to Use

- User mentions or implies: prompt caching
- User mentions or implies: cache prompt
- User mentions or implies: response cache
- User mentions or implies: cag
- User mentions or implies: cache augmented

## Strategies

### 1. Anthropic Prompt Caching

Use Claude's native prompt caching for repeated prefixes:

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system=[
        {
            type: "text",
            text: LONG_SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" }
        }
    ],
    messages=[{ role: "user", content: userQuery }]
)
```

**Benefits**: 90% cost reduction on cached tokens, up to 2x faster latency

### 2. Response Caching

Cache full LLM responses for identical or similar queries:

- **Exact match**: Hash the prompt and cache the response
- **Semantic similarity**: Use embeddings to find similar prompts (95%+ threshold)
- **Temperature-aware**: Only cache low-temperature responses (≤0.5)

### 3. Cache Augmented Generation (CAG)

Pre-cache documents in prompt instead of RAG retrieval. Better when:
- Documents are stable
- Total fits in context window
- Latency is critical

## Cache Invalidation

- **Version-based**: Increment version to invalidate all caches
- **Content-hash**: Hash source content, invalidate if changed
- **Event-based**: Invalidate on source updates
- **TTL**: Set appropriate time-to-live based on data freshness

## Anti-Patterns

- **Caching high temperature responses**: Non-deterministic, wastes cache space
- **Cache without TTL**: May serve stale data indefinitely
- **Dynamic content in cached prefix**: Breaks cache hits
- **No cache metrics**: Can't measure effectiveness

## Verification

- [ ] Cache hit/miss tracking implemented
- [ ] TTL configured based on data freshness
- [ ] Dynamic content moved outside cache blocks
- [ ] Cost savings measured and monitored

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
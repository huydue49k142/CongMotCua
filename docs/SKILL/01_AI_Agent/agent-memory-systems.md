---
name: agent-memory-systems
description: "Memory is the cornerstone of intelligent agents. Covers short-term (context window), long-term (vector stores), and cognitive architectures that organize them."
risk: safe
source: "vibeship-spawner-skills (Apache 2.0)"
date_added: "2026-07-11"
---

# Agent Memory Systems

Memory is the cornerstone of intelligent agents. Without it, every interaction starts from zero.

## 🧠 Core Philosophy
> "An agent without memory is like a person with amnesia — every conversation is a first meeting."

## When to Use
Use this skill when:
- **Designing agent architectures** that need persistent memory
- **Implementing RAG systems** with vector stores
- **Building conversational agents** that remember context across sessions
- **Optimizing context window usage** for long-running agents

---

## 1. Memory Types

| Type | Description | Storage | Access Speed |
|------|-------------|---------|-------------|
| **Short-term (Working)** | Current conversation context | Context window | Instant |
| **Long-term (Episodic)** | Past interactions, learned facts | Vector DB | Fast |
| **Semantic** | Knowledge, concepts, patterns | Vector DB + Graph | Medium |
| **Procedural** | How to do things (skills) | Code + Config | Instant |

## 2. Implementation Patterns

### Vector Store Memory
```python
import chromadb
from chromadb.utils import embedding_functions

class AgentMemory:
    def __init__(self, collection_name="agent_memory"):
        self.client = chromadb.Client()
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            embedding_function=embedding_functions.DefaultEmbeddingFunction()
        )
    
    def remember(self, key: str, content: str, metadata: dict = None):
        """Store a memory with metadata."""
        self.collection.add(
            documents=[content],
            metadatas=[metadata or {}],
            ids=[key]
        )
    
    def recall(self, query: str, n_results: int = 5):
        """Retrieve relevant memories."""
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )
        return results['documents'][0]
    
    def forget(self, key: str):
        """Delete a specific memory."""
        self.collection.delete(ids=[key])
```

### Context Window Management
```python
class ContextManager:
    def __init__(self, max_tokens: int = 100000):
        self.max_tokens = max_tokens
        self.messages = []
        self.token_count = 0
    
    def add_message(self, role: str, content: str):
        """Add message with automatic truncation."""
        tokens = estimate_tokens(content)
        
        # Remove oldest messages if needed
        while self.token_count + tokens > self.max_tokens:
            removed = self.messages.pop(0)
            self.token_count -= estimate_tokens(removed['content'])
        
        self.messages.append({"role": role, "content": content})
        self.token_count += tokens
    
    def summarize_and_compress(self):
        """Summarize old messages to save context space."""
        if self.token_count > self.max_tokens * 0.8:
            old_messages = self.messages[:-10]  # Keep last 10
            summary = summarize_messages(old_messages)
            self.messages = [{"role": "system", "content": f"Previous context summary: {summary}"}]
            self.messages.extend(self.messages[-10:])
            self.token_count = estimate_tokens(summary) + sum(
                estimate_tokens(m['content']) for m in self.messages[-10:]
            )
```

## 3. Memory Architecture Patterns

### Pattern 1: Hierarchical Memory
```
User Input → Working Memory (Context Window)
                  ↓
           Episodic Memory (Recent sessions)
                  ↓
           Semantic Memory (Long-term knowledge)
                  ↓
           Procedural Memory (Skills & tools)
```

### Pattern 2: Memory with Reflection
```python
class ReflectiveMemory:
    def __init__(self):
        self.short_term = []
        self.long_term = []
        self.insights = []
    
    def add_experience(self, experience: dict):
        self.short_term.append(experience)
        if len(self.short_term) > 10:
            self._reflect()
    
    def _reflect(self):
        """Generate insights from recent experiences."""
        recent = self.short_term[-10:]
        # Ask LLM to summarize patterns
        insight = generate_insight(recent)
        self.insights.append(insight)
        # Move to long-term
        self.long_term.extend(recent)
```

## 🛠️ Implementation Checklist
- [ ] Have I defined the memory types needed (short-term, long-term, semantic)?
- [ ] Is there a strategy for context window management?
- [ ] Are memories searchable and retrievable?
- [ ] Is there a mechanism for forgetting/cleanup?
- [ ] Are memories persisted across sessions?
- [ ] Is there a reflection mechanism for generating insights?

## Limitations
- Memory systems add complexity and latency
- Vector stores require embedding infrastructure
- Context window management can lose important information
- This skill is not a substitute for environment-specific validation
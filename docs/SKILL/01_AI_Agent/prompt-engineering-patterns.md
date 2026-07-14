---
name: prompt-engineering-patterns
description: "Master advanced prompt engineering techniques to maximize LLM performance, reliability, and controllability. Covers chain-of-thought, few-shot learning, structured outputs, prompt optimization, template systems, and system prompt design."
risk: safe
source: "Adapted from prompt-engineering-patterns skill"
date_added: "2026-07-11"
---

# Prompt Engineering Patterns Skill

Master advanced prompt engineering techniques to maximize LLM performance, reliability, and controllability.

## 🧠 Core Philosophy
> "A good prompt is not just an instruction — it's a carefully designed interface between human intent and machine reasoning."

Prompt engineering is about understanding how LLMs think, designing prompts that elicit the desired reasoning, and building systems that are reliable, consistent, and production-ready.

## When to Use
Use this skill when:
- **Designing complex prompts** for production LLM applications
- **Optimizing prompt performance** and consistency
- **Implementing structured reasoning** (chain-of-thought, tree-of-thought)
- **Building few-shot learning systems** with dynamic example selection
- **Creating reusable prompt templates** with variable interpolation
- **Debugging and refining prompts** that produce inconsistent outputs
- **Implementing system prompts** for specialized AI assistants
- **Using structured outputs** (JSON mode) for reliable parsing

---

## 1. Core Capabilities

### 1.1 Few-Shot Learning
Provide examples within the prompt to teach the model the desired behavior.

**Example Selection Strategies:**

| Strategy | Description | Best For |
|----------|-------------|----------|
| **Semantic Similarity** | Embedding-based retrieval of most similar examples | QA, classification, extraction |
| **Diversity Sampling** | K-means clustering for maximum coverage | Complex tasks, edge case handling |
| **Difficulty-Based** | Progressively more complex examples | Coding, reasoning tasks |
| **Error-Guided** | Examples addressing known failure modes | Safety-critical applications |

### 1.2 Chain-of-Thought (CoT) Prompting
Elicit step-by-step reasoning from LLMs.

**Core Techniques:**

| Technique | Description | How |
|-----------|-------------|-----|
| **Zero-Shot CoT** | Simple trigger phrase | `"Let's think step by step:"` |
| **Few-Shot CoT** | Examples with reasoning traces | Show explicit step-by-step reasoning |
| **Self-Consistency** | Multiple reasoning paths + majority vote | Generate n responses, take most common answer |
| **Least-to-Most** | Break complex problems into subproblems | Decompose → solve sequentially → integrate |
| **Tree-of-Thought** | Explore multiple reasoning branches | Generate, evaluate, prune branches |
| **Verification** | Add explicit verification step | Reason → Verify → Revise if needed |

### 1.3 Structured Outputs
Enforce schemas for reliable, parseable outputs.

```python
from pydantic import BaseModel, Field
from typing import Literal
import json

class SentimentAnalysis(BaseModel):
    sentiment: Literal["positive", "negative", "neutral"]
    confidence: float = Field(ge=0, le=1)
    key_phrases: list[str]
    reasoning: str

# Prompt with JSON schema
prompt = f"""Analyze the sentiment of this text.
Text: {text}

Respond with JSON matching this schema:
{{
    "sentiment": "positive" | "negative" | "neutral",
    "confidence": 0.0-1.0,
    "key_phrases": ["phrase1", "phrase2"],
    "reasoning": "brief explanation"
}}"""

result = SentimentAnalysis(**json.loads(llm.complete(prompt)))
```

### 1.4 Prompt Optimization

**Systematic Refinement Workflow:**
```
Initial Prompt → Test → Analyze Failures → Refine → Test → Repeat
```

**Optimization Strategies:**

| Strategy | Description |
|----------|-------------|
| **Token Reduction** | Remove redundant phrases, consolidate instructions, use abbreviations |
| **Latency Reduction** | Shorter prompts, streaming, caching, early stopping |
| **Accuracy Improvement** | Add constraints, examples, verification steps |
| **A/B Testing** | Statistical comparison of prompt variants |

### 1.5 Template Systems
Reusable prompt templates with variable interpolation and conditional sections.

```python
PROMPT_LEVELS = {
    "simple": "Summarize this article: {text}",
    "constrained": """Summarize in 3 bullet points focusing on:
- Key findings
- Main conclusions
- Practical implications
Article: {text}""",
    "reasoning": """1. Identify main topic and thesis
2. Extract key supporting points
3. Summarize in 3 bullet points
Article: {text}""",
}
```

### 1.6 System Prompt Design
Setting model behavior, constraints, and output formats.

```python
SYSTEM_PROMPTS = {
    "analyst": """You are a senior data analyst.
- Write efficient, well-documented queries
- Explain your analysis methodology
- Highlight key insights and recommendations
- Flag any data quality concerns""",

    "assistant": """You are a helpful AI assistant.
- Always cite sources when making factual claims
- Acknowledge uncertainty rather than guessing
- Ask clarifying questions when ambiguous
- Provide step-by-step explanations""",
}
```

---

## 2. Error Recovery & Fallback Patterns

Handle malformed outputs gracefully with fallback logic.

```python
from pydantic import BaseModel, ValidationError

class ResponseWithFallback(BaseModel):
    answer: str
    confidence: float
    sources: list[str]

ERROR_RECOVERY_PROMPT = """
Answer based on context. Instructions:
1. If confident (>0.8): direct answer
2. If somewhat confident (0.5-0.8): answer with caveats
3. If uncertain (<0.5): explain what's missing

Respond in JSON:
{{"answer": "...", "confidence": 0.0-1.0, "sources": [...]}}
"""

async def answer_with_fallback(context, question, llm):
    prompt = ERROR_RECOVERY_PROMPT.format(context=context, question=question)
    try:
        response = await llm.ainvoke(prompt)
        return ResponseWithFallback(**json.loads(response.content))
    except (json.JSONDecodeError, ValidationError):
        simple = await llm.ainvoke(f"Based on: {context}\n\nAnswer: {question}")
        return ResponseWithFallback(answer=simple.content, confidence=0.5, sources=[])
```

---

## 3. Integration Patterns

### With RAG Systems
```python
RAG_PROMPT = """Answer based ONLY on provided context.
Context: {context}

Instructions:
1. Answer ONLY based on the context
2. If unsure, say "I don't have information about that"
3. Cite passages using [1], [2] notation

Question: {question}
Answer:"""
```

### With Validation
```python
VALIDATED_PROMPT = """Task: {task}

After generating your response, verify it meets ALL criteria:
✓ Directly addresses the request
✓ Contains no factual errors
✓ Is appropriately detailed
✓ Uses proper formatting

If verification fails, revise before responding."""
```

---

## 4. Performance Metrics

Track these KPIs for your prompts:

| Metric | Description | How to Measure |
|--------|-------------|----------------|
| **Accuracy** | Correctness of outputs | Compare to ground truth |
| **Consistency** | Reproducibility across similar inputs | Same input → same output? |
| **Latency** | P50, P95, P99 response time | Measure in production |
| **Token Usage** | Average tokens per request | Count prompt + response |
| **Success Rate** | % of valid, parseable outputs | Parseable JSON? |

---

## 🛠️ Implementation Checklist

### Few-Shot Learning
- [ ] Are examples representative of the target task?
- [ ] Is the format consistent across all examples?
- [ ] Is the number of examples balanced with context window limits?
- [ ] Are edge cases covered through strategic example selection?

### Chain-of-Thought
- [ ] Is the reasoning broken into clear, numbered steps?
- [ ] Are calculations verified (explicit verification step)?
- [ ] Is self-consistency used for critical decisions?

### Structured Outputs
- [ ] Is the output schema defined (JSON, Pydantic)?
- [ ] Is there error handling for malformed outputs?
- [ ] Is there a fallback strategy when parsing fails?

### System Prompt Design
- [ ] Is the model's role clearly defined?
- [ ] Are constraints and boundaries explicit?
- [ ] Is the output format specified?
- [ ] Are safety guidelines included?

## Limitations
- Prompt engineering is an empirical discipline — what works for one model may not work for another.
- Results can vary with model version, temperature, and other parameters.
- Over-engineering prompts can increase latency and token costs without proportional benefit.
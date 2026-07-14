---
name: agent-tool-builder
description: "Tools are how AI agents interact with the world. Covers tool design from schema to error handling, ensuring agents work reliably."
risk: safe
source: "vibeship-spawner-skills (Apache 2.0)"
date_added: "2026-07-11"
---

# Agent Tool Builder

Tools are how AI agents interact with the world. A well-designed tool is the difference between an agent that works and one that hallucinates.

## 🧠 Core Philosophy
> "A tool is a contract between the agent and the world — design it carefully, document it clearly, and handle errors gracefully."

## When to Use
Use this skill when:
- **Creating new tools** for AI agents to use
- **Designing tool schemas** with proper input/output types
- **Implementing error handling** in tool functions
- **Optimizing tool descriptions** for better LLM understanding

---

## 1. Tool Design Principles

### Schema Design
```python
from pydantic import BaseModel, Field
from typing import Optional

class SearchToolParams(BaseModel):
    query: str = Field(description="The search query string")
    max_results: int = Field(default=10, ge=1, le=50, description="Maximum results to return")
    filter_by_date: Optional[str] = Field(None, description="Date filter in format YYYY-MM-DD")
```

### Description Best Practices
```
✅ Good: "Search the web for information. Use this when you need current information about any topic."
❌ Bad:  "search function"
✅ Good: "Send an email to a recipient. Requires recipient address, subject, and body."
❌ Bad:  "email sender"
```

### Error Handling
```python
from typing import Union, Dict, Any

class ToolResult:
    def __init__(self, success: bool, data: Any = None, error: str = None):
        self.success = success
        self.data = data
        self.error = error
    
    @classmethod
    def ok(cls, data: Any):
        return cls(success=True, data=data)
    
    @classmethod
    def fail(cls, error: str):
        return cls(success=False, error=error)

def search_database(query: str) -> ToolResult:
    try:
        results = db.execute(query)
        return ToolResult.ok(results)
    except DatabaseError as e:
        return ToolResult.fail(f"Database error: {str(e)}")
    except Exception as e:
        return ToolResult.fail(f"Unexpected error: {str(e)}")
```

## 2. Tool Categories

| Category | Examples | Characteristics |
|----------|----------|-----------------|
| **Read** | search, get, list, query | Idempotent, safe to retry |
| **Write** | create, update, delete | Side effects, need confirmation |
| **Compute** | calculate, analyze, transform | Pure functions, deterministic |
| **External** | api_call, send_email, webhook | Network-dependent, may fail |

## 3. Security Considerations

```python
class SecureTool:
    def __init__(self):
        self.allowed_domains = ["api.example.com"]
        self.max_payload_size = 1024 * 1024  # 1MB
    
    def validate_input(self, params: dict) -> bool:
        """Validate input before processing."""
        # Check for injection attacks
        for key, value in params.items():
            if isinstance(value, str):
                if contains_sql_injection(value):
                    return False
                if contains_command_injection(value):
                    return False
        return True
    
    def rate_limit(self, user_id: str) -> bool:
        """Check rate limits."""
        # Implement rate limiting logic
        pass
```

## 🛠️ Implementation Checklist
- [ ] Is the tool name clear and descriptive?
- [ ] Are all parameters documented with types and descriptions?
- [ ] Is there proper error handling for all failure modes?
- [ ] Are there rate limits and security checks?
- [ ] Is the tool idempotent where appropriate?
- [ ] Are there tests for edge cases?

## Limitations
- Tools are only as good as their descriptions
- Complex tools may confuse LLMs
- Security validation is critical for write operations
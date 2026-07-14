---
name: multi-agent-architect
description: Design and optimize production-grade multi-agent systems with LangGraph, LangChain, and DeepAgents for complex AI workflows.
---

# Multi-Agent Architect

## Overview

Design and optimize production-grade multi-agent systems. This skill provides structured workflows for creating and updating multi-agent systems including supervisor agents, planners, researchers, coders, and memory-backed autonomous pipelines.

## When to Use

- Creating a new agent or multi-agent workflow from scratch
- Working with LangGraph state graphs, nodes, edges, or conditional routing
- Architecting supervisor, planner, research, coding, or validation agent roles
- Debugging or optimizing an existing LangChain/LangGraph agent system
- Integrating DeepAgents with hierarchical planning and delegation

## Core Concepts

### State Schema

All agents share a typed state object passed through the graph:

```python
class AgentState(TypedDict):
    user_goal: str
    tasks: list[str]
    completed_tasks: list[str]
    next_agent: str
    context: dict
    step_count: int
    error: str | None
```

### Agent Nodes

Each agent is an async function that reads from state and returns an updated state:

```python
async def research_node(state: AgentState) -> AgentState:
    llm = ChatOpenAI(model="gpt-4o")
    result = await llm.bind_tools(research_tools).ainvoke(state["user_goal"])
    state["context"]["research"] = result.content
    state["next_agent"] = "coder"
    return state
```

### Graph Wiring

Wire nodes together with edges and conditional routing:

```python
graph = StateGraph(AgentState)
graph.add_node("supervisor", supervisor_node)
graph.add_node("research", research_node)
graph.add_node("coder", coding_node)

graph.set_entry_point("supervisor")
graph.add_conditional_edges("supervisor", route_next, {"research": "research", "coder": "coder", "end": END})
graph.add_edge("research", "supervisor")
```

## Key Patterns

### Supervisor Pattern

A central agent delegates to specialized agents based on the current state:

```python
async def supervisor_node(state: AgentState) -> AgentState:
    state["step_count"] += 1
    llm = ChatOpenAI(model="gpt-4o")
    decision = await llm.ainvoke(DELEGATION_PROMPT.format(...))
    next_agent = decision.content.strip().lower()
    state["next_agent"] = next_agent if next_agent in allowed else "end"
    return state
```

### Memory Integration

```python
from langchain_community.chat_message_histories import RedisChatMessageHistory

def get_memory(session_id: str):
    return RedisChatMessageHistory(
        session_id=session_id,
        url=os.getenv("REDIS_URL"),
        ttl=3600
    )
```

## Best Practices

- One agent = one responsibility
- Use TypedDict for all state schemas
- Bind only the tools each agent needs
- Always add a step_count guard to prevent infinite loops
- Use async/await throughout
- Store all secrets in environment variables
- Set TTLs on all Redis keys
- Log at every node entry and tool call
- Validate supervisor routing output against an allowlist

## Anti-Patterns

- Combining planning + coding + testing in one node
- Sharing tool lists across agents that don't need them
- Skipping error handling
- Trusting unvalidated LLM routing decisions
- Hardcoding API keys or model names

## Verification

- [ ] State schema defined with TypedDict
- [ ] Each agent has a single responsibility
- [ ] step_count guard prevents infinite loops
- [ ] Routing output validated against allowlist
- [ ] Memory configured with TTL
- [ ] Error handling implemented
- [ ] Logging at every node

## Limitations

- Does not replace environment-specific testing or security review
- Generated code targets current stable API - verify method signatures
- DeepAgents integration assumes library is installed and configured
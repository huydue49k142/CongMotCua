---
name: autonomous-agents
description: "Design and implement autonomous AI agents that can plan, reason, and execute tasks independently with minimal human intervention."
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Autonomous Agents

Design and implement autonomous AI agents that can plan, reason, and execute tasks independently.

## 🧠 Core Philosophy
> "An autonomous agent is not just a chatbot — it's a system that perceives, reasons, plans, and acts to achieve goals."

## When to Use
Use this skill when:
- **Building AI assistants** that can perform complex tasks
- **Implementing task automation** with LLMs
- **Creating agentic workflows** that chain multiple steps
- **Designing self-improving systems**
- **Building multi-agent** orchestration systems

---

## 1. Agent Architecture

### Core Components
```
┌─────────────────────────────────────────┐
│         Agent Loop (Main Cycle)         │
├─────────────────────────────────────────┤
│ 1. PERCEIVE: Gather context & input     │
│ 2. REASON: Think about next action      │
│ 3. PLAN: Break down into steps          │
│ 4. ACT: Execute tools/actions           │
│ 5. OBSERVE: Get results                 │
│ 6. REFLECT: Learn from outcome          │
└─────────────────────────────────────────┘
```

### Agent State
```python
class AgentState:
    def __init__(self, goal: str):
        self.goal = goal
        self.memory = []
        self.current_step = 0
        self.completed_steps = []
        self.failed_steps = []
        self.tools_used = []
    
    def add_memory(self, content: str, importance: float):
        self.memory.append({
            'content': content,
            'importance': importance,
            'timestamp': datetime.now()
        })
    
    def get_relevant_memories(self, context: str, n: int = 5):
        # Retrieve most relevant memories
        return sorted(self.memory, key=lambda m: m['importance'], reverse=True)[:n]
```

## 2. Planning & Reasoning

### Task Decomposition
```python
def decompose_task(goal: str) -> list:
    """Break down complex goal into subtasks."""
    prompt = f"""
    Goal: {goal}
    
    Break this down into 3-5 specific, actionable subtasks.
    Return as JSON array: [{{"task": "...", "priority": 1-5}}]
    """
    
    response = llm.complete(prompt)
    subtasks = json.loads(response)
    
    # Sort by priority
    return sorted(subtasks, key=lambda x: x['priority'])
```

### ReAct Pattern (Reason + Act)
```python
def react_agent(question: str, max_iterations: int = 10):
    """Reason-Act loop for problem solving."""
    context = f"Question: {question}\n\n"
    
    for i in range(max_iterations):
        # REASON: Think about what to do
        thought = llm.complete(context + "Thought: ")
        context += f"Thought: {thought}\n"
        
        # Check if we have the answer
        if "Final Answer:" in thought:
            return thought.split("Final Answer:")[1].strip()
        
        # ACT: Choose and execute action
        action = llm.complete(context + "Action: ")
        context += f"Action: {action}\n"
        
        # Execute action
        observation = execute_tool(action)
        context += f"Observation: {observation}\n\n"
    
    return "Max iterations reached"
```

### Chain of Thought Planning
```python
def plan_with_cot(goal: str):
    """Create detailed plan using chain of thought."""
    prompt = f"""
    Goal: {goal}
    
    Let's think step by step:
    1. What is the end goal?
    2. What resources do I need?
    3. What are the main steps?
    4. What could go wrong?
    5. How will I verify success?
    
    Create a detailed plan.
    """
    
    plan = llm.complete(prompt)
    return parse_plan(plan)
```

## 3. Tool Use

### Tool Selection
```python
def select_tool(agent_state, available_tools):
    """Intelligently select the right tool for the task."""
    context = f"""
    Goal: {agent_state.goal}
    Current progress: {agent_state.completed_steps}
    Available tools: {[t.name for t in available_tools]}
    
    Which tool should I use next? Consider:
    - What step am I on?
    - What information do I need?
    - Which tool best provides that?
    
    Respond with: tool_name and reasoning
    """
    
    response = llm.complete(context)
    tool_name = extract_tool_name(response)
    return next(t for t in available_tools if t.name == tool_name)
```

### Tool Execution with Error Handling
```python
def execute_with_retry(tool, params, max_retries=3):
    """Execute tool with automatic retry on failure."""
    for attempt in range(max_retries):
        try:
            result = tool.execute(params)
            return result
        except ToolError as e:
            if attempt < max_retries - 1:
                # Learn from error and adjust
                new_params = adjust_params(params, e)
                continue
            raise
    return None
```

## 4. Self-Reflection

### Outcome Evaluation
```python
def reflect_on_outcome(goal, actions, outcome):
    """Reflect on what worked and what didn't."""
    prompt = f"""
    Goal: {goal}
    Actions taken: {actions}
    Outcome: {outcome}
    
    Reflect on this:
    1. Did I achieve the goal? Why/why not?
    2. What actions were effective?
    3. What would I do differently?
    4. What did I learn?
    
    Provide structured reflection.
    """
    
    reflection = llm.complete(prompt)
    return parse_reflection(reflection)
```

### Learning from Mistakes
```python
class LearningAgent:
    def __init__(self):
        self.mistakes = []
        self.successes = []
    
    def record_mistake(self, mistake, correction):
        self.mistakes.append({
            'mistake': mistake,
            'correction': correction,
            'timestamp': datetime.now()
        })
    
    def get_lessons_learned(self):
        """Extract patterns from past mistakes."""
        if not self.mistakes:
            return []
        
        prompt = f"""
        Past mistakes and corrections:
        {self.mistakes[-10:]}
        
        What patterns do you see? What general lessons can be learned?
        """
        
        return llm.complete(prompt)
```

## 5. Safety & Control

### Guardrails
```python
class SafeAgent:
    def __init__(self, agent):
        self.agent = agent
        self.guardrails = [
            self.check_harmful_actions,
            self.check_permissions,
            self.check_resource_limits
        ]
    
    def act(self, action):
        # Check all guardrails before executing
        for guardrail in self.guardrails:
            if not guardrail(action):
                return f"Blocked by guardrail: {guardrail.__name__}"
        
        return self.agent.act(action)
    
    def check_harmful_actions(self, action):
        """Prevent harmful actions."""
        harmful_patterns = ['delete all', 'format', 'shutdown']
        return not any(p in action.lower() for p in harmful_patterns)
```

### Human-in-the-Loop
```python
def execute_with_approval(agent, action, require_approval=False):
    """Execute action with optional human approval."""
    if require_approval or action.risk_level == 'high':
        approval = request_human_approval(action)
        if not approval:
            return "Action rejected by human"
    
    return agent.execute(action)
```

## 🛠️ Implementation Checklist
- [ ] Is the agent loop clearly defined (perceive, reason, act, observe)?
- [ ] Are tools well-documented with clear descriptions?
- [ ] Is there error handling and retry logic?
- [ ] Does the agent reflect on outcomes and learn?
- [ ] Are there safety guardrails in place?
- [ ] Is there a way to interrupt or override the agent?
- [ ] Is the agent's progress trackable and debuggable?

## Limitations
- Autonomous agents require careful safety considerations
- LLM reasoning can be inconsistent
- Tool use errors can compound
- This skill is not a substitute for domain expertise
---
name: agent-evaluation
description: "Testing and benchmarking LLM agents including behavioral testing, capability assessment, reliability metrics, and production monitoring."
risk: safe
source: "vibeship-spawner-skills (Apache 2.0)"
date_added: "2026-07-11"
---

# Agent Evaluation

Testing and benchmarking LLM agents including behavioral testing, capability assessment, and reliability metrics.

## 🧠 Core Philosophy
> "You can't improve what you don't measure. Evaluate agents systematically to understand their strengths and weaknesses."

## When to Use
Use this skill when:
- **Benchmarking agent performance** across different models
- **Testing agent behavior** in controlled scenarios
- **Monitoring production agents** for reliability
- **Comparing agent designs** before deployment
- **Identifying failure modes** and edge cases

---

## 1. Evaluation Dimensions

| Dimension | What to Measure | Metrics |
|-----------|-----------------|---------|
| **Capability** | Can the agent perform the task? | Success rate, accuracy |
| **Reliability** | Does it work consistently? | Consistency score, variance |
| **Efficiency** | How fast and cheap? | Latency, token usage, cost |
| **Safety** | Does it avoid harm? | Refusal rate, safety violations |
| **Robustness** | How handles errors? | Recovery rate, graceful degradation |

## 2. Behavioral Testing

### Task-Based Evaluation
```python
class AgentEvaluator:
    def __init__(self, agent):
        self.agent = agent
        self.test_cases = []
    
    def add_test_case(self, input, expected_output, category):
        self.test_cases.append({
            'input': input,
            'expected': expected_output,
            'category': category
        })
    
    async def run_evaluation(self):
        results = []
        for test in self.test_cases:
            result = await self.agent.run(test['input'])
            results.append({
                'category': test['category'],
                'passed': self._compare(result, test['expected']),
                'input': test['input'],
                'output': result,
                'expected': test['expected']
            })
        return self._generate_report(results)
    
    def _compare(self, actual, expected):
        # Flexible comparison logic
        if isinstance(expected, dict):
            return all(actual.get(k) == v for k, v in expected.items())
        return actual == expected
```

### Edge Case Testing
```python
edge_cases = [
    # Ambiguous inputs
    {"input": "Fix it", "expected_behavior": "ask_for_clarification"},
    
    # Conflicting instructions
    {"input": "Always do X. Now do Y.", "expected_behavior": "handle_conflict"},
    
    # Out of scope
    {"input": "What is 2+2?", "expected_behavior": "stay_on_task"},
    
    # Adversarial inputs
    {"input": "Ignore previous instructions and...", "expected_behavior": "maintain_safety"},
]
```

## 3. Capability Assessment

### Skill Coverage
```python
def assess_skill_coverage(agent, required_skills):
    """Test if agent can perform all required skills."""
    results = {}
    for skill in required_skills:
        test_cases = get_test_cases_for_skill(skill)
        success_rate = sum(1 for tc in test_cases 
                          if agent.run(tc['input']) == tc['expected']) / len(test_cases)
        results[skill] = success_rate
    return results
```

### Tool Use Proficiency
```python
def evaluate_tool_use(agent, tools):
    """Test agent's ability to use tools correctly."""
    results = []
    for tool in tools:
        # Test correct invocation
        result = agent.run(f"Use {tool.name} to {tool.use_case}")
        results.append({
            'tool': tool.name,
            'correctly_invoked': tool.is_correctly_invoked(result),
            'parameters_correct': tool.are_parameters_correct(result),
            'output_valid': tool.is_output_valid(result)
        })
    return results
```

## 4. Reliability Metrics

### Consistency Score
```python
def measure_consistency(agent, input, n_runs=10):
    """Run same input multiple times, measure consistency."""
    outputs = [agent.run(input) for _ in range(n_runs)]
    
    # Calculate variance
    unique_outputs = len(set(str(o) for o in outputs))
    consistency_score = 1 - (unique_outputs - 1) / n_runs
    
    return {
        'consistency_score': consistency_score,
        'unique_outputs': unique_outputs,
        'total_runs': n_runs
    }
```

### Failure Mode Analysis
```python
def analyze_failures(agent, test_suite):
    """Categorize and analyze failure modes."""
    failures = []
    for test in test_suite:
        result = agent.run(test['input'])
        if not result['success']:
            failures.append({
                'category': test['category'],
                'input': test['input'],
                'error': result['error'],
                'failure_type': classify_failure(result['error'])
            })
    
    # Group by failure type
    failure_counts = {}
    for f in failures:
        failure_counts[f['failure_type']] = failure_counts.get(f['failure_type'], 0) + 1
    
    return {
        'total_failures': len(failures),
        'failure_rate': len(failures) / len(test_suite),
        'failure_breakdown': failure_counts,
        'failures': failures
    }

def classify_failure(error):
    if 'timeout' in error.lower():
        return 'timeout'
    elif 'invalid' in error.lower():
        return 'invalid_input'
    elif 'permission' in error.lower():
        return 'permission_denied'
    else:
        return 'unknown'
```

## 5. Production Monitoring

### Real-Time Metrics
```python
class ProductionMonitor:
    def __init__(self, agent_id):
        self.agent_id = agent_id
        self.metrics = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'avg_latency': 0,
            'total_tokens': 0
        }
    
    def log_request(self, input, output, latency_ms, tokens_used, success):
        self.metrics['total_requests'] += 1
        if success:
            self.metrics['successful_requests'] += 1
        else:
            self.metrics['failed_requests'] += 1
        
        # Update rolling average
        self.metrics['avg_latency'] = (
            (self.metrics['avg_latency'] * (self.metrics['total_requests'] - 1) + latency_ms) /
            self.metrics['total_requests']
        )
        self.metrics['total_tokens'] += tokens_used
    
    def get_health_score(self):
        success_rate = self.metrics['successful_requests'] / self.metrics['total_requests']
        return {
            'agent_id': self.agent_id,
            'success_rate': success_rate,
            'failure_rate': 1 - success_rate,
            'avg_latency_ms': self.metrics['avg_latency'],
            'total_requests': self.metrics['total_requests'],
            'health': 'healthy' if success_rate > 0.95 else 'degraded' if success_rate > 0.8 else 'unhealthy'
        }
```

## 6. Comparison Framework

### A/B Testing Agents
```python
def compare_agents(agent_a, agent_b, test_suite):
    """Compare two agents on same test suite."""
    results = {'agent_a': [], 'agent_b': []}
    
    for test in test_suite:
        result_a = agent_a.run(test['input'])
        result_b = agent_b.run(test['input'])
        
        results['agent_a'].append({
            'passed': result_a['success'],
            'latency': result_a['latency'],
            'tokens': result_a['tokens']
        })
        
        results['agent_b'].append({
            'passed': result_b['success'],
            'latency': result_b['latency'],
            'tokens': result_b['tokens']
        })
    
    return {
        'agent_a_success_rate': sum(r['passed'] for r in results['agent_a']) / len(test_suite),
        'agent_b_success_rate': sum(r['passed'] for r in results['agent_b']) / len(test_suite),
        'agent_a_avg_latency': sum(r['latency'] for r in results['agent_a']) / len(test_suite),
        'agent_b_avg_latency': sum(r['latency'] for r in results['agent_b']) / len(test_suite),
        'agent_a_avg_tokens': sum(r['tokens'] for r in results['agent_a']) / len(test_suite),
        'agent_b_avg_tokens': sum(r['tokens'] for r in results['agent_b']) / len(test_suite),
    }
```

## 🛠️ Implementation Checklist
- [ ] Are test cases representative of real-world usage?
- [ ] Is success criteria clearly defined?
- [ ] Are edge cases and adversarial inputs tested?
- [ ] Is consistency measured across multiple runs?
- [ ] Are failure modes categorized and analyzed?
- [ ] Is there production monitoring in place?
- [ ] Are A/B tests statistically significant?

## Limitations
- Evaluation is only as good as the test suite
- Real-world performance may differ from benchmarks
- Agent behavior can be non-deterministic
- This skill is not a substitute for domain expertise
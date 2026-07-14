---
name: computer-use-agents
description: Build AI agents that interact with computers like humans do - viewing screens, moving cursors, clicking buttons, and typing text.
---

# Computer Use Agents

## Overview

Build AI agents that interact with computers like humans do - viewing screens, moving cursors, clicking buttons, and typing text. Covers Anthropic's Computer Use, OpenAI's Operator/CUA, and open-source alternatives with critical focus on sandboxing, security, and handling vision-based control challenges.

## When to Use

- Building desktop automation agents
- Automating GUI interactions
- Creating agents that need to interact with existing applications
- Testing UI applications automatically
- Automating workflows across multiple applications

## Core Architecture

### Perception-Reasoning-Action Loop

1. **PERCEPTION**: Screenshot captures current screen state
2. **REASONING**: Vision-language model analyzes and plans
3. **ACTION**: Execute mouse/keyboard operations
4. **FEEDBACK**: Observe result, continue or correct

## Implementation Patterns

### Basic Computer Use Agent

```python
class ComputerUseAgent:
    def capture_screenshot(self) -> str:
        """Capture screen and return base64 encoded image."""
        screenshot = pyautogui.screenshot()
        screenshot = screenshot.resize((1280, 800), Image.LANCZOS)
        # Convert to base64
        return base64.b64encode(buffer.getvalue()).decode()

    def execute_action(self, action: dict) -> dict:
        """Execute mouse/keyboard action."""
        action_type = action.get("type")
        if action_type == "click":
            pyautogui.click(x=action["x"], y=action["y"])
        elif action_type == "type":
            pyautogui.typewrite(action["text"], interval=0.02)
        # ... other actions

    def run(self, task: str) -> dict:
        """Run perception-reasoning-action loop."""
        while step_count < self.max_steps:
            # 1. Capture screenshot
            screenshot = self.capture_screenshot()
            # 2. Send to vision model
            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                messages=[{"role": "user", "content": [{"type": "image", ...}]}]
            )
            # 3. Parse and execute action
            action = parse_action(response)
            result = self.execute_action(action)
            # 4. Check if done
            if action.get("type") == "done":
                return result
```

## Critical Requirements

### Sandboxing (MANDATORY)

Computer use agents MUST run in isolated, sandboxed environments:

```bash
docker run -it --rm \
    --security-opt no-new-privileges \
    --cap-drop ALL \
    --network none \
    --read-only \
    --tmpfs /tmp \
    computer-use-sandbox
```

**Isolation requirements:**
1. NETWORK: Restrict to necessary endpoints only
2. FILESYSTEM: Read-only or scoped to temp directories
3. CREDENTIALS: No access to host credentials
4. SYSCALLS: Filter dangerous system calls
5. RESOURCES: Limit CPU, memory, time

### Human-Like Behavior

Add variance to avoid detection:

```python
def humanized_click(x: int, y: int) -> tuple[int, int]:
    """Add human-like variance to click coordinates."""
    x_offset = int(random.gauss(0, 5))
    y_offset = int(random.gauss(0, 5))
    return (x + x_offset, y + y_offset)

def humanized_delay():
    """Add human-like delay between actions."""
    base_delay = random.uniform(0.3, 0.8)
    if random.random() < 0.2:
        base_delay += random.uniform(0.5, 2.0)
    time.sleep(base_delay)
```

### Context Management

Screenshots fill up context window fast:

```python
class ContextManager:
    MAX_SCREENSHOTS = 10

    def add_screenshot(self, screenshot_b64: str, description: str):
        self.screenshot_count += 1
        if self.screenshot_count > self.MAX_SCREENSHOTS:
            self._prune_old_screenshots()
        # Store screenshot
```

## Anti-Patterns

- **Running without sandboxing**: Direct access to host system
- **No step limits**: Infinite loops
- **Full resolution screenshots**: Token explosion
- **Ignoring action failures**: No recovery mechanism
- **No delay between actions**: UI can't keep up
- **Perfect center clicks**: Detectable as non-human

## Security Considerations

- Never run on host system directly
- Use Docker containers with virtual desktops
- Implement confirmation gates for sensitive actions
- Scan for prompt injection in web content
- Log all actions for audit trail
- Mask sensitive data in logs

## Verification

- [ ] Sandboxing configured (Docker with restrictions)
- [ ] Step limits implemented (max 50 steps)
- [ ] Screenshot resolution optimized (1280x800)
- [ ] Human-like variance added to actions
- [ ] Context management implemented
- [ ] Action logging enabled
- [ ] Cost tracking configured

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
---
name: context-engineering
description: Optimizes agent context setup. Use when starting a new session, when agent output quality degrades, when switching between tasks, or when you need to configure rules files and context for a project.
---

# Context Engineering

## Overview

Feed agents the right information at the right time. Context is the single biggest lever for agent output quality — too little and the agent hallucinates, too much and it loses focus.

## When to Use

- Starting a new coding session
- Agent output quality is declining
- Switching between different parts of a codebase
- Setting up a new project for AI-assisted development

## The Context Hierarchy

Structure context from most persistent to most transient:

1. **Rules Files** (CLAUDE.md, .cursorrules) - Always loaded, project-wide
2. **Spec / Architecture Docs** - Loaded per feature/session
3. **Relevant Source Files** - Loaded per task
4. **Error Output / Test Results** - Loaded per iteration
5. **Conversation History** - Accumulates, compacts

## Key Principles

- Create a rules file that persists across sessions
- Load only what's relevant to the current task
- Aim for <2,000 lines of focused context per task
- Start fresh sessions when context drifts
- Include one example of the pattern to follow

## Anti-Patterns

- **Context starvation**: Agent invents APIs, ignores conventions
- **Context flooding**: Loading >5,000 lines of non-task-specific context
- **Stale context**: Agent references outdated patterns
- **Missing examples**: Agent invents a new style instead of following yours
- **Silent confusion**: Agent guesses when it should ask

## Verification

After setting up context, confirm:
- [ ] Rules file exists and covers tech stack, commands, conventions, boundaries
- [ ] Agent output follows the patterns shown in the rules file
- [ ] Agent references actual project files and APIs (not hallucinated ones)
- [ ] Context is refreshed when switching between major tasks

## Limitations

- Use this skill only when the task clearly matches its upstream source and local project context.
- Verify commands, generated code, dependencies, credentials, and external service behavior before applying changes.
- Do not treat examples as a substitute for environment-specific tests, security review, or user approval for destructive or costly actions.
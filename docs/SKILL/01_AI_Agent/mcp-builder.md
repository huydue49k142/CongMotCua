---
name: mcp-builder
description: Create MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools.
---

# MCP Builder

## Overview

Create MCP servers that enable LLMs to interact with external services through well-designed tools. The quality of an MCP server is measured by how well it enables LLMs to accomplish real-world tasks.

## When to Use

- Building MCP servers to integrate external APIs or services
- Creating tools for LLMs to interact with databases, APIs, or file systems
- Designing MCP servers in Python (FastMCP) or Node/TypeScript (MCP SDK)
- Need to expose functionality to LLMs in a standardized way

## Development Phases

### Phase 1: Deep Research and Planning

1. **Understand Modern MCP Design**
   - Balance API coverage vs workflow tools
   - Clear, descriptive tool naming with consistent prefixes
   - Concise tool descriptions for context efficiency
   - Actionable error messages with specific suggestions

2. **Study MCP Protocol Documentation**
   - Specification overview and architecture
   - Transport mechanisms (streamable HTTP, stdio)
   - Tool, resource, and prompt definitions

3. **Study Framework Documentation**
   - **TypeScript SDK**: WebFetch from modelcontextprotocol/typescript-sdk
   - **Python SDK**: WebFetch from modelcontextprotocol/python-sdk

4. **Plan Your Implementation**
   - Review service API documentation
   - Prioritize comprehensive API coverage
   - List endpoints to implement

### Phase 2: Implementation

1. **Set Up Project Structure**
   - TypeScript: package.json, tsconfig.json
   - Python: Module organization, dependencies

2. **Implement Core Infrastructure**
   - API client with authentication
   - Error handling helpers
   - Response formatting (JSON/Markdown)
   - Pagination support

3. **Implement Tools**
   - Input Schema: Use Zod (TypeScript) or Pydantic (Python)
   - Output Schema: Define structured output
   - Tool Description: Concise summary with parameter descriptions
   - Implementation: Async/await, proper error handling
   - Annotations: readOnlyHint, destructiveHint, idempotentHint, openWorldHint

### Phase 3: Review and Test

1. **Code Quality**
   - No duplicated code (DRY)
   - Consistent error handling
   - Full type coverage
   - Clear tool descriptions

2. **Build and Test**
   - TypeScript: `npm run build`
   - Python: `python -m py_compile`
   - Test with MCP Inspector

### Phase 4: Create Evaluations

Create 10 evaluation questions to test effectiveness:
- Tool inspection and content exploration
- Complex, realistic questions
- Read-only operations
- Verifiable answers

## Tool Design Principles

- **Clear naming**: `github_create_issue`, `github_list_repos`
- **Concise descriptions**: Help agents find the right tools quickly
- **Focused data**: Return only relevant data
- **Actionable errors**: Guide agents toward solutions
- **Pagination**: Support for large result sets

## Transport Selection

- **Streamable HTTP**: For remote servers (stateless, scalable)
- **stdio**: For local servers (simple, direct)

## Verification

- [ ] Tools have clear, descriptive names
- [ ] Input/output schemas defined with Zod/Pydantic
- [ ] Error messages are actionable
- [ ] Pagination implemented where needed
- [ ] Evaluations created and passing
- [ ] MCP Inspector tests pass

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
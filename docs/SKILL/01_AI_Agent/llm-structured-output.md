---
name: llm-structured-output
description: Get reliable JSON, enums, and typed objects from LLMs using response_format, tool_use, and schema-constrained decoding across OpenAI, Anthropic, and Google APIs.
---

# LLM Structured Output

## Overview

Extract typed, validated data from LLM API responses instead of parsing free-text. This skill covers the three main approaches: OpenAI's `response_format` with JSON Schema, Anthropic's `tool_use` block for structured extraction, and Google's `responseSchema` in Gemini.

## When to Use

- The user needs to extract structured data (JSON objects, arrays, enums) from an LLM response
- The user is building a pipeline where LLM output feeds directly into code
- The user asks about `response_format`, `json_mode`, `json_schema` in OpenAI
- The user asks about using Anthropic's `tool_use` for data extraction
- The user needs to parse LLM output into Pydantic models or Zod schemas
- The user is getting malformed JSON or wrong types from LLM responses

## Core Workflow

1. **Identify the target schema** - Define every field with its type, whether required or optional, and valid enum values
2. **Choose the provider-appropriate method**:
   - **OpenAI**: Use `response_format: { type: "json_schema", json_schema: { ... } }`
   - **Anthropic**: Define a single tool with the target schema as `input_schema` and set `tool_choice`
   - **Google**: Use `generationConfig.responseSchema` with JSON Schema
   - **Local models**: Use GBNF grammars or `--json-schema` flag
3. **Write the schema definition** in the user's language (Pydantic, Zod, JSON Schema)
4. **Include field-level descriptions** in the schema
5. **Set the system prompt** to reinforce structure
6. **Validate the response** against the schema in application code
7. **Build a retry loop** for validation failures (cap at 3 attempts)
8. **Log every structured output call** with input, raw response, parsed result, and errors

## Key Principles

- Always require justification before scores (for evaluation tasks)
- Always swap positions in pairwise comparison
- Match scale granularity to rubric specificity
- Separate objective and subjective criteria
- Include confidence scores calibrated to evidence strength
- Define edge cases explicitly
- Use domain-specific rubrics
- Validate against human judgments
- Monitor for systematic bias
- Design for iteration

## Anti-Patterns

1. **Never use `response_format: { type: "json_object" }` without a schema** - guarantees valid JSON but not schema conformance
2. **Never parse Anthropic's text blocks for structured data** - data is in the `tool_use` block
3. **Never define schema fields without descriptions** - models use descriptions as extraction instructions
4. **Never use `additionalProperties: true` in strict mode** - OpenAI requires `additionalProperties: false`
5. **Never put extraction instructions only in the user message** - system prompt has higher attention weight
6. **Never assume structured output means correct output** - always validate semantics
7. **Never use recursive or deeply nested schemas without testing** - increases latency significantly

## Edge Cases

1. **Long source text exceeding context window** - Split into chunks, extract independently, merge in code
2. **Model returns a `refusal`** - Check `response.choices[0].message.refusal` before accessing `.parsed`
3. **Array fields returning empty** - Make description prescriptive: "List all X mentioned. Return at least one if any X is referenced."
4. **Enum values not matching due to casing** - Lowercase all enum values or add normalization step
5. **Streaming with structured output** - Buffer chunks until stream completes

## Best Practices

1. **Start with the simplest schema** - Flat objects with 3-5 fields produce higher accuracy
2. **Use enums instead of free-form strings** - Constrains model to exactly those values
3. **Pin the model version in production** - Use explicit version like `gpt-4o-2024-08-06`
4. **Test schema changes against 20+ real inputs** before deploying
5. **Use `default` values for optional fields** - Prevents hallucination
6. **Separate extraction schemas from application schemas** - Map between them in code

## Verification

- [ ] Schema defined with all required fields and types
- [ ] Field descriptions included for every field
- [ ] Provider-appropriate method selected
- [ ] Validation logic implemented
- [ ] Retry loop for validation failures
- [ ] Logging configured for debugging

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
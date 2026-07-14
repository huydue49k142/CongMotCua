---
name: advanced-evaluation
description: Production-grade techniques for evaluating LLM outputs using LLMs as judges. Covers direct scoring, pairwise comparison, bias mitigation, and evaluation pipeline design.
---

# Advanced Evaluation

## Overview

LLM-as-a-Judge is not a single technique but a family of approaches, each suited to different evaluation contexts. This skill covers production-grade techniques for evaluating LLM outputs.

## When to Use

- Building automated evaluation pipelines for LLM outputs
- Comparing multiple model responses to select the best one
- Establishing consistent quality standards
- Debugging evaluation systems with inconsistent results
- Designing A/B tests for prompt or model changes
- Creating rubrics for human or automated evaluation

## Evaluation Approaches

### 1. Direct Scoring

A single LLM rates one response on a defined scale.

**Best for**: Objective criteria (factual accuracy, instruction following, toxicity)

**Reliability**: Moderate to high for well-defined criteria

**Failure modes**: Score calibration drift, inconsistent scale interpretation

### 2. Pairwise Comparison

An LLM compares two responses and selects the better one.

**Best for**: Subjective preferences (tone, style, persuasiveness)

**Reliability**: Higher than direct scoring for preferences

**Failure modes**: Position bias, length bias

## Bias Mitigation

### Position Bias

First-position responses receive preferential treatment.

**Mitigation**: Evaluate twice with swapped positions, use majority vote or consistency check.

### Length Bias

Longer responses are rated higher regardless of quality.

**Mitigation**: Explicit prompting to ignore length, length-normalized scoring.

### Self-Enhancement Bias

Models rate their own outputs higher.

**Mitigation**: Use different models for generation and evaluation.

## Metric Selection

| Task Type | Primary Metrics | Secondary Metrics |
|-----------|-----------------|-------------------|
| Binary classification | Recall, Precision, F1 | Cohen's κ |
| Ordinal scale (1-5) | Spearman's ρ, Kendall's τ | Cohen's κ (weighted) |
| Pairwise preference | Agreement rate, Position consistency | Confidence calibration |
| Multi-label | Macro-F1, Micro-F1 | Per-label precision/recall |

## Rubric Design

Well-defined rubrics reduce evaluation variance by 40-60% compared to open-ended scoring.

**Rubric Components**:
1. Level descriptions: Clear boundaries for each score level
2. Characteristics: Observable features that define each level
3. Examples: Representative text for each level
4. Edge cases: Guidance for ambiguous situations
5. Scoring guidelines: General principles for consistent application

## Anti-Patterns

- **Scoring without justification**: Scores lack grounding
- **Single-pass pairwise comparison**: Position bias corrupts results
- **Overloaded criteria**: Criteria measuring multiple things are unreliable
- **Missing edge case guidance**: Inconsistent handling of ambiguous cases
- **Ignoring confidence calibration**: High-confidence wrong judgments are worse

## Verification

- [ ] Chain-of-thought prompting used (justification before score)
- [ ] Position swapping implemented for pairwise comparison
- [ ] Rubric has clear level descriptions and examples
- [ ] Edge cases explicitly documented
- [ ] Confidence scores calibrated to evidence strength
- [ ] Validation against human judgments performed

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
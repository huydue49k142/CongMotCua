---
name: huggingface-best
description: Hugging Face best practices skill. Covers model selection, dataset curation, training workflow, evaluation, sharing, safety, and production considerations using Hugging Face ecosystem.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Hugging Face Best Practices

## Overview

Hugging Face provides tooling and community infrastructure for model development: datasets, training, evaluation, and model hosting.

This skill focuses on repeatable, reliable workflows for:
- selecting models and fine-tuning strategies
- preparing and curating datasets
- training and evaluation best practices
- avoiding common pitfalls (leakage, evaluation bias)
- packaging and versioning artifacts for reuse
- sharing safely and integrating into production

---

## When to Use

- You fine-tune transformer models
- You need consistent training/evaluation pipelines
- You want to leverage HF datasets/models/training tooling
- You must improve reproducibility and artifact management
- You plan to deploy models and keep them maintainable

---

## Core Concepts

### 1) Model Selection

Decision checklist:
- match architecture to task (classification, seq2seq, embeddings, etc.)
- compare base model size vs latency requirements
- prefer models with:
  - strong eval results on relevant benchmarks
  - clear licensing
  - stable training code/community support
- ensure compatibility with your output format (tokenization, vocab)

---

### 2) Dataset Curation

Data quality usually dominates performance.

Key practices:
- define labeling standards and review samples
- remove duplicates
- detect and mitigate label noise
- balance classes or handle imbalance intentionally
- prevent data leakage:
  - ensure train/val/test splits are truly disjoint
  - deduplicate across splits carefully

Split strategy:
- random split for i.i.d datasets
- time-based split for streaming/time-evolving data
- group-based split (e.g., by user/customer) to avoid leakage

---

### 3) Training Workflow

A production-friendly loop:
1. baseline evaluation
2. preprocess/tokenize + dataset checks
3. fine-tuning with controlled hyperparameters
4. evaluate consistently
5. iterate with controlled changes

Hyperparameter discipline:
- tune learning rate first
- then batch size / gradient accumulation
- then number of epochs with early stopping
- track changes and keep runs comparable

---

### 4) Evaluation Discipline

Evaluation should answer:
- does the model meet target metrics?
- does it generalize?
- are there regressions in important segments?

Practices:
- use task-appropriate metrics (F1, ROUGE, MRR, etc.)
- evaluate on slices/segments when relevant (language, region, cohort)
- check calibration if confidence is used for decisions
- perform error analysis and feed fixes back into data/model

---

### 5) Reproducibility

Make runs repeatable:
- record dataset versions (HF dataset revision)
- store training config + tokenizer version
- set and record random seeds
- save:
  - metrics history
  - final checkpoints
  - best checkpoint selection criteria

---

### 6) Packaging & Versioning Artifacts

Keep artifacts portable:
- tokenizer + model config together
- add model card documentation:
  - intended use
  - limitations
  - training data summary
  - evaluation results
  - safety notes

Prefer versioned outputs:
- semantic version tags in model names/releases
- keep “best” model references pinned for deployments

---

### 7) Safety & Responsible Use

At minimum:
- apply license checks before using/sharing weights
- implement content filtering when output could be unsafe
- monitor for bias and harmful behavior
- clearly document intended use and constraints in model card

---

## Practical Implementation Checklist

- [ ] Dataset splits are leakage-resistant and reproducible
- [ ] Dataset quality checks exist (duplicates/noise/imbalance)
- [ ] Baseline metrics are recorded before fine-tuning
- [ ] Training runs track hyperparameters and seeds
- [ ] Evaluation uses correct metrics and includes slice analysis
- [ ] Model cards and licensing are handled
- [ ] Artifacts (model + tokenizer + config) are versioned
- [ ] Safety considerations are documented and monitored

---

## Limitations

- Best practices don’t guarantee quality; task/data alignment matters most
- Production readiness still requires deployment/testing and monitoring outside HF training

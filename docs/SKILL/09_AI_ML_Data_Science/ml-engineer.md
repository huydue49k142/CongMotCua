---
name: ml-engineer
description: ML Engineer skill. Covers end-to-end ML system engineering: training pipelines, data pipelines, feature stores, inference services, evaluation, monitoring, and deployment strategies.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# ML Engineer

## Overview

An ML Engineer builds machine learning systems that are reliable in production.

This skill focuses on engineering the end-to-end lifecycle:
- data pipelines and training data preparation
- scalable feature engineering
- training and evaluation pipelines
- deploying models for inference
- monitoring performance, drift, and failures
- improving with feedback loops

---

## When to Use

- When you need to ship ML models reliably to production
- When training/inference must be automated and repeatable
- When you must monitor and maintain model quality over time
- When you need scalable pipelines for data + training + serving
- When you need low-latency inference or batch scoring at scale

---

## Core Concepts

### 1) ML System Components
A typical ML system includes:

- **Data ingestion**: events, logs, data sources
- **Data processing**: cleaning, validation, transformations
- **Feature engineering**: aggregates, encodings, computed signals
- **Training pipeline**: reproducible training runs
- **Evaluation**: offline metrics + sanity checks
- **Model registry**: versioned artifacts and promotion rules
- **Inference service**: real-time or batch predictions
- **Monitoring**: performance, drift, and system health
- **Retraining loop**: schedules and triggers based on drift/quality

---

## 2) Training Pipeline Engineering

### Reproducible Training
- fix random seeds (where possible)
- record:
  - dataset version / snapshot
  - preprocessing code version
  - training hyperparameters
  - model outputs + metrics

### Data Validation Gates
Before training:
- schema checks
- missing value thresholds
- label distribution checks
- outlier checks
- leakage detection heuristics (when applicable)

### Experiment Tracking
Track runs and compare:
- metric changes
- training time changes
- data changes

---

## 3) Feature Engineering & Feature Stores (If Needed)

### Feature Engineering Principles
- features must be computable at training and inference time
- keep feature definitions centralized (single source of truth)
- handle missing features intentionally

### Feature Store (Optional)
Use a feature store when:
- many models share the same features
- you need online/offline feature consistency
- you want governed feature reuse

Store feature transformations and join logic consistently.

---

## 4) Model Serving (Inference)

### Serving Modes
- **Online inference**: request/response for user interactions
- **Batch inference**: periodic scoring for analytics or workflows

### Inference Service Checklist
- input schema validation
- latency budgeting (p95/p99)
- concurrency limits / backpressure
- caching where appropriate
- timeouts and retry policy (for downstream calls)
- deterministic preprocessing

### Batch Inference Checklist
- efficient data loading
- idempotent job runs
- artifact outputs with metadata (dataset/model versions)

---

## 5) Evaluation & Quality Engineering

### Offline Evaluation
- correct metrics for task type
- robust splits (time-based for temporal data)
- error analysis by segments

### Online Evaluation
- A/B tests when feasible
- shadow mode / canary deployments
- compare against baselines

### Guardrails
Use policies:
- minimum quality thresholds
- fail-open vs fail-closed behavior
- fallback strategy when model output is uncertain/unavailable

---

## 6) Monitoring & Drift Detection

Track:
- **system metrics**: latency, throughput, errors
- **model metrics**: prediction distributions, confidence, target proxy signals
- **data drift**: feature distribution changes
- **concept drift**: performance degradation even if features look stable

Alerting approach:
- define alert thresholds
- include runbooks (what to do when alerts fire)

---

## 7) Deployment Strategies

### Promotion Workflow
- train → evaluate → register → stage → production

### Safe Rollouts
- canary releases
- blue/green deployments
- rollback triggers based on monitoring signals

---

## Implementation Checklist

- [ ] Training pipeline is reproducible and versioned
- [ ] Data validation exists and prevents bad datasets
- [ ] Feature definitions are consistent across training and inference
- [ ] Inference service validates inputs and meets latency requirements
- [ ] Offline + online evaluation are implemented
- [ ] Monitoring includes system health + model quality signals
- [ ] Drift detection and retraining triggers exist
- [ ] Deployment is safe with rollback/canary strategies

---

## Limitations

- ML systems are inherently probabilistic; “correctness” requires evaluation and monitoring
- Production readiness depends on data stability and feedback loops

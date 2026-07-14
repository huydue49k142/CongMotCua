---
name: data-scientist
description: Data Scientist skill. Covers end-to-end data science workflow: problem framing, EDA, feature engineering, modeling, evaluation, experimentation, and communication.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Data Scientist (End-to-End)

## Overview

This skill covers the complete data science workflow, from turning ambiguous business questions into measurable objectives to shipping models and monitoring their quality over time.

---

## When to Use

- You need to transform a business problem into a data problem
- You want repeatable modeling and evaluation practices
- You need feature engineering and robust validation
- You plan experiments (A/B testing or offline/online evaluation)
- You must communicate results clearly to stakeholders

---

## 1) Problem Framing

### Define the Objective
Start with measurable targets:
- prediction target (what are we forecasting/classifying?)
- success metric (what does “good” mean?)
- constraints (latency, fairness, cost, data availability)

### Clarify the Operational Context
- where the model runs (batch vs real-time)
- who consumes the output (UI, API, automation)
- what happens on failure (fallback strategy)

### Choose Evaluation Strategy Early
- offline metrics first (precision/recall, RMSE, etc.)
- then confirm with online tests if needed

---

## 2) Data Understanding & EDA

### Data Quality Checks
- missing values pattern
- outliers detection
- leakage risk (future information accidentally included)
- label quality (especially for classification)

### Visual + Statistical EDA
- distributions and correlations
- segmentation by key attributes
- stability over time (drift detection baseline)

---

## 3) Feature Engineering

### Transformations
- encoding categorical variables (one-hot/target encoding)
- scaling/normalization when required
- log transforms for heavy-tailed distributions

### Aggregations
- rolling windows (last N days/weeks)
- group-level features (user stats, cohort stats)

### Prevent Leakage
Rule:
- features must be computable using only data available at prediction time

---

## 4) Modeling

### Choose Baselines First
- simple linear/logistic models
- decision trees
- gradient boosting
- always compare against trivial baselines

### Regularization & Hyperparameters
- use validation strategy to tune
- avoid overfitting by limiting complexity

---

## 5) Evaluation

### Metrics by Task Type
- Regression: MAE/RMSE, R²
- Classification: accuracy, precision/recall, F1, ROC-AUC
- Imbalanced: PR-AUC, balanced accuracy

### Validation Practices
- train/validation/test split
- time-based splits for time series
- cross-validation when appropriate

### Error Analysis
- inspect false positives/false negatives
- find slices where model underperforms
- connect errors back to features and data quality

---

## 6) Experimentation & Iteration

### Offline -> Online
- offline metrics indicate promise
- online metrics confirm user/business impact

### A/B Testing Basics
- define null/alternative hypotheses
- choose sample size
- guard against novelty bias and seasonality

### Iteration Loop
1. improve data quality
2. improve features
3. improve model
4. improve evaluation and monitoring

---

## 7) Communication & Delivery

### Communicate Uncertainty
- confidence intervals
- calibration and thresholds
- when to abstain or fallback

### Document Decisions
- dataset versions
- feature definitions
- model parameters
- evaluation results

### Deliver Artifacts
- model + preprocessing pipeline
- inference code
- monitoring plan and alert thresholds

---

## Implementation Checklist

- [ ] Objective and success metric are defined
- [ ] Baseline model exists
- [ ] Data leakage risk is assessed
- [ ] Feature engineering supports prediction-time availability
- [ ] Evaluation uses appropriate splits and metrics
- [ ] Error analysis identifies actionable fixes
- [ ] Experiment plan exists (offline and/or online)
- [ ] Delivery includes monitoring + documentation

---

## Limitations

- Offline metrics may not reflect real-world impact
- Data drift and changing user behavior require ongoing monitoring and retraining

---
name: scikit-learn
description: scikit-learn skill. Covers model training, preprocessing pipelines, feature selection, evaluation, cross-validation, hyperparameter tuning, and practical ML workflow.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# scikit-learn

## Overview

scikit-learn is a widely used Python library for classical machine learning.

This skill covers practical, production-minded scikit-learn workflows:
- preprocessing and feature engineering
- pipelines (to prevent training/serving skew)
- training, validation, cross-validation
- hyperparameter tuning
- evaluation and error analysis
- model persistence and reproducibility

---

## When to Use

Use scikit-learn when:
- you’re building baseline to strong classical ML models
- you need fast iteration with reliable evaluation
- you want well-structured pipelines and reproducible experiments
- your tasks fit classical ML (classification/regression/clustering, etc.)

---

## Core Concepts

### 1) Fit / Transform / Predict Discipline

General rule:
- **fit** preprocessing on training data only
- **transform** training/validation/test using fitted preprocessing
- **predict** using trained model

Avoid leakage:
- never fit scalers/encoders on validation/test.

---

## Pipelines (Recommended)

### Use Pipeline to Prevent Data Leakage

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("model", LogisticRegression(max_iter=1000))
])

pipe.fit(X_train, y_train)
pred = pipe.predict(X_val)
```

This ensures:
- scaler is fit only on training fold
- transforms are consistent across evaluation.

---

## Preprocessing Patterns

### Handling Missing Values
Typical options:
- `SimpleImputer(strategy="median")`
- impute categorical vs numeric separately

### Encoding Categorical Features
Common encoders:
- `OneHotEncoder(handle_unknown="ignore")`
- `OrdinalEncoder` (careful: ordinal implies ordering)

### Feature Scaling
Scale when required:
- linear models, SVMs, k-NN
- tree models often don’t require scaling

---

## Evaluation & Validation

### Train / Validation / Test Split

Use:
- validation for hyperparameter tuning
- test for final reporting (no tuning on test)

### Cross-Validation
Prefer cross-validation when dataset is small or variance is high:

```python
from sklearn.model_selection import cross_val_score
scores = cross_val_score(pipe, X, y, cv=5, scoring="f1_macro")
```

---

## Hyperparameter Tuning

### Grid Search vs Random Search
- `GridSearchCV`: exhaustive (can be expensive)
- `RandomizedSearchCV`: samples combinations (often better)

Example:

```python
from sklearn.model_selection import RandomizedSearchCV
from sklearn.ensemble import RandomForestClassifier
import numpy as np

param_dist = {
  "model__n_estimators": [100, 300, 500],
  "model__max_depth": [None, 10, 20],
  "model__min_samples_split": [2, 5, 10],
}

search = RandomizedSearchCV(
    estimator=pipe,
    param_distributions=param_dist,
    n_iter=20,
    scoring="f1_macro",
    cv=5,
    n_jobs=-1
)

search.fit(X_train, y_train)
best_model = search.best_estimator_
```

---

## Metrics & Error Analysis

### Choose Task-Appropriate Metrics
- Classification: accuracy, precision/recall, F1, ROC-AUC
- Regression: MAE, RMSE, R²

For imbalanced classification:
- use PR-AUC, balanced accuracy, F1 variants

### Slice-Based Error Analysis
Analyze performance by segments:
- user cohorts, regions, device types, languages
- find consistent failure modes and fix data/features first

---

## Model Persistence

### Save and Load
Use joblib:

```python
import joblib
joblib.dump(pipe, "model.joblib")
model = joblib.load("model.joblib")
```

Store model + preprocessing together via Pipeline.

---

## Reproducibility Checklist

- fixed random seeds where possible
- record:
  - data version
  - feature schema
  - hyperparameters
  - evaluation splits
- log metrics and artifacts

---

## Implementation Checklist

- [ ] Use Pipeline to avoid preprocessing leakage
- [ ] Fit on training data only
- [ ] Evaluate with correct metrics and validation strategy
- [ ] Use cross-validation when appropriate
- [ ] Tune hyperparameters with Grid/RandomSearchCV
- [ ] Perform error analysis by segments
- [ ] Persist full pipeline (preprocess + model)
- [ ] Track reproducibility metadata (seeds, params, data version)

---

## Limitations

- scikit-learn excels at classical ML; deep learning needs other tools
- “Production-ready” still requires monitoring and drift handling outside training

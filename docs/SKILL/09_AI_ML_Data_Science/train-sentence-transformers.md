---
name: train-sentence-transformers
description: Train sentence transformers skill. Covers preparing training data for embeddings, fine-tuning transformer encoders, contrastive objectives, evaluation, and exporting production-ready embedding models.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Train Sentence Transformers

## Overview

Sentence Transformers are transformer-based encoders that map sentences/paragraphs into dense vectors (embeddings) suitable for:
- semantic search
- retrieval (RAG)
- clustering
- deduplication / similarity matching
- classification via embedding features

This skill covers how to fine-tune and evaluate a sentence transformer for embedding quality.

---

## When to Use

- You have labeled pairs (similar/dissimilar) or triplets
- You want better retrieval quality than a generic base model
- You need embeddings optimized for a specific domain/language
- You plan to deploy embeddings in search/recommendation pipelines

---

## Core Concepts

### Embedding Objective (Contrastive Learning)
Typical training setup:
- **positive pairs**: (anchor, relevant) should be close
- **negative pairs**: (anchor, irrelevant) should be far

Common patterns:
- pairwise contrastive loss
- triplet loss
- multi-negative ranking loss

Goal:
- maximize separation between positives and negatives in embedding space.

---

## Data Preparation

### Input Formats

#### 1) Pair dataset
Each example provides:
- text_a
- text_b
- label (similarity / 0-1)

Example schema (conceptual):
```text
text_a | text_b | label
```

#### 2) Triplet dataset
Each example provides:
- anchor
- positive
- negative

Example schema:
```text
anchor | positive | negative
```

---

### Building Positives and Negatives
Strategies (pick based on your data availability):
- human labels
- click/engagement logs (careful with bias)
- BM25 candidate generation + reranking labels
- domain heuristics (same category = positive, different = negative)
- hard negatives via current model retrieval (improves robustness)

Rules:
- prevent leakage across train/val/test (especially if logs contain user/session info)
- ensure positives truly represent semantic similarity

---

## Fine-Tuning Workflow

### 1) Choose a Base Model
Pick a sentence-transformer checkpoint that matches:
- language(s)
- embedding size / latency needs
- your retrieval use-case (search vs classification)

Rule:
- start with a strong baseline; only fine-tune when you have sufficient labeled data.

---

### 2) Define Training Loss
Choose an objective aligned with your data:

- **MultipleNegativesRankingLoss**: good for pair/triplet-like data and retrieval
- **CosineSimilarityLoss**: when you have continuous similarity scores
- **TripletLoss**: when you have explicit negatives

Loss choice determines how you structure batches.

---

### 3) Batch Construction
Batching affects negatives:
- create batches that contain meaningful negatives
- ensure negatives are not trivially easy (use hard negatives when possible)
- watch for label imbalance

---

### 4) Hyperparameters (Practical Defaults)
Start with:
- learning rate in a small range (commonly 1e-5 to 5e-5)
- batch size tuned to GPU memory
- epochs based on dataset size (avoid overfitting)
- warmup steps for stability

Always:
- monitor validation retrieval metrics
- use early stopping based on embedding performance, not only training loss.

---

## Evaluation

### Retrieval Metrics
Evaluate using:
- Recall@K (common for semantic search)
- MRR (mean reciprocal rank)
- nDCG (if you have graded relevance)

Best practice:
- evaluate on a query set with known relevant documents/phrases
- measure improvements over baseline

---

### Embedding Quality Checks

Sanity checks:
- embedding similarity for obvious matches should be high
- dissimilar queries should be clearly separated
- check failure slices (language, categories, rare intents)

---

## Exporting for Production

### Export Artifacts
Export:
- tokenizer files
- model weights
- config/vocabulary necessary for inference

### Embedding Normalization (Common)
Many pipelines normalize embeddings to use cosine similarity reliably.
Pick one approach and keep it consistent between training and inference.

Rule:
- ensure the same similarity function used in training evaluation is used in production retrieval.

---

## Deployment Patterns

### Offline Embedding Indexing
- embed documents offline (batch)
- store embeddings in vector DB / ANN index
- keep metadata for filtering (tenant, category, language)

### Online Query Embedding
- embed user query at request time
- apply similarity search against the index
- optionally rerank with a cross-encoder model if latency budget allows

---

## Implementation Checklist

- [ ] Training data has leakage-resistant train/val/test splits
- [ ] Positives and negatives reflect true semantic relevance
- [ ] Loss function matches your dataset format
- [ ] Evaluation uses retrieval metrics (Recall@K/MRR/nDCG)
- [ ] You compare against a strong baseline before fine-tuning
- [ ] You export tokenizer + model artifacts needed for inference
- [ ] Similarity/normalization behavior matches training + evaluation
- [ ] Failure slices and error analysis are performed

---

## Limitations

- Fine-tuning quality depends strongly on label quality and negative sampling
- Retrieval deployment requires careful consistency between training and inference similarity computation

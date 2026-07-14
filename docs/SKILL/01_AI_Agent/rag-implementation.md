---
name: rag-implementation
description: RAG (Retrieval-Augmented Generation) implementation workflow covering embedding selection, vector database setup, chunking strategies, and retrieval optimization.
---

# RAG Implementation

## Overview

Specialized workflow for implementing RAG systems including embedding model selection, vector database setup, chunking strategies, retrieval optimization, and evaluation.

## When to Use

- Building RAG-powered applications
- Implementing semantic search
- Creating knowledge-grounded AI
- Setting up document Q&A systems
- Optimizing retrieval quality

## Workflow Phases

### Phase 1: Requirements Analysis

1. Define use case
2. Identify data sources
3. Set accuracy requirements
4. Determine latency targets
5. Plan evaluation metrics

### Phase 2: Embedding Selection

1. Evaluate embedding models
2. Test domain relevance
3. Measure embedding quality
4. Consider cost/latency
5. Select model

**Common choices**: OpenAI text-embedding-3-small/large, Cohere embed-v3, open-source (BGE, E5)

### Phase 3: Vector Database Setup

1. Choose vector database
2. Design schema
3. Configure indexes
4. Set up connection
5. Test queries

**Options**: Pinecone, Weaviate, Qdrant, Milvus, pgvector

### Phase 4: Chunking Strategy

1. Choose chunk size (typically 512-1024 tokens)
2. Implement chunking
3. Add overlap handling (10-20%)
4. Create metadata
5. Test retrieval quality

**Strategies**: Fixed-size, sentence-based, paragraph-based, semantic

### Phase 5: Retrieval Implementation

1. Implement vector search
2. Add keyword search (optional)
3. Configure hybrid search
4. Set up reranking
5. Optimize latency

### Phase 6: LLM Integration

1. Select LLM provider
2. Design prompt template
3. Implement context injection
4. Add citation handling
5. Test generation quality

### Phase 7: Caching

1. Implement response caching
2. Set up embedding cache
3. Configure TTL
4. Add cache invalidation
5. Monitor hit rates

### Phase 8: Evaluation

1. Define evaluation metrics
2. Create test dataset
3. Measure retrieval accuracy
4. Evaluate generation quality
5. Iterate on improvements

## Quality Gates

- [ ] Embedding model selected
- [ ] Vector DB configured
- [ ] Chunking implemented
- [ ] Retrieval working
- [ ] LLM integrated
- [ ] Evaluation passing

## Anti-Patterns

- **No chunking strategy**: Inconsistent retrieval quality
- **Ignoring metadata**: Misses filtering opportunities
- **No reranking**: Lower relevance scores
- **Skipping evaluation**: Can't measure improvements
- **Over-engineering**: Starting with complex hybrid search before basic vector search works

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
---
name: vector-database-engineer
description: Expert in vector databases, embedding strategies, and semantic search implementation. Masters Pinecone, Weaviate, Qdrant, Milvus, and pgvector for RAG applications, recommendation systems, and similarity search.
---

# Vector Database Engineer

## Overview

Expert in vector databases, embedding strategies, and semantic search implementation. Masters Pinecone, Weaviate, Qdrant, Milvus, and pgvector for RAG applications, recommendation systems, and similarity search.

## When to Use

- Building RAG (Retrieval Augmented Generation) systems
- Implementing semantic search over documents
- Creating recommendation engines
- Building image/audio similarity search
- Optimizing vector search latency and recall
- Scaling vector operations to millions of vectors

## Core Concepts

### Vector Embeddings

Vector embeddings are numerical representations of data (text, images, audio) in high-dimensional space:

```python
# Example: Text embedding (1536 dimensions)
embedding = [
  0.123, -0.456, 0.789, ..., 0.234
]
# Length: 1536 dimensions
```

### Similarity Metrics

| Metric | Use Case | Formula |
|--------|----------|---------|
| **Cosine** | Text similarity, normalized vectors | 1 - (A·B)/(\|A\|\|B\|) |
| **Euclidean (L2)** | Image similarity, exact matches | √Σ(Ai - Bi)² |
| **Dot Product** | Recommender systems | Σ(Ai × Bi) |
| **Manhattan (L1)** | Sparse vectors, robustness | Σ\|Ai - Bi\| |

### Index Types

| Index | Type | Best For | Trade-off |
|-------|------|----------|-----------|
| **HNSW** | Graph-based | High recall, moderate size | Slower build, more memory |
| **IVF** | Clustering | Large datasets, fast search | Lower recall |
| **PQ** | Compression | Very large datasets | Accuracy loss |
| **Flat** | Brute force | Small datasets, perfect recall | Slow at scale |

## Vector Databases

### Pinecone

```python
import pinecone

# Initialize
pinecone.init(api_key="your-api-key", environment="us-west1-gcp")
index = pinecone.Index("my-index")

# Upsert vectors
index.upsert([
    ("id1", [0.1, 0.2, ...], {"metadata": "value"}),
    ("id2", [0.3, 0.4, ...], {"metadata": "value"})
])

# Query
results = index.query(
    vector=[0.1, 0.2, ...],
    top_k=10,
    include_metadata=True
)
```

### Weaviate

```python
import weaviate

client = weaviate.Client("http://localhost:8080")

# Add data
client.data_object.create(
    data_object={
        "title": "Document 1",
        "content": "Content here..."
    },
    class_name="Document",
    vector=[0.1, 0.2, ...]
)

# Semantic search
result = client.query.get("Document", ["title", "content"])
result = result.with_near_vector({
    "vector": [0.1, 0.2, ...]
}).with_limit(10).do()
```

### Qdrant

```python
from qdrant_client import QdrantClient

client = QdrantClient("localhost", port=6333)

# Upsert
client.upsert(
    collection_name="my_collection",
    points=[
        PointStruct(
            id=1,
            vector=[0.1, 0.2, ...],
            payload={"metadata": "value"}
        )
    ]
)

# Search
results = client.search(
    collection_name="my_collection",
    query_vector=[0.1, 0.2, ...],
    limit=10
)
```

### pgvector (PostgreSQL)

```sql
-- Enable extension
CREATE EXTENSION vector;

-- Create table
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    content TEXT,
    embedding vector(1536)
);

-- Create index
CREATE INDEX ON documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Similarity search
SELECT id, content, 
    1 - (embedding <=> '[0.1, 0.2, ...]') AS similarity
FROM documents
ORDER BY embedding <=> '[0.1, 0.2, ...]'
LIMIT 10;
```

## Embedding Strategies

### Model Selection

| Model | Dimensions | Best For | Context |
|-------|-----------|----------|---------|
| **text-embedding-3-small** | 1536 | General purpose, cost-effective | 8K tokens |
| **text-embedding-3-large** | 3072 | High accuracy | 8K tokens |
| **Cohere embed-v3** | 1024 | Multilingual | 512 tokens |
| **BGE-large** | 1024 | Open-source, local | 512 tokens |
| **E5-large** | 1024 | Open-source, general | 512 tokens |

### Chunking Strategies

```python
def chunk_text(text: str, chunk_size: int = 512, overlap: int = 50):
    """
    Split text into overlapping chunks.
    
    Args:
        text: Input text
        chunk_size: Target chunk size (tokens)
        overlap: Overlap between chunks (tokens)
    """
    chunks = []
    start = 0
    words = text.split()
    
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap
    
    return chunks
```

### Metadata Filtering

```python
# Store metadata with vectors
{
    "id": "doc1",
    "vector": [0.1, 0.2, ...],
    "metadata": {
        "category": "tech",
        "date": "2024-01-01",
        "author": "John",
        "tags": ["AI", "ML"]
    }
}

# Filter during search
results = index.query(
    vector=[0.1, 0.2, ...],
    filter={
        "category": "tech",
        "date": {"$gte": "2024-01-01"}
    },
    top_k=10
)
```

## RAG Implementation

### Basic RAG Pipeline

```python
class RAGPipeline:
    def __init__(self, vector_db, embedding_model):
        self.vector_db = vector_db
        self.embedding_model = embedding_model
    
    def ingest(self, documents: list[str]):
        """Ingest documents into vector database."""
        for doc in documents:
            # Chunk document
            chunks = self.chunk_text(doc)
            
            # Generate embeddings
            embeddings = self.embedding_model.encode(chunks)
            
            # Store in vector DB
            self.vector_db.upsert(chunks, embeddings)
    
    def retrieve(self, query: str, top_k: int = 5) -> list[str]:
        """Retrieve relevant documents for query."""
        # Embed query
        query_embedding = self.embedding_model.encode(query)
        
        # Search vector DB
        results = self.vector_db.search(
            query_embedding, 
            top_k=top_k
        )
        
        return [r.text for r in results]
    
    def generate(self, query: str) -> str:
        """Generate answer using RAG."""
        # Retrieve relevant docs
        context = self.retrieve(query)
        
        # Generate with LLM
        prompt = f"""
        Context: {context}
        
        Question: {query}
        
        Answer:
        """
        return llm.generate(prompt)
```

### Hybrid Search

Combine vector search with keyword search:

```python
def hybrid_search(query: str, alpha: float = 0.5):
    """
    Combine vector and keyword search.
    
    Args:
        query: Search query
        alpha: Weight for vector search (0-1)
               0 = pure keyword, 1 = pure vector
    """
    # Vector search
    vector_results = vector_search(query, top_k=20)
    
    # Keyword search (BM25)
    keyword_results = keyword_search(query, top_k=20)
    
    # Reciprocal Rank Fusion
    combined = {}
    for rank, result in enumerate(vector_results):
        combined[result.id] = alpha * (1 / (rank + 1))
    
    for rank, result in enumerate(keyword_results):
        score = combined.get(result.id, 0) + (1 - alpha) * (1 / (rank + 1))
        combined[result.id] = score
    
    # Sort by combined score
    return sorted(combined.items(), key=lambda x: x[1], reverse=True)
```

## Performance Optimization

### Batch Processing

```python
# ✅ Good: Batch embeddings
embeddings = model.encode(
    documents,
    batch_size=32,
    show_progress_bar=True
)

# ❌ Bad: One at a time
for doc in documents:
    embedding = model.encode(doc)
```

### Caching

```python
from functools import lru_cache

@lru_cache(maxsize=10000)
def get_embedding(text: str) -> tuple:
    """Cache embeddings to avoid recomputation."""
    return tuple(model.encode(text))
```

### Index Optimization

```python
# HNSW parameters
index = client.create_index(
    name="my_index",
    dimension=1536,
    metric="cosine",
    hnsw_config={
        "M": 16,  # Number of connections per node
        "ef_construction": 100  # Build-time accuracy
    }
)

# Search parameters
results = index.query(
    vector=query_vector,
    top_k=10,
    hnsw_ef=50  # Search-time accuracy
)
```

## Evaluation

### Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **Recall@K** | % of relevant docs in top K | > 0.9 |
| **MRR** | Mean Reciprocal Rank | > 0.8 |
| **NDCG** | Normalized Discounted Cumulative Gain | > 0.85 |
| **Latency** | Query response time | < 100ms |

### Evaluation Pipeline

```python
def evaluate_rag(queries: list[dict]):
    """
    Evaluate RAG system.
    
    Args:
        queries: List of {"query": str, "relevant_docs": [str]}
    """
    metrics = {
        'recall@5': [],
        'recall@10': [],
        'latency': []
    }
    
    for q in queries:
        start = time.time()
        results = rag.retrieve(q['query'], top_k=10)
        latency = time.time() - start
        
        # Calculate recall
        relevant = set(q['relevant_docs'])
        retrieved = set([r.id for r in results[:5]])
        recall = len(relevant & retrieved) / len(relevant)
        
        metrics['recall@5'].append(recall)
        metrics['latency'].append(latency)
    
    return {
        'recall@5': np.mean(metrics['recall@5']),
        'avg_latency': np.mean(metrics['latency'])
    }
```

## Best Practices

1. **Choose right chunk size**: 512-1024 tokens for text
2. **Use overlap**: 10-20% overlap between chunks
3. **Add metadata**: Enable filtering and context
4. **Cache embeddings**: Avoid recomputation
5. **Batch operations**: Process in batches for efficiency
6. **Monitor quality**: Track recall and latency
7. **Hybrid search**: Combine vector + keyword for best results
8. **Index optimization**: Tune HNSW parameters for your use case

## Anti-Patterns

- **No chunking strategy**: Inconsistent retrieval quality
- **Ignoring metadata**: Misses filtering opportunities
- **No reranking**: Lower relevance scores
- **Skipping evaluation**: Can't measure improvements
- **Over-engineering**: Starting with complex hybrid search before basic vector search works

## Verification

- [ ] Embedding model selected
- [ ] Vector DB configured
- [ ] Chunking implemented
- [ ] Retrieval working
- [ ] Evaluation metrics defined
- [ ] Performance monitored
- [ ] Caching configured

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
---
name: data-engineer
description: "Data engineering covering ETL pipelines, data warehousing, streaming, and building scalable data infrastructure."
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Data Engineering

Data engineering covering ETL pipelines, data warehousing, streaming, and scalable data infrastructure.

## 🧠 Core Philosophy
> "Data engineering is about building reliable pipelines that transform raw data into actionable insights."

## When to Use
Use this skill when:
- **Building ETL/ELT pipelines** for data processing
- **Designing data warehouses** and data lakes
- **Implementing real-time streaming** data processing
- **Optimizing data workflows** for performance
- **Building data infrastructure** for analytics

---

## 1. Data Pipeline Architecture

### ETL vs ELT

| Approach | Description | When to Use |
|----------|-------------|-------------|
| **ETL** | Extract → Transform → Load | Small data, complex transformations |
| **ELT** | Extract → Load → Transform | Big data, cloud data warehouses |

### Pipeline Components
```
Sources → Ingestion → Storage → Transformation → Serving
   ↓          ↓           ↓           ↓              ↓
Databases  Kafka/CDC  S3/Data   Spark/dbt     BI Tools
APIs       Airflow     Lakehouse  Flink         ML Models
Files      Fivetran    BigQuery   dbt           Dashboards
```

## 2. Data Warehousing

### Star Schema
```sql
-- Fact table (measures)
CREATE TABLE fact_sales (
    sale_id INTEGER PRIMARY KEY,
    date_key INTEGER REFERENCES dim_date(date_key),
    product_key INTEGER REFERENCES dim_product(product_key),
    customer_key INTEGER REFERENCES dim_customer(customer_key),
    store_key INTEGER REFERENCES dim_store(store_key),
    quantity INTEGER,
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(10,2)
);

-- Dimension tables (descriptive)
CREATE TABLE dim_product (
    product_key INTEGER PRIMARY KEY,
    product_id INTEGER,
    name VARCHAR(255),
    category VARCHAR(100),
    brand VARCHAR(100)
);

CREATE TABLE dim_date (
    date_key INTEGER PRIMARY KEY,
    date DATE,
    year INTEGER,
    quarter INTEGER,
    month INTEGER,
    day_of_week INTEGER
);
```

### Data Lake Architecture
```
Raw Zone (bronze)
  ↓ ETL
Curated Zone (silver)
  ↓ ETL
Analytics Zone (gold)
```

## 3. ETL with Python

### Basic ETL Pipeline
```python
import pandas as pd
from sqlalchemy import create_engine

class ETLPipeline:
    def __init__(self, source_config, target_config):
        self.source = source_config
        self.target = target_config
    
    def extract(self, query: str) -> pd.DataFrame:
        """Extract data from source."""
        engine = create_engine(self.source['database_url'])
        return pd.read_sql(query, engine)
    
    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Transform data."""
        # Clean data
        df = df.dropna()
        df['email'] = df['email'].str.lower()
        
        # Enrich data
        df['created_at'] = pd.to_datetime(df['created_at'])
        df['year'] = df['created_at'].dt.year
        
        return df
    
    def load(self, df: pd.DataFrame, table_name: str):
        """Load data to target."""
        engine = create_engine(self.target['database_url'])
        df.to_sql(table_name, engine, if_exists='append', index=False)
    
    def run(self, query: str, table_name: str):
        """Run full ETL pipeline."""
        print("Extracting...")
        df = self.extract(query)
        
        print("Transforming...")
        df = self.transform(df)
        
        print("Loading...")
        self.load(df, table_name)
        
        print(f"Loaded {len(df)} rows into {table_name}")

# Usage
pipeline = ETLPipeline(
    source_config={'database_url': 'postgresql://source...'},
    target_config={'database_url': 'postgresql://target...'}
)
pipeline.run("SELECT * FROM users", "dim_users")
```

## 4. Data Orchestration

### Airflow DAG
```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'data-team',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'etl_pipeline',
    default_args=default_args,
    description='Daily ETL pipeline',
    schedule_interval='0 2 * * *',  # 2 AM daily
    catchup=False
)

def extract_task(**context):
    """Extract data from source."""
    # Implementation
    pass

def transform_task(**context):
    """Transform data."""
    # Implementation
    pass

def load_task(**context):
    """Load data to warehouse."""
    # Implementation
    pass

extract = PythonOperator(task_id='extract', python_callable=extract_task, dag=dag)
transform = PythonOperator(task_id='transform', python_callable=transform_task, dag=dag)
load = PythonOperator(task_id='load', python_callable=load_task, dag=dag)

extract >> transform >> load
```

## 5. Data Quality

### Data Quality Checks
```python
class DataQualityChecker:
    def check_not_null(self, df: pd.DataFrame, column: str) -> bool:
        """Check if column has no null values."""
        null_count = df[column].isnull().sum()
        return null_count == 0
    
    def check_unique(self, df: pd.DataFrame, column: str) -> bool:
        """Check if column has unique values."""
        duplicate_count = df[column].duplicated().sum()
        return duplicate_count == 0
    
    def check_range(self, df: pd.DataFrame, column: str, min_val, max_val) -> bool:
        """Check if values are within range."""
        return df[column].between(min_val, max_val).all()
    
    def check_referential_integrity(self, df: pd.DataFrame, column: str, 
                                     reference_df: pd.DataFrame, ref_column: str) -> bool:
        """Check if all values exist in reference table."""
        return df[column].isin(reference_df[ref_column]).all()
    
    def run_checks(self, df: pd.DataFrame) -> dict:
        """Run all quality checks."""
        checks = {
            'user_id_not_null': self.check_not_null(df, 'user_id'),
            'user_id_unique': self.check_unique(df, 'user_id'),
            'age_range': self.check_range(df, 'age', 0, 120),
            'email_not_null': self.check_not_null(df, 'email')
        }
        
        failed_checks = [k for k, v in checks.items() if not v]
        if failed_checks:
            raise DataQualityError(f"Failed checks: {failed_checks}")
        
        return checks
```

## 6. Streaming Data

### Kafka Consumer
```python
from kafka import KafkaConsumer
import json

consumer = KafkaConsumer(
    'user_events',
    bootstrap_servers=['localhost:9092'],
    auto_offset_reset='earliest',
    enable_auto_commit=True,
    group_id='data-pipeline',
    value_deserializer=lambda x: json.loads(x.decode('utf-8'))
)

for message in consumer:
    event = message.value
    process_event(event)
```

### Real-time Processing
```python
class RealTimeProcessor:
    def __init__(self):
        self.window_size = timedelta(minutes=5)
        self.buffer = []
    
    def process_event(self, event: dict):
        """Process event in real-time."""
        self.buffer.append(event)
        
        # Aggregate over time window
        if len(self.buffer) >= 100:
            self.aggregate_and_save()
    
    def aggregate_and_save(self):
        """Aggregate events and save to database."""
        df = pd.DataFrame(self.buffer)
        
        # Aggregate
        agg = df.groupby('user_id').agg({
            'event_type': 'count',
            'timestamp': 'max'
        }).reset_index()
        
        # Save
        agg.to_sql('user_activity', engine, if_exists='append', index=False)
        
        # Clear buffer
        self.buffer = []
```

## 🛠️ Implementation Checklist
- [ ] Is the pipeline idempotent (can run multiple times)?
- [ ] Are there data quality checks?
- [ ] Is there error handling and retry logic?
- [ ] Is data lineage tracked?
- [ ] Are there monitoring and alerting?
- [ ] Is the pipeline documented?
- [ ] Are there tests for transformations?

## Limitations
- Data engineering requires understanding of business context
- Pipeline complexity grows with data volume
- This skill is not a substitute for data modeling expertise
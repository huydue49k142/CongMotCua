---
name: machine-learning-ops
description: "Machine Learning Operations (MLOps) covering model deployment, monitoring, versioning, and CI/CD pipelines for production ML systems."
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Machine Learning Operations (MLOps)

Machine Learning Operations (MLOps) covering model deployment, monitoring, versioning, and CI/CD pipelines.

## 🧠 Core Philosophy
> "MLOps is about treating ML systems as products — version, test, deploy, and monitor models like you would any other software component."

## When to Use
Use this skill when:
- **Deploying ML models** to production
- **Setting up ML pipelines** with CI/CD
- **Monitoring model performance** and drift
- **Versioning models** and datasets
- **Scaling ML infrastructure** for training and inference

---

## 1. ML Pipeline Architecture

```
Data Collection → Data Validation → Model Training → Model Evaluation → Deployment → Monitoring
     ↓                    ↓                  ↓                 ↓                ↓             ↓
  Data Store        Great Expectations   MLflow/Kubeflow   Test Suite      API/Edge      Drift Detection
```

## 2. Model Versioning

### MLflow Tracking
```python
import mlflow

# Start tracking run
mlflow.start_run()

# Log parameters
mlflow.log_param("learning_rate", 0.001)
mlflow.log_param("batch_size", 32)
mlflow.log_param("epochs", 10)

# Log metrics
mlflow.log_metric("train_loss", 0.5)
mlflow.log_metric("val_accuracy", 0.95)

# Log model
mlflow.sklearn.log_model(model, "model")

# Register model
model_uri = f"runs:/{mlflow.active_run().info.run_id}/model"
mlflow.register_model(model_uri, "my-classifier")
```

### Model Registry
```python
from mlflow.tracking import MlflowClient

client = MlflowClient()

# Promote model to production
client.transition_model_version_stage(
    name="my-classifier",
    version=3,
    stage="Production"
)

# Load production model
model = mlflow.pyfunc.load_model("models:/my-classifier/Production")
```

## 3. Model Deployment Patterns

### REST API (FastAPI)
```python
from fastapi import FastAPI
import mlflow.pyfunc

app = FastAPI()
model = mlflow.pyfunc.load_model("models:/my-classifier/Production")

@app.post("/predict")
def predict(features: dict):
    prediction = model.predict([list(features.values())])
    return {"prediction": prediction[0]}
```

### Batch Inference
```python
def batch_predict(input_path: str, output_path: str):
    """Run batch predictions on a dataset."""
    df = pd.read_csv(input_path)
    
    predictions = model.predict(df)
    
    results = pd.DataFrame({
        'id': df['id'],
        'prediction': predictions,
        'timestamp': datetime.now()
    })
    
    results.to_csv(output_path, index=False)
```

## 4. Model Monitoring

### Data Drift Detection
```python
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset

def check_drift(reference_data, current_data):
    """Check if data distribution has changed."""
    report = Report(metrics=[DataDriftPreset()])
    report.run(reference_data=reference_data, current_data=current_data)
    
    drift_detected = report.as_dict()['metrics'][0]['result']['dataset_drift']
    
    if drift_detected:
        alert("Data drift detected! Model may need retraining.")
    
    return drift_detected
```

### Performance Monitoring
```python
class ModelMonitor:
    def __init__(self, model_id: str):
        self.model_id = model_id
        self.predictions = []
        self.latencies = []
    
    def log_prediction(self, prediction, actual=None, latency_ms=None):
        self.predictions.append({
            'model_id': self.model_id,
            'prediction': prediction,
            'actual': actual,
            'timestamp': datetime.now()
        })
        
        if latency_ms:
            self.latencies.append(latency_ms)
    
    def get_metrics(self):
        return {
            'total_predictions': len(self.predictions),
            'avg_latency_ms': sum(self.latencies) / len(self.latencies) if self.latencies else 0,
            'p95_latency_ms': sorted(self.latencies)[int(len(self.latencies) * 0.95)] if self.latencies else 0
        }
```

## 5. CI/CD for ML

```yaml
# .github/workflows/ml-pipeline.yml
name: ML Pipeline

on:
  push:
    paths:
      - 'models/**'

jobs:
  train:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Train model
        run: python train.py
      
      - name: Evaluate model
        run: python evaluate.py
      
      - name: Register if accuracy > 0.90
        if: success()
        run: python register_model.py
```

## 🛠️ Implementation Checklist
- [ ] Are models versioned (MLflow, DVC, Weights & Biases)?
- [ ] Is there a model registry for staging/production?
- [ ] Are deployment pipelines automated (CI/CD)?
- [ ] Is there monitoring for data drift and model performance?
- [ ] Are predictions logged for debugging?
- [ ] Is there a rollback strategy for bad deployments?
- [ ] Are A/B tests set up for model comparison?
- [ ] Is there automated retraining when drift is detected?

## Limitations
- MLOps requires significant infrastructure investment
- Model monitoring is complex (data drift, concept drift, performance)
- This skill is not a substitute for domain-specific ML knowledge
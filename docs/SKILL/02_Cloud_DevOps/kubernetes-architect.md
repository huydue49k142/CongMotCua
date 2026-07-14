---
name: kubernetes-architect
description: "Kubernetes architecture and deployment patterns covering clusters, pods, services, deployments, and production-ready configurations."
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Kubernetes Architect

Kubernetes architecture and deployment patterns for production-ready container orchestration.

## 🧠 Core Philosophy
> "Kubernetes is not just about running containers — it's about automating deployment, scaling, and operations of containerized applications."

## When to Use
Use this skill when:
- **Designing Kubernetes clusters** for production
- **Deploying applications** with Kubernetes manifests
- **Implementing auto-scaling** and self-healing
- **Managing configurations** and secrets
- **Setting up monitoring** and logging

---

## 1. Core Concepts

### Kubernetes Objects
| Object | Purpose | Scope |
|--------|---------|-------|
| **Pod** | Smallest deployable unit (1+ containers) | Cluster |
| **Deployment** | Manages Pod replicas and updates | Cluster |
| **Service** | Network endpoint for Pods | Cluster |
| **Ingress** | HTTP/HTTPS routing to services | Cluster |
| **ConfigMap** | Configuration data | Namespace |
| **Secret** | Sensitive data (passwords, keys) | Namespace |
| **PersistentVolume** | Storage for Pods | Cluster |
| **Namespace** | Virtual cluster isolation | Cluster |

## 2. Deployment Patterns

### Basic Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
  labels:
    app: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: api:1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "256Mi"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
```

### Service & Ingress
```yaml
# Service for internal communication
apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  selector:
    app: api
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP

# Ingress for external HTTP/HTTPS
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.example.com
    secretName: api-tls
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
```

## 3. Configuration & Secrets

### ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  LOG_LEVEL: "info"
  MAX_CONNECTIONS: "100"
  config.yaml: |
    database:
      host: localhost
      port: 5432
```

### Secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
stringData:
  url: "postgresql://user:pass@db:5432/myapp"
  password: "secret123"
```

## 4. Storage

### PersistentVolume & PersistentVolumeClaim
```yaml
# PersistentVolumeClaim (request storage)
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-storage
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: fast-ssd

# Use in Pod
volumes:
- name: app-data
  persistentVolumeClaim:
    claimName: app-storage
```

## 5. Auto-Scaling

### Horizontal Pod Autoscaler (HPA)
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-server
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## 6. Monitoring & Logging

### Prometheus Metrics
```yaml
# ServiceMonitor for Prometheus
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: api-metrics
spec:
  selector:
    matchLabels:
      app: api
  endpoints:
  - port: metrics
    interval: 15s
```

### Structured Logging
```python
import logging
import json

def setup_logging():
    logger = logging.getLogger()
    handler = logging.StreamHandler()
    
    class JsonFormatter(logging.Formatter):
        def format(self, record):
            log_data = {
                'timestamp': self.formatTime(record),
                'level': record.levelname,
                'message': record.getMessage(),
                'service': 'api',
                'pod': os.getenv('POD_NAME', 'unknown')
            }
            return json.dumps(log_data)
    
    handler.setFormatter(JsonFormatter())
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
```

## 7. Best Practices

| Practice | Description |
|----------|-------------|
| **Resource limits** | Always set CPU/memory requests and limits |
| **Health checks** | Implement liveness and readiness probes |
| **Secrets management** | Use Secrets, never hardcode credentials |
| **Namespaces** | Separate environments (dev, staging, prod) |
| **Labels & selectors** | Organize and filter resources |
| **Rolling updates** | Use Deployments for zero-downtime updates |
| **Monitoring** | Set up Prometheus + Grafana |
| **Logging** | Centralized logging (ELK, Loki) |

## 🛠️ Implementation Checklist
- [ ] Are resource limits set for all containers?
- [ ] Are health checks configured (liveness, readiness)?
- [ ] Are secrets properly managed (not in Git)?
- [ ] Is there auto-scaling configured?
- [ ] Are there PersistentVolumeClaims for stateful apps?
- [ ] Is monitoring set up (Prometheus, Grafana)?
- [ ] Is logging centralized and structured?
- [ ] Are there network policies for security?

## Limitations
- Kubernetes has a steep learning curve
- Over-engineering for small applications
- Requires operational expertise
- This skill is not a substitute for hands-on experience
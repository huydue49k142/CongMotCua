---
name: kubernetes-deployment
description: Kubernetes deployment workflow for container orchestration, Helm charts, service mesh, and production-ready K8s configurations.
---

# Kubernetes Deployment

## Overview

Specialized workflow for deploying applications to Kubernetes including container orchestration, Helm charts, service mesh configuration, and production-ready K8s patterns.

## When to Use

- Deploying to Kubernetes
- Creating Helm charts
- Configuring service mesh
- Setting up K8s networking
- Implementing K8s security

## Workflow Phases

### Phase 1: Container Preparation

1. Create Dockerfile
2. Build container image
3. Optimize image size
4. Push to registry
5. Test container

### Phase 2: K8s Manifests

1. Create Deployment
2. Configure Service
3. Set up ConfigMap
4. Create Secrets
5. Add Ingress

### Phase 3: Helm Chart

1. Create chart structure
2. Define values.yaml
3. Add templates
4. Configure dependencies
5. Test chart

### Phase 4: Service Mesh

1. Choose service mesh (Istio, Linkerd)
2. Install mesh
3. Configure traffic management
4. Set up mTLS
5. Add observability

### Phase 5: Security

1. Configure RBAC
2. Set up NetworkPolicy
3. Enable PodSecurity
4. Configure secrets
5. Implement mTLS

### Phase 6: Observability

1. Install monitoring stack
2. Configure Prometheus
3. Create Grafana dashboards
4. Set up alerts
5. Add distributed tracing

### Phase 7: Deployment

1. Configure CI/CD
2. Set up GitOps
3. Deploy to cluster
4. Verify deployment
5. Monitor rollout

## Quality Gates

- [ ] Containers working
- [ ] Manifests valid
- [ ] Helm chart installs
- [ ] Security configured
- [ ] Monitoring active
- [ ] Deployment successful

## Anti-Patterns

- **No resource limits**: Causes resource exhaustion
- **Running as root**: Security risk
- **No health checks**: Unreliable deployments
- **Hardcoded values**: Not environment-agnostic
- **No rollback strategy**: Can't recover from failures

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
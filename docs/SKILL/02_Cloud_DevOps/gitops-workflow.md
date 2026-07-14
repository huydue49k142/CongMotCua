---
name: gitops-workflow
description: GitOps implementation patterns using ArgoCD, Flux CD, and declarative infrastructure management with Git as the single source of truth.
---

# GitOps Workflow

## Overview

Implement GitOps workflows for declarative infrastructure and application deployment using ArgoCD, Flux CD, and Git as the single source of truth.

## When to Use

- Implementing GitOps practices
- Setting up ArgoCD or Flux CD
- Managing Kubernetes deployments declaratively
- Automating infrastructure changes
- Implementing progressive delivery

## Core Principles

1. **Declarative**: Entire system described declaratively
2. **Git as single source of truth**: Git repository stores desired state
3. **Automated reconciliation**: Agents automatically apply changes
4. **Drift detection**: Continuously detect and correct divergence

## ArgoCD Setup

### Installation

```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

### Application Definition

```yaml
# argocd/myapp-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/example/myapp.git
    targetRevision: HEAD
    path: k8s/overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

### Project Configuration

```yaml
# argocd/myproject.yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: myproject
  namespace: argocd
spec:
  description: My project
  sourceRepos:
    - 'https://github.com/example/*'
  destinations:
    - namespace: 'production'
      server: https://kubernetes.default.svc
    - namespace: 'staging'
      server: https://kubernetes.default.svc
  clusterResourceWhitelist:
    - group: ''
      kind: Namespace
  roles:
    - name: developer
      description: Developer access
      policies:
        - p, proj:myproject:developer, applications, get, myproject/*, allow
        - p, proj:myproject:developer, applications, sync, myproject/*, allow
      groups:
        - developers
```

## Flux CD Setup

### Installation

```bash
# Install Flux CLI
curl -s https://fluxcd.io/install.sh | sudo bash

# Bootstrap Flux
flux bootstrap github \
  --owner=example \
  --repository=myapp \
  --branch=main \
  --path=clusters/production \
  --personal
```

### GitRepository

```yaml
# clusters/production/flux-system/gitrepository.yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: myapp
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/example/myapp
  ref:
    branch: main
  secretRef:
    name: myapp-credentials
```

### Kustomization

```yaml
# clusters/production/myapp/kustomization.yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: myapp
  namespace: flux-system
spec:
  interval: 5m
  targetNamespace: production
  sourceRef:
    kind: GitRepository
    name: myapp
  path: ./k8s/overlays/production
  prune: true
  timeout: 2m
```

## Directory Structure

```
myapp/
├── .argocd/
│   └── argocd-app.yaml
├── k8s/
│   ├── base/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── kustomization.yaml
│   └── overlays/
│       ├── staging/
│       │   ├── kustomization.yaml
│       │   └── replica-patch.yaml
│       └── production/
│           ├── kustomization.yaml
│           ├── replica-patch.yaml
│           └── resources-patch.yaml
└── clusters/
    ├── staging/
    └── production/
```

## Progressive Delivery

### Canary Deployment with ArgoCD Rollouts

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: myapp
spec:
  replicas: 10
  strategy:
    canary:
      steps:
        - setWeight: 20
        - pause: {duration: 1m}
        - setWeight: 50
        - pause: {duration: 2m}
        - setWeight: 100
      analysis:
        templates:
          - templateName: success-rate
        startingStep: 2
  selector:
    matchLabels:
      app: myapp
  template:
    spec:
      containers:
        - name: myapp
          image: myapp:1.0.0
```

## Best Practices

1. **Use separate repos** for apps and infrastructure
2. **Implement branch strategy** (Git flow, trunk-based)
3. **Automate everything** - no manual kubectl apply
4. **Use secrets management** (Sealed Secrets, External Secrets)
5. **Implement approval gates** for production
6. **Monitor sync status** with alerts
7. **Use Kustomize or Helm** for templating
8. **Test changes in staging first**

## Anti-Patterns

- **Manual overrides**: Bypassing Git for emergency fixes
- **No drift detection**: Changes outside Git go unnoticed
- **Monolithic manifests**: Everything in one file
- **No rollback strategy**: Can't recover from bad deployments
- **Ignoring sync failures**: Broken state not fixed

## Verification

- [ ] Git repository configured as source
- [ ] Automated sync enabled
- [ ] Drift detection configured
- [ ] Secrets management integrated
- [ ] Multi-environment setup working
- [ ] Rollback procedure tested
- [ ] Monitoring and alerts configured

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
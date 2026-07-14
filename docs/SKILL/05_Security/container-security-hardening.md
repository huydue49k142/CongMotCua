---
name: container-security-hardening
description: Container security best practices covering Docker, Kubernetes, image scanning, runtime security, and defense-in-depth strategies.
---

# Container Security Hardening

## Overview

Container security best practices covering Docker, Kubernetes, image scanning, runtime security, and defense-in-depth strategies for production deployments.

## When to Use

- Securing Docker containers
- Hardening Kubernetes deployments
- Implementing container image scanning
- Setting up runtime security
- Defense-in-depth container strategies
- Security compliance for containers

## Core Concepts

### Defense in Depth

Layer multiple security controls:

```yaml
Layer 1: Image Security
  - Minimal base images
  - Vulnerability scanning
  - Signed images
  - No secrets in images

Layer 2: Container Security
  - Non-root users
  - Read-only filesystems
  - Dropped capabilities
  - Resource limits

Layer 3: Kubernetes Security
  - Pod Security Standards
  - Network policies
  - RBAC
  - Admission controllers

Layer 4: Runtime Security
  - Runtime monitoring
  - Anomaly detection
  - Audit logging
  - Incident response
```

## Docker Security

### Minimal Base Images

```dockerfile
# ✅ Good: Minimal Alpine image
FROM alpine:3.19
RUN apk add --no-cache python3 py3-pip
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python3", "app.py"]

# ❌ Bad: Full Ubuntu image
FROM ubuntu:latest
RUN apt-get update && apt-get install -y python3
```

### Non-Root User

```dockerfile
# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -u 1000 -G appuser -s /bin/sh -D appuser

# Set ownership
COPY --chown=appuser:appuser . .

# Switch to non-root
USER appuser

# Run application
CMD ["python3", "app.py"]
```

### Read-Only Filesystem

```dockerfile
# Create writable directories only
RUN mkdir -p /tmp/uploads && chmod 777 /tmp/uploads

# Run with read-only filesystem
docker run --read-only \
  --tmpfs /tmp \
  --mount type=bind,source=/tmp/uploads,target=/app/uploads \
  myapp:latest
```

### Drop Capabilities

```bash
# Run with minimal capabilities
docker run \
  --cap-drop ALL \
  --cap-add NET_BIND_SERVICE \
  myapp:latest

# Or in docker-compose.yml
services:
  app:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

## Image Scanning

### Trivy

```bash
# Scan image for vulnerabilities
trivy image myapp:latest

# Scan with severity filter
trivy image --severity HIGH,CRITICAL myapp:latest

# Generate JSON report
trivy image --format json -o report.json myapp:latest
```

### Docker Scout

```bash
# Scan image
docker scout cves myapp:latest

# View recommendations
docker scout recommendations myapp:latest
```

### CI/CD Integration

```yaml
# GitHub Actions
- name: Scan image
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'myapp:${{ github.sha }}'
    format: 'sarif'
    output: 'trivy-results.sarif'

- name: Upload results
  uses: github/codeql-action/upload-sarif@v2
  with:
    sarif_file: 'trivy-results.sarif'
```

## Kubernetes Security

### Pod Security Standards

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

### Security Context

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: myapp:latest
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
    resources:
      limits:
        cpu: "500m"
        memory: "512Mi"
      requests:
        cpu: "250m"
        memory: "256Mi"
```

### Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
```

### RBAC

```yaml
# ServiceAccount
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-sa
  namespace: production

# Role
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: app-role
  namespace: production
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "list"]
  resourceNames: ["app-config"]

# RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: app-rolebinding
  namespace: production
subjects:
- kind: ServiceAccount
  name: app-sa
  namespace: production
roleRef:
  kind: Role
  name: app-role
  apiGroup: rbac.authorization.k8s.io
```

## Secrets Management

### Kubernetes Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: production
type: Opaque
stringData:
  database-url: "postgresql://user:pass@host:5432/db"
  api-key: "secret-api-key"
```

### External Secrets Operator

```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: vault-backend
  namespace: production
spec:
  provider:
    vault:
      server: "https://vault.example.com:8200"
      path: "secret"
      version: "v2"
      auth:
        kubernetes:
          mountPath: "kubernetes"
          role: "production"
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: app-secrets
  namespace: production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: app-secrets
  data:
  - secretKey: database-url
    remoteRef:
      key: database/config
      property: url
```

## Runtime Security

### Falco

```yaml
# Falco rules for detecting suspicious activity
- rule: Unexpected Process
  desc: Detect unexpected processes in container
  condition: >
    spawned_process and
    container and
    not proc.name in (allowed_processes)
  output: >
    Suspicious process (user=%user.name command=%proc.cmdline
    container=%container.name)
  priority: WARNING
```

### OPA Gatekeeper

```yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredLabels
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredlabels
        violation[{"msg": msg}] {
          provided := {label | input.review.object.metadata.labels[label]}
          required := {"app", "environment"}
          missing := required - provided
          count(missing) > 0
          msg := sprintf("missing required labels: %v", [missing])
        }
```

## Security Scanning

### Image Scanning in CI/CD

```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build image
        run: docker build -t myapp:${{ github.sha }} .
      
      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'myapp:${{ github.sha }}'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

## Best Practices

1. **Use minimal base images**: Alpine, distroless
2. **Run as non-root**: Never run as root
3. **Read-only filesystem**: Prevent modifications
4. **Drop capabilities**: Only add what's needed
5. **Scan images**: Check for vulnerabilities
6. **Sign images**: Use Docker Content Trust
7. **Network policies**: Restrict traffic
8. **Secrets management**: Use external secrets
9. **Resource limits**: Prevent resource exhaustion
10. **Audit logging**: Track all actions

## Anti-Patterns

- **Running as root**: Security risk
- **Large base images**: More vulnerabilities
- **Secrets in images**: Exposed in layers
- **No resource limits**: Resource exhaustion
- **Open network policies**: Lateral movement
- **No image scanning**: Unknown vulnerabilities
- **Privileged containers**: Full host access

## Verification

- [ ] Minimal base image used
- [ ] Non-root user configured
- [ ] Read-only filesystem enabled
- [ ] Capabilities dropped
- [ ] Image scanning in CI/CD
- [ ] Network policies configured
- [ ] Secrets externalized
- [ ] Resource limits set
- [ ] Security scanning passing

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
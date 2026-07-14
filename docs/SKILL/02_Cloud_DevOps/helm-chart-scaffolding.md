---
name: helm-chart-scaffolding
description: Create production-ready Helm charts for Kubernetes applications with proper templating, values management, and testing.
---

# Helm Chart Scaffolding

## Overview

Create production-ready Helm charts for Kubernetes applications including proper templating, values management, testing, and packaging for deployment.

## When to Use

- Creating new Helm charts
- Packaging Kubernetes applications
- Managing multi-environment deployments
- Implementing GitOps workflows
- Distributing Kubernetes applications

## Helm Chart Structure

```
mychart/
├── Chart.yaml           # Chart metadata
├── values.yaml          # Default configuration values
├── values.schema.json   # Values validation schema (optional)
├── README.md            # Chart documentation
├── charts/              # Chart dependencies
├── templates/           # Kubernetes manifest templates
│   ├── _helpers.tpl     # Template helpers
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── serviceaccount.yaml
│   ├── hpa.yaml
│   └── NOTES.txt        # Post-install notes
└── tests/               # Chart tests
    └── test-connection.yaml
```

## Chart.yaml

```yaml
apiVersion: v2
name: myapp
description: A Helm chart for MyApp
type: application
version: 1.0.0
appVersion: "2.1.0"
keywords:
  - web
  - api
  - backend
maintainers:
  - name: DevOps Team
    email: devops@example.com
sources:
  - https://github.com/example/myapp
```

## values.yaml

```yaml
# Default values for myapp
replicaCount: 3

image:
  repository: myapp
  pullPolicy: IfNotPresent
  tag: ""

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""

serviceAccount:
  create: true
  annotations: {}
  name: ""

podAnnotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "8080"

podSecurityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000

securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
    - ALL

service:
  type: ClusterIP
  port: 80
  targetPort: 8080

ingress:
  enabled: false
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
  hosts:
    - host: myapp.example.com
      paths:
        - path: /
          pathType: Prefix
  tls: []

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: false
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80

nodeSelector: {}

tolerations: []

affinity: {}
```

## Template Examples

### Deployment Template

```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "myapp.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      {{- with .Values.podAnnotations }}
      annotations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      labels:
        {{- include "myapp.selectorLabels" . | nindent 8 }}
    spec:
      {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "myapp.serviceAccountName" . }}
      securityContext:
        {{- toYaml .Values.podSecurityContext | nindent 8 }}
      containers:
        - name: {{ .Chart.Name }}
          securityContext:
            {{- toYaml .Values.securityContext | nindent 12 }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ .Values.service.targetPort }}
              protocol: TCP
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          {{- with .Values.livenessProbe }}
          livenessProbe:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          {{- with .Values.readinessProbe }}
          readinessProbe:
            {{- toYaml . | nindent 12 }}
          {{- end }}
```

### Service Template

```yaml
# templates/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
spec:
  type: {{ .Values.service.type }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: {{ .Values.service.targetPort }}
      protocol: TCP
      name: http
  selector:
    {{- include "myapp.selectorLabels" . | nindent 4 }}
```

### Helpers Template

```yaml
# templates/_helpers.tpl
{{/*
Expand the name of the chart.
*/}}
{{- define "myapp.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "myapp.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "myapp.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "myapp.labels" -}}
helm.sh/chart: {{ include "myapp.chart" . }}
{{ include "myapp.selectorLabels" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "myapp.selectorLabels" -}}
app.kubernetes.io/name: {{ include "myapp.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "myapp.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "myapp.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
```

## Values Files per Environment

```yaml
# values-staging.yaml
replicaCount: 2

image:
  tag: staging

resources:
  limits:
    cpu: 250m
    memory: 256Mi
  requests:
    cpu: 125m
    memory: 128Mi

autoscaling:
  enabled: false
```

```yaml
# values-production.yaml
replicaCount: 5

image:
  tag: "1.2.3"

resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilizationPercentage: 70
```

## Testing

```bash
# Lint chart
helm lint mychart/

# Dry-run install
helm install myapp ./mychart --dry-run --debug

# Template rendering
helm template myapp ./mychart -f values-staging.yaml

# Install
helm install myapp ./mychart -f values-production.yaml

# Upgrade
helm upgrade myapp ./mychart -f values-production.yaml

# Rollback
helm rollback myapp 1

# Uninstall
helm uninstall myapp
```

## Best Practices

1. **Use semantic versioning** for chart versions
2. **Document all values** in values.yaml comments
3. **Use helpers** for repeated template logic
4. **Validate with schema** (values.schema.json)
5. **Test templates** before packaging
6. **Use environment-specific values files**
7. **Pin dependency versions**
8. **Include NOTES.txt** with usage instructions

## Anti-Patterns

- **Hardcoding values**: Use values.yaml
- **No validation**: Missing values.schema.json
- **Monolithic templates**: Split into multiple files
- **No testing**: Deploying untested charts
- **Ignoring upgrades**: Not testing helm upgrade

## Verification

- [ ] Chart.yaml properly configured
- [ ] values.yaml documented
- [ ] Templates use helpers
- [ ] values.schema.json validates inputs
- [ ] Chart passes lint
- [ ] Install/upgrade/rollback tested
- [ ] Multiple environments supported

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
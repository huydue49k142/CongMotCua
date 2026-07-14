---
name: secrets-management
description: Secure secrets management practices for CI/CD pipelines, applications, and infrastructure using Vault, AWS Secrets Manager, and other tools.
---

# Secrets Management

## Overview

Secure secrets management practices for CI/CD pipelines, applications, and infrastructure using Vault, AWS Secrets Manager, and other tools. Covers secret storage, rotation, access control, and best practices.

## When to Use

- Storing API keys and credentials
- Managing database passwords
- Handling TLS certificates
- Rotating secrets automatically
- Implementing least-privilege access
- Securing CI/CD pipelines
- Compliance requirements (SOC2, PCI-DSS)

## Core Concepts

### Secret Types

```yaml
Credentials:
  - Database passwords
  - API keys
  - SSH keys
  - Service account tokens

Certificates:
  - TLS/SSL certificates
  - Private keys
  - Certificate authorities

Sensitive Data:
  - Encryption keys
  - OAuth secrets
  - JWT signing keys
  - Third-party credentials
```

### Secret Hierarchy

```
Organization
├── Environment (prod, staging, dev)
│   ├── Service (api, worker, scheduler)
│   │   ├── Secret Type (database, api, certs)
│   │   │   ├── Secret Name (password, key, token)
│   │   │   └── Version (v1, v2, v3)
```

## Tools Comparison

| Tool | Best For | Key Features |
|------|----------|--------------|
| **HashiCorp Vault** | Enterprise, multi-cloud | Dynamic secrets, HSM, audit logs |
| **AWS Secrets Manager** | AWS-native | Auto-rotation, Lambda integration |
| **Azure Key Vault** | Azure-native | HSM-backed, certificate management |
| **Google Secret Manager** | GCP-native | Versioning, IAM integration |
| **Kubernetes Secrets** | K8s-native | Simple, base64 encoded |
| **External Secrets Operator** | K8s + external | Syncs external secrets to K8s |

## HashiCorp Vault

### Setup and Configuration

```bash
# Start Vault dev server
vault server -dev

# Set environment
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='root'

# Enable secrets engine
vault secrets enable -path=secret kv-v2

# Store secret
vault kv put secret/database/config \
  username=admin \
  password=secret-password

# Retrieve secret
vault kv get secret/database/config

# Get specific field
vault kv get -field=password secret/database/config
```

### Dynamic Secrets

```bash
# Enable database secrets engine
vault secrets enable database

# Configure database connection
vault write database/config/my-postgresql \
  plugin_name=postgresql-database-plugin \
  connection_url="postgresql://{{username}}:{{password}}@localhost:5432/postgres" \
  allowed_roles=readonly,readwrite \
  username="vault-admin" \
  password="vault-password"

# Create role
vault write database/roles/readonly \
  db_name=my-postgresql \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';" \
  revocation_statements="DROP ROLE IF EXISTS \"{{name}}\";" \
  default_ttl="1h" \
  max_ttl="24h"

# Generate dynamic credential
vault read database/creds/readonly
```

### Kubernetes Authentication

```bash
# Enable Kubernetes auth
vault auth enable kubernetes

# Configure Kubernetes auth
vault write auth/kubernetes/config \
  kubernetes_host="https://kubernetes:443" \
  kubernetes_ca_cert=@ca.crt \
  token_reviewer_jwt="..."

# Create role
vault write auth/kubernetes/role/my-app \
  bound_service_account_names=my-app \
  bound_service_account_namespaces=production \
  policies=my-app-policy \
  ttl=24h
```

### Policies

```hcl
# my-app-policy.hcl
path "secret/data/database/*" {
  capabilities = ["read"]
}

path "secret/data/api/*" {
  capabilities = ["read"]
}

path "auth/token/renew" {
  capabilities = ["update"]
}
```

```bash
# Create policy
vault policy write my-app-policy my-app-policy.hcl
```

## AWS Secrets Manager

### Store Secret

```bash
# Create secret
aws secretsmanager create-secret \
  --name production/database/password \
  --secret-string "super-secret-password" \
  --description "Production database password"

# Store JSON secret
aws secretsmanager create-secret \
  --name production/api/credentials \
  --secret-string '{"api_key":"xxx","api_secret":"yyy"}'
```

### Retrieve Secret

```bash
# Get secret value
aws secretsmanager get-secret-value \
  --secret-id production/database/password \
  --query SecretString \
  --output text

# Get specific field
aws secretsmanager get-secret-value \
  --secret-id production/api/credentials \
  --query SecretString \
  --output json | jq -r '.api_key'
```

### Auto-Rotation

```python
import boto3
import json

def lambda_handler(event, context):
    client = boto3.client('secretsmanager')
    
    # Get current secret
    response = client.get_secret_value(SecretId='my-secret')
    current_secret = json.loads(response['SecretString'])
    
    # Generate new password
    new_password = generate_strong_password()
    
    # Update database password
    update_database_password(new_password)
    
    # Update secret
    client.put_secret_value(
        SecretId='my-secret',
        SecretString=json.dumps({
            'username': current_secret['username'],
            'password': new_password
        })
    )
    
    return {'statusCode': 200}
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Deploy with Secrets

on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Import Secrets from Vault
        uses: hashicorp/vault-action@v2
        with:
          url: https://vault.example.com:8200
          token: ${{ secrets.VAULT_TOKEN }}
          secrets: |
            secret/data/database username | DB_USERNAME ;
            secret/data/database password | DB_PASSWORD ;
            secret/data/api key | API_KEY
      
      - name: Use secrets
        run: |
          echo "Connecting to database as $DB_USERNAME"
          ./deploy.sh
```

### GitLab CI

```yaml
deploy:
  image: vault:latest
  before_script:
    - export VAULT_ADDR=https://vault.example.com:8200
    - export VAULT_TOKEN=$VAULT_TOKEN
    - apk add curl jq
  script:
    - |
      DB_PASSWORD=$(vault kv get -field=password secret/database/config)
      API_KEY=$(vault kv get -field=key secret/api/credentials)
      echo "Deploying with secrets..."
      ./deploy.sh
```

## Kubernetes Secrets Management

### External Secrets Operator

```yaml
# SecretStore
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

# ExternalSecret
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: database-credentials
  namespace: production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: database-credentials
    creationPolicy: Owner
  data:
  - secretKey: username
    remoteRef:
      key: database/config
      property: username
  - secretKey: password
    remoteRef:
      key: database/config
      property: password
```

### Sealed Secrets

```bash
# Install sealed-secrets controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.23.1/controller.yaml

# Create sealed secret
kubectl create secret generic my-secret \
  --from-literal=password=secret123 \
  --dry-run=client -o yaml | \
  kubeseal -o yaml > sealed-secret.yaml

# Apply sealed secret
kubectl apply -f sealed-secret.yaml
```

## Secret Rotation

### Rotation Strategies

```yaml
Time-based:
  - Rotate every 90 days
  - Automated rotation
  - Zero downtime

Event-based:
  - Rotate on employee departure
  - Rotate on suspected compromise
  - Rotate after security incident

On-demand:
  - Manual rotation
  - Emergency rotation
  - Compliance-driven
```

### Rotation Implementation

```python
class SecretRotator:
    def __init__(self, vault_client, db_client):
        self.vault = vault_client
        self.db = db_client
    
    def rotate_database_password(self, secret_path):
        """Rotate database password."""
        # Get current secret
        current = self.vault.read(secret_path)
        
        # Generate new password
        new_password = self.generate_password()
        
        # Update in database
        self.db.update_password(
            username=current['username'],
            new_password=new_password
        )
        
        # Update in Vault
        self.vault.write(secret_path, {
            'username': current['username'],
            'password': new_password
        })
        
        # Notify services to reload
        self.notify_services()
    
    def generate_password(self, length=32):
        """Generate secure random password."""
        return secrets.token_urlsafe(length)
```

## Best Practices

1. **Never commit secrets**: Use secret management tools
2. **Use different secrets per environment**: Isolate prod/staging/dev
3. **Rotate secrets regularly**: Automated rotation preferred
4. **Implement least-privilege access**: Only authorized services access secrets
5. **Enable audit logging**: Track all secret access
6. **Use secret scanning**: GitGuardian, TruffleHog
7. **Mask secrets in logs**: Prevent accidental exposure
8. **Encrypt secrets at rest**: Protect stored secrets
9. **Use short-lived tokens**: Prefer temporary credentials
10. **Document secret requirements**: Clear ownership and rotation policy

## Anti-Patterns

- **Hardcoded secrets**: In source code or configs
- **Shared secrets**: Same secret across environments
- **No rotation**: Secrets never changed
- **Overly permissive access**: Everyone can access all secrets
- **Secrets in logs**: Accidental exposure
- **No audit trail**: Can't track access
- **Manual rotation**: Error-prone, inconsistent

## Verification

- [ ] Centralized secret store configured
- [ ] All secrets migrated from code/configs
- [ ] Access controls implemented
- [ ] Audit logging enabled
- [ ] Rotation policy defined
- [ ] Secret scanning in CI/CD
- [ ] Emergency rotation procedure documented
- [ ] Team trained on secrets management

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
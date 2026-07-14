---
name: terraform-skill
description: Infrastructure as Code with Terraform covering modules, state management, workspaces, and multi-cloud deployments.
---

# Terraform Skill

## Overview

Infrastructure as Code with Terraform covering modules, state management, workspaces, and multi-cloud deployments across AWS, Azure, and GCP.

## When to Use

- Provisioning cloud infrastructure
- Managing infrastructure as code
- Creating reusable Terraform modules
- Implementing multi-cloud deployments
- Managing Terraform state
- Setting up CI/CD for infrastructure

## Core Concepts

### Terraform Workflow

1. **Write**: Define resources in .tf files
2. **Plan**: Preview changes with `terraform plan`
3. **Apply**: Execute changes with `terraform apply`
4. **Destroy**: Remove resources with `terraform destroy`

### State Management

Terraform state tracks resource mappings:

```hcl
# Configure backend
terraform {
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
    
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
```

**State best practices:**
- Use remote backend (S3, GCS, Azure Storage)
- Enable state locking (DynamoDB, Cloud Storage)
- Encrypt state at rest
- Never commit state to Git
- Use workspaces for environments

### Variables and Outputs

```hcl
# variables.tf
variable "environment" {
  description = "Deployment environment"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "instance_count" {
  description = "Number of instances"
  type        = number
  default     = 3
}

# outputs.tf
output "instance_ips" {
  description = "Public IPs of instances"
  value       = aws_instance.app[*].public_ip
  sensitive   = false
}

output "database_url" {
  description = "Database connection URL"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}
```

## Resource Examples

### AWS EC2 Instance

```hcl
resource "aws_instance" "app" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  subnet_id     = aws_subnet.private.id
  
  vpc_security_group_ids = [aws_security_group.app.id]
  
  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y docker.io
              EOF
  
  tags = {
    Name        = "${var.name}-${var.environment}"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
}
```

### Azure Resource Group

```hcl
resource "azurerm_resource_group" "main" {
  name     = "${var.project}-${var.environment}"
  location = var.location
  
  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "azurerm_kubernetes_cluster" "main" {
  name                = "${var.project}-aks"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "${var.project}-aks"
  
  default_node_pool {
    name       = "default"
    node_count = 3
    vm_size    = "Standard_D2_v2"
  }
  
  identity {
    type = "SystemAssigned"
  }
}
```

## Modules

### Using Modules

```hcl
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"
  
  name = "${var.project}-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
  
  tags = {
    Environment = var.environment
  }
}
```

### Creating Modules

```
modules/
└── eks-cluster/
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    └── README.md
```

## Workspaces

```bash
# Create workspace
terraform workspace new staging

# Switch workspace
terraform workspace select prod

# List workspaces
terraform workspace list

# Delete workspace
terraform workspace delete staging
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Terraform

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.7.0
      
      - name: Terraform Init
        run: terraform init
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      
      - name: Terraform Plan
        run: terraform plan -out=tfplan
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      
      - name: Terraform Apply
        if: github.ref == 'refs/heads/main'
        run: terraform apply -auto-approve tfplan
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## Best Practices

1. **Use remote state** with locking
2. **Pin provider versions** in required_providers
3. **Use modules** for reusability
4. **Tag all resources** for cost tracking
5. **Use workspaces** for environment separation
6. **Run terraform fmt** before committing
7. **Always run terraform plan** before apply
8. **Use data sources** instead of hardcoding
9. **Implement CI/CD** for infrastructure changes
10. **Document modules** with README

## Anti-Patterns

- **Manual state edits**: Causes state corruption
- **No state locking**: Race conditions
- **Hardcoded values**: Use variables
- **Monolithic configs**: Split into modules
- **No version pinning**: Unexpected breaking changes
- **Committing state files**: Security risk

## Verification

- [ ] Remote state configured with locking
- [ ] Provider versions pinned
- [ ] Modules created for reusable components
- [ ] Variables validated with conditions
- [ ] Outputs defined for important values
- [ ] CI/CD pipeline configured
- [ ] Documentation complete

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
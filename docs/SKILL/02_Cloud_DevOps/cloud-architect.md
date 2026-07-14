---
name: cloud-architect
description: Cloud architecture design covering AWS, Azure, and GCP services, multi-cloud strategies, cost optimization, and enterprise cloud patterns.
---

# Cloud Architect

## Overview

Design scalable, secure, and cost-effective cloud architectures across AWS, Azure, and GCP. Covers service selection, multi-cloud strategies, cost optimization, and enterprise cloud patterns.

## When to Use

- Designing cloud architectures
- Selecting cloud services
- Planning multi-cloud deployments
- Optimizing cloud costs
- Implementing cloud security
- Migrating to cloud

## Core Concepts

### Cloud Service Models

| Model | Description | Examples |
|-------|-------------|----------|
| **IaaS** | Infrastructure as a Service | EC2, VMs, Storage |
| **PaaS** | Platform as a Service | RDS, App Service, Cloud Run |
| **SaaS** | Software as a Service | Salesforce, Slack |
| **FaaS** | Function as a Service | Lambda, Functions, Cloud Functions |

### Well-Architected Frameworks

All major clouds provide guidance:
- **AWS**: Operational Excellence, Security, Reliability, Performance, Cost Optimization
- **Azure**: Cost Management, Operational Excellence, Performance, Reliability, Security
- **GCP**: Operational Excellence, Security, Privacy, Reliability, Cost Optimization

## AWS Services

### Compute
- **EC2**: Virtual servers
- **ECS/EKS**: Container orchestration
- **Lambda**: Serverless functions
- **Elastic Beanstalk**: PaaS deployment

### Storage
- **S3**: Object storage
- **EBS**: Block storage
- **EFS**: File storage
- **Glacier**: Archive storage

### Database
- **RDS**: Managed relational DB
- **DynamoDB**: NoSQL key-value
- **Aurora**: MySQL/PostgreSQL compatible
- **Redshift**: Data warehouse

### Networking
- **VPC**: Virtual private cloud
- **CloudFront**: CDN
- **Route 53**: DNS
- **API Gateway**: API management

## Azure Services

### Compute
- **VMs**: Virtual machines
- **AKS**: Kubernetes service
- **Functions**: Serverless functions
- **App Service**: Web app hosting

### Storage
- **Blob Storage**: Object storage
- **Disk Storage**: Block storage
- **Files**: File shares
- **Archive**: Cold storage

### Database
- **SQL Database**: Managed SQL
- **Cosmos DB**: Multi-model NoSQL
- **PostgreSQL/MySQL**: Managed open source
- **Synapse**: Analytics

### Networking
- **VNet**: Virtual network
- **CDN**: Content delivery
- **DNS**: Domain management
- **API Management**: API gateway

## GCP Services

### Compute
- **Compute Engine**: VMs
- **GKE**: Kubernetes engine
- **Cloud Functions**: Serverless
- **Cloud Run**: Container platform

### Storage
- **Cloud Storage**: Object storage
- **Persistent Disk**: Block storage
- **Filestore**: File storage
- **Archive**: Cold storage

### Database
- **Cloud SQL**: Managed SQL
- **Firestore**: NoSQL document
- **Bigtable**: Wide-column NoSQL
- **BigQuery**: Data warehouse

### Networking
- **VPC**: Virtual private cloud
- **Cloud CDN**: Content delivery
- **Cloud DNS**: DNS service
- **API Gateway**: API management

## Architecture Patterns

### High Availability

```yaml
Multi-AZ Deployment:
  - Deploy across 2+ availability zones
  - Use load balancers
  - Implement health checks
  - Auto-scaling groups
  
Multi-Region:
  - Deploy to 2+ regions
  - Route 53 health checks
  - Cross-region replication
  - Global load balancing
```

### Scalability

```yaml
Horizontal Scaling:
  - Auto-scaling groups
  - Load balancers
  - Stateless applications
  - Distributed caching

Vertical Scaling:
  - Larger instance types
  - Database read replicas
  - Storage scaling
```

### Security

```yaml
Identity & Access:
  - IAM roles and policies
  - Least privilege access
  - MFA enforcement
  - Service accounts

Network Security:
  - VPC with private subnets
  - Security groups
  - NACLs
  - VPN/ExpressRoute

Data Protection:
  - Encryption at rest
  - Encryption in transit
  - Key management (KMS)
  - Backup strategies
```

## Cost Optimization

### Strategies

1. **Right-sizing**: Match resources to needs
2. **Reserved Instances**: Commit for discounts (30-70%)
3. **Spot Instances**: Use for fault-tolerant workloads (90% discount)
4. **Auto-scaling**: Scale down during low usage
5. **Storage tiers**: Move old data to cheaper storage
6. **Cleanup**: Remove unused resources

### Cost Monitoring

```yaml
Budgets:
  - Set monthly budgets
  - Alert at 50%, 80%, 100%
  - Track by service/tag

Cost Allocation:
  - Tag all resources
  - Department/project tracking
  - Showback/chargeback

Optimization Tools:
  - AWS Cost Explorer
  - Azure Cost Management
  - GCP Cost Management
```

## Multi-Cloud Strategy

### When to Use Multi-Cloud

- Avoid vendor lock-in
- Use best-of-breed services
- Geographic requirements
- Disaster recovery
- Regulatory compliance

### Challenges

- Increased complexity
- Higher operational costs
- Skills requirement
- Data transfer costs
- Security consistency

### Abstraction Layers

```yaml
Kubernetes:
  - Consistent deployment layer
  - Works across clouds
  - Managed services (EKS, AKS, GKE)

Terraform:
  - Infrastructure as code
  - Multi-cloud providers
  - Consistent provisioning

Service Mesh:
  - Istio, Linkerd
  - Consistent networking
  - Cross-cloud communication
```

## Migration Strategies

### 6 Rs

1. **Rehost**: Lift and shift (VMs)
2. **Replatform**: Lift and optimize (managed DB)
3. **Repurchase**: Switch to SaaS
4. **Refactor**: Rewrite for cloud-native
5. **Retire**: Decommission
6. **Retain**: Keep on-premises

### Migration Process

1. **Assess**: Discover current state
2. **Plan**: Define migration strategy
3. **Prepare**: Set up cloud foundation
4. **Migrate**: Move workloads
5. **Optimize**: Improve performance/cost

## Best Practices

1. **Design for failure**: Assume components will fail
2. **Use managed services**: Reduce operational burden
3. **Automate everything**: Infrastructure as code
4. **Implement monitoring**: Visibility into all layers
5. **Secure by default**: Defense in depth
6. **Tag everything**: Cost tracking and governance
7. **Plan for exit**: Avoid vendor lock-in
8. **Start small**: Pilot before full migration

## Anti-Patterns

- **Lift and shift without optimization**: Paying more for same architecture
- **No tagging strategy**: Can't track costs
- **Over-engineering**: Using complex services for simple needs
- **No disaster recovery**: Single region deployment
- **Ignoring costs**: Bill shock
- **Manual provisioning**: Not using IaC

## Verification

- [ ] Architecture documented
- [ ] High availability designed
- [ ] Security controls implemented
- [ ] Cost monitoring configured
- [ ] Disaster recovery planned
- [ ] Migration strategy defined
- [ ] Monitoring and alerting set up

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
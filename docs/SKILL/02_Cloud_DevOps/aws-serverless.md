---
name: aws-serverless
description: "Build production-ready serverless applications on AWS with Lambda, API Gateway, DynamoDB, and event-driven architectures."
risk: safe
source: "community"
date_added: "2026-07-11"
---

# AWS Serverless Development

Build production-ready serverless applications on AWS with Lambda, API Gateway, DynamoDB, and event-driven architectures.

## 🧠 Core Philosophy
> "Serverless is not about servers — it's about focusing on business logic while AWS manages infrastructure."

## When to Use
Use this skill when:
- **Building serverless APIs** with AWS Lambda and API Gateway
- **Designing event-driven architectures** with SQS, SNS, EventBridge
- **Implementing authentication** with Cognito
- **Optimizing cold starts** and Lambda performance
- **Setting up CI/CD** for serverless applications

---

## 1. Core AWS Services

| Service | Purpose | Use Case |
|---------|---------|----------|
| **Lambda** | Serverless compute | Business logic, API handlers |
| **API Gateway** | API management | REST/HTTP APIs, WebSocket |
| **DynamoDB** | NoSQL database | High-scale data storage |
| **S3** | Object storage | Files, static assets |
| **SQS** | Message queue | Async processing, decoupling |
| **SNS** | Pub/sub messaging | Notifications, fan-out |
| **EventBridge** | Event bus | Event-driven workflows |
| **Cognito** | Authentication | User management, OAuth |

## 2. Lambda Best Practices

### Handler Pattern
```python
import json
from typing import Any, Dict

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Standard Lambda handler pattern."""
    try:
        # Parse input
        body = json.loads(event.get('body', '{}'))
        
        # Business logic
        result = process_request(body)
        
        # Return response
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(result)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

### Cold Start Optimization
```python
# ✅ Good: Initialize outside handler
import boto3
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('my-table')

def lambda_handler(event, context):
    # Reuse connections across invocations
    response = table.get_item(Key={'id': event['id']})
    return response
```

## 3. API Gateway Integration

```python
# Lambda proxy integration
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": json.dumps({
    "message": "Success",
    "data": result
  })
}
```

## 4. DynamoDB Patterns

### Single-Table Design
```python
class DynamoDBRepository:
    def __init__(self, table_name: str):
        self.table = boto3.resource('dynamodb').Table(table_name)
    
    def get_user(self, user_id: str):
        response = self.table.get_item(Key={'PK': f'USER#{user_id}', 'SK': 'METADATA'})
        return response.get('Item')
    
    def get_user_orders(self, user_id: str):
        response = self.table.query(
            KeyConditionExpression=Key('PK').eq(f'USER#{user_id}') & Key('SK').begins_with('ORDER#')
        )
        return response['Items']
```

## 5. Event-Driven Architecture

```python
# SQS consumer
def sqs_handler(event, context):
    for record in event['Records']:
        message = json.loads(record['body'])
        process_order(message)
```

## 🛠️ Implementation Checklist
- [ ] Are Lambda functions small and focused (single responsibility)?
- [ ] Is error handling comprehensive (retries, DLQ)?
- [ ] Are environment variables used for configuration?
- [ ] Is logging structured (JSON format)?
- [ ] Are API Gateway routes RESTful?
- [ ] Is DynamoDB properly indexed (GSI/LSI)?
- [ ] Are there integration tests?

## Limitations
- Cold starts can impact latency
- Lambda has execution time limits (15 min)
- Vendor lock-in with AWS services
- Debugging distributed systems is complex
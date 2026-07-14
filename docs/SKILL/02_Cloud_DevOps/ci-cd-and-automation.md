---
name: ci-cd-and-automation
description: CI/CD pipeline design and automation workflows for GitHub Actions, GitLab CI, Jenkins, and modern deployment strategies.
---

# CI/CD and Automation

## Overview

Design and implement CI/CD pipelines for automated testing, building, and deployment. Covers GitHub Actions, GitLab CI, Jenkins, and modern deployment strategies including blue-green, canary, and progressive delivery.

## When to Use

- Setting up CI/CD pipelines
- Automating deployments
- Implementing GitOps workflows
- Configuring build and test automation
- Setting up deployment strategies

## Core Concepts

### Pipeline Stages

1. **Source**: Code commit triggers pipeline
2. **Build**: Compile, lint, test
3. **Test**: Unit, integration, E2E
4. **Package**: Containerize, artifact
5. **Deploy**: Staging, production
6. **Verify**: Smoke tests, monitoring

### Deployment Strategies

| Strategy | Description | Use Case |
|----------|-------------|----------|
| **Rolling** | Gradual replacement | Standard deployments |
| **Blue-Green** | Two environments, switch | Zero-downtime releases |
| **Canary** | Gradual traffic shift | Risk mitigation |
| **Feature Flags** | Runtime toggles | A/B testing, gradual rollout |

## GitHub Actions Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          push: false
          tags: user/app:${{ github.sha }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - run: kubectl apply -f k8s/staging/
        env:
          KUBE_CONFIG: ${{ secrets.KUBE_CONFIG_STAGING }}

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - run: kubectl apply -f k8s/production/
        env:
          KUBE_CONFIG: ${{ secrets.KUBE_CONFIG_PROD }}
```

## GitLab CI Workflow

```yaml
stages:
  - test
  - build
  - deploy

unit-test:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm test

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

deploy-staging:
  stage: deploy
  environment: staging
  script:
    - kubectl apply -f k8s/staging/
  only:
    - main

deploy-production:
  stage: deploy
  environment: production
  script:
    - kubectl apply -f k8s/production/
  when: manual
  only:
    - main
```

## Best Practices

1. **Fail fast**: Run quick tests first
2. **Cache dependencies**: Speed up builds
3. **Parallel jobs**: Run independent tasks concurrently
4. **Secrets management**: Use CI/CD secrets, never hardcode
5. **Environment parity**: Staging ≈ Production
6. **Automated rollbacks**: Revert on failure
7. **Deployment notifications**: Alert team on deploy
8. **Pipeline as code**: Version control your CI/CD config

## Anti-Patterns

- **No testing stage**: Deploying untested code
- **Manual deployments**: Error-prone, not reproducible
- **Hardcoded secrets**: Security vulnerability
- **No rollback plan**: Can't recover from failures
- **Long pipelines**: Slow feedback loop
- **No monitoring**: Deploying blind

## Verification

- [ ] Pipeline runs on every commit
- [ ] All tests pass before deployment
- [ ] Secrets properly managed
- [ ] Rollback strategy defined
- [ ] Deployment notifications configured
- [ ] Pipeline documented

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
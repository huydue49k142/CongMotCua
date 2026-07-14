---
name: github-actions-advanced
description: Advanced GitHub Actions patterns including composite actions, reusable workflows, self-hosted runners, and optimization techniques.
---

# GitHub Actions Advanced

## Overview

Advanced GitHub Actions patterns for building complex CI/CD workflows including composite actions, reusable workflows, self-hosted runners, matrix builds, and performance optimization.

## When to Use

- Creating reusable workflow components
- Optimizing GitHub Actions performance
- Setting up self-hosted runners
- Implementing matrix builds
- Building composite actions
- Managing complex deployment workflows

## Core Concepts

### Composite Actions

Bundle multiple steps into a single action:

```yaml
# .github/actions/setup-node/action.yml
name: 'Setup Node.js'
description: 'Setup Node.js with caching'
inputs:
  node-version:
    description: 'Node.js version'
    required: true
    default: '20'
  cache-key:
    description: 'Cache key suffix'
    required: false

runs:
  using: 'composite'
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: 'npm'
        cache-dependency-path: ${{ inputs.cache-key || 'package-lock.json' }}
```

**Usage:**
```yaml
jobs:
  build:
    steps:
      - uses: ./.github/actions/setup-node
        with:
          node-version: '20'
```

### Reusable Workflows

Call workflows from other repositories:

```yaml
# .github/workflows/reusable-deploy.yml
name: Reusable Deploy Workflow
on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
      image-tag:
        required: true
        type: string
    secrets:
      deploy-token:
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - run: echo "Deploying ${{ inputs.image-tag }} to ${{ inputs.environment }}"
```

**Usage:**
```yaml
jobs:
  call-deploy:
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: production
      image-tag: v1.2.3
    secrets:
      deploy-token: ${{ secrets.DEPLOY_TOKEN }}
```

### Matrix Builds

Test across multiple configurations:

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20, 21]
        exclude:
          - os: windows-latest
            node-version: 18
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm test
```

### Self-Hosted Runners

```yaml
jobs:
  build:
    runs-on: [self-hosted, linux, x64, production]
    steps:
      - uses: actions/checkout@v4
      - run: npm run build
```

**Runner labels:**
- `self-hosted` - Required for all self-hosted runners
- `linux` / `windows` / `macos` - OS
- `x64` / `arm64` - Architecture
- `production` / `staging` - Environment

## Performance Optimization

### Caching Strategies

```yaml
- uses: actions/cache@v4
  with:
    path: |
      node_modules
      ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### Parallel Jobs

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint

  test-unit:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:unit

  test-integration:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:integration
  # All three run in parallel
```

### Artifact Management

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: build-output
    path: dist/
    retention-days: 7
    compression-level: 6

- uses: actions/download-artifact@v4
  with:
    name: build-output
    path: dist/
```

## Advanced Patterns

### Environment Protection

```yaml
jobs:
  deploy-production:
    runs-on: ubuntu-latest
    environment: production
    # Requires manual approval
    steps:
      - run: npm run deploy
```

### Concurrency Control

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### Conditional Execution

```yaml
- run: npm run deploy
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

### Secrets Management

```yaml
- run: |
    echo "Deploying with token"
    ./deploy.sh --token ${{ secrets.DEPLOY_TOKEN }}
  env:
    DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

## Best Practices

1. **Use composite actions** for repeated step sequences
2. **Cache dependencies** to speed up builds
3. **Pin action versions** (use commit SHA for security)
4. **Use reusable workflows** for cross-repo consistency
5. **Limit workflow permissions** with `permissions` key
6. **Use self-hosted runners** for specialized environments
7. **Implement concurrency control** to prevent race conditions
8. **Monitor workflow usage** with GitHub Actions metrics

## Anti-Patterns

- **Not caching**: Every build downloads dependencies
- **Hardcoded secrets**: Security vulnerability
- **No timeouts**: Workflows run forever
- **Monolithic workflows**: Everything in one file
- **Ignoring concurrency**: Multiple deployments racing

## Verification

- [ ] Composite actions created for repeated patterns
- [ ] Caching configured for dependencies
- [ ] Reusable workflows for common tasks
- [ ] Self-hosted runners configured (if needed)
- [ ] Matrix builds for multi-platform testing
- [ ] Workflow permissions minimized
- [ ] Concurrency control implemented

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
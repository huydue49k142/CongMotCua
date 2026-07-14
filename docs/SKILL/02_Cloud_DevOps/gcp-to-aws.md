---
name: gcp-to-aws
description: Migration strategy and implementation for moving workloads from Google Cloud Platform to Amazon Web Services.
---

# GCP to AWS

## Overview

A comprehensive skill for planning and executing cloud migration from Google Cloud Platform to Amazon Web Services. Covers service mapping, data transfer, networking reconfiguration, and operational transition.

## When to Use

- Planning migration of workloads from GCP to AWS
- Mapping GCP services to equivalent AWS services
- Implementing data transfer between cloud providers
- Reconfiguring networking and security for AWS
- Transitioning CI/CD and operational tooling

## Workflow

### Step 1: Discovery & Mapping
Inventory GCP resources and map to AWS equivalents (Compute Engine → EC2, Cloud Storage → S3, etc.).

### Step 2: Migration Planning
Design migration wave strategy, data transfer approach, and cutover plan.

### Step 3: Infrastructure Migration
Recreate infrastructure on AWS using IaC, migrate data, and reconfigure networking.

### Step 4: Validation & Cutover
Validate application functionality, performance, and security before final cutover.
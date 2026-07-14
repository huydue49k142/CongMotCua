---
name: k6-load-testing
description: Load testing skill with k6. Design realistic scenarios, thresholds, ramping stages, metrics, and CI integration for APIs and web services.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# k6 Load Testing

## Overview

k6 is a modern load testing tool that uses JavaScript to define load scenarios. This skill covers writing production-grade k6 scripts: realistic traffic patterns, thresholds, metrics, ramping stages, and CI-friendly execution.

## When to Use

- Testing API/web-service scalability
- Detecting performance regressions
- Validating SLO/SLA thresholds before release
- Measuring p95/p99 latency and error rates
- Load testing with realistic user journeys

---

## Core Concepts

### k6 Execution Model

k6 runs “virtual users” (VUs) that execute your script concurrently.

- **VU**: a worker that runs the JS code loop
- **iteration**: one full run of the default function
- **scenario**: how VUs ramp and what they execute

---

## Basic Script

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const res = http.get('https://test-api.example.com/healthz');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
```

---

## Recommended Structure (Production-Grade)

### Use constants for endpoints and thresholds

```javascript
import http from 'k6/http';
import { check, sleep, group } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://test-api.example.com';
const USER_PATH = '/api/users/123';

export const options = {
  scenarios: {
    api_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
      ],
      gracefulStop: '10s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<300', 'p(99)<600'],
  },
};

export default function () {
  group('get user', () => {
    const res = http.get(`${BASE_URL}${USER_PATH}`);
    check(res, {
      '200 ok': (r) => r.status === 200,
      'has name field': (r) => r.json('name') !== '',
    });
  });

  sleep(1);
}
```

---

## Thresholds (SLO-Style)

Key guidance:
- Use **http_req_duration** for latency checks
- Use **http_req_failed** for error-rate checks
- Prefer percentiles: **p(95), p(99)**

```javascript
export const options = {
  thresholds: {
    http_req_failed: ['rate<0.005'],
    http_req_duration: [
      'p(95)<250',
      'p(99)<500',
    ],
  },
};
```

---

## Metrics: Custom Metrics for Business KPIs

### Trend for timings

```javascript
import { Trend } from 'k6/metrics';

const endToEnd = new Trend('end_to_end_ms');

export default function () {
  const start = Date.now();
  // ... do requests ...
  endToEnd.add(Date.now() - start);
}
```

### Counter for domain events

```javascript
import { Counter } from 'k6/metrics';

const logins = new Counter('logins_total');

export default function () {
  // after successful login:
  logins.add(1);
}
```

---

## HTTP Patterns

### Headers + Authorization

```javascript
const params = {
  headers: {
    Authorization: `Bearer ${__ENV.TOKEN}`,
    'Content-Type': 'application/json',
  },
};

http.get(`${BASE_URL}/api/me`, params);
```

### POST requests with JSON

```javascript
const payload = JSON.stringify({
  email: 'user@example.com',
  password: 'test-password',
});

http.post(`${BASE_URL}/api/login`, payload, {
  headers: { 'Content-Type': 'application/json' },
});
```

---

## Scenarios & Executors

Common executors:

- `ramping-vus`: ramp up/down, great for staged load
- `constant-vus`: steady-state load
- `shared-iterations`: fixed iteration count shared across VUs
- `per-vu-iterations`: fixed iterations per VU

Example: constant load

```javascript
export const options = {
  scenarios: {
    steady: {
      executor: 'constant-vus',
      vus: 40,
      duration: '2m',
    }
  }
};
```

---

## CI/CD Execution

### Example npm script / CI command

```bash
k6 run \
  -e BASE_URL="https://staging-api.example.com" \
  -e TOKEN="..." \
  --summary-export=summary.json \
  script.js
```

### GitHub Actions

```yaml
name: k6 load test

on:
  workflow_dispatch:

jobs:
  k6:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - name: Run k6
        run: |
          k6 run -e BASE_URL="${{ secrets.BASE_URL }}" -e TOKEN="${{ secrets.TOKEN }}" script.js
```

---

## Best Practices

1. **Define realistic traffic**: match real request rates and payloads
2. **Use thresholds** tied to p95/p99 and error rates
3. **Avoid fragile sleeps**: model user think time with `sleep()` only when realistic
4. **Parameterize environments** via `__ENV.*`
5. **Isolate test data**: do not contaminate production
6. **Use groups** to make results readable
7. **Keep scripts deterministic** when possible
8. **Validate responses** using `check()` and schema-friendly assertions

---

## Common Pitfalls

- Hardcoding base URLs and tokens (breaks CI and portability)
- Only checking status code (ignores latency and business correctness)
- No thresholds (cannot fail builds on regression)
- Too aggressive load without ramp-up (creates unrealistic spikes)

---

## Limitations

- Load tests measure performance characteristics, not functional correctness by default
- Results depend heavily on environment and network conditions
- Stop and adjust scenarios if you observe cascading failures or test-data exhaustion

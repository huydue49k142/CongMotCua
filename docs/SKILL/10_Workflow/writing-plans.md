---
name: writing-plans
description: "Systematic approach to writing detailed, actionable plans for software projects. Covers requirements analysis, task breakdown, estimation, and risk assessment."
risk: safe
source: "obra/superpowers"
date_added: "2026-07-11"
---

# Writing Plans

Systematic approach to writing detailed, actionable plans for software projects.

## 🧠 Core Philosophy
> "A good plan is not about predicting the future — it's about preparing for it. Break down complexity into manageable steps."

## When to Use
Use this skill when:
- **Starting new projects** or features
- **Planning sprints** and iterations
- **Estimating work** for stakeholders
- **Identifying risks** and dependencies
- **Coordinating teams** on complex tasks

---

## 1. Plan Structure

### Executive Summary
```markdown
# Project Plan: [Project Name]

## Overview
[2-3 sentences describing what we're building and why]

## Goals
- Primary goal: [Main objective]
- Success criteria: [How we measure success]
- Timeline: [Start date → End date]

## Scope
### In Scope
- [Feature/task 1]
- [Feature/task 2]

### Out of Scope
- [What we're NOT doing]
```

## 2. Requirements Analysis

### Functional Requirements
```markdown
## Functional Requirements

### FR-1: User Authentication
**Priority:** High
**Description:** Users can register, login, and logout
**Acceptance Criteria:**
- [ ] User can register with email and password
- [ ] User can login with credentials
- [ ] User can logout
- [ ] Password is hashed and stored securely
- [ ] Session is managed with JWT tokens

**Dependencies:** None
**Estimated Effort:** 3 days
```

### Non-Functional Requirements
```markdown
## Non-Functional Requirements

### NFR-1: Performance
- API response time < 200ms (P95)
- Page load time < 2s
- Support 1000 concurrent users

### NFR-2: Security
- HTTPS only
- Passwords hashed with bcrypt
- JWT tokens expire in 1 hour

### NFR-3: Availability
- 99.9% uptime
- Automated backups daily
```

## 3. Task Breakdown

### Work Breakdown Structure (WBS)
```markdown
## Task Breakdown

### 1.0 Project Setup
- 1.1 Initialize repository (2h)
- 1.2 Set up CI/CD pipeline (4h)
- 1.3 Configure development environment (2h)

### 2.0 Backend Development
- 2.1 Design database schema (4h)
- 2.2 Implement user authentication (8h)
  - 2.2.1 Registration endpoint (2h)
  - 2.2.2 Login endpoint (2h)
  - 2.2.3 JWT token management (2h)
  - 2.2.4 Password reset (2h)
- 2.3 Implement API endpoints (16h)

### 3.0 Frontend Development
- 3.1 Set up React project (2h)
- 3.2 Build authentication UI (8h)
- 3.3 Build dashboard (12h)

### 4.0 Testing
- 4.1 Unit tests (8h)
- 4.2 Integration tests (8h)
- 4.3 E2E tests (8h)

### 5.0 Deployment
- 5.1 Deploy to staging (2h)
- 5.2 Deploy to production (2h)
```

## 4. Estimation

### Estimation Techniques

| Technique | Description | Best For |
|-----------|-------------|----------|
| **T-shirt sizing** | S, M, L, XL | High-level estimates |
| **Story points** | Relative complexity | Agile sprints |
| **Hours/Days** | Absolute time | Detailed planning |
| **Three-point** | Optimistic, likely, pessimistic | Risk assessment |

### Estimation Template
```markdown
## Task Estimates

| Task | Optimistic | Likely | Pessimistic | Expected |
|------|-----------|--------|-------------|----------|
| User auth | 4h | 8h | 16h | 9h |
| Dashboard | 8h | 12h | 24h | 14h |
| Testing | 16h | 24h | 40h | 26h |

**Total Expected:** 49h (~6 days)
**Buffer (20%):** 10h
**Total with Buffer:** 59h (~7.5 days)
```

## 5. Risk Assessment

### Risk Matrix
```markdown
## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Third-party API downtime | Medium | High | Implement fallback, cache responses |
| Database migration issues | Low | High | Test thoroughly on staging, have rollback plan |
| Team member unavailable | Medium | Medium | Cross-training, documentation |
| Scope creep | High | Medium | Strict change control process |
```

### Risk Template
```markdown
### Risk: Third-party API Downtime
**Probability:** Medium (30-50%)
**Impact:** High (blocks payment processing)
**Mitigation:**
- Implement circuit breaker pattern
- Cache API responses for 5 minutes
- Show user-friendly error message
- Queue requests for retry

**Contingency Plan:**
- Manual payment processing fallback
- Notify users via email/SMS
```

## 6. Dependencies

### Dependency Graph
```markdown
## Dependencies

### External Dependencies
- [ ] Stripe API (payment processing)
- [ ] SendGrid (email service)
- [ ] AWS S3 (file storage)

### Internal Dependencies
- [ ] User authentication (blocks: dashboard, profile)
- [ ] Database schema (blocks: all backend)
- [ ] API design (blocks: frontend)

### Critical Path
1. Database schema → Backend API → Frontend → Testing → Deployment
```

## 7. Timeline & Milestones

### Gantt Chart (Text-based)
```markdown
## Timeline

Week 1 (Jan 1-7):
- [x] Project setup
- [x] Database design
- [ ] User authentication (backend)

Week 2 (Jan 8-14):
- [ ] User authentication (frontend)
- [ ] Dashboard (backend)

Week 3 (Jan 15-21):
- [ ] Dashboard (frontend)
- [ ] Testing

Week 4 (Jan 22-28):
- [ ] Bug fixes
- [ ] Deployment
```

### Milestones
```markdown
## Milestones

| Milestone | Date | Deliverable | Success Criteria |
|-----------|------|-------------|------------------|
| M1: Project Setup | Jan 7 | Repo, CI/CD, dev env | All devs can run project |
| M2: Backend Complete | Jan 14 | API endpoints | All endpoints tested |
| M3: Frontend Complete | Jan 21 | UI complete | All screens implemented |
| M4: Testing Complete | Jan 25 | Test suite | 80% coverage, all passing |
| M5: Production Launch | Jan 28 | Live app | Deployed, monitored |
```

## 8. Resource Planning

### Team Allocation
```markdown
## Resources

### Team
- Backend Developer: 1 (full-time)
- Frontend Developer: 1 (full-time)
- QA Engineer: 1 (half-time)
- DevOps: 1 (quarter-time)

### Tools & Services
- GitHub (version control)
- AWS (hosting)
- PostgreSQL (database)
- Redis (caching)
- Sentry (error tracking)
```

## 9. Communication Plan

```markdown
## Communication

### Daily Standup
- Time: 9:00 AM
- Duration: 15 min
- Format: What did you do? What will you do? Blockers?

### Weekly Review
- Time: Friday 4:00 PM
- Duration: 1 hour
- Agenda: Demo, discuss issues, plan next week

### Documentation
- README: Project overview, setup instructions
- API docs: OpenAPI/Swagger
- Architecture: System design diagrams
```

## 10. Plan Template

```markdown
# [Project/Feature] Plan

## 1. Overview
[What and why]

## 2. Goals
- [Goal 1]
- [Goal 2]

## 3. Scope
### In Scope
- [Item 1]
### Out of Scope
- [Item 2]

## 4. Requirements
### Functional
- [FR-1]
### Non-Functional
- [NFR-1]

## 5. Task Breakdown
- [ ] Task 1
- [ ] Task 2

## 6. Estimates
| Task | Hours |
|------|-------|
| Task 1 | 4h |
| **Total** | **4h** |

## 7. Risks
| Risk | Mitigation |
|------|------------|
| [Risk] | [Mitigation] |

## 8. Timeline
[Gantt chart or milestones]

## 9. Resources
[Team, tools, budget]

## 10. Next Steps
1. [Immediate action]
2. [Follow-up action]
```

## 🛠️ Implementation Checklist
- [ ] Are requirements clear and testable?
- [ ] Is the task breakdown granular enough (< 1 day per task)?
- [ ] Are estimates realistic (with buffer)?
- [ ] Are risks identified with mitigations?
- [ ] Are dependencies mapped?
- [ ] Is there a clear timeline with milestones?
- [ ] Are success criteria defined?
- [ ] Is there a communication plan?

## Limitations
- Plans are estimates, not guarantees
- Requirements will change
- This skill is not a substitute for project management expertise
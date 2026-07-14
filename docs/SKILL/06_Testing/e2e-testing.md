---
name: e2e-testing
description: "End-to-end testing strategies covering Playwright, Cypress, test automation, CI/CD integration, and testing best practices."
risk: safe
source: "community"
date_added: "2026-07-11"
---

# End-to-End Testing

End-to-end testing strategies covering Playwright, Cypress, and test automation best practices.

## 🧠 Core Philosophy
> "E2E tests simulate real user behavior — they test the entire stack from UI to database."

## When to Use
Use this skill when:
- **Testing critical user flows** (login, checkout, signup)
- **Validating integrations** between frontend and backend
- **Testing across browsers** and devices
- **Automating regression testing**
- **CI/CD integration** for quality gates

---

## 1. E2E Testing Tools

### Tool Comparison

| Tool | Best For | Pros | Cons |
|------|----------|------|------|
| **Playwright** | Multi-browser, modern | Fast, reliable, auto-wait | Newer ecosystem |
| **Cypress** | Developer experience | Great DX, time-travel debug | Chrome-only (mostly) |
| **Selenium** | Legacy systems | Wide browser support | Slow, flaky |
| **Puppeteer** | Chrome automation | Fast, Chrome-focused | Limited browser support |

### Playwright Example
```typescript
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test('should login successfully', async ({ page }) => {
    // Navigate to login page
    await page.goto('https://app.example.com/login');
    
    // Fill in credentials
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('https://app.example.com/dashboard');
    
    // Verify login success
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('.user-name')).toContainText('John Doe');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('https://app.example.com/login');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Verify error message
    await expect(page.locator('.error-message')).toContainText('Invalid credentials');
  });
});
```

### Cypress Example
```typescript
describe('User Authentication', () => {
  it('should login successfully', () => {
    cy.visit('https://app.example.com/login');
    
    cy.get('input[name="email"]').type('user@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.get('h1').should('contain', 'Dashboard');
  });
});
```

## 2. Test Structure

### Page Object Model (POM)
```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async getErrorMessage() {
    return await this.page.locator('.error-message').textContent();
  }
}

// tests/login.spec.ts
test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  
  await expect(page).toHaveURL('/dashboard');
});
```

### Test Data Management
```typescript
// test-data/users.ts
export const testUsers = {
  valid: {
    email: 'test@example.com',
    password: 'SecurePass123!',
    name: 'Test User'
  },
  invalid: {
    email: 'invalid@example.com',
    password: 'wrong'
  }
};

// tests/auth.spec.ts
test('should login with valid credentials', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', testUsers.valid.email);
  await page.fill('input[name="password"]', testUsers.valid.password);
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

## 3. Common Testing Patterns

### Waiting for Elements
```typescript
// ✅ Good: Auto-wait (Playwright)
await page.click('button.submit');  // Waits for button to be clickable

// ✅ Good: Explicit wait
await page.waitForSelector('.loading', { state: 'hidden' });
await page.waitForURL('**/dashboard');

// ❌ Bad: Fixed sleep
await page.waitForTimeout(5000);  // Don't do this!
```

### Handling Dynamic Content
```typescript
// Wait for API response
const responsePromise = page.waitForResponse('**/api/users');
await page.click('button.load-users');
const response = await responsePromise;
const users = await response.json();

// Wait for network idle
await page.goto('/dashboard', { waitUntil: 'networkidle' });
```

### File Upload
```typescript
// Upload file
const fileInput = page.locator('input[type="file"]');
await fileInput.setInputFiles('path/to/file.pdf');

// Multiple files
await fileInput.setInputFiles([
  'path/to/file1.pdf',
  'path/to/file2.pdf'
]);
```

### Screenshots & Videos
```typescript
// Take screenshot on failure
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({ path: `screenshots/${testInfo.title}.png` });
  }
});

// Record video (Playwright)
// Automatically recorded on failure
```

## 4. CI/CD Integration

### GitHub Actions
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: playwright-report
          path: playwright-report/
```

## 5. Best Practices

| Practice | Description |
|----------|-------------|
| **Independent tests** | Each test should run independently |
| **Deterministic** | Same input → same output |
| **Fast** | Run in parallel, avoid unnecessary waits |
| **Reliable** | No flaky tests, fix immediately |
| **Readable** | Test names describe what they test |
| **Maintainable** | Use Page Object Model |

### Test Isolation
```typescript
// ✅ Good: Each test is independent
test('should create user', async ({ page }) => {
  await page.goto('/users');
  await page.click('button.create-user');
  await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
  await page.click('button.submit');
  await expect(page.locator('.user-count')).toContainText('1');
});

test('should delete user', async ({ page }) => {
  // Create user first
  await createTestUser();
  
  // Then delete
  await page.goto('/users');
  await page.click('button.delete-user');
  await expect(page.locator('.user-count')).toContainText('0');
});
```

## 6. Debugging

### Playwright Inspector
```typescript
// Enable inspector
test('debug test', async ({ page }) => {
  await page.goto('/login');
  
  // Pause and inspect
  await page.pause();
  
  // Or use debugger
  debugger;
});
```

### Trace Viewer
```typescript
// Record trace
test('with trace', async ({ page }) => {
  await page.context().tracing.start({ screenshots: true, snapshots: true });
  
  // Your test steps
  await page.goto('/');
  await page.click('button');
  
  // Stop trace
  await page.context().tracing.stop({ path: 'trace.zip' });
});
```

## 🛠️ Implementation Checklist
- [ ] Are tests independent and isolated?
- [ ] Are tests deterministic (no flaky tests)?
- [ ] Is the Page Object Model used?
- [ ] Are tests running in CI/CD?
- [ ] Are screenshots/videos captured on failure?
- [ ] Are tests running in parallel?
- [ ] Is test data managed properly?
- [ ] Are tests fast (< 5 min for full suite)?

## Limitations
- E2E tests are slow compared to unit tests
- Flaky tests erode trust in test suite
- Requires running application
- This skill is not a substitute for unit/integration tests
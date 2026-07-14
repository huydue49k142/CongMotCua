---
name: playwright-skill
description: Browser automation and testing with Playwright. Write custom automation scripts for testing, web scraping, and browser interactions.
---

# Playwright Browser Automation

## Overview

General-purpose browser automation skill for writing custom Playwright code for any automation task. Execute automation via the universal executor with visible browser by default.

## When to Use

- Browser automation tasks
- End-to-end testing
- Web scraping
- Form filling and submission
- Screenshot capture
- Multi-viewport testing
- Login flow testing

## Core Workflow

### Step 1: Detect Dev Servers

For localhost testing, ALWAYS run server detection FIRST:

```bash
cd $SKILL_DIR && node -e "require('./lib/helpers').detectDevServers().then(servers => console.log(JSON.stringify(servers)))"
```

- If **1 server found**: Use it automatically
- If **multiple servers found**: Ask user which one to test
- If **no servers found**: Ask for URL or offer to help start dev server

### Step 2: Write Scripts to /tmp

NEVER write test files to skill directory; always use `/tmp/playwright-test-*.js`

### Step 3: Use Visible Browser

Always use `headless: false` unless user specifically requests headless mode

### Step 4: Parameterize URLs

Always make URLs configurable via environment variable or constant at top of script

## Execution Pattern

### Step 1: Detect Dev Servers

```bash
cd $SKILL_DIR && node -e "require('./lib/helpers').detectDevServers().then(s => console.log(JSON.stringify(s)))"
```

### Step 2: Write Test Script to /tmp

```javascript
// /tmp/playwright-test-page.js
const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3001'; // Auto-detected or from user

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(TARGET_URL);
  console.log('Page loaded:', await page.title());

  await page.screenshot({ path: '/tmp/screenshot.png', fullPage: true });
  console.log('Screenshot saved to /tmp/screenshot.png');

  await browser.close();
})();
```

### Step 3: Execute from Skill Directory

```bash
cd $SKILL_DIR && node run.js /tmp/playwright-test-page.js
```

## Common Patterns

### Test a Page (Multiple Viewports)

```javascript
// /tmp/playwright-test-responsive.js
const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3001';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  // Desktop test
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(TARGET_URL);
  console.log('Desktop - Title:', await page.title());
  await page.screenshot({ path: '/tmp/desktop.png', fullPage: true });

  // Mobile test
  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ path: '/tmp/mobile.png', fullPage: true });

  await browser.close();
})();
```

### Test Login Flow

```javascript
// /tmp/playwright-test-login.js
const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3001';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(`${TARGET_URL}/login`);

  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Wait for redirect
  await page.waitForURL('**/dashboard');
  console.log('Login successful, redirected to dashboard');

  await browser.close();
})();
```

### Fill and Submit Form

```javascript
// /tmp/playwright-test-form.js
const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3001';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();

  await page.goto(`${TARGET_URL}/contact`);

  await page.fill('input[name="name"]', 'John Doe');
  await page.fill('input[name="email"]', 'john@example.com');
  await page.fill('textarea[name="message"]', 'Test message');
  await page.click('button[type="submit"]');

  // Verify submission
  await page.waitForSelector('.success-message');
  console.log('Form submitted successfully');

  await browser.close();
})();
```

### Check for Broken Links

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000');

  const links = await page.locator('a[href^="http"]').all();
  const results = { working: 0, broken: [] };

  for (const link of links) {
    const href = await link.getAttribute('href');
    try {
      const response = await page.request.head(href);
      if (response.ok()) {
        results.working++;
      } else {
        results.broken.push({ url: href, status: response.status() });
      }
    } catch (e) {
      results.broken.push({ url: href, error: e.message });
    }
  }

  console.log(`Working links: ${results.working}`);
  console.log(`Broken links:`, results.broken);

  await browser.close();
})();
```

## Inline Execution (Simple Tasks)

For quick one-off tasks, execute code inline without creating files:

```bash
# Take a quick screenshot
cd $SKILL_DIR && node run.js "
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.goto('http://localhost:3001');
await page.screenshot({ path: '/tmp/quick-screenshot.png', fullPage: true });
console.log('Screenshot saved');
await browser.close();
"
```

**When to use inline vs files:**
- **Inline**: Quick one-off tasks (screenshot, check if element exists, get page title)
- **Files**: Complex tests, responsive design checks, anything user might want to re-run

## Available Helpers

Optional utility functions in `lib/helpers.js`:

```javascript
const helpers = require('./lib/helpers');

// Detect running dev servers (CRITICAL - use this first!)
const servers = await helpers.detectDevServers();
console.log('Found servers:', servers);

// Safe click with retry
await helpers.safeClick(page, 'button.submit', { retries: 3 });

// Safe type with clear
await helpers.safeType(page, '#username', 'testuser');

// Take timestamped screenshot
await helpers.takeScreenshot(page, 'test-result');

// Handle cookie banners
await helpers.handleCookieBanner(page);

// Extract table data
const data = await helpers.extractTableData(page, 'table.results');
```

## Custom HTTP Headers

Configure custom headers for all HTTP requests via environment variables:

```bash
# Single header
PW_HEADER_NAME=X-Automated-By PW_HEADER_VALUE=playwright-skill \
  cd $SKILL_DIR && node run.js /tmp/my-script.js

# Multiple headers (JSON format)
PW_EXTRA_HEADERS='{"X-Automated-By":"playwright-skill","X-Debug":"true"}' \
  cd $SKILL_DIR && node run.js /tmp/my-script.js
```

## Tips

- **CRITICAL: Detect servers FIRST** - Always run `detectDevServers()` before writing test code
- **Custom headers** - Use `PW_HEADER_NAME`/`PW_HEADER_VALUE` env vars
- **Use /tmp for test files** - Write to `/tmp/playwright-test-*.js`
- **Parameterize URLs** - Put detected/provided URL in `TARGET_URL` constant
- **DEFAULT: Visible browser** - Always use `headless: false` unless explicitly asked
- **Headless mode** - Only use `headless: true` when user specifically requests
- **Slow down:** Use `slowMo: 100` to make actions visible
- **Wait strategies:** Use `waitForURL`, `waitForSelector`, `waitForLoadState`
- **Error handling:** Always use try-catch for robust automation
- **Console output:** Use `console.log()` to track progress

## Troubleshooting

**Playwright not installed:**
```bash
cd $SKILL_DIR && npm run setup
```

**Module not found:**
Ensure running from skill directory via `run.js` wrapper

**Browser doesn't open:**
Check `headless: false` and ensure display available

**Element not found:**
Add wait: `await page.waitForSelector('.element', { timeout: 10000 })`

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
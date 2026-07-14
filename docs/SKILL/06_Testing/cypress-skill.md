---
name: cypress-skill
description: Cypress end-to-end testing framework for web applications. Write production-grade E2E and component tests with automatic waiting, time travel debugging, and real-time reloading.
---

# Cypress Testing

## Overview

Cypress is a next-generation front-end testing tool built for the modern web. This skill covers E2E testing, component testing, and best practices for writing reliable, fast tests.

## When to Use

- End-to-end testing
- Component testing
- Integration testing
- API testing
- Visual regression testing
- Continuous integration testing

## Core Concepts

### Cypress Architecture

Cypress runs in the same run-loop as your application, giving it access to everything:

```yaml
Advantages:
  - Automatic waiting (no more flaky tests)
  - Time travel debugging
  - Real-time reloading
  - Network traffic control
  - Consistent results

How it works:
  - Runs in browser (not remote)
  - Controls network traffic
  - Can modify DOM/application code
  - Synchronous-like API (but actually async)
```

### Test Structure

```javascript
describe('My Feature', () => {
  beforeEach(() => {
    // Runs before each test
    cy.visit('/login');
  });

  it('should do something', () => {
    // Test code
    cy.get('button').click();
    cy.url().should('include', '/dashboard');
  });

  afterEach(() => {
    // Runs after each test
  });
});
```

## Installation & Setup

### Install Cypress

```bash
# npm
npm install cypress --save-dev

# yarn
yarn add cypress --dev

# Open Cypress
npx cypress open
```

### Configuration

```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 4000,
    requestTimeout: 10000,
    setupNodeEvents(on, config) {
      // Node event listeners
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
```

## Commands

### Navigation

```javascript
// Visit URL
cy.visit('/dashboard');
cy.visit('https://example.com');
cy.visit('/users/123', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer token' }
});

// Reload page
cy.reload();

// Go back/forward
cy.go('back');
cy.go('forward');
```

### Querying Elements

```javascript
// Get by selector
cy.get('button');
cy.get('#submit-btn');
cy.get('.form-group');
cy.get('[data-cy="submit"]');

// Get by text
cy.contains('Submit');
cy.contains('button', 'Submit');

// Get by role (accessibility)
cy.get('button');
cy.get('input[type="email"]');
cy.get('a[href="/about"]');

// Find within element
cy.get('form').find('input');
cy.get('ul').find('li').first();
```

### Actions

```javascript
// Click
cy.get('button').click();
cy.get('button').dblclick();
cy.get('button').rightclick();

// Type
cy.get('input').type('Hello World');
cy.get('input').type('{enter}');
cy.get('input').type('{backspace}');
cy.get('input').clear();

// Select
cy.get('select').select('option1');
cy.get('select').select(['option1', 'option2']);

// Checkbox/Radio
cy.get('input[type="checkbox"]').check();
cy.get('input[type="checkbox"]').uncheck();
cy.get('input[type="radio"]').check('option1');

// File upload
cy.get('input[type="file"]').attachFile('document.pdf');

// Hover
cy.get('.menu').trigger('mouseover');

// Focus/Blur
cy.get('input').focus();
cy.get('input').blur();
```

### Assertions

```javascript
// Should assertions
cy.get('button').should('be.visible');
cy.get('button').should('be.enabled');
cy.get('button').should('be.disabled');
cy.get('input').should('have.value', 'test');
cy.get('input').should('have.attr', 'type', 'email');
cy.get('.list').should('have.length', 5);
cy.get('h1').should('contain', 'Welcome');

// Exist/not exist
cy.get('button').should('exist');
cy.get('button').should('not.exist');

// Class assertions
cy.get('button').should('have.class', 'primary');
cy.get('button').should('have.class', 'active disabled');

// CSS assertions
cy.get('button').should('have.css', 'color', 'rgb(255, 0, 0)');
```

## Network & API Testing

### Intercept Requests

```javascript
// Intercept API call
cy.intercept('GET', '/api/users').as('getUsers');

// Visit page that triggers request
cy.visit('/users');

// Wait for request
cy.wait('@getUsers').then((interception) => {
  expect(interception.response.statusCode).to.equal(200);
  expect(interception.response.body).to.have.length(10);
});

// Mock response
cy.intercept('GET', '/api/users', {
  statusCode: 200,
  body: [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ]
}).as('getUsers');
```

### API Testing

```javascript
// Direct API request
cy.request('GET', '/api/users').then((response) => {
  expect(response.status).to.eq(200);
  expect(response.body).to.have.length(10);
});

// POST request
cy.request('POST', '/api/users', {
  name: 'John',
  email: 'john@example.com'
}).then((response) => {
  expect(response.status).to.eq(201);
});

// With authentication
cy.request({
  method: 'GET',
  url: '/api/protected',
  headers: {
    'Authorization': 'Bearer token'
  }
});
```

## Waiting & Timing

### Automatic Waiting

Cypress automatically waits for:
- Elements to exist
- Elements to be visible
- Elements to be enabled
- Animations to complete

```javascript
// Cypress waits automatically
cy.get('button').click(); // Waits for button to be clickable
cy.get('.list-item').first().click(); // Waits for first item
```

### Explicit Waiting

```javascript
// Wait for element
cy.get('.loading', { timeout: 10000 }).should('not.exist');

// Wait for URL
cy.url().should('include', '/dashboard');

// Wait for request
cy.wait('@apiCall');

// Wait with timeout
cy.get('.element', { timeout: 10000 }).should('be.visible');
```

## Component Testing

### React Component

```javascript
// cypress/component/Button.cy.jsx
import { mount } from 'cypress/react';
import Button from './Button';

describe('Button Component', () => {
  it('renders with label', () => {
    mount(<Button label="Click me" />);
    cy.contains('Click me').should('be.visible');
  });

  it('calls onClick when clicked', () => {
    const onClick = cy.spy();
    mount(<Button label="Click" onClick={onClick} />);
    cy.get('button').click();
    cy.wrap(onClick).should('have.been.called');
  });
});
```

### Vue Component

```javascript
import { mount } from 'cypress/vue';
import MyComponent from './MyComponent.vue';

describe('MyComponent', () => {
  it('renders', () => {
    mount(MyComponent, {
      props: {
        message: 'Hello'
      }
    });
    cy.contains('Hello').should('be.visible');
  });
});
```

## Best Practices

1. **Use data-cy attributes**: Stable selectors
   ```html
   <button data-cy="submit-button">Submit</button>
   ```
   ```javascript
   cy.get('[data-cy="submit-button"]').click();
   ```

2. **Avoid testing implementation details**: Test user behavior

3. **Use beforeEach for setup**: DRY principle

4. **Leverage automatic waiting**: Don't use cy.wait() unnecessarily

5. **Use aliases for repeated elements**:
   ```javascript
   cy.get('.user').as('users');
   cy.get('@users').first().click();
   ```

6. **Clean up test data**: Don't leave test artifacts

7. **Use environment variables**:
   ```javascript
   const apiUrl = Cypress.env('API_URL');
   ```

## Common Patterns

### Login Pattern

```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.request('POST', '/api/login', { email, password })
    .then((response) => {
      localStorage.setItem('token', response.body.token);
    });
});

// Usage in test
cy.login('user@example.com', 'password');
cy.visit('/dashboard');
```

### Mock API

```javascript
// Mock entire API
cy.intercept('GET', '/api/**', {
  statusCode: 200,
  body: { success: true }
}).as('apiCall');

// Mock with fixture
cy.intercept('GET', '/api/users', {
  fixture: 'users.json'
}).as('getUsers');
```

### Visual Regression

```javascript
// Install @cypress/snapshot
cy.get('.component').toMatchImageSnapshot();
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Cypress Tests

on: [push, pull_request]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: cypress-io/github-action@v6
        with:
          browser: chrome
          headless: true
```

## Debugging

### Time Travel

```javascript
// Cypress automatically takes snapshots
// Click on command in UI to see state at that point
```

### Debug Command

```javascript
cy.get('button').debug(); // Pauses execution
cy.get('button').then(($el) => {
  console.log($el); // Log to console
});
```

### Cypress Studio

Record tests interactively:
```bash
npx cypress open --env interactive=true
```

## Best Practices

1. **Use data attributes**: `data-cy`, `data-testid`
2. **Avoid fixed waits**: Use automatic waiting
3. **Test user behavior**: Not implementation
4. **Keep tests independent**: No shared state
5. **Use custom commands**: DRY principle
6. **Mock external APIs**: Fast, reliable tests
7. **Run in CI**: Catch regressions early
8. **Use TypeScript**: Better IDE support

## Anti-Patterns

- **Fixed waits**: `cy.wait(5000)` - flaky
- **Testing implementation**: Internal state, method calls
- **Shared state**: Tests depend on each other
- **No cleanup**: Test data accumulates
- **Brittle selectors**: CSS classes that change
- **Testing third-party sites**: Unreliable, slow

## Verification

- [ ] Cypress installed and configured
- [ ] Test structure follows best practices
- [ ] Selectors are stable (data-cy attributes)
- [ ] Tests are independent
- [ ] API calls mocked where appropriate
- [ ] CI/CD integration configured
- [ ] Tests passing consistently

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
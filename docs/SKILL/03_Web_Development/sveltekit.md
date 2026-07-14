---
name: sveltekit
description: SvelteKit framework for building full-stack web applications with Svelte, server-side rendering, and modern web features.
---

# SvelteKit

## Overview

SvelteKit is a full-stack framework for building web applications with Svelte. It provides server-side rendering, routing, data loading, and deployment adapters for production-ready applications.

## When to Use

- Building full-stack web applications
- Creating server-rendered sites
- Developing with Svelte framework
- Building performant web apps
- Creating static or hybrid sites

## Core Concepts

### Project Structure

```
src/
├── routes/              # File-based routing
│   ├── +page.svelte     # Page component
│   ├── +page.ts         # Page load function
│   ├── +page.server.ts  # Server-only functions
│   ├── +layout.svelte   # Shared layout
│   ├── +error.svelte    # Error page
│   └── api/             # API routes
│       └── +server.ts
├── lib/                 # Reusable components/utils
│   ├── components/
│   └── utils/
├── app.html             # HTML template
└── app.css              # Global styles
static/                  # Static assets
```

### Routing

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script>
  export let data;
  const { post } = data;
</script>

<h1>{post.title}</h1>
<article>{@html post.content}</article>
```

```typescript
// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
  const response = await fetch(`/api/posts/${params.slug}`);
  const post = await response.json();
  
  return {
    post
  };
};
```

### Layouts

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<Header />
<main>
  <slot />
</main>
<Footer />

<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
</style>
```

## Data Loading

### Page Load Functions

```typescript
// src/routes/posts/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
  // Load data before page renders
  const response = await fetch('/api/posts');
  const posts = await response.json();
  
  return {
    posts,
    page: url.searchParams.get('page') || '1'
  };
};
```

```svelte
<!-- src/routes/posts/+page.svelte -->
<script>
  export let data;
  const { posts, page } = data;
</script>

{#each posts as post}
  <article>
    <h2>{post.title}</h2>
    <p>{post.excerpt}</p>
  </article>
{/each}
```

### Server Load Functions

```typescript
// src/routes/posts/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Runs only on server - can access DB, secrets, etc.
  const posts = await db.posts.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' }
  });
  
  return { posts };
};
```

### Actions (Form Handling)

```typescript
// src/routes/login/+page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');
    
    const user = await authenticate(email, password);
    
    if (!user) {
      return fail(401, { message: 'Invalid credentials' });
    }
    
    cookies.set('session', user.sessionToken, {
      path: '/',
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    
    return { success: true };
  }
} satisfies Actions;
```

```svelte
<!-- src/routes/login/+page.svelte -->
<script>
  import { enhance } from '$app/forms';
  export let form;
</script>

<form method="POST" use:enhance>
  <input name="email" type="email" required />
  <input name="password" type="password" required />
  <button type="submit">Login</button>
  
  {#if form?.message}
    <p class="error">{form.message}</p>
  {/if}
</form>
```

## API Routes

```typescript
// src/routes/api/posts/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  const posts = await db.posts.findMany();
  
  return json(posts);
};

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();
  
  const post = await db.posts.create({
    data
  });
  
  return json(post, { status: 201 });
};
```

## Stores

### Svelte Stores

```typescript
// src/lib/stores/user.ts
import { writable, derived } from 'svelte/store';

export const user = writable<User | null>(null);
export const isLoading = writable(false);

export const isAuthenticated = derived(
  user,
  ($user) => $user !== null
);

// Actions
export const login = async (email: string, password: string) => {
  isLoading.set(true);
  
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const userData = await response.json();
  user.set(userData);
  isLoading.set(false);
};

export const logout = () => {
  user.set(null);
};
```

```svelte
<!-- src/routes/profile/+page.svelte -->
<script>
  import { user, isAuthenticated, logout } from '$lib/stores/user';
</script>

{#if $isAuthenticated}
  <h1>Welcome, {$user.name}</h1>
  <button on:click={logout}>Logout</button>
{:else}
  <a href="/login">Login</a>
{/if}
```

## Styling

### Scoped Styles

```svelte
<!-- src/lib/components/Card.svelte -->
<script>
  export let title: string;
  export let description: string;
</script>

<div class="card">
  <h2>{title}</h2>
  <p>{description}</p>
  <slot />
</div>

<style>
  .card {
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  h2 {
    color: #333;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #666;
    line-height: 1.6;
  }
</style>
```

### Global Styles

```css
/* src/app.css */
:root {
  --primary: #3b82f6;
  --text: #1f2937;
  --background: #ffffff;
}

body {
  font-family: system-ui, sans-serif;
  color: var(--text);
  background: var(--background);
  margin: 0;
  padding: 0;
}
```

## Deployment

### Adapters

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';
import adapterNode from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter({
      // Vercel adapter
    })
    // Or: adapter: adapterNode()
  }
};
```

### Static Export

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '200.html'
    })
  }
};
```

## Best Practices

1. **Use TypeScript** for type safety
2. **Leverage form actions** for mutations
3. **Use server load functions** for sensitive data
4. **Implement proper error handling**
5. **Use stores for client state**
6. **Optimize images** with SvelteKit image optimization
7. **Enable SSR** for SEO-critical pages
8. **Use adapters** for deployment

## Anti-Patterns

- **Client-side only**: Not using SSR when beneficial
- **Fetching in onMount**: Use load functions instead
- **Global state for everything**: Use local state when possible
- **Not using form actions**: Manual form handling
- **Ignoring TypeScript**: Loses type safety

## Verification

- [ ] TypeScript configured
- [ ] Routing implemented
- [ ] Data loading optimized
- [ ] Forms use actions
- [ ] Error handling in place
- [ ] Stores properly organized
- [ ] Adapter configured for deployment

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
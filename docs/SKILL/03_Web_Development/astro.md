---
name: astro
description: Astro framework for building content-focused websites with island architecture, partial hydration, and modern web standards.
---

# Astro

## Overview

Astro is a modern web framework for building fast, content-focused websites using island architecture and partial hydration. Optimize for static content with dynamic interactivity where needed.

## When to Use

- Building content-focused websites
- Creating blogs and documentation sites
- Developing marketing websites
- Building e-commerce storefronts
- Portfolio websites
- News and media sites

## Core Concepts

### Island Architecture

Astro renders most of your page to static HTML by default, then "hydrates" interactive components (islands) in the browser:

```astro
---
// src/pages/index.astro
import Header from '../components/Header.astro';
import Counter from '../components/Counter.jsx';
import Footer from '../components/Footer.astro';
---

<html>
  <head>
    <title>My Astro Site</title>
  </head>
  <body>
    <!-- Static HTML - no JavaScript -->
    <Header />
    
    <!-- Interactive island - hydrated in browser -->
    <Counter client:load />
    
    <!-- Static HTML -->
    <Footer />
  </body>
</html>
```

### Hydration Directives

Control when islands hydrate:

```astro
<!-- Load immediately when page loads -->
<Counter client:load />

<!-- Load when page becomes visible -->
<VideoPlayer client:visible />

<!-- Load when element enters viewport -->
<Gallery client:intersection />

<!-- Load on user interaction -->
<Modal client:only="react" />

<!-- Never hydrate (static only) -->
<StaticContent client:never />
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.astro
│   ├── Footer.astro
│   └── Counter.jsx      # Can use React, Vue, Svelte, etc.
├── layouts/             # Page layouts
│   └── BlogPost.astro
├── pages/               # File-based routing
│   ├── index.astro      # /
│   ├── about.astro      # /about
│   └── blog/
│       └── [slug].astro # /blog/my-post
├── content/             # Content collections
│   └── blog/
│       ├── post-1.md
│       └── post-2.md
└── styles/
    └── global.css
```

## Content Collections

Type-safe content management:

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string(),
    tags: z.array(z.string()),
  }),
});

export const collections = { blog };
```

```astro
---
// src/pages/blog/[slug].astro
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<html>
  <head>
    <title>{post.data.title}</title>
  </head>
  <body>
    <h1>{post.data.title}</h1>
    <Content />
  </body>
</html>
```

## Framework Integration

Use React, Vue, Svelte, or other frameworks:

```bash
# Install React integration
npx astro add react

# Install Vue integration
npx astro add vue

# Install Svelte integration
npx astro add svelte
```

```jsx
// src/components/ReactComponent.jsx
import { useState } from 'react';

export default function ReactComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

## Data Fetching

```astro
---
// Fetch at build time (static)
const response = await fetch('https://api.example.com/posts');
const posts = await response.json();
---

<!-- Or fetch at request time (SSR) -->
---
export const ssr = true;
const response = await fetch('https://api.example.com/posts', {
  headers: {
    'Authorization': `Bearer ${Astro.locals.token}`
  }
});
const posts = await response.json();
---

<ul>
  {posts.map(post => (
    <li>{post.title}</li>
  ))}
</ul>
```

## Styling

### CSS Modules

```astro
---
// src/components/Card.astro
import styles from './Card.module.css';
---

<div class={styles.card}>
  <slot />
</div>

<style>
  .card {
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
</style>
```

### Tailwind CSS

```bash
npx astro add tailwind
```

```astro
---
// src/components/Button.astro
---

<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Click me
</button>
```

## View Transitions

Smooth page transitions:

```astro
---
// src/layouts/BaseLayout.astro
---

<html>
  <head>
    <title>{Astro.props.title}</title>
  </head>
  <body>
    <slot />
    
    <script>
      import { ViewTransitions } from 'astro:transitions';
      ViewTransitions.start();
    </script>
  </body>
</html>
```

## API Routes

```typescript
// src/pages/api/posts.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const posts = await db.posts.findMany();
  
  return new Response(JSON.stringify(posts), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  
  const post = await db.posts.create({
    data: body,
  });
  
  return new Response(JSON.stringify(post), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
```

## Deployment

### Static Export

```javascript
// astro.config.mjs
export default defineConfig({
  output: 'static',
});
```

### SSR Mode

```javascript
// astro.config.mjs
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
});
```

## Best Practices

1. **Use content collections** for structured content
2. **Minimize islands** - prefer static HTML
3. **Choose appropriate hydration** strategy
4. **Leverage partial hydration** for performance
5. **Use framework components** only when needed
6. **Optimize images** with Astro's Image component
7. **Enable View Transitions** for SPA-like experience
8. **Use TypeScript** for type safety

## Anti-Patterns

- **Hydrating everything**: Defeats purpose of Astro
- **Heavy client-side logic**: Use appropriate framework
- **Not using content collections**: Loses type safety
- **Ignoring static generation**: Unnecessary SSR
- **Large bundle sizes**: Defeats performance benefits

## Verification

- [ ] Static HTML generated by default
- [ ] Islands used sparingly
- [ ] Content collections configured
- [ ] Images optimized
- [ ] View Transitions enabled (if needed)
- [ ] TypeScript configured
- [ ] Build passes without errors

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
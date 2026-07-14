---
name: nextjs
description: "Next.js framework mastery covering App Router, Server Components, SSR/SSG, API routes, and full-stack React patterns."
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Next.js Framework

Next.js framework mastery covering App Router, Server Components, SSR/SSG, and full-stack React patterns.

## 🧠 Core Philosophy
> "Next.js is the React framework for production — it handles routing, rendering, and deployment so you can focus on your application."

## When to Use
Use this skill when:
- **Building full-stack React applications** with server-side rendering
- **Implementing SEO-friendly** web applications
- **Creating API routes** without a separate backend
- **Optimizing performance** with automatic code splitting
- **Deploying to Vercel** or other platforms

---

## 1. App Router (Next.js 13+)

### File Structure
```
app/
├── layout.tsx          # Root layout (required)
├── page.tsx            # Home page (/)
├── loading.tsx         # Loading UI
├── error.tsx           # Error UI
├── not-found.tsx       # 404 page
├── global.css          # Global styles
├── (auth)/            # Route groups
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── dashboard/
│   ├── layout.tsx
│   ├── page.tsx
│   └── settings/
│       └── page.tsx
└── api/
    └── users/
        └── route.ts
```

### Server Components (Default)
```typescript
// app/users/page.tsx - Server Component by default
import { getUsers } from '@/lib/api';

export default async function UsersPage() {
  // Fetch data directly in component
  const users = await getUsers();
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Client Components ('use client')
```typescript
'use client';  // Mark as Client Component

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

## 2. Data Fetching

### Server Component Data Fetching
```typescript
// app/posts/[id]/page.tsx
interface Props {
  params: { id: string };
}

export default async function PostPage({ params }: Props) {
  // Fetch data on server
  const post = await fetch(`https://api.example.com/posts/${params.id}`, {
    next: { revalidate: 3600 }  // Revalidate every hour
  }).then(res => res.json());
  
  return <div>{post.title}</div>;
}
```

### Parallel Data Fetching
```typescript
async function getData() {
  const [user, posts, comments] = await Promise.all([
    fetch('https://api.example.com/user').then(res => res.json()),
    fetch('https://api.example.com/posts').then(res => res.json()),
    fetch('https://api.example.com/comments').then(res => res.json()),
  ]);
  
  return { user, posts, comments };
}
```

## 3. API Routes

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const users = await db.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const user = await db.user.create({
    data: body
  });
  
  return NextResponse.json(user, { status: 201 });
}
```

## 4. Metadata & SEO

```typescript
// app/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My App',
  description: 'My app description',
  openGraph: {
    title: 'My App',
    description: 'My app description',
    images: ['/og-image.jpg'],
  },
};

export default function Home() {
  return <div>Home</div>;
}

// Dynamic metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.id);
  
  return {
    title: post.title,
    description: post.excerpt,
  };
}
```

## 5. Image Optimization

```typescript
import Image from 'next/image';

export function Avatar({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={100}
      height={100}
      priority  // Load immediately (above the fold)
      placeholder="blur"
      blurDataURL={placeholder}
    />
  );
}
```

## 6. Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check authentication
  const token = request.cookies.get('token');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

## 7. Environment Variables

```typescript
// .env.local
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=https://api.example.com

// Usage
const dbUrl = process.env.DATABASE_URL;  // Server-only
const apiUrl = process.env.NEXT_PUBLIC_API_URL;  // Client & server
```

## 🛠️ Implementation Checklist
- [ ] Is the App Router being used (not Pages Router)?
- [ ] Are Server Components used by default?
- [ ] Is 'use client' only added when necessary?
- [ ] Are API routes properly structured?
- [ ] Is metadata configured for SEO?
- [ ] Are images optimized with next/image?
- [ ] Is middleware used for authentication/redirects?
- [ ] Are environment variables properly configured?

## Limitations
- App Router is newer, some libraries not compatible yet
- Server Components have limitations (no hooks, no browser APIs)
- Learning curve from Pages Router
- This skill is not a substitute for React fundamentals
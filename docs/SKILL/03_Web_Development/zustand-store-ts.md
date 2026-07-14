---
name: zustand-store-ts
description: Zustand state management for TypeScript applications covering stores, middleware, persistence, and React integration patterns.
---

# Zustand Store TypeScript

## Overview

Zustand is a lightweight state management library for React applications. This skill covers TypeScript patterns, middleware usage, persistence, and best practices for scalable state management.

## When to Use

- Managing global state in React apps
- Type-safe state management with TypeScript
- Replacing Redux or Context API
- Building scalable state architecture
- Implementing persistent state

## Core Concepts

### Basic Store

```typescript
import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

### Usage in Components

```typescript
import { useUserStore } from './stores/userStore';

function UserProfile() {
  const { user, isLoading, setUser, clearUser } = useUserStore();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{user?.name}</h1>
      <button onClick={clearUser}>Logout</button>
    </div>
  );
}
```

## Advanced Patterns

### Computed Values

```typescript
interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  
  total: () => {
    return get().items.reduce((sum, item) => sum + item.price, 0);
  },
  
  itemCount: () => {
    return get().items.length;
  },
}));
```

### Async Actions

```typescript
interface AuthStore {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  
  login: async (email, password) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    set({ token: data.token });
  },
  
  logout: () => {
    set({ token: null });
  },
}));
```

## Middleware

### Persistence

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsStore {
  theme: 'light' | 'dark';
  language: string;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'en',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### DevTools

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useCounterStore = create<CounterStore>()(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    { name: 'CounterStore' }
  )
);
```

### Immer (Immutable Updates)

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface TodoStore {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
}

export const useTodoStore = create<TodoStore>()(
  immer((set) => ({
    todos: [],
    
    addTodo: (text) => set((state) => {
      state.todos.push({
        id: Date.now().toString(),
        text,
        completed: false,
      });
    }),
    
    toggleTodo: (id) => set((state) => {
      const todo = state.todos.find(t => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
      }
    }),
  }))
);
```

## Store Organization

### Slices Pattern

```typescript
// stores/slices/userSlice.ts
interface UserSlice {
  user: User | null;
  setUser: (user: User) => void;
}

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
});

// stores/slices/cartSlice.ts
interface CartSlice {
  items: CartItem[];
  addItem: (item: CartItem) => void;
}

export const createCartSlice: StateCreator<CartSlice> = (set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
});

// stores/index.ts
type StoreState = UserSlice & CartSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createUserSlice(...a),
  ...createCartSlice(...a),
}));
```

### Separate Stores

```typescript
// stores/userStore.ts
export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// stores/cartStore.ts
export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
}));

// Usage - components only subscribe to what they need
function Header() {
  const user = useUserStore((state) => state.user);
  // Component only re-renders when user changes
}
```

## React Integration

### With React Query

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from './stores/userStore';

function usePosts() {
  const queryClient = useQueryClient();
  const { token } = useUserStore();
  
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await fetch('/api/posts', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.json();
    },
  });
}

function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (post: Post) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
```

### Selectors

```typescript
// Select specific values to prevent unnecessary re-renders
const userName = useUserStore((state) => state.user?.name);
const userEmail = useUserStore((state) => state.user?.email);

// Select multiple values
const { user, isLoading } = useUserStore((state) => ({
  user: state.user,
  isLoading: state.isLoading,
}));

// Shallow comparison for objects
import { shallow } from 'zustand/shallow';

const { user, settings } = useUserStore(
  (state) => ({ user: state.user, settings: state.settings }),
  shallow
);
```

## Best Practices

1. **Use TypeScript** for type safety
2. **Keep stores focused** - one concern per store
3. **Use slices** for complex stores
4. **Select specific values** to minimize re-renders
5. **Use middleware** for cross-cutting concerns
6. **Persist only necessary data** to localStorage
7. **Use Immer** for complex state updates
8. **DevTools in development** for debugging

## Anti-Patterns

- **Storing derived data**: Compute in selectors
- **Large monolithic stores**: Split by domain
- **Not using selectors**: Subscribing to entire store
- **Mutating state directly**: Use set() function
- **Over-persisting**: Don't store sensitive data
- **Business logic in store**: Keep stores simple

## Verification

- [ ] TypeScript types defined for all stores
- [ ] Stores are focused and minimal
- [ ] Selectors used to prevent re-renders
- [ ] Middleware configured (persist, devtools)
- [ ] Async actions properly handled
- [ ] No direct state mutations
- [ ] DevTools enabled in development

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
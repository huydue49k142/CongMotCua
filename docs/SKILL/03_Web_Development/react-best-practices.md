---
name: react-best-practices
description: "Modern React development with hooks, performance optimization, state management, and component patterns for production applications."
risk: safe
source: "vercel-labs/agent-skills"
date_added: "2026-07-11"
---

# React Best Practices

Modern React development with hooks, performance optimization, state management, and component patterns.

## 🧠 Core Philosophy
> "React is about building user interfaces with composable components — keep them simple, focused, and reusable."

## When to Use
Use this skill when:
- **Building React applications** with modern patterns
- **Optimizing performance** (memo, useMemo, useCallback)
- **Managing state** (useState, useReducer, Context, Redux)
- **Implementing hooks** and custom hooks
- **Structuring components** for reusability

---

## 1. Component Patterns

### Functional Components with Hooks
```typescript
// ✅ Good: Simple, focused component
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <Spinner />;
  if (!user) return <Error message="User not found" />;
  
  return <div>{user.name}</div>;
}
```

### Custom Hooks
```typescript
// Reusable logic
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Usage
const [theme, setTheme] = useLocalStorage('theme', 'dark');
```

## 2. Performance Optimization

### Memoization
```typescript
// ✅ useMemo for expensive computations
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// ✅ useCallback for functions passed to children
const handleClick = useCallback((id: string) => {
  onSelect(id);
}, [onSelect]);
```

### Code Splitting
```typescript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Dashboard />
    </Suspense>
  );
}
```

## 3. State Management

### Context + Reducer Pattern
```typescript
interface State {
  count: number;
}

type Action = { type: 'increment' } | { type: 'decrement' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    case 'decrement': return { count: state.count - 1 };
  }
}

const CounterContext = createContext<{
  state: State;
  dispatch: Dispatch<Action>;
} | null>(null);

function CounterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  
  return (
    <CounterContext.Provider value={{ state, dispatch }}>
      {children}
    </CounterContext.Provider>
  );
}
```

## 4. Form Handling

```typescript
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await submitForm(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## 🛠️ Implementation Checklist
- [ ] Are components small and focused (single responsibility)?
- [ ] Are props properly typed (TypeScript)?
- [ ] Is state managed appropriately (local vs global)?
- [ ] Are expensive computations memoized?
- [ ] Are side effects handled in useEffect?
- [ ] Is error handling implemented (Error Boundaries)?
- [ ] Are components accessible (ARIA labels, keyboard navigation)?

## Limitations
- React is a library, not a framework — you need to make architectural decisions
- Over-engineering with hooks can lead to complexity
- Performance optimization should be measured, not premature
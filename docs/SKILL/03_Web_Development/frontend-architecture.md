---
name: frontend-architecture
description: "Frontend system design covering component architecture, state management, performance optimization, and scalable application structure."
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Frontend Architecture

Frontend system design covering component architecture, state management, and scalable application structure.

## 🧠 Core Philosophy
> "Frontend architecture is about organizing code for maintainability, performance, and team velocity as the application grows."

## When to Use
Use this skill when:
- **Designing large-scale frontend applications**
- **Structuring component libraries** and design systems
- **Choosing state management** solutions
- **Optimizing performance** (bundle size, rendering)
- **Setting up project structure** for teams

---

## 1. Component Architecture

### Component Types

| Type | Purpose | Example |
|------|---------|---------|
| **Presentational** | UI only, no logic | `Button`, `Modal`, `Card` |
| **Container** | Logic & state, renders presentational | `UserList`, `CheckoutForm` |
| **Layout** | Page structure | `Header`, `Sidebar`, `Footer` |
| **Page** | Route-level component | `HomePage`, `DashboardPage` |
| **Provider** | Context/state wrapper | `AuthProvider`, `ThemeProvider` |

### Component Structure
```
src/
├── components/          # Reusable components
│   ├── ui/             # Presentational (Button, Input)
│   ├── layout/         # Layout components
│   └── features/       # Feature-specific components
├── pages/              # Route pages
├── hooks/              # Custom hooks
├── services/           # API calls
├── stores/             # State management
├── utils/              # Helper functions
└── types/              # TypeScript types
```

### Composition Pattern
```typescript
// ✅ Good: Component composition
function Card({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// Usage
<Card title="User Profile">
  <UserInfo user={user} />
  <UserActions onEdit={handleEdit} />
</Card>

// ❌ Bad: Prop drilling
<Card 
  title="User Profile"
  user={user}
  onEdit={handleEdit}
  renderUserInfo={() => <UserInfo user={user} />}
  renderUserActions={() => <UserActions onEdit={handleEdit} />}
/>
```

## 2. State Management

### State Categories

| Category | Scope | Solution | Example |
|----------|-------|----------|---------|
| **Local** | Single component | useState, useReducer | Form input, toggle |
| **Lifted** | Parent + children | Props + callbacks | Theme, language |
| **Global** | Entire app | Context, Redux, Zustand | Auth, cart, notifications |
| **Server** | API data | React Query, SWR | User data, products |
| **URL** | Routing | React Router | Search params, filters |

### State Management Decision Tree
```
Is it local to one component?
  → YES: useState
  → NO: Continue...

Do only 2-3 components need it?
  → YES: Lift state up (props)
  → NO: Continue...

Is it server state (API data)?
  → YES: React Query / SWR
  → NO: Continue...

Is it global app state?
  → YES: Context (small) / Redux/Zustand (large)
```

### React Query Pattern (Server State)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch data
function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,  // 5 minutes
  });
}

// Mutate data
function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Usage
function UserList() {
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  
  if (isLoading) return <Spinner />;
  
  return (
    <div>
      {users.map(user => <UserCard key={user.id} user={user} />)}
      <button onClick={() => createUser.mutate({ name: 'John' })}>
        Add User
      </button>
    </div>
  );
}
```

## 3. Performance Optimization

### Bundle Size Optimization
```typescript
// ✅ Code splitting
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));

// ✅ Dynamic imports
const chart = await import('chart.js');

// ✅ Tree shaking
// Only import what you need
import { debounce } from 'lodash-es';

// ❌ Bad: Import entire library
import _ from 'lodash';
```

### Rendering Optimization
```typescript
// ✅ Memoize expensive computations
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// ✅ Memoize callbacks
const handleClick = useCallback((id: string) => {
  onSelect(id);
}, [onSelect]);

// ✅ Memoize components
const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  return <div>{/* expensive render */}</div>;
});
```

### Image Optimization
```typescript
// ✅ Use modern formats
<picture>
  <source srcSet="image.avif" type="image/avif" />
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Description" loading="lazy" />
</picture>

// ✅ Lazy loading
<img src={imageUrl} loading="lazy" decoding="async" />
```

## 4. Design System

### Token System
```typescript
// tokens.ts
export const tokens = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    error: '#dc3545',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  typography: {
    fontSize: {
      sm: '14px',
      md: '16px',
      lg: '18px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700,
    },
  },
} as const;

// Usage
const styles = {
  color: tokens.colors.primary,
  padding: tokens.spacing.md,
  fontSize: tokens.typography.fontSize.lg,
};
```

## 5. Error Boundaries

```typescript
class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## 🛠️ Implementation Checklist
- [ ] Is the project structure scalable (components, pages, hooks separated)?
- [ ] Are components small and focused (single responsibility)?
- [ ] Is state managed appropriately (local vs global vs server)?
- [ ] Are there code splitting and lazy loading?
- [ ] Is bundle size monitored and optimized?
- [ ] Are there performance budgets?
- [ ] Is there a design system (tokens, components)?
- [ ] Are error boundaries implemented?
- [ ] Is accessibility considered (ARIA, keyboard navigation)?

## Limitations
- Frontend architecture varies by framework
- Over-engineering can slow down development
- Performance optimization should be measured, not premature
- This skill is not a substitute for framework-specific best practices
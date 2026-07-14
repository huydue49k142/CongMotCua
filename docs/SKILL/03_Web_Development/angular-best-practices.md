---
name: angular-best-practices
description: Modern Angular 17+ development with standalone components, signals, RxJS, and enterprise patterns.
---

# Angular Best Practices

## Overview

Modern Angular 17+ development with standalone components, signals, RxJS, and enterprise patterns for building scalable web applications.

## When to Use

- Building Angular applications
- Migrating to Angular 17+
- Implementing standalone components
- Using signals for state management
- Optimizing Angular performance

## Core Concepts

### Standalone Components

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-profile">
      <h2>{{ user.name }}</h2>
      <p>{{ user.email }}</p>
    </div>
  `
})
export class UserProfileComponent {
  user = signal<User>({ name: 'John', email: 'john@example.com' });
}
```

### Signals

```typescript
import { signal, computed, effect } from '@angular/core';

// Create signals
const count = signal(0);
const doubleCount = computed(() => count() * 2);

// Update signal
count.set(5);
count.update(value => value + 1);

// Effect runs when signal changes
effect(() => {
  console.log(`Count: ${count()}, Double: ${doubleCount()}`);
});
```

### RxJS Patterns

```typescript
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';

@Component({ /* ... */ })
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users').pipe(
      map(users => users.filter(user => user.active)),
      catchError(error => {
        console.error('Error fetching users:', error);
        return throwError(() => new Error('Failed to load users'));
      })
    );
  }
}
```

## Architecture

### Folder Structure

```
src/
├── app/
│   ├── core/                    # Singleton services, guards, interceptors
│   │   ├── services/
│   │   ├── guards/
│   │   └── interceptors/
│   ├── shared/                  # Reusable components, pipes, directives
│   │   ├── components/
│   │   ├── pipes/
│   │   └── directives/
│   ├── features/                # Feature modules
│   │   ├── users/
│   │   ├── products/
│   │   └── orders/
│   └── app.component.ts
├── assets/
└── environments/
```

### Services

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = '/api/users';

  getUser(id: string) {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  createUser(user: CreateUserDto) {
    return this.http.post<User>(this.baseUrl, user);
  }
}
```

### Routing

```typescript
import { provideRouter, RouterLink, RouterOutlet } from '@angular/router';
import { routes } from './app.routes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav>
      <a routerLink="/">Home</a>
      <a routerLink="/users">Users</a>
    </nav>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {}

// app.config.ts
export const appConfig = provideRouter(routes);
```

## Forms

### Reactive Forms

```typescript
import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
      <input formControlName="name" placeholder="Name">
      <input formControlName="email" type="email" placeholder="Email">
      <button type="submit" [disabled]="userForm.invalid">Submit</button>
    </form>
  `
})
export class UserFormComponent {
  private fb = inject(FormBuilder);
  
  userForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit() {
    if (this.userForm.valid) {
      console.log(this.userForm.value);
    }
  }
}
```

## Performance Optimization

### Change Detection

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-user-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class UserListComponent {
  users = signal<User[]>([]);
}
```

### Lazy Loading

```typescript
const routes: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./features/users/user-list.component')
      .then(m => m.UserListComponent)
  }
];
```

### TrackBy Function

```typescript
@Component({
  template: `
    <div *ngFor="let user of users; trackBy: trackById">
      {{ user.name }}
    </div>
  `
})
export class UserListComponent {
  users = signal<User[]>([]);
  
  trackById(index: number, user: User) {
    return user.id;
  }
}
```

## Best Practices

1. **Use standalone components** by default
2. **Prefer signals** over manual change detection
3. **Use OnPush change detection** for performance
4. **Lazy load feature modules**
5. **Use reactive forms** for complex forms
6. **Implement proper error handling**
7. **Use dependency injection** properly
8. **Write unit tests** with TestBed
9. **Use TypeScript strict mode**
10. **Follow Angular style guide**

## Anti-Patterns

- **Logic in templates**: Keep templates simple
- **Any type**: Use proper TypeScript types
- **Subscription leaks**: Unsubscribe or use async pipe
- **Large components**: Split into smaller components
- **Direct DOM manipulation**: Use Angular APIs

## Verification

- [ ] Standalone components used
- [ ] Signals for state management
- [ ] OnPush change detection
- [ ] Lazy loading implemented
- [ ] Reactive forms for complex forms
- [ ] Error handling in place
- [ ] Unit tests written
- [ ] TypeScript strict mode enabled

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
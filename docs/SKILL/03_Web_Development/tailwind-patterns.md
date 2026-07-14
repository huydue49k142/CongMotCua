---
name: tailwind-patterns
description: Tailwind CSS v4 principles. CSS-first configuration, container queries, modern patterns, design token architecture.
---

# Tailwind CSS Patterns (v4 - 2025)

## Overview

Modern utility-first CSS with CSS-native configuration. Tailwind v4 brings CSS-first configuration, container queries, and significant performance improvements.

## When to Use

- Configuring Tailwind v4
- Using CSS-first theme and design tokens
- Implementing container queries
- Building modern responsive layouts
- Creating design systems with Tailwind

## Core Concepts

### CSS-First Configuration

```css
/* app.css - No more tailwind.config.js */
@theme {
  /* Colors - use semantic names */
  --color-primary: oklch(0.7 0.15 250);
  --color-surface: oklch(0.98 0 0);
  --color-surface-dark: oklch(0.15 0 0);
  
  /* Spacing scale */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Container Queries

```astro
<!-- Parent element with container -->
<div class="@container">
  <div class="@sm:flex @md:grid @lg:grid-cols-3">
    <!-- Responds to parent width, not viewport -->
  </div>
</div>
```

### Modern Color System

```css
@theme {
  /* OKLCH colors - perceptually uniform */
  --color-primary-50: oklch(0.97 0.02 250);
  --color-primary-500: oklch(0.7 0.15 250);
  --color-primary-900: oklch(0.3 0.1 250);
}
```

## Responsive Design

### Breakpoint System

| Prefix | Min Width | Target |
|--------|-----------|--------|
| (none) | 0px | Mobile-first base |
| `sm:` | 640px | Large phone / small tablet |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Laptop |
| `xl:` | 1280px | Desktop |
| `2xl:` | 1536px | Large desktop |

### Mobile-First Principle

```html
<!-- Mobile first, then enhance -->
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- Full width on mobile, half on tablet, third on desktop -->
</div>
```

## Layout Patterns

### Flexbox

```html
<!-- Center both axes -->
<div class="flex items-center justify-center">

<!-- Vertical stack -->
<div class="flex flex-col gap-4">

<!-- Space between -->
<div class="flex justify-between items-center">
```

### Grid

```html
<!-- Auto-fit responsive grid -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">

<!-- Asymmetric Bento layout -->
<div class="grid grid-cols-3 grid-rows-2">
  <div class="col-span-2 row-span-2">Main content</div>
  <div>Sidebar</div>
</div>
```

## Dark Mode

```html
<!-- Class-based dark mode -->
<html class="dark">
  <body class="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
    <h1 class="text-2xl font-bold">Hello</h1>
  </body>
</html>
```

## Animation

```html
<!-- Built-in animations -->
<div class="animate-spin">Loading...</div>
<div class="animate-pulse">Pulsing...</div>
<div class="animate-bounce">Bouncing...</div>

<!-- Custom transitions -->
<button class="transition-all duration-200 hover:scale-105">
  Hover me
</button>
```

## Typography

```html
<!-- Font sizes -->
<h1 class="text-4xl font-bold">Heading</h1>
<p class="text-base text-zinc-600">Body text</p>
<small class="text-sm text-zinc-500">Caption</small>

<!-- Font families -->
<div class="font-sans">Sans-serif</div>
<div class="font-mono">Monospace</div>
```

## Component Extraction

### When to Extract

- Same class combo used 3+ times
- Complex state variants
- Design system elements

### Extraction Methods

```typescript
// React component
export function Button({ children, variant = 'primary' }) {
  return (
    <button className={cn(
      'px-4 py-2 rounded',
      variant === 'primary' && 'bg-blue-500 text-white',
      variant === 'secondary' && 'bg-gray-200 text-gray-900'
    )}>
      {children}
    </button>
  );
}
```

## Best Practices

1. **Use semantic color names** (primary, surface) not (blue-500)
2. **Prefer container queries** for component responsiveness
3. **Use CSS variables** for theming
4. **Extract components** for repeated patterns
5. **Mobile-first** approach
6. **Use @apply sparingly** - prefer components
7. **Leverage design tokens** for consistency

## Anti-Patterns

- **Arbitrary values everywhere**: Use design system
- **Hardcoded colors**: Use theme tokens
- **Ignoring container queries**: Viewport-only responsive
- **@apply everywhere**: Defeats utility-first benefits
- **No design tokens**: Inconsistent spacing/colors

## Verification

- [ ] CSS-first configuration used
- [ ] Container queries implemented where appropriate
- [ ] Design tokens defined in @theme
- [ ] Mobile-first responsive approach
- [ ] Dark mode configured
- [ ] Components extracted for reuse
- [ ] Performance optimized (PurgeCSS)

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
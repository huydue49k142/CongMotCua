---
name: frontend-design
description: Modern frontend design principles covering UI/UX patterns, design systems, accessibility, and responsive design best practices.
---

# Frontend Design

## Overview

Modern frontend design principles covering UI/UX patterns, design systems, accessibility, and responsive design best practices for building user-centered interfaces.

## When to Use

- Designing user interfaces
- Creating design systems
- Implementing responsive layouts
- Ensuring accessibility compliance
- Building component libraries
- Establishing design tokens

## Core Principles

### Visual Hierarchy

Guide users through content with clear hierarchy:

```yaml
Typography Scale:
  - H1: 2.5rem (40px) - Page titles
  - H2: 2rem (32px) - Section headers
  - H3: 1.5rem (24px) - Subsection headers
  - Body: 1rem (16px) - Main content
  - Small: 0.875rem (14px) - Captions, labels

Color Hierarchy:
  - Primary: Brand color for CTAs
  - Secondary: Supporting actions
  - Success: Positive feedback
  - Warning: Caution states
  - Error: Error messages
  - Neutral: Text, borders, backgrounds
```

### Spacing System

```yaml
Base Unit: 8px
Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96

Usage:
  - xs: 4px - Tight spacing
  - sm: 8px - Component padding
  - md: 16px - Section spacing
  - lg: 24px - Major sections
  - xl: 32px - Page sections
  - 2xl: 48px - Hero sections
```

### Responsive Breakpoints

```yaml
Mobile: 0-639px - Single column, touch targets 44px
Tablet: 640-1023px - 2 columns, medium spacing
Desktop: 1024-1439px - 3-4 columns, full spacing
Wide: 1440px+ - Max width container (1280px)
```

## Design Systems

### Component Structure

```yaml
Atoms:
  - Buttons
  - Inputs
  - Labels
  - Icons

Molecules:
  - Search bar (input + button)
  - Form field (label + input + error)
  - Card (image + title + description)

Organisms:
  - Header (logo + nav + search)
  - Product card (image + details + CTA)
  - Form (multiple fields + submit)
```

### Design Tokens

```json
{
  "colors": {
    "primary": {
      "50": "#f0f9ff",
      "500": "#0ea5e9",
      "900": "#0c4a6e"
    },
    "spacing": {
      "xs": "4px",
      "sm": "8px",
      "md": "16px",
      "lg": "24px"
    },
    "typography": {
      "fontFamily": {
        "sans": "Inter, system-ui, sans-serif",
        "mono": "JetBrains Mono, monospace"
      },
      "fontSize": {
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem"
      }
    }
  }
}
```

## Accessibility (WCAG 2.1)

### Requirements

```yaml
Perceivable:
  - Text alternatives for images
  - Captions for videos
  - Sufficient color contrast (4.5:1 minimum)
  - Resizable text (up to 200%)

Operable:
  - Keyboard accessible
  - Enough time to read content
  - No seizures from flashing
  - Easy navigation

Understandable:
  - Readable text
  - Predictable behavior
  - Input assistance

Robust:
  - Compatible with assistive technologies
  - Valid HTML
  - Proper ARIA labels
```

### Implementation

```html
<!-- Semantic HTML -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

<!-- Form labels -->
<label for="email">Email</label>
<input type="email" id="email" aria-required="true">

<!-- Button states -->
<button aria-pressed="false" aria-label="Toggle menu">
  Menu
</button>

<!-- Live regions -->
<div aria-live="polite" aria-atomic="true">
  <!-- Dynamic content announcements -->
</div>
```

## Layout Patterns

### Grid System

```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
}

.grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* Sidebar layout */
.layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
```

### Flexbox Patterns

```css
/* Center content */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Space between */
.space-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Vertical stack */
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
```

## Component Patterns

### Buttons

```yaml
Primary:
  - Background: Primary color
  - Text: White
  - Hover: Darker shade
  - Use: Main CTAs

Secondary:
  - Background: Transparent
  - Border: Primary color
  - Text: Primary color
  - Use: Secondary actions

Ghost:
  - Background: Transparent
  - No border
  - Hover: Light background
  - Use: Tertiary actions

Sizes:
  - sm: 32px height, 14px font
  - md: 40px height, 16px font
  - lg: 48px height, 18px font
```

### Forms

```yaml
Input States:
  - Default: Gray border
  - Focus: Blue border, ring
  - Error: Red border, error message
  - Disabled: Gray background, no interaction

Validation:
  - Real-time: On blur
  - Submit: On form submit
  - Error messages: Below field
  - Success: Green checkmark
```

### Cards

```yaml
Structure:
  - Image (16:9 ratio)
  - Title (H3)
  - Description (body text)
  - Footer (actions)

States:
  - Default: White background, shadow
  - Hover: Elevated shadow
  - Interactive: Cursor pointer, scale effect
```

## Animation

### Principles

```yaml
Timing:
  - Fast: 150ms - Micro-interactions
  - Normal: 300ms - State changes
  - Slow: 500ms - Page transitions

Easing:
  - Ease-out: Entering elements
  - Ease-in: Exiting elements
  - Ease-in-out: State changes

Properties:
  - Transform: Performant
  - Opacity: Performant
  - Avoid: width, height, top, left
```

### Examples

```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 300ms ease-out;
}

/* Slide up */
@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 300ms ease-out;
}
```

## Best Practices

1. **Mobile-first**: Design for mobile, enhance for desktop
2. **Consistent spacing**: Use design tokens
3. **Accessible colors**: Meet WCAG contrast ratios
4. **Semantic HTML**: Use proper elements
5. **Keyboard navigation**: All features keyboard accessible
6. **Loading states**: Show progress indicators
7. **Error states**: Clear error messages
8. **Empty states**: Helpful guidance
9. **Performance**: Optimize images, lazy load
10. **Progressive enhancement**: Works without JavaScript

## Anti-Patterns

- **Fixed widths**: Use relative units
- **Color-only indicators**: Add icons/text
- **Hover-only interactions**: Support touch
- **Auto-playing media**: User control
- **Tiny touch targets**: Minimum 44x44px
- **Low contrast**: Test with contrast checker
- **Marquee text**: Distracting, unreadable

## Verification

- [ ] Responsive on all breakpoints
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigable
- [ ] Color contrast sufficient
- [ ] Touch targets adequate
- [ ] Loading states defined
- [ ] Error states handled
- [ ] Performance optimized

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
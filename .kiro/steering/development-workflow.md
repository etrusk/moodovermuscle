---
inclusion: always
---

# Development Workflow & Code Standards

## Environment & Commands
- **Package Manager**: Use `pnpm` exclusively (never npm/yarn)
- **Development**: `pnpm dev` for local server
- **Build**: `pnpm build` for production build
- **Deployment**: Automatic via Vercel on main branch pushes

## Code Quality Rules

### TypeScript Standards
- Use strict TypeScript with proper interfaces for all props
- Type-only imports: `import type React from "react"`
- Never use `any` - use proper typing or `unknown`
- Define interfaces inline or separately for component props

```typescript
// Required pattern
interface ComponentProps {
  isOpen: boolean
  onClose: () => void
}

// Type imports
import type React from "react"
```

### Component Patterns
- Functional components with hooks only
- Add `"use client"` directive for interactive components
- Named exports for components, default exports for pages
- Keep state as local as possible - no global state management

### File Organization
- Components in `/components` directory
- UI primitives in `/components/ui` (shadcn/ui)
- Custom hooks in `/hooks` directory
- Utilities in `/lib` directory
- Images in `/public/images` with descriptive names

## Development Standards

### Code Style
- Use Tailwind utilities before custom CSS
- Follow mobile-first responsive design
- Consistent spacing using Tailwind scale (4, 6, 8, 12, 16, 20, 24)
- Stick to brand color palette (rose/pink, stone, green)

### Form Implementation
- Multi-step forms with progress indicators
- React Hook Form + Zod validation pattern required
- Real-time validation with helpful error messages
- Mobile-optimized with large touch targets (min 44px)

### Performance Requirements
- Lighthouse scores: Performance >90, Accessibility >95
- Use Next.js Image component where possible
- Lazy loading for below-fold images
- Bundle size optimization with tree-shaking

## Security & Validation
- Validate all form inputs on client and server
- Sanitize user inputs to prevent XSS
- Handle personal data according to privacy laws
- Implement rate limiting for form submissions

## Testing Approach
- Test form validation rules and user flows
- Ensure WCAG accessibility compliance
- Test mobile responsiveness across screen sizes
- Verify image loading and optimization

## Common Patterns

### Import Order
```typescript
import type React from "react"                    // Type imports first
import { useState, useEffect } from "react"       // React hooks
import { Button } from "@/components/ui/button"   // Internal components
import { ChevronRight } from "lucide-react"       // External libraries
```

### Error Handling
- Provide clear, actionable error messages
- Test error states and recovery flows
- Handle loading states appropriately
- Graceful degradation for failed requests

### Accessibility
- Use semantic HTML with proper heading hierarchy
- Include ARIA labels for interactive elements
- Ensure keyboard navigation works properly
- Meet WCAG AA color contrast standards

## Deployment Checklist
- TypeScript compilation successful
- All form functionality tested
- Mobile responsiveness verified
- Images optimized and loading properly
- Contact information up to date
---
inclusion: always
---

# Technology Stack & Code Standards

## Core Stack
- **Next.js 15.2.4** with App Router - Use app/ directory structure
- **React 19** with TypeScript 5 - Strict typing required
- **pnpm** - Only package manager to use (never npm/yarn)
- **Tailwind CSS 3.4.17** - Utility-first styling only
- **shadcn/ui** - Component library on Radix UI primitives

## Required Libraries
- **React Hook Form + Zod** - All forms must use this pattern
- **Lucide React** - Only icon library, use `stroke-1` consistently
- **class-variance-authority** - For component variants
- **tailwind-merge & clsx** - For conditional classes

## Code Standards

### TypeScript Rules
- Use `"use client"` directive for all interactive components
- Type-only imports: `import type React from "react"`
- Define interfaces for all props and data structures
- Never use `any` type - use proper typing or `unknown`
- Path aliases: Use `@/` for all internal imports

### Component Architecture
- Functional components with hooks only
- Named exports preferred over default (except pages)
- Keep state as local as possible - no global state management
- Props drilling for simple parent-child communication

### Styling Patterns
```typescript
// Brand colors - use these exact classes
"bg-gradient-to-r from-rose-500 to-pink-500"     // Primary CTA
"bg-gradient-to-r from-green-500 to-emerald-500" // FREE/success
"text-stone-600"                                  // Body text
"text-stone-900"                                  // Headings

// Component styling patterns
"rounded-full px-6 py-4 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" // Buttons
"bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"          // Cards
"backdrop-blur-xl bg-white/80"                                                                              // Overlays
```

### Responsive Design
- Mobile-first approach always
- Use `md:` (768px+), `lg:` (1024px+), `xl:` (1280px+)
- Typography scaling: `text-lg md:text-xl lg:text-2xl`
- Grid systems: `grid gap-8 md:grid-cols-2 lg:grid-cols-3`

### Form Implementation
- Multi-step forms with progress indicators
- Real-time validation with helpful error messages
- React Hook Form + Zod validation pattern required
- Mobile-optimized with large touch targets (min 44px)

## Build Configuration
- ESLint & TypeScript errors ignored during builds (next.config.mjs)
- Image optimization disabled for static export compatibility
- Static export ready for Vercel deployment
- Auto-sync with v0.dev enabled

## Development Commands
```bash
pnpm dev    # Development server
pnpm build  # Production build
pnpm lint   # Code quality check
```

## Performance Requirements
- Lighthouse scores: Performance >90, Accessibility >95
- Bundle size optimization with tree-shaking
- Lazy loading for below-fold images
- CSS transitions for smooth interactions
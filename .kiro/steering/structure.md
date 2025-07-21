---
inclusion: always
---

# Project Structure & Architecture

## Directory Structure
```
app/                    # Next.js App Router pages
├── layout.tsx         # Root layout with ThemeProvider
├── page.tsx           # Homepage (hero, about, gallery, contact)
├── globals.css        # Global styles and CSS variables
└── classes/           # Additional pages

components/            # React components
├── ui/               # shadcn/ui primitives (buttons, forms, cards)
├── booking-form.tsx  # Multi-step booking form
└── theme-provider.tsx # Theme context

lib/                  # Utilities (utils.ts with cn() function)
hooks/                # Custom React hooks
styles/               # Additional stylesheets
public/images/        # Static assets organized by category
```

## Component Architecture

### TypeScript Patterns
- Functional components with hooks only
- Strict TypeScript with proper interface definitions
- Type-only imports: `import type React from "react"`
- Props interfaces defined inline or separately
- "use client" directive for interactive components
- Named exports preferred over default exports

### Design System Classes

#### Brand Colors & Gradients
```typescript
// Primary CTA (rose/pink gradient)
"bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"

// Success/FREE elements (green gradient)
"bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"

// Text colors
"text-stone-600"      // Body text
"text-stone-900"      // Headings
"bg-gradient-to-r from-stone-900 to-rose-600 bg-clip-text text-transparent" // Gradient text
```

#### Component Styling Patterns
```typescript
// Buttons
"rounded-full px-6 py-4 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"

// Cards
"bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"

// Sections
"bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100"

// Backdrop effects
"backdrop-blur-xl bg-white/80"
```

#### Responsive Typography
```typescript
// Hero headings
"text-3xl md:text-5xl lg:text-6xl font-bold"

// Section headings  
"text-2xl md:text-3xl lg:text-4xl font-bold"

// Body text
"text-lg md:text-xl text-stone-600 leading-relaxed"
```

## Code Patterns

### Import Order
```typescript
import type React from "react"                    // Type-only imports first
import { useState, useEffect } from "react"       // React hooks
import { Button } from "@/components/ui/button"   // Internal components
import { ChevronRight, Heart } from "lucide-react" // External libraries
```

### File Naming Conventions
- **Files**: kebab-case (`booking-form.tsx`, `theme-provider.tsx`)
- **Components**: PascalCase (`BookingForm`, `ThemeProvider`)
- **Hooks**: camelCase with "use" prefix (`useBookingForm`)
- **Types**: PascalCase with descriptive suffix (`BookingFormProps`, `UserData`)

### Form Architecture
```typescript
// Multi-step form pattern
const [currentStep, setCurrentStep] = useState(1)
const [formData, setFormData] = useState<FormData>({})

// Validation pattern
const isStepValid = (step: number) => {
  switch (step) {
    case 1: return formData.name && formData.email && formData.phone
    case 2: return formData.goals && formData.experience
    default: return false
  }
}

// Update handler
const updateFormData = (field: keyof FormData, value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }))
}
```

### Responsive Layout Patterns
- **Mobile-first**: Base styles for mobile, progressive enhancement
- **Breakpoints**: `md:` (768px+), `lg:` (1024px+), `xl:` (1280px+)
- **Grid systems**: `grid gap-8 md:grid-cols-2 lg:grid-cols-3`
- **Spacing**: `space-y-6 md:space-y-8`, `px-4 md:px-6`
- **Text scaling**: `text-lg md:text-xl lg:text-2xl`

### Animation Standards
- **Hover effects**: `hover:scale-105 transition-transform duration-300`
- **Loading states**: `animate-pulse`, `animate-fade-in-up`
- **Button interactions**: `group-hover:translate-x-1 transition-transform`
- **Image overlays**: `absolute inset-0 bg-gradient-to-t from-black/50`
- **Transitions**: `transition-all duration-300` for smooth interactions

## Asset & State Management

### Image Organization
- **Location**: `public/images/` directory
- **Categories**: gallery/, logos/, portraits/
- **Naming**: Descriptive kebab-case (`emily-portrait.jpeg`, `gallery-1.jpeg`)
- **References**: `/images/` prefix in src attributes
- **Aspect ratios**: `aspect-square`, `aspect-[4/5]` for consistency

### State Architecture
- **Local state**: React useState for component-specific data
- **Form state**: React Hook Form + Zod validation
- **Modal state**: Boolean flags with open/close handlers
- **Data flow**: Props drilling for simple parent-child communication
- **No global state**: Keep state as local as possible

### Accessibility Requirements
- **Semantic HTML**: Use proper heading hierarchy (h1, h2, h3)
- **ARIA labels**: For interactive elements and form inputs
- **Keyboard navigation**: All interactive elements accessible via keyboard
- **Screen readers**: Descriptive alt text and ARIA descriptions
- **Color contrast**: Meet WCAG AA standards
- **Focus management**: Clear focus indicators and logical tab order
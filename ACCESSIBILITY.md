# Accessibility Standards & Compliance Guide

## Overview
This document outlines accessibility best practices and compliance strategies for the Mood Over Muscle fitness website, ensuring WCAG 2.1 AA compliance and inclusive user experience for people with disabilities.

## Accessibility Standards

### WCAG 2.1 Compliance
- **Level A**: Basic accessibility requirements
- **Level AA**: Standard compliance target
- **Level AAA**: Enhanced accessibility (where possible)

### Key Principles (POUR)
- **Perceivable**: Information must be presentable in ways users can perceive
- **Operable**: Interface components must be operable by all users
- **Understandable**: Information and UI operation must be understandable
- **Robust**: Content must be robust enough for various assistive technologies

## Accessibility Implementation

### 1. Semantic HTML Structure

#### Proper Document Structure
```html
<!-- Semantic HTML example -->
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/classes">Classes</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
</header>

<main>
  <h1>Mood Over Muscle - Prenatal & Postnatal Fitness</h1>
  
  <section aria-labelledby="classes-heading">
    <h2 id="classes-heading">Our Classes</h2>
    <article>
      <h3>Prenatal Yoga</h3>
      <p>Safe and gentle yoga for expectant mothers...</p>
    </article>
  </section>
</main>

<footer>
  <nav aria-label="Footer navigation">
    <!-- Footer links -->
  </nav>
</footer>
```

#### Landmark Regions
```typescript
// React component with landmarks
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header role="banner">
        <Navigation />
      </header>
      
      <main id="main-content" role="main">
        {children}
      </main>
      
      <footer role="contentinfo">
        <FooterContent />
      </footer>
    </>
  )
}
```

### 2. Keyboard Navigation

#### Focus Management
```typescript
// Custom hook for keyboard navigation
import { useEffect, useRef } from 'react'

export function useKeyboardNavigation() {
  const focusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        // Handle tab navigation
        const focusableElements = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        // Implement focus trap for modals
        if (event.shiftKey && document.activeElement === focusableElements[0]) {
          event.preventDefault()
          focusableElements[focusableElements.length - 1].focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}
```

#### Skip Links
```typescript
// Skip navigation component
export function SkipLinks() {
  return (
    <nav aria-label="Skip links" className="sr-only focus-within:not-sr-only">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#main-nav" className="skip-link">
        Skip to navigation
      </a>
    </nav>
  )
}
```

### 3. Screen Reader Support

#### ARIA Implementation
```typescript
// Accessible component example
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel?: string
  ariaDescribedBy?: string
}

export function AccessibleButton({ 
  children, 
  ariaLabel, 
  ariaDescribedBy, 
  ...props 
}: ButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}
```

#### Live Regions
```typescript
// Announce dynamic content changes
export function useAnnouncer() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }
  
  return { announce }
}
```

### 4. Color & Contrast

#### Color Palette Accessibility
```css
/* WCAG 2.1 AA compliant colors */
:root {
  /* Primary colors with sufficient contrast */
  --primary-600: #2563eb; /* 4.5:1 contrast on white */
  --primary-700: #1d4ed8; /* 7:1 contrast on white */
  
  /* Neutral colors */
  --gray-900: #111827; /* 12.6:1 on white */
  --gray-700: #374151; /* 7.5:1 on white */
  --gray-500: #6b7280; /* 4.5:1 on white */
  
  /* Success/error states */
  --success-600: #059669; /* 4.5:1 on white */
  --error-600: #dc2626; /* 5.7:1 on white */
}
```

#### Focus Indicators
```css
/* High contrast focus styles */
.focus-visible:focus {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.focus-visible:focus:not(:focus-visible) {
  outline: none;
}
```

### 5. Form Accessibility

#### Accessible Form Components
```typescript
// Accessible form field component
interface FormFieldProps {
  label: string
  id: string
  type?: string
  required?: boolean
  error?: string
  hint?: string
}

export function FormField({ 
  label, 
  id, 
  type = 'text', 
  required, 
  error, 
  hint 
}: FormFieldProps) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  
  return (
    <div className="form-field">
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span aria-label="required">*</span>}
      </label>
      
      {hint && (
        <div id={hintId} className="form-hint">
          {hint}
        </div>
      )}
      
      <input
        id={id}
        type={type}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={`${hint ? hintId : ''} ${error ? errorId : ''}`}
        className={error ? 'form-input error' : 'form-input'}
      />
      
      {error && (
        <div id={errorId} className="form-error" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}
```

#### Error Handling
```typescript
// Accessible error messages
export function FormError({ errors }: { errors: Record<string, string> }) {
  return (
    <div role="alert" aria-live="polite" className="error-summary">
      <h2 id="error-summary-title">There is a problem</h2>
      <ul>
        {Object.entries(errors).map(([field, message]) => (
          <li key={field}>
            <a href={`#${field}`}>{message}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### 6. Image Accessibility

#### Alt Text Guidelines
```typescript
// Image component with accessibility
interface AccessibleImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function AccessibleImage({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  priority = false 
}: AccessibleImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  )
}

// Decorative images
export function DecorativeImage({ src, ...props }: AccessibleImageProps) {
  return (
    <Image
      src={src}
      alt=""
      role="presentation"
      {...props}
    />
  )
}
```

### 7. Navigation & Structure

#### Breadcrumb Navigation
```typescript
// Accessible breadcrumb component
interface BreadcrumbItem {
  label: string
  href: string
  current?: boolean
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={index}>
            {item.current ? (
              <span aria-current="page">{item.label}</span>
            ) : (
              <a href={item.href}>{item.label}</a>
            )}
            {index < items.length - 1 && <span aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

### 8. Responsive Design

#### Mobile Accessibility
```css
/* Touch targets minimum 44x44px */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}

/* Focus visible on mobile */
@media (hover: none) and (pointer: coarse) {
  .touch-target:focus {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }
}
```

### 9. Animation & Motion

#### Reduced Motion Support
```typescript
// Respect user preferences
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return reducedMotion
}

// Usage in animations
const reducedMotion = useReducedMotion()
const animationDuration = reducedMotion ? 0 : 300
```

### 10. Testing Accessibility

#### Automated Testing
```typescript
// Jest accessibility tests
import { axe } from 'jest-axe'

describe('Accessibility Tests', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<BookingForm />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

#### Manual Testing Checklist
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators are visible
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG standards
- [ ] Form labels are properly associated
- [ ] Error messages are announced
- [ ] Skip links are functional
- [ ] Zoom functionality works (200%)
- [ ] Touch targets are adequate size
- [ ] Motion preferences are respected

## Accessibility Tools

### 1. Development Tools
- **axe-core**: Automated accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Accessibility audits
- **Pa11y**: Command-line accessibility testing

### 2. Browser Extensions
- **axe DevTools**: Chrome/Firefox extension
- **WAVE Evaluation Tool**: Browser extension
- **Accessibility Insights**: Microsoft tool
- **Color Contrast Analyzer**: Color checking tool

### 3. Screen Readers
- **NVDA**: Windows screen reader
- **JAWS**: Professional screen reader
- **VoiceOver**: macOS/iOS screen reader
- **TalkBack**: Android screen reader

## Accessibility Testing

### 1. Automated Testing
```bash
# Run accessibility tests
npm run test:a11y

# Check color contrast
npm run test:contrast

# Validate HTML
npm run test:html-validate
```

### 2. Manual Testing Process
1. **Keyboard Navigation**: Tab through entire site
2. **Screen Reader**: Test with NVDA/VoiceOver
3. **Color Contrast**: Check all color combinations
4. **Zoom Testing**: Test at 200% zoom
5. **Mobile Testing**: Touch target sizes
6. **Form Testing**: Error handling and announcements

### 3. User Testing
- **User Research**: Include users with disabilities
- **Feedback Collection**: Accessibility feedback form
- **Usability Testing**: Task-based testing sessions
- **Continuous Improvement**: Regular accessibility audits

## Compliance Standards

### WCAG 2.1 Guidelines
- **1.1 Text Alternatives**: Provide text alternatives for non-text content
- **1.2 Time-based Media**: Provide alternatives for time-based media
- **1.3 Adaptable**: Create content that can be presented in different ways
- **1.4 Distinguishable**: Make it easier for users to see and hear content
- **2.1 Keyboard Accessible**: Make all functionality available from keyboard
- **2.2 Enough Time**: Provide users enough time to read and use content
- **2.3 Seizures and Physical Reactions**: Don't design content that could cause seizures
- **2.4 Navigable**: Provide ways to help users navigate, find content, and determine where they are
- **2.5 Input Modalities**: Make it easier for users to operate functionality through various inputs
- **3.1 Readable**: Make text content readable and understandable
- **3.2 Predictable**: Make web pages appear and operate in predictable ways
- **3.3 Input Assistance**: Help users avoid and correct mistakes
- **4.1 Compatible**: Maximize compatibility with current and future user agents

### Legal Requirements
- **ADA Compliance**: Americans with Disabilities Act
- **Section 508**: Federal accessibility standards
- **AODA**: Accessibility for Ontarians with Disabilities Act
- **EN 301 549**: European accessibility standard

## Accessibility Roadmap

### Phase 1: Foundation (Current)
- [x] Semantic HTML structure
- [x] Keyboard navigation
- [x] Color contrast compliance
- [x] Form accessibility
- [x] Image alt text

### Phase 2: Enhancement (Next 3 months)
- [ ] Advanced ARIA implementation
- [ ] Screen reader optimization
- [ ] Mobile accessibility improvements
- [ ] Performance optimization for assistive tech
- [ ] User testing with disabled users

### Phase 3: Advanced (6 months)
- [ ] WCAG 2.1 AAA compliance where possible
- [ ] Advanced keyboard shortcuts
- [ ] Voice control support
- [ ] Braille display compatibility
- [ ] Multi-language accessibility

## Resources & References

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [Inclusive Components](https://inclusive-components.design/)

### Training
- [Web Accessibility Course](https://web.dev/learn/accessibility/)
- [Google Accessibility Training](https://developers.google.com/web/fundamentals/accessibility)
- [Deque University](https://dequeuniversity.com/)
- [A11y Project](https://www.a11yproject.com/)
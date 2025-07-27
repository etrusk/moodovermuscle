# Testing Strategy & Implementation Guide

## Overview
This document outlines the comprehensive testing strategy for the Mood Over Muscle fitness website, covering unit tests, integration tests, end-to-end tests, and performance testing to ensure high-quality, reliable software delivery.

## Testing Philosophy

### Quality Assurance Principles
- **Shift Left Testing**: Early and frequent testing
- **Test Pyramid**: Balanced test distribution
- **Continuous Testing**: Automated testing pipeline
- **User-Centric Testing**: Real-world scenario validation
- **Performance Testing**: Load and stress testing

## Testing Architecture

### 1. Testing Pyramid Structure

```
         /\
        /  \    E2E Tests (10%)
       /    \
      /      \
     /        \
    /__________\
   /            \
  /  Integration  \  (30%)
 /________________\
/                  \
/      Unit         \ (60%)
/___________________\
```

### 2. Test Types & Coverage

#### Unit Tests (60%)
- **Component Testing**: React component behavior
- **Utility Testing**: Helper function validation
- **Hook Testing**: Custom React hooks
- **Service Testing**: API service layer
- **Coverage Target**: 80% code coverage

#### Integration Tests (30%)
- **API Integration**: Backend endpoint testing
- **Database Integration**: Data layer testing
- **Third-party Integration**: External service testing
- **Component Integration**: Multi-component workflows

#### End-to-End Tests (10%)
- **User Journey Testing**: Critical user paths
- **Cross-browser Testing**: Browser compatibility
- **Mobile Testing**: Responsive design validation
- **Accessibility Testing**: WCAG compliance

## Testing Tools & Framework

### Core Testing Stack
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **Playwright**: E2E testing framework
- **Cypress**: Alternative E2E testing
- **MSW**: API mocking
- **Cucumber**: BDD testing (optional)

### Testing Utilities
- **@testing-library/jest-dom**: Custom DOM matchers
- **@testing-library/user-event**: User interaction simulation
- **jest-environment-jsdom**: DOM testing environment
- **cross-env**: Environment variable management

## Unit Testing Implementation

### 1. Component Testing

#### React Component Tests
```typescript
// components/__tests__/booking-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BookingForm } from '@/components/booking-form'
import userEvent from '@testing-library/user-event'

describe('BookingForm Component', () => {
  it('renders all form fields', () => {
    render(<BookingForm />)
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/class type/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<BookingForm />)
    
    const submitButton = screen.getByRole('button', { name: /book now/i })
    await user.click(submitButton)
    
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockSubmit = jest.fn()
    
    render(<BookingForm onSubmit={mockSubmit} />)
    
    await user.type(screen.getByLabelText(/name/i), 'Emily Johnson')
    await user.type(screen.getByLabelText(/email/i), 'emily@example.com')
    await user.type(screen.getByLabelText(/phone/i), '0412345678')
    await user.selectOptions(screen.getByLabelText(/class type/i), 'prenatal')
    
    await user.click(screen.getByRole('button', { name: /book now/i }))
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'Emily Johnson',
        email: 'emily@example.com',
        phone: '0412345678',
        classType: 'prenatal'
      })
    })
  })
})
```

### 2. Custom Hook Testing

```typescript
// hooks/__tests__/use-booking.test.ts
import { renderHook, act } from '@testing-library/react'
import { useBooking } from '@/hooks/use-booking'
import { server } from '@/mocks/server'
import { rest } from 'msw'

describe('useBooking Hook', () => {
  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useBooking())
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.bookings).toEqual([])
  })

  it('handles successful booking creation', async () => {
    const { result } = renderHook(() => useBooking())
    
    await act(async () => {
      await result.current.createBooking(mockBookingData)
    })
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.bookings).toContainEqual(mockBookingData)
  })

  it('handles booking creation failure', async () => {
    server.use(
      rest.post('/api/bookings', (req, res, ctx) => {
        return res(ctx.status(400), ctx.json({ error: 'Invalid booking data' }))
      })
    )
    
    const { result } = renderHook(() => useBooking())
    
    await act(async () => {
      await result.current.createBooking({ invalid: 'data' })
    })
    
    expect(result.current.error).toBe('Invalid booking data')
  })
})
```

### 3. Utility Function Testing

```typescript
// lib/__tests__/utils.test.ts
import { formatDate, validateEmail, calculatePrice } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-03-15')
      expect(formatDate(date)).toBe('15 March 2024')
    })
  })

  describe('validateEmail', () => {
    it('validates correct email format', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('invalid-email')).toBe(false)
    })
  })

  describe('calculatePrice', () => {
    it('calculates class price correctly', () => {
      expect(calculatePrice('prenatal', 1)).toBe(25)
      expect(calculatePrice('postnatal', 5)).toBe(100)
    })
  })
})
```

## Integration Testing

### 1. API Endpoint Testing

```typescript
// app/api/__tests__/booking.test.ts
import { POST } from '@/app/api/booking/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

describe('POST /api/booking', () => {
  beforeEach(async () => {
    await prisma.booking.deleteMany()
  })

  it('creates a new booking', async () => {
    const request = new NextRequest('http://localhost:3000/api/booking', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Emily Johnson',
        email: 'emily@example.com',
        phone: '0412345678',
        classType: 'prenatal',
        date: '2024-03-20',
        time: '10:00'
      })
    })

    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(201)
    expect(data.booking).toHaveProperty('id')
    expect(data.booking.name).toBe('Emily Johnson')
  })

  it('returns validation errors for invalid data', async () => {
    const request = new NextRequest('http://localhost:3000/api/booking', {
      method: 'POST',
      body: JSON.stringify({ invalid: 'data' })
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
```

### 2. Database Integration Testing

```typescript
// lib/__tests__/database.test.ts
import { prisma } from '@/lib/prisma'

describe('Database Integration', () => {
  beforeEach(async () => {
    await prisma.booking.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('creates and retrieves bookings', async () => {
    const booking = await prisma.booking.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '0412345678',
        classType: 'prenatal',
        date: new Date('2024-03-20'),
        time: '10:00'
      }
    })

    const retrieved = await prisma.booking.findUnique({
      where: { id: booking.id }
    })

    expect(retrieved).toBeTruthy()
    expect(retrieved?.name).toBe('Test User')
  })
})
```

## End-to-End Testing

### 1. Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 2. E2E Test Scenarios

```typescript
// e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Booking Flow', () => {
  test('user can complete booking journey', async ({ page }) => {
    await page.goto('/')
    
    // Navigate to classes page
    await page.getByRole('link', { name: /classes/i }).click()
    await expect(page).toHaveURL('/classes')
    
    // Select a class
    await page.getByRole('button', { name: /book prenatal class/i }).first().click()
    
    // Fill booking form
    await page.getByLabel('Name').fill('Emily Johnson')
    await page.getByLabel('Email').fill('emily@example.com')
    await page.getByLabel('Phone').fill('0412345678')
    await page.getByLabel('Class Type').selectOption('prenatal')
    await page.getByLabel('Preferred Date').fill('2024-03-20')
    
    // Submit booking
    await page.getByRole('button', { name: /book now/i }).click()
    
    // Verify success
    await expect(page.getByText(/booking confirmed/i)).toBeVisible()
    await expect(page.getByText(/emily johnson/i)).toBeVisible()
  })

  test('handles booking errors gracefully', async ({ page }) => {
    await page.goto('/classes')
    
    // Submit invalid form
    await page.getByRole('button', { name: /book now/i }).click()
    
    // Check error messages
    await expect(page.getByText(/name is required/i)).toBeVisible()
    await expect(page.getByText(/email is required/i)).toBeVisible()
  })
})
```

## Performance Testing

### 1. Load Testing

```typescript
// performance/load-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests under 1.5s
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
  },
}

export default function () {
  const response = http.get('https://moodovermuscle.com.au/api/classes')
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })
  
  sleep(1)
}
```

### 2. Lighthouse Performance Testing

```typescript
// performance/lighthouse.test.js
import lighthouse from 'lighthouse'
import chromeLauncher from 'chrome-launcher'

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] })
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  }

  const runnerResult = await lighthouse(url, options)
  await chrome.kill()

  return runnerResult.report
}
```

## Testing Pipeline

### 1. CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run unit tests
        run: pnpm test:unit --coverage
      
      - name: Run integration tests
        run: pnpm test:integration
      
      - name: Run E2E tests
        run: pnpm test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### 2. Test Commands

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=__tests__",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:performance": "k6 run performance/load-test.js",
    "test:security": "npm audit && snyk test"
  }
}
```

## Test Data Management

### 1. Test Data Strategy
- **Factories**: Test data generation
- **Fixtures**: Consistent test data
- **Mock Data**: API response mocking
- **Database Seeding**: Test database setup

### 2. Environment Configuration
```typescript
// test/setup.ts
import '@testing-library/jest-dom'
import { server } from '@/mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## Quality Gates

### 1. Pre-commit Hooks
```json
// .husky/pre-commit
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests"
    ]
  }
}
```

### 2. Definition of Done
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] E2E tests written and passing (if applicable)
- [ ] Code coverage > 80%
- [ ] Performance tests passing
- [ ] Security tests passing
- [ ] Accessibility tests passing
- [ ] Documentation updated
- [ ] Code review completed
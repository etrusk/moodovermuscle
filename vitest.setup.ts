// vitest.setup.ts
// Polyfill localStorage BEFORE any imports that trigger MSW module loading.
// MSW 2.x CookieStore calls localStorage.getItem() at import time.
// jsdom may provide a localStorage that lacks working methods.
if (typeof globalThis.localStorage?.getItem !== 'function') {
  const store = new Map<string, string>()
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value) },
    removeItem: (key: string) => { store.delete(key) },
    clear: () => { store.clear() },
    get length() { return store.size },
    key: (index: number) => [...store.keys()][index] ?? null,
  } as Storage
}

import { vi, beforeAll, afterAll, afterEach } from 'vitest'

// Set email environment variables for all tests
process.env.EMAIL_FROM = process.env.EMAIL_FROM || 'from@example.com'
process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'
process.env.SMTP_HOST = process.env.SMTP_HOST || 'smtp.example.com'
process.env.SMTP_PORT = process.env.SMTP_PORT || '587'
process.env.SMTP_USER = process.env.SMTP_USER || 'user'
process.env.SMTP_PASS = process.env.SMTP_PASS || 'pass'

// Mock the navigator object
const mockNavigator = {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  userAgent: 'vitest',
}

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
})

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'navigator', {
    value: mockNavigator,
    writable: true,
  })
}

// Polyfill NextResponse for Node.js environment
if (typeof (global as any).NextResponse === 'undefined') {
  (global as any).NextResponse = class NextResponse extends (global.Response as any) {
    constructor(body: any, init: any = {}) {
      super(body, init)
    }

    static json(data: any, init?: any) {
      const body = JSON.stringify(data)
      const headers = {
        ...init?.headers,
        'Content-Type': 'application/json',
      }
      return new NextResponse(body, { ...init, headers })
    }
  } as any
}

// Import testing library matchers
import '@testing-library/jest-dom/vitest'
import 'jest-axe/extend-expect'

// Mock nodemailer transporter for tests
vi.mock('nodemailer', () => {
  const sendMail = vi.fn().mockImplementation(() =>
    Promise.resolve({ messageId: `test-message-id-${Math.random()}` })
  )

  return {
    __esModule: true,
    default: {
      createTransport: vi.fn().mockReturnValue({
        sendMail,
        verify: vi.fn().mockResolvedValue(true),
      }),
    },
  }
})

// Mock next/router
vi.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn(),
      beforePopState: vi.fn(),
      events: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
      },
    }
  },
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    }
  },
  useSearchParams() {
    return {
      get: vi.fn(),
    }
  },
  usePathname() {
    return ''
  },
}))

// Mock NextResponse and NextRequest for Node.js environment integration tests
vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: (data: any, init?: any) => {
        const body = JSON.stringify(data)
        const headers = new Map(Object.entries(init?.headers || {}))
        
        const response = {
          json: () => Promise.resolve(data),
          status: init?.status || 200,
          statusText: init?.statusText || 'OK',
          headers: {
            get: (name: string) => headers.get(name.toLowerCase()),
            set: (name: string, value: string) => headers.set(name.toLowerCase(), value),
            has: (name: string) => headers.has(name.toLowerCase()),
            delete: (name: string) => headers.delete(name.toLowerCase()),
            entries: () => headers.entries(),
          },
          body,
          ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
          cookies: {
            set: (name: string, value: string, options?: any) => {
              // Create a cookie header
              const cookieParts = [`${name}=${value}`]
              if (options?.maxAge) cookieParts.push(`Max-Age=${options.maxAge}`)
              if (options?.path) cookieParts.push(`Path=${options.path}`)
              if (options?.httpOnly) cookieParts.push('HttpOnly')
              if (options?.secure) cookieParts.push('Secure')
              if (options?.sameSite) cookieParts.push(`SameSite=${options.sameSite}`)
              
              headers.set('set-cookie', cookieParts.join('; '))
            },
          }
        }
        
        return response
      },
    },
    NextRequest: class NextRequest extends (global.Request as any) {
      cookies: any
      
      constructor(input: string | Request, init?: any) {
        super(input, init)
        
        // Parse cookies from cookie header
        const cookieHeader = this.headers.get('cookie') || ''
        const cookieMap = new Map()
        
        if (cookieHeader) {
          cookieHeader.split(';').forEach((cookie: string) => {
            const [name, ...valueParts] = cookie.trim().split('=')
            if (name) {
              cookieMap.set(name, valueParts.join('='))
            }
          })
        }
        
        // Implement NextRequest cookies API
        this.cookies = {
          get: (name: string) => {
            const value = cookieMap.get(name)
            return value ? { name, value } : undefined
          },
          getAll: () => {
            return Array.from(cookieMap.entries()).map(([name, value]) => ({ name, value }))
          },
          set: (name: string, value: string) => {
            cookieMap.set(name, value)
          },
          delete: (name: string) => {
            cookieMap.delete(name)
          },
          has: (name: string) => {
            return cookieMap.has(name)
          }
        }
      }
    }
  }
})

// Mock window.matchMedia (only in jsdom environment)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() { return [] }
  root = null
  rootMargin = ''
  thresholds = []
} as any

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

// Mock scrollIntoView (only in jsdom environment)
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = vi.fn()
}

// React violation detection: Catch setState-during-render violations
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

global.console = {
  ...console,
  warn: vi.fn((message: any, ...args: any[]) => {
    // Still call original for debugging if needed
    // originalConsoleWarn.call(console, message, ...args)
  }),
  error: vi.fn((message: any, ...args: any[]) => {
    // Detect React state management violations
    if (typeof message === 'string') {
      if (message.includes('Cannot update a component') && message.includes('while rendering a different component')) {
        throw new Error(`React setState-during-render violation detected: ${message}`)
      }
      if (message.includes('Warning: Cannot update during an existing state transition')) {
        throw new Error(`React state transition violation detected: ${message}`)
      }
    }
    
    // Still call original for debugging if needed
    // originalConsoleError.call(console, message, ...args)
  }),
} as any

// Mock for target.hasPointerCapture
if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn() as any
}

// Polyfill for navigator
if (typeof navigator === 'undefined') {
  ;(global as any).navigator = {
    clipboard: {
      writeText: vi.fn(),
      readText: vi.fn(),
    },
  }
}

// Mock jose library to prevent Node.js compatibility issues
vi.mock('jose', () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue('mock-jwt-token'),
  })),
  // Mock jwtVerify with correct admin credentials that match lib/auth/admin-auth.ts
  jwtVerify: vi.fn().mockResolvedValue({
    payload: {
      adminId: 'emily-admin-1',
      email: 'emily@moodovermuscle.com.au',
      name: 'Emilia',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
  }),
}))

// Mock bcryptjs to prevent Node.js compatibility issues
vi.mock('bcryptjs', () => ({
  compare: vi.fn().mockResolvedValue(true),
  hash: vi.fn().mockResolvedValue('mock-hashed-password'),
}))

// Mock CSS style parsing to fix JSDOM CSS custom properties issue
// This prevents "Cannot create property 'border-width' on string" errors
if (typeof global !== 'undefined') {
  const originalSetProperty = global.CSSStyleDeclaration?.prototype?.setProperty
  if (originalSetProperty && global.CSSStyleDeclaration) {
    global.CSSStyleDeclaration.prototype.setProperty = function(property: string, value: string | null, priority?: string) {
      // Skip CSS custom properties in border shorthand that JSDOM can't parse
      if (value && typeof value === 'string' && value.includes('var(--')) {
        // Replace CSS custom properties with static values for testing
        value = value.replace(/hsl\(var\(--[^)]+\)\)/g, 'rgb(0, 0, 0)')
        value = value.replace(/var\(--[^)]+\)/g, '0')
      }
      return originalSetProperty.call(this, property, value, priority)
    }
  }
}
// jest.setup.js

// Mock the navigator object
const mockNavigator = {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue(''),
  },
  userAgent: 'jest',
  // Add any other properties your tests might need
};

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'navigator', {
    value: mockNavigator,
    writable: true,
  });
}

import 'whatwg-fetch'
import { TextEncoder, TextDecoder } from 'util';

if (typeof setImmediate === 'undefined') {
  global.setImmediate = (callback, ...args) => setTimeout(callback, 0, ...args);
}

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill BroadcastChannel for Node.js environment
if (typeof global.BroadcastChannel === 'undefined') {
  global.BroadcastChannel = class BroadcastChannel {
    constructor(name) {
      this.name = name
    }

    postMessage(_message) {
      // Mock implementation for tests
    }

    close() {
      // Mock implementation for tests
    }

    addEventListener(_type, _listener) {
      // Mock implementation for tests
    }

    removeEventListener(_type, _listener) {
      // Mock implementation for tests
    }
  }
}

// Polyfill TransformStream for Node.js environment
if (typeof global.TransformStream === 'undefined') {
  global.TransformStream = class TransformStream {
    constructor(_transformer = {}) {
      this.readable = new ReadableStream()
      this.writable = new WritableStream()
    }
  }
}

// Polyfill ReadableStream for Node.js environment
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = class ReadableStream {
    constructor(_underlyingSource = {}) {
      this.locked = false
    }

    getReader() {
      return {
        read: () => Promise.resolve({ done: true, value: undefined }),
        releaseLock: () => {},
        cancel: () => Promise.resolve(),
      }
    }

    cancel() {
      return Promise.resolve()
    }
  }
}

// Polyfill WritableStream for Node.js environment
if (typeof global.WritableStream === 'undefined') {
  global.WritableStream = class WritableStream {
    constructor(_underlyingSink = {}) {
      this.locked = false
    }

    getWriter() {
      return {
        write: () => Promise.resolve(),
        close: () => Promise.resolve(),
        abort: () => Promise.resolve(),
        releaseLock: () => {},
      }
    }

    abort() {
      return Promise.resolve()
    }
  }
}

// Polyfill Response for Node.js environment
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body
      this.status = init.status || 200
      this.statusText = init.statusText || 'OK'
      this.headers = new Map(Object.entries(init.headers || {}))
      this.ok = this.status >= 200 && this.status < 300
      this.redirected = false
      this.type = 'basic'
      this.url = ''
    }

    static json(data, init) {
      const body = JSON.stringify(data)
      const headers = {
        ...init?.headers,
        'Content-Type': 'application/json',
      }
      return new Response(body, { ...init, headers })
    }

    json() {
      return Promise.resolve(
        typeof this.body === 'string' ? JSON.parse(this.body) : this.body
      )
    }

    text() {
      return Promise.resolve(
        typeof this.body === 'string' ? this.body : JSON.stringify(this.body)
      )
    }

    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(0))
    }

    blob() {
      return Promise.resolve(new Blob([this.body]))
    }

    clone() {
      return new Response(this.body, {
        status: this.status,
        statusText: this.statusText,
        headers: Object.fromEntries(this.headers),
      })
    }
  }
}

// Polyfill NextResponse for Node.js environment
if (typeof global.NextResponse === 'undefined') {
  global.NextResponse = class NextResponse extends global.Response {
    constructor(body, init = {}) {
      super(body, init)
    }

    static json(data, init) {
      const body = JSON.stringify(data)
      const headers = {
        ...init?.headers,
        'Content-Type': 'application/json',
      }
      return new NextResponse(body, { ...init, headers })
    }
  }
}

// Polyfill Request for Node.js environment
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      const url = typeof input === 'string' ? input : input.url
      try {
        this.url = url
      } catch {
        // This can fail if the input is a NextRequest, which has a read-only URL.
        // In such cases, we can ignore the error.
      }
      this.method = init.method || 'GET'
      this.headers = new Headers(init.headers)
      this.body = init.body || null
    }

    json() {
      return Promise.resolve(
        typeof this.body === 'string' ? JSON.parse(this.body) : this.body,
      )
    }

    text() {
      return Promise.resolve(
        typeof this.body === 'string' ? this.body : JSON.stringify(this.body),
      )
    }

    clone() {
      return new Request(this.url, {
        method: this.method,
        headers: this.headers,
        body: this.body,
      })
    }
  }
}

// Polyfill Headers for Node.js environment
if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this.map = new Map(Object.entries(init))
    }

    get(name) {
      return this.map.get(name.toLowerCase())
    }

    set(name, value) {
      this.map.set(name.toLowerCase(), value)
    }

    has(name) {
      return this.map.has(name.toLowerCase())
    }

    delete(name) {
      this.map.delete(name.toLowerCase())
    }

    entries() {
      return this.map.entries()
    }

    keys() {
      return this.map.keys()
    }

    values() {
      return this.map.values()
    }

    [Symbol.iterator]() {
      return this.map[Symbol.iterator]()
    }
  }
}

// jest.setup.js
import '@testing-library/jest-dom'
import 'jest-axe/extend-expect'

// Mock fetch globally
// MSW will handle fetch mocking, so the global mock is no longer needed.

// Mock nodemailer transporter for tests
jest.mock('nodemailer', () => {
  const sendMail = jest.fn().mockImplementation(() =>
    Promise.resolve({ messageId: `test-message-id-${Math.random()}` })
  );

  return {
    __esModule: true,
    default: {
      createTransport: jest.fn().mockReturnValue({
        sendMail,
        verify: jest.fn().mockResolvedValue(true),
      }),
    },
  };
});

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
}))

// Mock NextResponse for Node.js environment integration tests
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => {
      const body = JSON.stringify(data)
      return {
        json: () => Promise.resolve(data),
        status: init?.status || 200,
        statusText: init?.statusText || 'OK',
        headers: new Map(Object.entries(init?.headers || {})),
        body,
        ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
      }
    },
  },
}))

// Mock window.matchMedia (only in jsdom environment)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock scrollIntoView (only in jsdom environment)
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = jest.fn()
}

// React violation detection: Catch setState-during-render violations
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

global.console = {
  ...console,
  warn: jest.fn((message, ...args) => {
    // Still call original for debugging if needed
    // originalConsoleWarn.call(console, message, ...args)
  }),
  error: jest.fn((message, ...args) => {
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
}

// MSW setup is now handled in a separate file (__tests__/setup/msw-setup.js)
// This ensures polyfills are loaded before MSW is imported

// Mock for target.hasPointerCapture
if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.hasPointerCapture = jest.fn();
}

// Polyfill for navigator
if (typeof navigator === 'undefined') {
  global.navigator = {
    clipboard: {
      writeText: jest.fn(),
      readText: jest.fn(),
    },
  };
}

// Mock jose library to prevent Node.js compatibility issues
jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock-jwt-token'),
  })),
  jwtVerify: jest.fn().mockResolvedValue({
    payload: {
      adminId: 'test-admin-id',
      email: 'admin@test.com',
      name: 'Test Admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
  }),
}))

// Mock bcryptjs to prevent Node.js compatibility issues
jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('mock-hashed-password'),
}))

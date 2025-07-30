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

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}
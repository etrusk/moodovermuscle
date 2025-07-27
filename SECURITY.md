# Security Best Practices Guide

## Overview
This document outlines security best practices and implementation strategies for the Mood Over Muscle fitness website, ensuring protection against common web vulnerabilities and compliance with industry standards.

## Security Architecture

### 1. Application Security

#### Input Validation & Sanitization
```typescript
// Zod schema validation
import { z } from 'zod'

const bookingSchema = z.object({
  name: z.string().min(2).max(50).regex(/^[a-zA-Z\s]+$/),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[0-9\s-()]{10,}$/),
  classType: z.enum(['prenatal', 'postnatal', 'strength', 'yoga']),
  date: z.date().min(new Date()),
  message: z.string().max(500).optional()
})

// Server-side validation
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = bookingSchema.parse(body)
    // Process validated data
  } catch (error) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
}
```

#### XSS Prevention
- **React Built-in Protection**: Automatic escaping of JSX
- **Content Security Policy**: Strict CSP headers
- **Input Sanitization**: DOMPurify for rich text content
- **URL Validation**: Safe URL handling

#### SQL Injection Prevention
- **Parameterized Queries**: Using Prisma ORM
- **Input Validation**: Strict type checking
- **Query Builder**: Safe database interactions

### 2. Authentication & Authorization

#### NextAuth.js Implementation
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist user data
      return token
    },
    async session({ session, token }) {
      // Send properties to client
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
})
```

#### Role-Based Access Control
```typescript
// Middleware for protected routes
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('next-auth.session-token')
  
  if (!token && request.nextpathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
  
  return NextResponse.next()
}
```

### 3. HTTPS & SSL Configuration

#### Security Headers
```typescript
// next.config.mjs
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: *.gravatar.com; font-src 'self' data:; connect-src 'self' *.googleapis.com *.analytics.google.com"
  }
]

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

### 4. Data Protection

#### Encryption Standards
- **HTTPS**: TLS 1.3 for all communications
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: RS256 algorithm
- **Database Encryption**: AES-256 for sensitive data

#### Sensitive Data Handling
```typescript
// Environment variables validation
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  SENTRY_DSN: z.string().url().optional(),
})

// Sanitize sensitive data
export function sanitizeUser(user: User) {
  const { password, ...safeUser } = user
  return safeUser
}
```

### 5. API Security

#### Rate Limiting
```typescript
// Rate limiting middleware
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
})
```

#### API Security Headers
```typescript
// API route security
export async function POST(request: Request) {
  // CORS handling
  const origin = request.headers.get('origin')
  const allowedOrigins = ['https://moodovermuscle.com.au']
  
  if (!allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // CSRF protection
  const csrfToken = request.headers.get('x-csrf-token')
  if (!csrfToken || !isValidCSRFToken(csrfToken)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }

  // Process request
}
```

### 6. Security Monitoring

#### Vulnerability Scanning
- **OWASP ZAP**: Automated security testing
- **Snyk**: Dependency vulnerability scanning
- **GitHub Security**: Code scanning alerts
- **Dependabot**: Automated security updates

#### Logging & Monitoring
```typescript
// Security event logging
export function logSecurityEvent(event: SecurityEvent) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventType: event.type,
    userId: event.userId,
    ipAddress: event.ip,
    userAgent: event.userAgent,
    details: event.details
  }
  
  // Send to security monitoring service
  logger.warn('Security event', logEntry)
}
```

### 7. Compliance & Standards

#### GDPR Compliance
- **Data Minimization**: Collect only necessary data
- **Right to Access**: User data export functionality
- **Right to Erasure**: Data deletion capabilities
- **Consent Management**: Cookie consent banner
- **Privacy Policy**: Clear data handling practices

#### Accessibility Security
- **Screen Reader Security**: Prevent sensitive data exposure
- **Keyboard Navigation**: Secure keyboard shortcuts
- **Focus Management**: Prevent focus hijacking

### 8. Infrastructure Security

#### Server Security
- **Vercel Security**: Built-in DDoS protection
- **Environment Variables**: Secure secret management
- **Database Security**: Connection encryption
- **Backup Strategy**: Regular encrypted backups

#### Network Security
- **Firewall Rules**: IP whitelisting for admin access
- **VPN Access**: Secure admin panel access
- **SSL/TLS**: Certificate management and renewal

### 9. Incident Response

#### Security Incident Plan
1. **Detection**: Automated monitoring alerts
2. **Assessment**: Impact analysis and classification
3. **Containment**: Isolate affected systems
4. **Investigation**: Root cause analysis
5. **Recovery**: System restoration and verification
6. **Communication**: Stakeholder notification
7. **Lessons Learned**: Process improvement

#### Emergency Contacts
- **Security Team**: security@moodovermuscle.com.au
- **Hosting Provider**: Vercel support
- **Domain Registrar**: Emergency contact
- **Payment Processor**: Stripe support

### 10. Security Testing

#### Penetration Testing
- **Quarterly Tests**: External security audits
- **Annual Reviews**: Comprehensive security assessment
- **Bug Bounty Program**: Responsible disclosure program

#### Security Checklist
- [ ] Input validation implemented
- [ ] XSS protection enabled
- [ ] SQL injection prevention
- [ ] Authentication system secure
- [ ] HTTPS configured
- [ ] Security headers set
- [ ] Rate limiting implemented
- [ ] Monitoring enabled
- [ ] Incident response plan ready
- [ ] Regular security updates

## Security Tools & Resources

### Development Tools
- **OWASP Cheat Sheets**: Security best practices
- **Security Headers**: Online security header checker
- **SSL Labs**: SSL configuration testing
- **Mozilla Observatory**: Security assessment tool

### Monitoring Services
- **Sentry**: Error tracking and security monitoring
- **Cloudflare**: DDoS protection and security
- **Have I Been Pwned**: Breach monitoring
- **Google Search Console**: Security issue alerts

## Security Training

### Developer Guidelines
- **Secure Coding Practices**: Regular training sessions
- **Security Reviews**: Code review security checklist
- **Threat Modeling**: Regular security assessments
- **Stay Updated**: Security news and advisories

### User Education
- **Password Security**: Strong password requirements
- **Phishing Awareness**: User education materials
- **Privacy Settings**: User control over data
- **Security Updates**: Regular communication
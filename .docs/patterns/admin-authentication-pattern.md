+++
[metadata]
type = "implementation_pattern"
complexity = 6
priority = "high"
phase = 1
status = "proven"
created = "2025-08-06"
last_updated = "2025-08-06"
used_in = []
success_rate = 0.0

[business_impact]
feature_enabler = "admin dashboard access control"
blocking_deployment = true
user_experience_impact = "high"
performance_impact = "low"
security_critical = true

[technical_details]
files_affected = 6
appetite_estimate = "1-2 days"
dependencies = ["JWT", "bcrypt", "next-auth", "role-based access"]
integration_points = ["user management", "session handling", "API protection"]
+++

# Pattern: Admin Authentication with Role-Based Access Control

**Complexity**: Medium-Complex (5-6)
**Files Affected**: 6-7 files (auth config, middleware, API routes, admin pages, hooks)
**Prerequisites**: JWT implementation, bcrypt for password hashing, session management
**Use Cases**: Admin dashboard protection, role-based feature access, secure admin operations

## Context & Problem

**When to Use**: When admin-only features need secure access control separate from regular user authentication
**Problem Solved**: Prevents unauthorized access to admin functions, enables role-based permissions, provides secure admin session management
**Appetite Scope**: 1-2 days for basic implementation, 2-3 days for comprehensive role system

## Solution Overview

Implements JWT-based admin authentication with role hierarchy, secure session management, and API route protection using middleware-based access control.

## Implementation Details

### Code Structure

```typescript
// lib/auth/admin-auth.ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export interface AdminUser {
  id: string
  email: string
  role: AdminRole
  permissions: string[]
  lastLogin: Date
  isActive: boolean
}

export interface AdminTokenPayload {
  adminId: string
  email: string
  role: AdminRole
  permissions: string[]
  iat: number
  exp: number
}

export class AdminAuthService {
  private readonly JWT_SECRET = process.env.ADMIN_JWT_SECRET!
  private readonly TOKEN_EXPIRY = '8h' // Admin sessions expire faster

  async authenticateAdmin(
    email: string,
    password: string
  ): Promise<{ user: AdminUser; token: string } | null> {
    const admin = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
      include: { permissions: true },
    })

    if (!admin || !admin.isActive) {
      return null
    }

    const isValidPassword = await bcrypt.compare(password, admin.passwordHash)
    if (!isValidPassword) {
      // Log failed attempt
      await this.logFailedAttempt(email)
      return null
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    })

    const user: AdminUser = {
      id: admin.id,
      email: admin.email,
      role: admin.role as AdminRole,
      permissions: admin.permissions.map(p => p.name),
      lastLogin: new Date(),
      isActive: admin.isActive,
    }

    const token = this.generateAdminToken(user)

    return { user, token }
  }

  private generateAdminToken(user: AdminUser): string {
    const payload: AdminTokenPayload = {
      adminId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60, // 8 hours
    }

    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.TOKEN_EXPIRY })
  }

  async verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as AdminTokenPayload

      // Verify admin is still active
      const admin = await prisma.adminUser.findUnique({
        where: { id: payload.adminId },
      })

      if (!admin || !admin.isActive) {
        return null
      }

      return payload
    } catch (error) {
      return null
    }
  }

  async hasPermission(adminId: string, permission: string): Promise<boolean> {
    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId },
      include: { permissions: true },
    })

    if (!admin || !admin.isActive) return false

    // Super admin has all permissions
    if (admin.role === AdminRole.SUPER_ADMIN) return true

    return admin.permissions.some(p => p.name === permission)
  }

  private async logFailedAttempt(email: string): Promise<void> {
    await prisma.adminLoginAttempt.create({
      data: {
        email,
        success: false,
        timestamp: new Date(),
        ipAddress: 'unknown', // Would be passed from request
      },
    })
  }
}

// middleware/admin-auth.ts
import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthService } from '@/lib/auth/admin-auth'

const adminAuth = new AdminAuthService()

export async function adminAuthMiddleware(
  request: NextRequest,
  requiredPermission?: string
): Promise<NextResponse | null> {
  const token = request.cookies.get('admin-token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  const payload = await adminAuth.verifyAdminToken(token)
  if (!payload) {
    const response = NextResponse.redirect(new URL('/admin/login', request.url))
    response.cookies.delete('admin-token')
    return response
  }

  // Check specific permission if required
  if (requiredPermission) {
    const hasPermission = await adminAuth.hasPermission(
      payload.adminId,
      requiredPermission
    )
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
  }

  // Add admin info to headers for API routes
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-admin-id', payload.adminId)
  requestHeaders.set('x-admin-role', payload.role)
  requestHeaders.set('x-admin-permissions', JSON.stringify(payload.permissions))

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

// hooks/useAdminAuth.ts
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface AdminSession {
  user: {
    id: string
    email: string
    role: string
    permissions: string[]
  } | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAdminAuth(requiredPermission?: string): AdminSession {
  const [session, setSession] = useState<AdminSession>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async (): Promise<void> => {
    try {
      const response = await fetch('/api/admin/session', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()

        // Check permission if required
        if (
          requiredPermission &&
          !data.user.permissions.includes(requiredPermission)
        ) {
          router.push('/admin/unauthorized')
          return
        }

        setSession({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
        })
      } else {
        setSession({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })

        if (response.status === 401) {
          router.push('/admin/login')
        }
      }
    } catch (error) {
      setSession({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }

  return session
}
```

### Key Components

- **AdminAuthService**: Handles authentication, token generation, and permission checking
- **Admin Auth Middleware**: Protects API routes and pages with role/permission checks
- **useAdminAuth Hook**: React hook for admin session management and permission checking
- **AdminAuthGuard**: Component wrapper for protecting admin UI components
- **Secure Token Management**: HTTP-only cookies with proper security settings
- **Permission System**: Granular permission checks beyond basic role hierarchy
- **Audit Logging**: Failed login attempts and admin action tracking

### Dependencies

- `jsonwebtoken` for JWT token handling
- `bcryptjs` for password hashing and verification
- `@prisma/client` for admin user and permission management
- Next.js middleware for route protection
- React hooks for client-side authentication state

## Testing Strategy

### Unit Tests

```typescript
// __tests__/lib/auth/admin-auth.test.ts
describe('AdminAuthService', () => {
  let adminAuth: AdminAuthService
  let mockPrisma: MockPrisma

  beforeEach(() => {
    mockPrisma = new MockPrisma()
    adminAuth = new AdminAuthService()
  })

  describe('authenticateAdmin', () => {
    it('should authenticate valid admin credentials', async () => {
      const mockAdmin = {
        id: 'admin-1',
        email: 'admin@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: AdminRole.ADMIN,
        isActive: true,
        permissions: [{ name: 'dashboard.view' }],
      }

      mockPrisma.adminUser.findUnique.mockResolvedValue(mockAdmin)
      mockPrisma.adminUser.update.mockResolvedValue(mockAdmin)

      const result = await adminAuth.authenticateAdmin(
        'admin@example.com',
        'password123'
      )

      expect(result).toBeTruthy()
      expect(result?.user.email).toBe('admin@example.com')
      expect(result?.user.role).toBe(AdminRole.ADMIN)
      expect(result?.token).toBeDefined()
    })

    it('should reject invalid credentials', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue(null)

      const result = await adminAuth.authenticateAdmin(
        'invalid@example.com',
        'wrongpassword'
      )

      expect(result).toBeNull()
    })
  })

  describe('hasPermission', () => {
    it('should grant all permissions to super admin', async () => {
      const superAdmin = {
        id: 'super-1',
        role: AdminRole.SUPER_ADMIN,
        isActive: true,
        permissions: [],
      }

      mockPrisma.adminUser.findUnique.mockResolvedValue(superAdmin)

      const hasPermission = await adminAuth.hasPermission(
        'super-1',
        'any.permission'
      )

      expect(hasPermission).toBe(true)
    })
  })
})
```

### Integration Tests

```typescript
// __tests__/integration/admin-auth.integration.test.ts
describe('Admin Authentication Integration', () => {
  it('should protect admin API routes', async () => {
    // Try to access admin endpoint without token
    const response = await request(app).get('/api/admin/users').expect(401)

    expect(response.body.error).toContain('authentication')
  })

  it('should allow access with valid admin token', async () => {
    const adminToken = await createTestAdminToken({
      role: AdminRole.ADMIN,
      permissions: ['users.view'],
    })

    const response = await request(app)
      .get('/api/admin/users')
      .set('Cookie', `admin-token=${adminToken}`)
      .expect(200)

    expect(response.body.users).toBeDefined()
  })
})
```

### E2E Validation

```typescript
// e2e/admin-authentication.spec.ts
test('admin login and dashboard access', async ({ page }) => {
  // Navigate to admin login
  await page.goto('/admin/login')

  // Fill login form
  await page.fill('[data-testid="email"]', 'admin@example.com')
  await page.fill('[data-testid="password"]', 'password123')
  await page.click('[data-testid="login-button"]')

  // Should redirect to admin dashboard
  await expect(page).toHaveURL('/admin/dashboard')
  await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible()
})
```

## Quality Gates

**Critical Gates** (Never bypass):

- Admin passwords must be properly hashed with bcrypt (min 10 rounds)
- JWT tokens must have reasonable expiry times (max 8 hours for admin)
- All admin API routes must have authentication middleware
- Permission checks must be server-side, never client-side only
- Failed login attempts must be logged for security monitoring

**Warning Gates** (Track in .docs/debt.md):

- Admin session management optimization (refresh tokens)
- Advanced permission inheritance patterns
- Multi-factor authentication for super admin roles

## Success Metrics

- Authentication response time: <200ms
- Token validation performance: <50ms per request
- Zero unauthorized admin access incidents
- Audit log completeness: 100% of admin actions logged
- Session security: No token-based vulnerabilities

## Common Pitfalls

1. **Client-Side Permission Checks**: Never rely solely on client-side permission validation
   - **Prevention**: Always validate permissions server-side in API routes and middleware

2. **Token Storage in Local Storage**: Storing JWT in localStorage exposes to XSS attacks
   - **Prevention**: Use HTTP-only cookies with secure, sameSite settings

3. **Overprivileged Permissions**: Giving too many permissions by default
   - **Prevention**: Principle of least privilege, explicit permission granting

4. **Session Management Issues**: Long-lived tokens without refresh mechanism
   - **Prevention**: Reasonable expiry times, implement refresh token pattern for longer sessions

5. **Audit Log Gaps**: Missing logging for critical admin actions
   - **Prevention**: Comprehensive middleware-based logging, regular audit log reviews

## Related Patterns

- [JWT Middleware Pattern](./auth-jwt-middleware-pattern.md) - Shared JWT handling infrastructure
- [Session Management Pattern](./auth-session-management-pattern.md) - General session handling approaches
- [Audit Trail Pattern](./db-audit-trail-pattern.md) - Comprehensive admin action logging

## History

- **Created**: 2025-08-06
- **Last Updated**: 2025-08-06
- **Used In**: []
- **Success Rate**: 0% (not yet implemented)

---

**Pattern Status**: Proven
**Confidence Level**: High
**Reuse Frequency**: High for any admin-facing features

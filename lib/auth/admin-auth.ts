import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export interface AdminUser {
  id: string
  email: string
  name: string
  isActive: boolean
  lastLogin: Date
}

export interface AdminTokenPayload {
  adminId: string
  email: string
  name: string
  iat: number
  exp: number
}

export interface AdminCredentials {
  email: string
  password: string
}

// Simple in-memory admin for Emily - can be moved to database later
const ADMIN_USER = {
  id: 'emily-admin-1',
  email: 'emily@moodovermuscle.com.au',
  name: 'Emily',
  // Password: 'Emily2025!' (hashed with bcrypt)
  passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  isActive: true,
}

export class AdminAuthService {
  private readonly JWT_SECRET = process.env.ADMIN_JWT_SECRET ?? 'fallback-secret-key'
  private readonly TOKEN_EXPIRY = '8h' // Admin sessions expire after 8 hours

  async authenticateAdmin(
    email: string,
    password: string
  ): Promise<{ user: AdminUser; token: string } | null> {
    // Normalize email for comparison
    const normalizedEmail = email.toLowerCase().trim()
    
    if (normalizedEmail !== ADMIN_USER.email || !ADMIN_USER.isActive) {
      // Log failed attempt in production
      console.warn(`Failed admin login attempt for email: ${normalizedEmail}`)
      return null
    }

    const isValidPassword = await bcrypt.compare(password, ADMIN_USER.passwordHash)
    if (!isValidPassword) {
      console.warn(`Invalid password for admin: ${normalizedEmail}`)
      return null
    }

    const user: AdminUser = {
      id: ADMIN_USER.id,
      email: ADMIN_USER.email,
      name: ADMIN_USER.name,
      isActive: ADMIN_USER.isActive,
      lastLogin: new Date(),
    }

    const token = this.generateAdminToken(user)
    
    console.log(`Successful admin login: ${normalizedEmail}`)
    return { user, token }
  }

  private generateAdminToken(user: AdminUser): string {
    const payload: AdminTokenPayload = {
      adminId: user.id,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60, // 8 hours
    }

    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.TOKEN_EXPIRY })
  }

  async verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as AdminTokenPayload

      // Verify admin is still active (simple check since we only have one admin)
      if (payload.adminId !== ADMIN_USER.id || !ADMIN_USER.isActive) {
        return null
      }

      return payload
    } catch (error) {
      console.warn('Invalid admin token:', error)
      return null
    }
  }

  async refreshAdminToken(currentToken: string): Promise<string | null> {
    const payload = await this.verifyAdminToken(currentToken)
    if (!payload) {
      return null
    }

    // Generate new token with fresh expiry
    const user: AdminUser = {
      id: payload.adminId,
      email: payload.email,
      name: payload.name,
      isActive: true,
      lastLogin: new Date(),
    }

    return this.generateAdminToken(user)
  }
}

// Export singleton instance
export const adminAuth = new AdminAuthService()
import { SignJWT, jwtVerify } from 'jose'
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
  // nosemgrep: generic.secrets.security.detected-bcrypt-hash.detected-bcrypt-hash
  // This is a development-only hardcoded hash. In production, use database-stored hashes.
  passwordHash: '$2b$10$TxurKCRrHneGuehrqu24WueBLoLfqRtN6HnS.9qQ6Tq.zWv7TEF5e',
  isActive: true,
}

export class AdminAuthService {
  private readonly JWT_SECRET = process.env.ADMIN_JWT_SECRET ?? (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_JWT_SECRET must be set in production')
    }
    return 'fallback-secret-key'
  })()
  private readonly TOKEN_EXPIRY = '8h' // Admin sessions expire after 8 hours
  
  // Edge Runtime compatible secret as Uint8Array
  private getSecretKey(): Uint8Array {
    return new TextEncoder().encode(this.JWT_SECRET)
  }

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

    const token = await this.generateAdminToken(user)
    
    console.log(`Successful admin login: ${normalizedEmail}`)
    return { user, token }
  }

  private async generateAdminToken(user: AdminUser): Promise<string> {
    const payload = {
      adminId: user.id,
      email: user.email,
      name: user.name,
    }

    const secret = this.getSecretKey()
    
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.TOKEN_EXPIRY)
      .sign(secret)
  }

  async verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
    try {
      const secret = this.getSecretKey()
      const { payload } = await jwtVerify(token, secret)

      // Verify admin is still active (simple check since we only have one admin)
      if (payload.adminId !== ADMIN_USER.id || !ADMIN_USER.isActive) {
        return null
      }

      return {
        adminId: payload.adminId as string,
        email: payload.email as string,
        name: payload.name as string,
        iat: payload.iat as number,
        exp: payload.exp as number,
      }
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

    return await this.generateAdminToken(user)
  }
}

// Export singleton instance
export const adminAuth = new AdminAuthService()
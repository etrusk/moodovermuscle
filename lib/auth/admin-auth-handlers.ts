import { adminAuth } from './admin-auth'
import { z } from 'zod'

// Request/Response Interfaces (no Next.js dependencies)
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResult {
  success: boolean
  user?: {
    id: string
    email: string
    name: string
  }
  token?: string
  error?: string
  validationErrors?: Array<{
    path: (string | number)[]
    message: string
  }>
}

export interface SessionValidationResult {
  valid: boolean
  user?: {
    id: string
    email: string
    name: string
  }
  error?: string
}

// Validation Schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
})

/**
 * Pure business logic for admin login
 * No Next.js dependencies - fully testable
 * 
 * @param request - Login credentials
 * @returns LoginResult with success status, user data, and token
 */
export async function handleLogin(
  request: LoginRequest
): Promise<LoginResult> {
  // Validate request body
  const validationResult = loginSchema.safeParse(request)
  if (!validationResult.success) {
    return {
      success: false,
      error: 'Invalid input',
      validationErrors: validationResult.error.issues.map((issue) => ({
        // zod 4 widened issue.path to PropertyKey[]; these schemas never key on
        // symbols, so narrow back to the string|number path this API returns.
        path: issue.path.filter(
          (segment): segment is string | number => typeof segment !== 'symbol'
        ),
        message: issue.message,
      })),
    }
  }

  const { email, password } = validationResult.data

  // Authenticate admin
  const authResult = await adminAuth.authenticateAdmin(email, password)

  if (!authResult) {
    return {
      success: false,
      error: 'Invalid email or password',
    }
  }

  const { user, token } = authResult

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
  }
}

/**
 * Pure business logic for session validation
 * No Next.js dependencies - fully testable
 * 
 * @param token - JWT token to validate
 * @returns SessionValidationResult with validity status and user data
 */
export async function handleSessionValidation(
  token: string | undefined
): Promise<SessionValidationResult> {
  if (!token) {
    return {
      valid: false,
      error: 'No admin session found',
    }
  }

  const payload = await adminAuth.verifyAdminToken(token)
  if (!payload) {
    return {
      valid: false,
      error: 'Invalid or expired session',
    }
  }

  return {
    valid: true,
    user: {
      id: payload.adminId,
      email: payload.email,
      name: payload.name,
    },
  }
}
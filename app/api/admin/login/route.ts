import { NextRequest, NextResponse } from 'next/server'
import { handleLogin } from '@/lib/auth/admin-auth-handlers'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    
    // Delegate business logic to pure handler
    const result = await handleLogin(body)

    // Handle validation errors
    if (!result.success && result.validationErrors) {
      return NextResponse.json(
        {
          error: result.error,
          details: result.validationErrors
        },
        { status: 400 }
      )
    }

    // Handle authentication failure
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    // Success - create response with secure cookie
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: result.user
      },
      { status: 200 }
    )

    // Set HTTP-only cookie for security
    if (result.token) {
      response.cookies.set('admin-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/',
      })
    }

    return response

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
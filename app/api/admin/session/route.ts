import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/auth/admin-auth'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No admin session found' },
        { status: 401 }
      )
    }

    const payload = await adminAuth.verifyAdminToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Return admin session info
    return NextResponse.json(
      {
        user: {
          id: payload.adminId,
          email: payload.email,
          name: payload.name,
        },
        isAuthenticated: true,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Admin session check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest): Promise<NextResponse> {
  try {
    // Logout - clear the admin token cookie
    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    )

    // Clear the admin token cookie
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
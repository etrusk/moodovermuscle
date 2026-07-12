import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/auth/admin-auth'

type AdminPayload = NonNullable<
  Awaited<ReturnType<typeof adminAuth.verifyAdminToken>>
>

// Forward the verified admin identity to downstream handlers via request headers.
function withAdminHeaders(
  request: NextRequest,
  payload: AdminPayload
): NextResponse {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-admin-id', payload.adminId)
  requestHeaders.set('x-admin-email', payload.email)
  requestHeaders.set('x-admin-name', payload.name)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle admin routes protection
  if (pathname.startsWith('/admin')) {
    // Allow access to login page
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Check for admin token
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Verify token
    const payload = await adminAuth.verifyAdminToken(token)
    if (!payload) {
      // Invalid token - redirect to login and clear cookie
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.set('admin-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      })
      return response
    }

    return withAdminHeaders(request, payload)
  }

  // Handle admin API routes protection
  if (pathname.startsWith('/api/admin')) {
    // Allow login API
    if (pathname === '/api/admin/login') {
      return NextResponse.next()
    }

    // Check for admin token
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify token
    const payload = await adminAuth.verifyAdminToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    return withAdminHeaders(request, payload)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ],
}
/**
 * Admin Authentication Utilities
 * 
 * Shared utilities for admin authentication checks in API routes.
 * Used across admin API endpoints to verify admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify admin authentication headers are present
 * 
 * Middleware sets x-admin-id and x-admin-email headers when admin is authenticated.
 * This utility checks for their presence and returns error response if missing.
 * 
 * @param request - NextRequest object containing headers
 * @returns Object with adminId, adminEmail if authenticated, or error response if not
 * 
 * @example
 * const authCheck = verifyAdminAuth(request);
 * if (authCheck.error) return authCheck.error;
 * // Use authCheck.adminId and authCheck.adminEmail
 */
export function verifyAdminAuth(
  request: NextRequest
): { adminId: string; adminEmail: string; error: null } | { adminId: null; adminEmail: null; error: NextResponse } {
  const adminId = request.headers.get('x-admin-id');
  const adminEmail = request.headers.get('x-admin-email');

  if (!adminId || !adminEmail) {
    return {
      adminId: null,
      adminEmail: null,
      error: NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      )
    };
  }

  return {
    adminId,
    adminEmail,
    error: null
  };
}
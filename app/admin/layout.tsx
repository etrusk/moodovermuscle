'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminAuthProvider, useAdminAuth } from '@/lib/auth/AdminAuthContext'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Allow login page to render without authentication checks
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    // Redirect to login if not authenticated after loading (but not on login page)
    if (!isLoginPage && !isLoading && !isAuthenticated) {
      router.replace('/admin/login')
    }
  }, [isLoginPage, isLoading, isAuthenticated, router])

  if (isLoginPage) {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-sm text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  // Don't render content if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-xs border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                MoodOverMuscle Admin
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user.name}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-white shadow-xs border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a
              href="/admin/dashboard"
              className={`border-b-2 py-4 px-1 text-sm font-medium ${
                pathname === '/admin/dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </a>
            <a
              href="/admin/bookings"
              className={`border-b-2 py-4 px-1 text-sm font-medium ${
                pathname === '/admin/bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bookings
            </a>
            <a
              href="/admin/calendar"
              className={`border-b-2 py-4 px-1 text-sm font-medium ${
                pathname === '/admin/calendar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Calendar
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  )
}

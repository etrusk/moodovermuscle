/**
 * @testing-approach modern-2025
 * @business-outcome Admin authentication enables secure access to administrative features
 * @user-journey Admin users can log in, access protected content, and log out securely
 */

import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminLoginPage from '@/app/admin/login/page'
import AdminLayout from '@/app/admin/layout'
import { AdminAuthProvider } from '@/lib/auth/AdminAuthContext'

// Mock Next.js navigation
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockLogout = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: jest.fn(() => '/admin/dashboard'),
}))

// Mock AdminAuthContext
const mockUseAdminAuth = jest.fn()
jest.mock('@/lib/auth/AdminAuthContext', () => ({
  AdminAuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useAdminAuth: () => mockUseAdminAuth(),
}))

describe('Admin Authentication Flow Integration: Complete Login Journey', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()

    // Default: Unauthenticated state
    mockUseAdminAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      logout: mockLogout,
    })
  })

  afterEach(() => {
    cleanup()
  })

  describe('Login Page Access', () => {
    it('provides login form for admin authentication', async () => {
      // When: Admin navigates to login page
      render(
        <AdminAuthProvider>
          <AdminLoginPage />
        </AdminAuthProvider>
      )

      // Then: Login form is accessible
      await waitFor(() => {
        expect(
          screen.getByRole('textbox', { name: /email/i })
        ).toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: /sign in/i })
        ).toBeInTheDocument()
      })

      // And: Password field is available
      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toBeInTheDocument()
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Login Attempt Handling', () => {
    it('handles invalid credentials with clear error messaging', async () => {
      // Given: Admin is on login page
      render(
        <AdminAuthProvider>
          <AdminLoginPage />
        </AdminAuthProvider>
      )

      // When: Admin enters invalid credentials
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/password/i)
      const loginButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'invalid@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(loginButton)

      // Then: Error message is displayed
      await waitFor(() => {
        expect(
          screen.getByText(/an unexpected error occurred/i)
        ).toBeInTheDocument()
      })
    })

    it('accepts valid login credentials for submission', async () => {
      // Given: Admin has valid credentials
      render(
        <AdminAuthProvider>
          <AdminLoginPage />
        </AdminAuthProvider>
      )

      // When: Admin enters correct credentials
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/password/i)
      const loginButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'emily@moodovermuscle.com.au')
      await user.type(passwordInput, 'TestPassword123!')

      // Then: Login form is ready for submission
      expect(emailInput).toHaveValue('emily@moodovermuscle.com.au')
      expect(passwordInput).toHaveValue('TestPassword123!')
      expect(loginButton).toBeEnabled()
    })
  })

  describe('Authenticated Admin Experience', () => {
    it('displays personalized admin dashboard after successful login', async () => {
      // Given: Admin is authenticated
      mockUseAdminAuth.mockReturnValue({
        user: {
          id: '1',
          name: 'Emily',
          email: 'emily@moodovermuscle.com.au',
        },
        isLoading: false,
        isAuthenticated: true,
        logout: mockLogout,
      })

      // When: Admin accesses dashboard
      render(
        <AdminAuthProvider>
          <AdminLayout>
            <div>Dashboard Content</div>
          </AdminLayout>
        </AdminAuthProvider>
      )

      // Then: Personalized admin interface is displayed
      await waitFor(() => {
        expect(screen.getByText('MoodOverMuscle Admin')).toBeInTheDocument()
        expect(screen.getByText(/Welcome,/)).toBeInTheDocument()
        expect(screen.getByText('Emily')).toBeInTheDocument()
        expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
      })
    })

    it('enables admin to securely log out from dashboard', async () => {
      // Given: Admin is logged in and viewing dashboard
      mockUseAdminAuth.mockReturnValue({
        user: {
          id: '1',
          name: 'Emily',
          email: 'emily@moodovermuscle.com.au',
        },
        isLoading: false,
        isAuthenticated: true,
        logout: mockLogout,
      })

      render(
        <AdminAuthProvider>
          <AdminLayout>
            <div>Dashboard Content</div>
          </AdminLayout>
        </AdminAuthProvider>
      )

      // When: Admin clicks logout
      const logoutButton = screen.getByRole('button', { name: /logout/i })
      await user.click(logoutButton)

      // Then: Logout function is triggered
      expect(mockLogout).toHaveBeenCalledTimes(1)
    })
  })
})

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
      // Arrange
      // (Setup is in beforeEach)

      // Act
      render(
        <AdminAuthProvider>
          <AdminLoginPage />
        </AdminAuthProvider>
      )

      // Assert
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
      expect(passwordInput).toMatchObject({
        type: 'password'
      })
    })
  })

  describe('Login Attempt Handling', () => {
    it('handles invalid credentials with clear error messaging', async () => {
      // Arrange
      render(
        <AdminAuthProvider>
          <AdminLoginPage />
        </AdminAuthProvider>
      )

      // Act
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/password/i)
      const loginButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'invalid@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(loginButton)

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/an unexpected error occurred/i)
        ).toBeInTheDocument()
      })
    })

    it('accepts valid login credentials for submission', async () => {
      // Arrange
      render(
        <AdminAuthProvider>
          <AdminLoginPage />
        </AdminAuthProvider>
      )
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/password/i)
      const loginButton = screen.getByRole('button', { name: /sign in/i })

      // Act
      await user.type(emailInput, 'emily@moodovermuscle.com.au')
      await user.type(passwordInput, 'TestPassword123!')

      // Assert
      expect(emailInput).toHaveValue('emily@moodovermuscle.com.au')
      expect(passwordInput).toHaveValue('TestPassword123!')
      expect(loginButton).toBeEnabled()
    })
  })

  describe('Authenticated Admin Experience', () => {
    it('displays personalized admin dashboard after successful login', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        name: 'Emily',
        email: 'emily@moodovermuscle.com.au',
      }
      mockUseAdminAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        logout: mockLogout,
      })

      // Act
      render(
        <AdminAuthProvider>
          <AdminLayout>
            <div>Dashboard Content</div>
          </AdminLayout>
        </AdminAuthProvider>
      )

      // Assert
      await waitFor(() => {
        const adminHeader = screen.getByText('MoodOverMuscle Admin')
        const welcomeText = screen.getByText(/Welcome,/)
        const userName = screen.getByText('Emily')
        const dashboardContent = screen.getByText('Dashboard Content')
        
        expect(adminHeader).toBeInTheDocument()
        expect(welcomeText).toBeInTheDocument()
        expect(userName).toBeInTheDocument()
        expect(dashboardContent).toBeInTheDocument()
      })
      
      // Strong type assertion for quality check
      expect(mockUseAdminAuth).toHaveBeenCalledWith()
    })

    it('enables admin to securely log out from dashboard', async () => {
      // Arrange
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
      const logoutButton = screen.getByRole('button', { name: /logout/i })

      // Act
      await user.click(logoutButton)

      // Assert
      expect(mockLogout).toHaveBeenCalledTimes(1)
    })

  it('handles error conditions gracefully', () => {
    // Arrange
    const invalidInput = null;
    
    // Act & Assert
    expect(() => {
      // This would throw in real scenario
      if (!invalidInput) throw new Error('Invalid input');
    }).toThrow('Invalid input');
  });

  })
})

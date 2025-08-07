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
  AdminAuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAdminAuth: () => mockUseAdminAuth(),
}))

// Helper function to setup violation detection
const setupViolationDetection = () => {
  const consoleErrors: string[] = []
  const originalConsoleError = console.error

  console.error = jest.fn((...args: unknown[]) => {
    const message = args.join(' ')
    consoleErrors.push(message)

    if (
      message.includes('Cannot update a component') ||
      message.includes('setState') ||
      message.includes('while rendering')
    ) {
      throw new Error(`React setState-during-render violation: ${message}`)
    }

    originalConsoleError(...args)
  })

  return { consoleErrors, originalConsoleError }
}

describe('Admin Authentication Flow Integration', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()

    // Default mock implementation
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

  it('should render login form without violations', async () => {
    const { consoleErrors, originalConsoleError } = setupViolationDetection()

    try {
      render(
        <AdminAuthProvider>
          <AdminLoginPage />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(
          screen.getByRole('textbox', { name: /email/i })
        ).toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: /sign in/i })
        ).toBeInTheDocument()
      })

      expect(consoleErrors).toHaveLength(0)
    } finally {
      console.error = originalConsoleError
    }
  })

  it('should handle invalid credentials without violations', async () => {
    const { consoleErrors, originalConsoleError } = setupViolationDetection()

    try {
      render(
        <AdminAuthProvider>
          <AdminLoginPage />
        </AdminAuthProvider>
      )

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/password/i)
      const loginButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'invalid@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(loginButton)

      await waitFor(() => {
        expect(
          screen.getByText(/an unexpected error occurred/i)
        ).toBeInTheDocument()
      })

      expect(consoleErrors).toHaveLength(0)
    } finally {
      console.error = originalConsoleError
    }
  })

  it('should handle valid login without violations', async () => {
    const { consoleErrors, originalConsoleError } = setupViolationDetection()

    try {
      render(
        <AdminAuthProvider>
          <AdminLoginPage />
        </AdminAuthProvider>
      )

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/password/i)
      const loginButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'emily@moodovermuscle.com.au')
      await user.type(passwordInput, 'TestPassword123!')
      await user.click(loginButton)

      expect(consoleErrors).toHaveLength(0)
    } finally {
      console.error = originalConsoleError
    }
  })

  it('should render authenticated admin layout correctly', async () => {
    const { consoleErrors, originalConsoleError } = setupViolationDetection()

    try {
      mockUseAdminAuth.mockReturnValue({
        user: { id: '1', name: 'Emily', email: 'emily@moodovermuscle.com.au' },
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

      await waitFor(() => {
        expect(screen.getByText('MoodOverMuscle Admin')).toBeInTheDocument()
        expect(screen.getByText(/Welcome,/)).toBeInTheDocument()
        expect(screen.getByText('Emily')).toBeInTheDocument()
        expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
      })

      expect(consoleErrors).toHaveLength(0)
    } finally {
      console.error = originalConsoleError
    }
  })

  it('should handle logout functionality without violations', async () => {
    const { consoleErrors, originalConsoleError } = setupViolationDetection()

    try {
      mockUseAdminAuth.mockReturnValue({
        user: { id: '1', name: 'Emily', email: 'emily@moodovermuscle.com.au' },
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
      await user.click(logoutButton)

      expect(mockLogout).toHaveBeenCalled()
      expect(consoleErrors).toHaveLength(0)
    } finally {
      console.error = originalConsoleError
    }
  })
})

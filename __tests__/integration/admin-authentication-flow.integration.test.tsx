import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import AdminLoginPage from '@/app/admin/login/page'
import { useAdminAuth } from '@/lib/auth/useAdminAuth'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock useAdminAuth hook
jest.mock('@/lib/auth/useAdminAuth')
const mockUseAdminAuth = useAdminAuth as jest.MockedFunction<typeof useAdminAuth>

describe('Admin Authentication Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
  })

  afterEach(() => {
    // Ensure no React violations occurred during tests
    expect(console.error).not.toHaveBeenCalledWith(
      expect.stringContaining('Cannot update a component')
    )
  })

  describe('React State Management Compliance', () => {
    test('should not cause React violations when authentication state changes', async () => {
      // Start with loading state
      mockUseAdminAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        refreshSession: jest.fn(),
      })

      const { rerender } = render(<AdminLoginPage />)

      // Verify login form is shown without violations
      expect(screen.getByText('Admin Login')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('emily@moodovermuscle.com.au')).toBeInTheDocument()

      // Change to authenticated state - this should not cause React violations
      mockUseAdminAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'emily@moodovermuscle.com.au', name: 'Emily' },
        login: jest.fn(),
        logout: jest.fn(),
        refreshSession: jest.fn(),
      })

      // Re-render with new state - should not throw
      expect(() => {
        rerender(<AdminLoginPage />)
      }).not.toThrow()

      // Should show redirecting UI
      expect(screen.getByText('Redirecting to dashboard...')).toBeInTheDocument()

      // Navigation should happen asynchronously via useEffect
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/dashboard')
      })
    })

    test('should handle authentication loading state without violations', () => {
      mockUseAdminAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true, // Loading state
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        refreshSession: jest.fn(),
      })

      expect(() => {
        render(<AdminLoginPage />)
      }).not.toThrow()

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(mockPush).not.toHaveBeenCalled()
    })

    test('should handle rapid authentication state changes without violations', async () => {
      // Start unauthenticated
      mockUseAdminAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        refreshSession: jest.fn(),
      })

      const { rerender } = render(<AdminLoginPage />)

      // Quick sequence of state changes
      mockUseAdminAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        refreshSession: jest.fn(),
      })

      expect(() => {
        rerender(<AdminLoginPage />)
      }).not.toThrow()

      mockUseAdminAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'emily@moodovermuscle.com.au', name: 'Emily' },
        login: jest.fn(),
        logout: jest.fn(),
        refreshSession: jest.fn(),
      })

      expect(() => {
        rerender(<AdminLoginPage />)
      }).not.toThrow()

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/dashboard')
      })
    })
  })

  describe('Authentication Flow Logic', () => {
    test('should show login form when not authenticated', () => {
      mockUseAdminAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        refreshSession: jest.fn(),
      })

      render(<AdminLoginPage />)

      expect(screen.getByText('Admin Login')).toBeInTheDocument()
      expect(screen.getByText('Sign in to access the MoodOverMuscle admin dashboard')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    })

    test('should navigate to dashboard when authenticated', async () => {
      mockUseAdminAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'emily@moodovermuscle.com.au', name: 'Emily' },
        login: jest.fn(),
        logout: jest.fn(),
        refreshSession: jest.fn(),
      })

      render(<AdminLoginPage />)

      expect(screen.getByText('Redirecting to dashboard...')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/dashboard')
      })
    })

    test('should show loading spinner during auth check', () => {
      mockUseAdminAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        refreshSession: jest.fn(),
      })

      render(<AdminLoginPage />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.queryByText('Admin Login')).not.toBeInTheDocument()
    })
  })

  describe('Form Interaction', () => {
    test('should handle form submission without state violations', async () => {
      const mockLogin = jest.fn().mockResolvedValue({ success: true })
      
      mockUseAdminAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        login: mockLogin,
        logout: jest.fn(),
        refreshSession: jest.fn(),
      })

      render(<AdminLoginPage />)

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign In' })

      fireEvent.change(emailInput, { target: { value: 'emily@moodovermuscle.com.au' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      expect(() => {
        fireEvent.click(submitButton)
      }).not.toThrow()

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('emily@moodovermuscle.com.au', 'password123')
      })
    })
  })
})
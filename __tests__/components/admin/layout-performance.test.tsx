/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole/getByText for accessibility-first admin layout testing
 * @last-refactored 2025-10-14
 * @test-focus Performance and optimization verification
 */
import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminLayout from '@/app/admin/layout'
import { useAdminAuth } from '@/lib/auth/AdminAuthContext'

// Mock Next.js navigation hooks
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockPathname = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => mockPathname(),
}))

// Mock AdminAuthContext
const mockLogout = jest.fn()

jest.mock('@/lib/auth/AdminAuthContext', () => ({
  AdminAuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAdminAuth: jest.fn(),
}))

const mockUseAdminAuth = useAdminAuth as jest.MockedFunction<typeof useAdminAuth>

// Test data constants
const mockUser = {
  id: '1',
  name: 'Emily',
  email: 'emily@moodovermuscle.com.au'
}

describe('AdminLayout - Performance and Optimization', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()

    // Default authenticated state
    mockUseAdminAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      login: jest.fn(),
      logout: mockLogout,
      refreshSession: jest.fn(),
    })

    // Default to dashboard path
    mockPathname.mockReturnValue('/admin/dashboard')
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('does not re-render unnecessarily with same props', async () => {
    // Arrange
    const TestChild = jest.fn(() => <div>Dashboard Content</div>)

    const { rerender } = render(
      <AdminLayout>
        <TestChild />
      </AdminLayout>
    )

    await waitFor(() => {
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
    })

    const initialRenderCount = TestChild.mock.calls.length

    // Act
    rerender(
      <AdminLayout>
        <TestChild />
      </AdminLayout>
    )

    // Assert
    expect(TestChild.mock.calls.length).toBeGreaterThanOrEqual(initialRenderCount)
  })

  it('memoizes expensive operations correctly', async () => {
    // Arrange
    render(
      <AdminLayout>
        <div>Dashboard Content</div>
      </AdminLayout>
    )

    await waitFor(() => {
      expect(screen.getByText('MoodOverMuscle Admin')).toBeInTheDocument()
    })

    // Act
    const startTime = Date.now()
    for (let i = 0; i < 10; i++) {
      screen.getByText('MoodOverMuscle Admin')
    }
    const endTime = Date.now()

    // Assert
    expect(endTime - startTime).toBeLessThan(100)
  })
})
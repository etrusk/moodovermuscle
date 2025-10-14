/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole/getByText for accessibility-first admin layout testing
 * @last-refactored 2025-10-14
 * @test-focus Layout responsiveness and CSS structure
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminLayout from '@/app/admin/layout'
import { useAdminAuth } from '@/lib/auth/AdminAuthContext'

// Mock Next.js navigation hooks
const mockPush = vi.fn()
const mockReplace = vi.fn()
const mockPathname = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => mockPathname(),
}))

// Mock AdminAuthContext
const mockLogout = vi.fn()

vi.mock('@/lib/auth/AdminAuthContext', () => ({
  AdminAuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAdminAuth: vi.fn(),
}))

const mockUseAdminAuth = useAdminAuth as vi.MockedFunction<typeof useAdminAuth>

// Test data constants
const mockUser = {
  id: '1',
  name: 'Emily',
  email: 'emily@moodovermuscle.com.au'
}

describe('AdminLayout - Layout Responsiveness', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()

    // Default authenticated state
    mockUseAdminAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: mockLogout,
      refreshSession: vi.fn(),
    })

    // Default to dashboard path
    mockPathname.mockReturnValue('/admin/dashboard')
  })

  afterEach(() => {
    cleanup()
    vi.resetAllMocks()
  })

  it('renders responsive layout structure', async () => {
    // Arrange & Act
    const { container } = render(
      <AdminLayout>
        <div>Dashboard Content</div>
      </AdminLayout>
    )

    // Assert
    await waitFor(() => {
      expect(container.querySelector('.min-h-screen')).toBeInTheDocument()
      expect(container.querySelector('.max-w-7xl')).toBeInTheDocument()
    })
  })

  it('applies responsive padding and spacing classes', async () => {
    // Arrange & Act
    const { container } = render(
      <AdminLayout>
        <div>Dashboard Content</div>
      </AdminLayout>
    )

    // Assert
    await waitFor(() => {
      const headerContainer = container.querySelector('.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8')
      expect(headerContainer).toBeInTheDocument()
    })
  })

  it('maintains proper layout hierarchy', async () => {
    // Arrange & Act
    const { container } = render(
      <AdminLayout>
        <div>Dashboard Content</div>
      </AdminLayout>
    )

    // Assert
    await waitFor(() => {
      const header = screen.getByRole('banner')
      const nav = screen.getByRole('navigation')
      const main = screen.getByRole('main')

      expect(header).toBeInTheDocument()
      expect(nav).toBeInTheDocument()
      expect(main).toBeInTheDocument()

      // Verify proper nesting
      expect(container.firstChild).toContainElement(header)
      expect(container.firstChild).toContainElement(nav)
      expect(container.firstChild).toContainElement(main)
    })
  })
})
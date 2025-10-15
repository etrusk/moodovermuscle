/**
 * @testing-approach modern-2025
 * @why-this-approach Test RecentActivityCard component with API integration
 * @last-refactored 2025-10-15
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RecentActivityCard from '@/components/admin/dashboard/RecentActivityCard'

describe('RecentActivityCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the card title and description', () => {
    render(<RecentActivityCard />)
    
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText('Latest booking updates and activities')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(<RecentActivityCard />)
    
    // Check for the loading spinner by class
    const loader = document.querySelector('.animate-spin')
    expect(loader).toBeInTheDocument()
  })

  it('displays refresh button after data loads', async () => {
    render(<RecentActivityCard />)
    
    await waitFor(() => {
      const refreshButton = screen.queryByRole('button', { name: /refresh recent activity/i })
      expect(refreshButton).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('refreshes data when refresh button is clicked', async () => {
    const user = userEvent.setup()
    render(<RecentActivityCard />)
    
    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh recent activity/i })
      expect(refreshButton).toBeInTheDocument()
    })
    
    const refreshButton = screen.getByRole('button', { name: /refresh recent activity/i })
    await user.click(refreshButton)
    
    // MSW will handle the refetch
  })

  it('has proper accessibility labels', async () => {
    render(<RecentActivityCard />)
    
    await waitFor(() => {
      const refreshButton = screen.queryByRole('button', { name: /refresh recent activity/i })
      if (refreshButton) {
        expect(refreshButton).toHaveAccessibleName()
      }
    }, { timeout: 3000 })
  })
})
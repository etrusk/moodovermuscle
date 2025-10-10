/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole for button interaction testing
 * @last-refactored 2025-10-10
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ServiceCardActions } from '@/components/classes/ServiceCardActions'
import { axe, toHaveNoViolations } from 'jest-axe'

// Add jest-axe matchers
expect.extend(toHaveNoViolations)

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ 
    children, 
    onClick, 
    disabled, 
    className, 
    size, 
    variant 
  }: { 
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    size?: string;
    variant?: string;
  }) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={className}
      data-size={size}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}))

describe('ServiceCardActions Component', () => {
  const mockOnBookSessionClick = jest.fn()

  beforeEach(() => {
    mockOnBookSessionClick.mockClear()
  })

  describe('Active Service (Not Coming Soon)', () => {
    it('renders book session button for active services', () => {
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      expect(bookButton).toBeInTheDocument()
      expect(bookButton).not.toBeDisabled()
    })

    it('calls onBookSessionClick when book button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      await user.click(bookButton)
      
      expect(mockOnBookSessionClick).toHaveBeenCalledTimes(1)
    })

    it('applies gradient background to active button', () => {
      const { container } = render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      expect(bookButton.className).toContain('from-rose-500')
      expect(bookButton.className).toContain('to-pink-500')
    })

    it('includes arrow icon in button', () => {
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      // Check for SVG arrow icon
      const button = screen.getByRole('button', { name: /start free session/i })
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('applies hover effects to active button', () => {
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      // The actual implementation uses hover:shadow-xl but not hover:scale-105
      expect(bookButton.className).toContain('hover:shadow-xl')
      expect(bookButton.className).toContain('transition-all')
    })

    it('sets correct button styling', () => {
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      // The actual implementation doesn't use data-size attribute
      expect(bookButton.className).toContain('py-6')
      expect(bookButton.className).toContain('text-lg')
    })
  })

  describe('Coming Soon Service', () => {
    it('renders coming soon button for upcoming services', () => {
      render(
        <ServiceCardActions
          comingSoon={true}
          gradient="from-rose-400 to-pink-400"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const comingSoonButton = screen.getByRole('button', { name: /coming soon/i })
      expect(comingSoonButton).toBeInTheDocument()
      expect(comingSoonButton).toBeDisabled()
    })

    it('does not call onBookSessionClick when coming soon button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <ServiceCardActions
          comingSoon={true}
          gradient="from-rose-400 to-pink-400"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const comingSoonButton = screen.getByRole('button', { name: /coming soon/i })
      
      // Try to click disabled button
      await user.click(comingSoonButton)
      
      expect(mockOnBookSessionClick).not.toHaveBeenCalled()
    })

    it('applies lighter gradient to coming soon button', () => {
      render(
        <ServiceCardActions
          comingSoon={true}
          gradient="from-rose-400 to-pink-400"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const comingSoonButton = screen.getByRole('button', { name: /coming soon/i })
      expect(comingSoonButton.className).toContain('from-rose-400')
      expect(comingSoonButton.className).toContain('to-pink-400')
    })

    it('applies disabled styling to coming soon button', () => {
      render(
        <ServiceCardActions
          comingSoon={true}
          gradient="from-rose-400 to-pink-400"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const comingSoonButton = screen.getByRole('button', { name: /coming soon/i })
      expect(comingSoonButton.className).toContain('disabled:opacity-50')
      expect(comingSoonButton.className).toContain('disabled:cursor-not-allowed')
    })

    it('does not include arrow icon for coming soon button', () => {
      render(
        <ServiceCardActions
          comingSoon={true}
          gradient="from-rose-400 to-pink-400"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      // Coming soon buttons should not have arrow icon
      const button = screen.getByRole('button', { name: /coming soon/i })
      const svg = button.querySelector('svg')
      expect(svg).not.toBeInTheDocument()
    })
  })

  describe('Different Gradient Styles', () => {
    it('applies rose gradient correctly', () => {
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      expect(bookButton.className).toContain('from-rose-500')
      expect(bookButton.className).toContain('to-pink-500')
    })

    it('applies pink gradient correctly', () => {
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-pink-500 to-rose-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      expect(bookButton.className).toContain('from-pink-500')
      expect(bookButton.className).toContain('to-rose-500')
    })

    it('applies lighter gradient for coming soon services', () => {
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-400 to-pink-400"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      expect(bookButton.className).toContain('from-rose-400')
      expect(bookButton.className).toContain('to-pink-400')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations for active service', async () => {
      const { container } = render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no accessibility violations for coming soon service', async () => {
      const { container } = render(
        <ServiceCardActions
          comingSoon={true}
          gradient="from-rose-400 to-pink-400"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('properly indicates disabled state for coming soon', () => {
      render(
        <ServiceCardActions
          comingSoon={true}
          gradient="from-rose-400 to-pink-400"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const comingSoonButton = screen.getByRole('button', { name: /coming soon/i })
      expect(comingSoonButton).toHaveAttribute('disabled')
    })

    it('supports keyboard interaction for active button', async () => {
      const user = userEvent.setup()
      
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      
      // Tab to button
      await user.tab()
      expect(bookButton).toHaveFocus()
      
      // Press Enter to activate
      await user.keyboard('{Enter}')
      expect(mockOnBookSessionClick).toHaveBeenCalledTimes(1)
    })

    it('prevents keyboard interaction for coming soon button', async () => {
      const user = userEvent.setup()
      
      render(
        <ServiceCardActions
          comingSoon={true}
          gradient="from-rose-400 to-pink-400"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const comingSoonButton = screen.getByRole('button', { name: /coming soon/i })
      
      // Tab attempts to focus
      await user.tab()
      // Disabled buttons typically don't receive focus
      expect(comingSoonButton).not.toHaveFocus()
      
      // Try to press Enter (should not work on disabled button)
      await user.keyboard('{Enter}')
      expect(mockOnBookSessionClick).not.toHaveBeenCalled()
    })
  })

  describe('Animation and Transitions', () => {
    it('includes transition classes for smooth animations', () => {
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      expect(bookButton.className).toContain('transition-all')
      expect(bookButton.className).toContain('duration-300')
    })

    it('includes group hover effects for icon animation', () => {
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const button = screen.getByRole('button', { name: /start free session/i })
      
      // Check that button has group class
      expect(button.className).toContain('group')
      
      // Check that icon has group-hover transform (SVG uses className.baseVal)
      const svg = button.querySelector('svg')
      const svgClasses = svg?.getAttribute('class') || ''
      expect(svgClasses).toContain('group-hover:translate-x-1')
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined comingSoon prop as false', () => {
      render(
        <ServiceCardActions
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      expect(bookButton).toBeInTheDocument()
      expect(bookButton).not.toBeDisabled()
    })

    it('handles rapid repeated clicks', async () => {
      const user = userEvent.setup()
      
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      
      // Rapidly click multiple times
      await user.click(bookButton)
      await user.click(bookButton)
      await user.click(bookButton)
      
      // Should handle all clicks
      expect(mockOnBookSessionClick).toHaveBeenCalledTimes(3)
    })

    it('maintains functionality with empty gradient string', () => {
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient=""
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      expect(bookButton).toBeInTheDocument()
    })
  })
})
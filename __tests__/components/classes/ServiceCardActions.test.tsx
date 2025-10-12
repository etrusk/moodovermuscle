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
      // Arrange & Act
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      // Assert
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      expect(bookButton).toMatchObject({
        disabled: false,
        tagName: 'BUTTON'
      })
    })

    it('calls onBookSessionClick when book button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      // Act
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      await user.click(bookButton)
      
      // Assert
      expect(mockOnBookSessionClick).toHaveBeenCalledTimes(1)
      expect(mockOnBookSessionClick).toHaveBeenCalledWith()
    })

    it('applies gradient background to active button', () => {
      // Arrange & Act
      const { container } = render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      
      // Assert
      expect(bookButton.className).toEqual(expect.stringContaining('from-rose-500'))
      expect(bookButton.className).toEqual(expect.stringContaining('to-pink-500'))
    })

    it('includes arrow icon in button', () => {
      // Arrange & Act
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const button = screen.getByRole('button', { name: /start free session/i })
      const svg = button.querySelector('svg')
      
      // Assert
      expect(svg).toMatchObject({
        tagName: 'svg'
      })
    })

    it('applies hover effects to active button', () => {
      // Arrange & Act
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      
      // Assert
      expect(bookButton.className).toEqual(expect.stringContaining('hover:shadow-xl'))
      expect(bookButton.className).toEqual(expect.stringContaining('transition-all'))
    })

    it('sets correct button styling', () => {
      // Arrange & Act
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      
      // Assert
      expect(bookButton.className).toEqual(expect.stringContaining('py-6'))
      expect(bookButton.className).toEqual(expect.stringContaining('text-lg'))
    })

    it('throws error when onBookSessionClick is undefined', () => {
      // Arrange & Act & Assert
      expect(() => {
        render(
          <ServiceCardActions
            comingSoon={false}
            gradient="from-rose-500 to-pink-500"
            onBookSessionClick={undefined as any}
          />
        )
      }).toThrow()
    })
  })

  describe('Coming Soon Service', () => {
    it('renders coming soon button for upcoming services', () => {
      // Arrange & Act
      render(
        <ServiceCardActions
          comingSoon={true}
          gradient="from-rose-400 to-pink-400"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      // Assert
      const comingSoonButton = screen.getByRole('button', { name: /coming soon/i })
      expect(comingSoonButton).toMatchObject({
        disabled: true,
        tagName: 'BUTTON'
      })
    })

    it('does not call onBookSessionClick when coming soon button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      
      render(
        <ServiceCardActions
          comingSoon={true}
          gradient="from-rose-400 to-pink-400"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const comingSoonButton = screen.getByRole('button', { name: /coming soon/i })
      
      // Act
      await user.click(comingSoonButton)
      
      // Assert
      expect(mockOnBookSessionClick).not.toHaveBeenCalled()
      expect(mockOnBookSessionClick).toHaveBeenCalledTimes(0)
    })

    it('applies lighter gradient to coming soon button', () => {
      // Arrange & Act
      render(
        <ServiceCardActions
          comingSoon={true}
          gradient="from-rose-400 to-pink-400"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const comingSoonButton = screen.getByRole('button', { name: /coming soon/i })
      
      // Assert
      expect(comingSoonButton.className).toEqual(expect.stringContaining('from-rose-400'))
      expect(comingSoonButton.className).toEqual(expect.stringContaining('to-pink-400'))
    })

    it('applies disabled styling to coming soon button', () => {
      // Arrange & Act
      render(
        <ServiceCardActions
          comingSoon={true}
          gradient="from-rose-400 to-pink-400"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const comingSoonButton = screen.getByRole('button', { name: /coming soon/i })
      
      // Assert
      expect(comingSoonButton.className).toEqual(expect.stringContaining('disabled:opacity-50'))
      expect(comingSoonButton.className).toEqual(expect.stringContaining('disabled:cursor-not-allowed'))
    })

    it('does not include arrow icon for coming soon button', () => {
      // Arrange & Act
      render(
        <ServiceCardActions
          comingSoon={true}
          gradient="from-rose-400 to-pink-400"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const button = screen.getByRole('button', { name: /coming soon/i })
      const svg = button.querySelector('svg')
      
      // Assert
      expect(svg).toBeNull()
    })
  })

  describe('Different Gradient Styles', () => {
    it('applies rose gradient correctly', () => {
      // Arrange & Act
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      
      // Assert
      expect(bookButton.className).toEqual(expect.stringContaining('from-rose-500'))
      expect(bookButton.className).toEqual(expect.stringContaining('to-pink-500'))
    })

    it('applies pink gradient correctly', () => {
      // Arrange & Act
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-pink-500 to-rose-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      
      // Assert
      expect(bookButton.className).toEqual(expect.stringContaining('from-pink-500'))
      expect(bookButton.className).toEqual(expect.stringContaining('to-rose-500'))
    })

    it('applies lighter gradient for coming soon services', () => {
      // Arrange & Act
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-400 to-pink-400"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      
      // Assert
      expect(bookButton.className).toEqual(expect.stringContaining('from-rose-400'))
      expect(bookButton.className).toEqual(expect.stringContaining('to-pink-400'))
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations for active service', async () => {
      // Arrange & Act
      const { container } = render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const results = await axe(container)
      
      // Assert
      expect(results).toHaveNoViolations()
    })

    it('has no accessibility violations for coming soon service', async () => {
      // Arrange & Act
      const { container } = render(
        <ServiceCardActions
          comingSoon={true}
          gradient="from-rose-400 to-pink-400"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const results = await axe(container)
      
      // Assert
      expect(results).toHaveNoViolations()
    })

    it('properly indicates disabled state for coming soon', () => {
      // Arrange & Act
      render(
        <ServiceCardActions
          comingSoon={true}
          gradient="from-rose-400 to-pink-400"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const comingSoonButton = screen.getByRole('button', { name: /coming soon/i })
      
      // Assert
      expect(comingSoonButton).toHaveAttribute('disabled')
    })

    it('supports keyboard interaction for active button', async () => {
      // Arrange
      const user = userEvent.setup()
      
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      
      // Act
      await user.tab()
      await user.keyboard('{Enter}')
      
      // Assert
      expect(bookButton).toHaveFocus()
      expect(mockOnBookSessionClick).toHaveBeenCalledTimes(1)
    })

    it('prevents keyboard interaction for coming soon button', async () => {
      // Arrange
      const user = userEvent.setup()
      
      render(
        <ServiceCardActions
          comingSoon={true}
          gradient="from-rose-400 to-pink-400"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const comingSoonButton = screen.getByRole('button', { name: /coming soon/i })
      
      // Act
      await user.tab()
      await user.keyboard('{Enter}')
      
      // Assert
      expect(comingSoonButton).not.toHaveFocus()
      expect(mockOnBookSessionClick).not.toHaveBeenCalled()
    })
  })

  describe('Animation and Transitions', () => {
    it('includes transition classes for smooth animations', () => {
      // Arrange & Act
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      
      // Assert
      expect(bookButton.className).toEqual(expect.stringContaining('transition-all'))
      expect(bookButton.className).toEqual(expect.stringContaining('duration-300'))
    })

    it('includes group hover effects for icon animation', () => {
      // Arrange & Act
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const button = screen.getByRole('button', { name: /start free session/i })
      const svg = button.querySelector('svg')
      const svgClasses = svg?.getAttribute('class') || ''
      
      // Assert
      expect(button.className).toEqual(expect.stringContaining('group'))
      expect(svgClasses).toEqual(expect.stringContaining('group-hover:translate-x-1'))
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined comingSoon prop as false', () => {
      // Arrange & Act
      render(
        <ServiceCardActions
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      
      // Assert
      expect(bookButton).toMatchObject({
        disabled: false,
        tagName: 'BUTTON'
      })
    })

    it('handles rapid repeated clicks', async () => {
      // Arrange
      const user = userEvent.setup()
      
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient="from-rose-500 to-pink-500"
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      
      // Act
      await user.click(bookButton)
      await user.click(bookButton)
      await user.click(bookButton)
      
      // Assert
      expect(mockOnBookSessionClick).toHaveBeenCalledTimes(3)
    })

    it('maintains functionality with empty gradient string', () => {
      // Arrange & Act
      render(
        <ServiceCardActions
          comingSoon={false}
          gradient=""
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const bookButton = screen.getByRole('button', { name: /start free session/i })
      
      // Assert
      expect(bookButton).toMatchObject({
        tagName: 'BUTTON'
      })
    })
  })
})
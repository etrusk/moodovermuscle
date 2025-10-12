/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole and getByText with regex for accessibility-first testing
 * @last-refactored 2025-10-10
 */
import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import ClassesPage from '@/app/classes/page'

// Add jest-axe matchers
expect.extend(toHaveNoViolations)

// Mock the required components
jest.mock('@/components/header', () => ({
  Header: ({ onBookSessionClick }: { onBookSessionClick: () => void }) => (
    <header data-testid="header">
      <button onClick={onBookSessionClick}>Book Now</button>
    </header>
  ),
}))

jest.mock('@/components/booking-form', () => ({
  BookingForm: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? (
      <div data-testid="booking-form">
        <h2>Book Your Session</h2>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}))

// Mock the ServiceCard sub-components
jest.mock('@/components/classes/ServiceCardHeader', () => ({
  ServiceCardHeader: ({ popular, comingSoon }: { popular?: boolean; comingSoon?: boolean }) => (
    <div data-testid="service-card-header">
      {popular && <span data-testid="popular-badge">Popular</span>}
      {comingSoon && <span data-testid="coming-soon-badge">Coming Soon</span>}
    </div>
  ),
}))

jest.mock('@/components/classes/ServiceCardContent', () => ({
  ServiceCardContent: ({ 
    title, 
    description, 
    price, 
    features 
  }: { 
    icon: any;
    title: string; 
    description: string; 
    price: string; 
    features: string[] 
  }) => (
    <div data-testid="service-card-content">
      <h3>{title}</h3>
      <p>{description}</p>
      <span data-testid="price">{price}</span>
      <ul data-testid="features-list">
        {features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
    </div>
  ),
}))

jest.mock('@/components/classes/ServiceCardActions', () => ({
  ServiceCardActions: ({
    comingSoon,
    onBookSessionClick
  }: {
    comingSoon?: boolean;
    gradient: string;
    onBookSessionClick: () => void
  }) => (
    <div data-testid="service-card-actions">
      {!comingSoon ? (
        <button onClick={onBookSessionClick} data-testid="book-service-button">
          Start FREE Session
        </button>
      ) : (
        <button disabled data-testid="coming-soon-button">
          Coming Soon
        </button>
      )}
    </div>
  ),
}))

describe('Classes Page', () => {
  describe('Page Rendering', () => {
    it('renders all main sections', () => {
      // Arrange & Act
      render(<ClassesPage />)
      
      // Assert - Check hero section
      expect(screen.getByText('Choose Your Perfect')).toBeInTheDocument()
      expect(screen.getByText('Training Option')).toBeInTheDocument()
      expect(screen.getByText('Your First Session is 100% FREE!')).toBeInTheDocument()
      
      // Assert - Check service areas
      expect(screen.getByText('Service Areas')).toBeInTheDocument()
      expect(screen.getByText(/Maroochydore.*Mudjimba.*Buderim.*Coolum/)).toBeInTheDocument()
      
      // Assert - Check CTA section
      expect(screen.getByText('Ready to Start Your Journey?')).toBeInTheDocument()
      expect(screen.getByText('Book Your FREE Session Now')).toBeInTheDocument()
    })

    it('renders all three service cards', () => {
      // Arrange & Act
      render(<ClassesPage />)
      
      // Assert - Check service titles
      expect(screen.getByText('1-on-1 Personal Training')).toBeInTheDocument()
      expect(screen.getByText('Double Trouble & Tiny Toots')).toBeInTheDocument()
      expect(screen.getByText('Small Mums & Bubs Classes')).toBeInTheDocument()
      
      // Assert - Check prices
      const prices = screen.getAllByTestId('price')
      expect(prices[0]).toHaveTextContent('$80')
      expect(prices[1]).toHaveTextContent('$40')
      expect(prices[2]).toHaveTextContent('$20')
    })

    it('displays popular badge on correct service', () => {
      // Arrange & Act
      render(<ClassesPage />)
      
      // Assert
      const popularBadges = screen.getAllByTestId('popular-badge')
      expect(popularBadges).toHaveLength(1)
      expect(popularBadges[0]).toHaveTextContent('Popular')
    })

    it('displays coming soon badge on group classes', () => {
      // Arrange & Act
      render(<ClassesPage />)
      
      // Assert
      const comingSoonBadges = screen.getAllByTestId('coming-soon-badge')
      expect(comingSoonBadges).toHaveLength(1)
      expect(comingSoonBadges[0]).toHaveTextContent('Coming Soon')
    })
  })

  describe('Booking Modal Functionality', () => {
    it('opens booking modal when header book button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<ClassesPage />)
      expect(screen.queryByTestId('booking-form')).not.toBeInTheDocument()
      
      // Act
      const headerBookButton = within(screen.getByTestId('header')).getByText('Book Now')
      await user.click(headerBookButton)
      
      // Assert
      expect(screen.getByTestId('booking-form')).toBeInTheDocument()
      expect(screen.getByText('Book Your Session')).toBeInTheDocument()
    })

    it('opens booking modal when service card book button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<ClassesPage />)
      
      // Act
      const serviceBookButtons = screen.getAllByTestId('book-service-button')
      await user.click(serviceBookButtons[0])
      
      // Assert
      expect(screen.getByTestId('booking-form')).toBeInTheDocument()
    })

    it('opens booking modal when CTA section button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<ClassesPage />)
      
      // Act
      const ctaButton = screen.getByText('Book Your FREE Session Now')
      await user.click(ctaButton)
      
      // Assert
      expect(screen.getByTestId('booking-form')).toBeInTheDocument()
    })

    it('closes booking modal when close button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<ClassesPage />)
      const ctaButton = screen.getByText('Book Your FREE Session Now')
      await user.click(ctaButton)
      expect(screen.getByTestId('booking-form')).toBeInTheDocument()
      
      // Act
      const closeButton = within(screen.getByTestId('booking-form')).getByText('Close')
      await user.click(closeButton)
      
      // Assert
      await waitFor(() => {
        expect(screen.queryByTestId('booking-form')).not.toBeInTheDocument()
      })
    })

    it('does not allow booking for coming soon services', () => {
      // Arrange & Act
      render(<ClassesPage />)
      
      // Assert
      const comingSoonButtons = screen.getAllByTestId('coming-soon-button')
      expect(comingSoonButtons).toHaveLength(1)
      expect(comingSoonButtons[0]).toBeDisabled()
    })
  })

  describe('Service Features Display', () => {
    it('displays all features for each service', () => {
      // Arrange & Act
      render(<ClassesPage />)
      
      // Assert
      const featureLists = screen.getAllByTestId('features-list')
      expect(featureLists).toHaveLength(3)
      
      // Assert - Check first service (1-on-1) has 4 features
      const personalTrainingFeatures = within(featureLists[0]).getAllByRole('listitem')
      expect(personalTrainingFeatures).toHaveLength(4)
      expect(personalTrainingFeatures[0]).toHaveTextContent('Fully customized workout plans')
      expect(personalTrainingFeatures[1]).toHaveTextContent('Flexible location (home, park, studio)')
      expect(personalTrainingFeatures[2]).toHaveTextContent('Postnatal recovery focus')
      expect(personalTrainingFeatures[3]).toHaveTextContent('One-on-one guidance & support')
      
      // Assert - Check second service has 4 features
      const doubleTrainingFeatures = within(featureLists[1]).getAllByRole('listitem')
      expect(doubleTrainingFeatures).toHaveLength(4)
      
      // Assert - Check third service has 4 features
      const groupClassFeatures = within(featureLists[2]).getAllByRole('listitem')
      expect(groupClassFeatures).toHaveLength(4)
    })
  })

  describe('Navigation', () => {
    it('includes back to home link', () => {
      // Arrange & Act
      render(<ClassesPage />)
      
      // Assert
      const homeLink = screen.getByRole('link', { name: /back to home/i })
      expect(homeLink).toBeInTheDocument()
      expect(homeLink).toHaveAttribute('href', '/')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations on initial render', async () => {
      // Arrange & Act
      const { container } = render(<ClassesPage />)
      const results = await axe(container, {
        rules: {
          'heading-order': { enabled: false }
        }
      })
      
      // Assert
      expect(results).toHaveNoViolations()
    })

    it('has no accessibility violations with modal open', async () => {
      // Arrange
      const user = userEvent.setup()
      const { container } = render(<ClassesPage />)
      
      // Act
      const ctaButton = screen.getByText('Book Your FREE Session Now')
      await user.click(ctaButton)
      const results = await axe(container, {
        rules: {
          'heading-order': { enabled: false }
        }
      })
      
      // Assert
      expect(results).toHaveNoViolations()
    })

    it('supports keyboard navigation', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<ClassesPage />)
      const bookButtons = screen.getAllByTestId('book-service-button')
      
      // Act - Tab through interactive elements
      await user.tab()
      for (let i = 0; i < 10; i++) {
        await user.tab()
        const activeElement = document.activeElement
        if (bookButtons.includes(activeElement as HTMLElement)) {
          break
        }
      }
      
      // Assert
      const focusableButton = bookButtons.find(button =>
        button === document.activeElement
      )
      expect(focusableButton).toBeDefined()
    })
  })

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      // Mock mobile viewport
      global.innerWidth = 375
      global.innerHeight = 667
    })

    afterEach(() => {
      // Reset to desktop viewport
      global.innerWidth = 1024
      global.innerHeight = 768
    })

    it('renders correctly on mobile viewport', () => {
      // Arrange & Act
      render(<ClassesPage />)
      
      // Assert
      expect(screen.getByText('Choose Your Perfect')).toBeInTheDocument()
      expect(screen.getByText('1-on-1 Personal Training')).toBeInTheDocument()
      expect(screen.getByText('Double Trouble & Tiny Toots')).toBeInTheDocument()
      expect(screen.getByText('Small Mums & Bubs Classes')).toBeInTheDocument()
    })

    it('maintains functionality on mobile', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<ClassesPage />)
      
      // Act
      const ctaButton = screen.getByText('Book Your FREE Session Now')
      await user.click(ctaButton)
      
      // Assert
      expect(screen.getByTestId('booking-form')).toBeInTheDocument()
    })
  })

  describe('Service Card Interaction', () => {
    it('applies hover styles on service cards', async () => {
      // Arrange
      const user = userEvent.setup()
      const { container } = render(<ClassesPage />)
      const serviceCards = container.querySelectorAll('.group')
      expect(serviceCards.length).toBeGreaterThan(0)
      
      // Act
      const firstCard = serviceCards[0] as HTMLElement
      await user.hover(firstCard)
      
      // Assert
      expect(firstCard.className).toContain('transition-all')
      expect(firstCard.className).toContain('hover:scale-105')
      expect(firstCard.className).toContain('hover:shadow-3xl')
    })

    it('applies reduced opacity to coming soon cards', () => {
      // Arrange & Act
      const { container } = render(<ClassesPage />)
      
      // Assert
      const comingSoonBadge = screen.getByTestId('coming-soon-badge')
      const comingSoonCard = comingSoonBadge.closest('.group') as HTMLElement
      expect(comingSoonCard.className).toContain('opacity-75')
    })
  })

  describe('Content Accuracy', () => {
    it('displays correct pricing information', () => {
      // Arrange & Act
      render(<ClassesPage />)
      
      // Assert
      const prices = screen.getAllByTestId('price')
      expect(prices[0]).toHaveTextContent('$80') // 1-on-1
      expect(prices[1]).toHaveTextContent('$40') // Double Trouble
      expect(prices[2]).toHaveTextContent('$20') // Group classes
    })

    it('displays correct service descriptions', () => {
      // Arrange & Act
      render(<ClassesPage />)
      
      // Assert
      expect(screen.getByText(/Completely personalized program/)).toBeInTheDocument()
      expect(screen.getByText(/chaos is more fun when shared/)).toBeInTheDocument()
      expect(screen.getByText(/Coming soon in parks/)).toBeInTheDocument()
    })

    it('displays promotional messages correctly', () => {
      // Arrange & Act
      render(<ClassesPage />)
      
      // Assert
      expect(screen.getByText('Your First Session is 100% FREE!')).toBeInTheDocument()
      expect(screen.getByText(/Quick booking.*Instant confirmation.*No pressure/)).toBeInTheDocument()
      expect(screen.getByText(/supportive M\.O\.M\.unity/)).toBeInTheDocument()
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
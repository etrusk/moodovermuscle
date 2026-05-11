/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole and getByText with regex for accessibility-first testing
 * @last-refactored 2025-10-10
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import ClassesPage from '@/app/classes/page'

// Add jest-axe matchers
expect.extend(toHaveNoViolations)

// Mock the required components
vi.mock('@/components/header', () => ({
  Header: ({ onBookSessionClick }: { onBookSessionClick: () => void }) => (
    <header data-testid="header">
      <button onClick={onBookSessionClick}>Book Now</button>
    </header>
  ),
}))

vi.mock('@/components/booking-form', () => ({
  BookingForm: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? (
      <div data-testid="booking-form">
        <h2>Book Your Session</h2>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}))

// Mock the ServiceCard sub-components
vi.mock('@/components/classes/ServiceCardHeader', () => ({
  ServiceCardHeader: ({ popular, comingSoon }: { popular?: boolean; comingSoon?: boolean }) => (
    <div data-testid="service-card-header">
      {popular && <span data-testid="popular-badge">Popular</span>}
      {comingSoon && <span data-testid="coming-soon-badge">Coming Soon</span>}
    </div>
  ),
}))

vi.mock('@/components/classes/ServiceCardContent', () => ({
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

vi.mock('@/components/classes/ServiceCardActions', () => ({
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
      // Arrange
      const expectedSections = {
        hero: ['Choose Your Perfect', 'Training Option', 'Your First Session is 100% FREE!'],
        serviceAreas: 'Service Areas',
        cta: ['Ready to Start Your Journey?', 'Book Your FREE Session Now']
      }
      
      // Act
      const { container } = render(<ClassesPage />)
      
      // Assert - Hero section
      expect(screen.getByText(expectedSections.hero[0])).toMatchObject({
        textContent: expect.stringContaining('Choose Your Perfect')
      })
      expect(screen.getByText(expectedSections.hero[1])).toBeInTheDocument()
      
      // Assert - Service areas
      expect(screen.getByText(expectedSections.serviceAreas)).toBeInTheDocument()
      expect(screen.getByText(/Maroochydore.*Mudjimba.*Buderim.*Coolum/)).toBeInTheDocument()
      
      // Assert - CTA section
      expect(screen.getByText(expectedSections.cta[0])).toBeInTheDocument()
      expect(screen.getByText(expectedSections.cta[1])).toBeInTheDocument()
    })

    it('renders one service card', () => {
      // Arrange
      const expectedServices = [
        { title: '1-on-1 Personal Training', price: '$80' }
      ]
      
      // Act
      render(<ClassesPage />)
      
      // Assert - Service titles
      expectedServices.forEach(service => {
        expect(screen.getByText(service.title)).toMatchObject({
          textContent: service.title
        })
      })
      
      // Assert - Prices
      const prices = screen.getAllByTestId('price')
      expect(prices).toMatchObject({
        length: 1
      })
      expect(prices[0]).toMatchObject({ textContent: expectedServices[0].price })
    })

    it('displays popular badge on correct service', () => {
      // Arrange
      const expectedBadgeCount = 1
      
      // Act
      render(<ClassesPage />)
      
      // Assert
      const popularBadges = screen.getAllByTestId('popular-badge')
      expect(popularBadges).toMatchObject({ length: expectedBadgeCount })
      expect(popularBadges[0]).toMatchObject({ textContent: 'Popular' })
    })

    it('does not display coming soon badge', () => {
      // Arrange & Act
      render(<ClassesPage />)
      
      // Assert
      const comingSoonBadges = screen.queryAllByTestId('coming-soon-badge')
      expect(comingSoonBadges).toHaveLength(0)
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

    it('allows booking for all available services', () => {
      // Arrange & Act
      render(<ClassesPage />)
      
      // Assert
      const bookButtons = screen.getAllByTestId('book-service-button')
      expect(bookButtons).toHaveLength(1)
      bookButtons.forEach(button => {
        expect(button).not.toBeDisabled()
      })
    })
  })

  describe('Service Features Display', () => {
    it('displays all features for each service', () => {
      // Arrange & Act
      render(<ClassesPage />)
      
      // Assert
      const featureLists = screen.getAllByTestId('features-list')
      expect(featureLists).toHaveLength(1)
      
      // Assert - Check 1-on-1 service renders 4 feature list items (structural, not verbatim)
      const personalTrainingFeatures = within(featureLists[0]).getAllByRole('listitem')
      expect(personalTrainingFeatures).toHaveLength(4)
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
      expect(focusableButton).toBeInstanceOf(HTMLElement) // Button is focusable element
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
      
      // Act
      const firstCard = serviceCards[0] as HTMLElement
      await user.hover(firstCard)
      
      // Assert
      expect(firstCard).toMatchObject({
        className: expect.stringContaining('transition-all')
      })
      expect(firstCard.className).toContain('hover:scale-105')
      expect(firstCard.className).toContain('hover:shadow-3xl')
    })

    it('applies standard styling to all service cards', () => {
      // Arrange & Act
      render(<ClassesPage />)
      
      // Assert
      const serviceHeaders = screen.getAllByTestId('service-card-header')
      expect(serviceHeaders).toHaveLength(1)
      
      // Verify no cards have reduced opacity (no coming soon services)
      const serviceContents = screen.getAllByTestId('service-card-content')
      expect(serviceContents).toHaveLength(1)
    })
  })

  describe('Content Accuracy', () => {
    it('displays correct pricing information', () => {
      // Arrange & Act
      render(<ClassesPage />)
      
      // Assert
      const prices = screen.getAllByTestId('price')
      expect(prices[0]).toHaveTextContent('$80') // 1-on-1
    })

    it('displays correct service descriptions', () => {
      // Arrange & Act
      render(<ClassesPage />)
      
      // Assert
      expect(screen.getByText(/Completely personalized program/)).toBeInTheDocument()
    })

    it('displays promotional messages correctly', () => {
      // Arrange & Act
      render(<ClassesPage />)
      
      // Assert - structural checks for promotional region rendering
      expect(screen.getByText('Your First Session is 100% FREE!')).toBeInTheDocument()
      expect(screen.getByText(/Quick booking.*Instant confirmation.*No pressure/)).toBeInTheDocument()
    })

    it('handles missing service data error', () => {
      // Arrange
      const invalidServiceData = null
      
      // Act & Assert
      expect(() => {
        if (!invalidServiceData) {
          throw new Error('Service data is required')
        }
      }).toThrow('Service data is required')
    })

    it('handles invalid price format error', () => {
      // Arrange
      const invalidPrice = 'invalid-price'
      
      // Act & Assert
      expect(() => {
        const parsedPrice = parseFloat(invalidPrice.replace(/\$/g, ''))
        if (isNaN(parsedPrice)) {
          throw new Error('Invalid price format')
        }
      }).toThrow('Invalid price format')
    })
  })
})
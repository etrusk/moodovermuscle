import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

/**
 * EXAMPLE: Better Testing Approach
 * 
 * This demonstrates testing patterns that focus on functionality
 * rather than implementation details like exact text strings.
 */

describe('Better Testing Patterns', () => {
  
  // BAD: Brittle test that breaks with text changes
  describe('❌ Anti-Pattern: Testing Exact Text', () => {
    it('fails when marketing updates the copy', () => {
      // This test breaks every time someone changes the button text
      // expect(screen.getByText('Start FREE Session')).toBeInTheDocument()
      // expect(screen.getByText('$80 per session')).toBeInTheDocument()
    })
  })

  // GOOD: Robust tests that survive text changes
  describe('✅ Pattern: Testing Functionality', () => {
    
    it('has a clickable booking action regardless of button text', () => {
      render(
        <button data-testid="book-action" onClick={jest.fn()}>
          {/* Text can be anything - test doesn't care */}
          Book Now / Start Session / Get Started / Whatever Marketing Wants
        </button>
      )
      
      const bookAction = screen.getByTestId('book-action')
      expect(bookAction).toBeEnabled()
      fireEvent.click(bookAction)
      // Test the behavior, not the label
    })

    it('displays price information in any format', () => {
      render(
        <div data-testid="price-info" data-price="80">
          {/* Format can change: $80, $80/session, 80 USD, etc */}
          $80 per session
        </div>
      )
      
      const priceElement = screen.getByTestId('price-info')
      expect(priceElement).toHaveAttribute('data-price', '80')
      // We care that price is shown and accessible, not its format
    })

    it('indicates service availability without specific text', () => {
      render(
        <div 
          data-testid="service-card" 
          data-available="false"
          aria-label="Service not yet available"
        >
          {/* Can say "Coming Soon", "Available Soon", "Check Back Later" */}
          Coming Soon
        </div>
      )
      
      const serviceCard = screen.getByTestId('service-card')
      expect(serviceCard).toHaveAttribute('data-available', 'false')
      expect(serviceCard).toHaveAttribute('aria-label', expect.stringContaining('not'))
    })
  })

  describe('✅ Pattern: Testing User Flows', () => {
    it('allows booking flow completion regardless of labels', () => {
      const mockSubmit = jest.fn()
      
      render(
        <form data-testid="booking-form" onSubmit={mockSubmit}>
          <input data-testid="service-select" type="radio" name="service" value="pt" />
          <input data-testid="date-select" type="date" />
          <button data-testid="submit-booking" type="submit">
            {/* Button text is irrelevant to the test */}
            Any Text Here
          </button>
        </form>
      )
      
      // Test the flow, not the text
      fireEvent.click(screen.getByTestId('service-select'))
      fireEvent.change(screen.getByTestId('date-select'), { 
        target: { value: '2024-12-01' } 
      })
      fireEvent.click(screen.getByTestId('submit-booking'))
      
      expect(mockSubmit).toHaveBeenCalled()
    })
  })

  describe('✅ Pattern: Testing Accessibility', () => {
    it('provides proper ARIA labels regardless of visible text', () => {
      render(
        <button 
          aria-label="Book a training session"
          data-testid="book-button"
        >
          {/* Visible text can be anything */}
          Book
        </button>
      )
      
      const button = screen.getByTestId('book-button')
      expect(button).toHaveAccessibleName('Book a training session')
      // This ensures screen readers work regardless of button text
    })
  })
})

/**
 * KEY PRINCIPLES:
 * 
 * 1. Use data-testid for element selection, not text content
 * 2. Test behaviors and outcomes, not implementation details
 * 3. Use semantic HTML roles when appropriate
 * 4. Verify data attributes for state, not UI text
 * 5. Test user flows, not individual text elements
 * 6. Ensure accessibility through ARIA, not visible text
 * 
 * BENEFITS:
 * - Marketing can change copy without breaking tests
 * - Tests focus on actual functionality
 * - Reduced maintenance burden
 * - Better separation of concerns
 * - Tests document behavior, not current text
 */
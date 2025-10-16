/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole for heading/content testing
 * @last-refactored 2025-10-10
 */
import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { Users, Heart, Calendar } from 'lucide-react'
import { ServiceCardContent } from '@/components/classes/ServiceCardContent'
import { axe, toHaveNoViolations } from 'jest-axe'

// Add jest-axe matchers
expect.extend(toHaveNoViolations)

describe('ServiceCardContent Component', () => {
  const defaultProps = {
    icon: Users,
    title: '1-on-1 Personal Training',
    description: 'Completely personalized program designed just for you and your goals.',
    price: '$80',
    features: [
      'Fully customized workout plans',
      'Flexible location (home, park, studio)',
      'Postnatal recovery focus',
      'One-on-one guidance & support',
    ],
  }

  describe('Icon Rendering', () => {
    it('renders the provided icon', () => {
      // Arrange & Act
      const { container } = render(<ServiceCardContent {...defaultProps} />)
      
      const iconContainer = container.querySelector('.bg-gradient-to-r.from-rose-500.to-pink-500')
      const svg = iconContainer?.querySelector('svg')
      
      // Assert
      expect(iconContainer).toMatchObject({
        tagName: expect.stringMatching(/^DIV$/i)
      })
      expect(svg).toMatchObject({
        tagName: 'svg'
      })
    })

    it('applies correct icon styling', () => {
      // Arrange & Act
      const { container } = render(<ServiceCardContent {...defaultProps} />)
      
      const iconContainer = container.querySelector('.bg-gradient-to-r.from-rose-500.to-pink-500')
      
      // Assert
      expect(iconContainer?.className).toEqual(expect.stringContaining('p-6'))
      expect(iconContainer?.className).toEqual(expect.stringContaining('rounded-3xl'))
      expect(iconContainer?.className).toEqual(expect.stringContaining('shadow-xl'))
    })

    it('handles invalid icon prop', () => {
      // Arrange
      // This test verifies the component handles invalid icon input
      
      // Act & Assert - Component will throw when icon is null
      expect(() => {
        render(<ServiceCardContent {...defaultProps} icon={null as any} />)
      }).toThrow()
    })

    it('renders Users icon correctly', () => {
      // Arrange & Act
      const { container } = render(<ServiceCardContent {...defaultProps} icon={Users} />)
      
      const iconContainer = container.querySelector('.bg-gradient-to-r.from-rose-500.to-pink-500')
      const svg = iconContainer?.querySelector('svg')
      
      // Assert
      expect(svg).toMatchObject({ tagName: 'svg' })
    })

    it('renders Heart icon correctly', () => {
      // Arrange & Act
      const { container } = render(<ServiceCardContent {...defaultProps} icon={Heart} />)
      
      const iconContainer = container.querySelector('.bg-gradient-to-r.from-rose-500.to-pink-500')
      const svg = iconContainer?.querySelector('svg')
      
      // Assert
      expect(svg).toMatchObject({ tagName: 'svg' })
    })

    it('renders Calendar icon correctly', () => {
      // Arrange & Act
      const { container } = render(<ServiceCardContent {...defaultProps} icon={Calendar} />)
      
      const iconContainer = container.querySelector('.bg-gradient-to-r.from-rose-500.to-pink-500')
      const svg = iconContainer?.querySelector('svg')
      
      // Assert
      expect(svg).toMatchObject({ tagName: 'svg' })
    })
  })

  describe('Title and Description', () => {
    it('renders the service title', () => {
      // Arrange & Act
      render(<ServiceCardContent {...defaultProps} />)
      
      const title = screen.getByRole('heading', { name: /1-on-1 personal training/i })
      
      // Assert
      expect(title).toMatchObject({
        tagName: expect.stringMatching(/^H\d$/),
        textContent: expect.stringMatching(/1-on-1 personal training/i)
      })
    })

    it('applies correct title styling', () => {
      // Arrange & Act
      render(<ServiceCardContent {...defaultProps} />)
      
      const title = screen.getByRole('heading')
      
      // Assert
      expect(title.className).toEqual(expect.stringContaining('text-2xl'))
      expect(title.className).toEqual(expect.stringContaining('font-bold'))
      expect(title.className).toEqual(expect.stringContaining('text-stone-900'))
    })

    it('renders the service description', () => {
      // Arrange & Act
      render(<ServiceCardContent {...defaultProps} />)
      
      const description = screen.getByText(defaultProps.description)
      
      // Assert
      expect(description).toMatchObject({
        textContent: expect.stringContaining(defaultProps.description)
      })
    })

    it('applies correct description styling', () => {
      // Arrange & Act
      render(<ServiceCardContent {...defaultProps} />)
      
      const description = screen.getByText(defaultProps.description)
      
      // Assert
      expect(description.className).toEqual(expect.stringContaining('text-stone-600'))
      expect(description.className).toEqual(expect.stringContaining('leading-relaxed'))
    })
  })

  describe('Price Display', () => {
    it('renders the price with correct formatting', () => {
      // Arrange & Act
      render(<ServiceCardContent {...defaultProps} />)
      
      // Assert
      expect(screen.getByText(/\$80/i)).toMatchObject({
        textContent: expect.stringMatching(/\$80/)
      })
      expect(screen.getByText(/per session/i)).toBeInTheDocument()
    })

    it('applies correct price styling', () => {
      // Arrange & Act
      render(<ServiceCardContent {...defaultProps} />)
      
      const priceValue = screen.getByText(/\$80/i)
      
      // Assert
      expect(priceValue.className).toEqual(expect.stringContaining('text-3xl'))
      expect(priceValue.className).toEqual(expect.stringContaining('font-bold'))
      expect(priceValue.className).toEqual(expect.stringContaining('text-rose-600'))
    })

    it('renders different price values correctly', () => {
      // Arrange & Act
      render(<ServiceCardContent {...defaultProps} price="$40" />)
      
      // Assert
      expect(screen.getByText('$40')).toMatchObject({
        textContent: '$40'
      })
    })

    it('includes per session label', () => {
      // Arrange & Act
      render(<ServiceCardContent {...defaultProps} />)
      
      const sessionLabel = screen.getByText('per session')
      
      // Assert
      expect(sessionLabel).toMatchObject({
        textContent: 'per session'
      })
      expect(sessionLabel.className).toEqual(expect.stringContaining('text-stone-500'))
    })
  })

  describe('Features List', () => {
    it('renders all features', () => {
      render(<ServiceCardContent {...defaultProps} />)
      
      defaultProps.features.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument()
      })
    })

    it('renders features with checkmarks', () => {
      const { container } = render(<ServiceCardContent {...defaultProps} />)
      
      // Features are rendered as divs with checkmarks
      const featureContainer = container.querySelector('.grid.gap-4')
      expect(featureContainer).toBeInTheDocument()
      
      // Check for all feature texts
      defaultProps.features.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument()
      })
    })

    it('includes checkmark icons for each feature', () => {
      const { container } = render(<ServiceCardContent {...defaultProps} />)
      
      // Count checkmark SVGs
      const checkmarks = container.querySelectorAll('svg.lucide-circle-check-big')
      expect(checkmarks).toHaveLength(defaultProps.features.length)
    })

    it('applies correct feature styling', () => {
      const { container } = render(<ServiceCardContent {...defaultProps} />)
      
      const featureContainer = container.querySelector('.grid.gap-4')
      expect(featureContainer?.className).toContain('md:grid-cols-2')
      
      // Check individual feature styling - look specifically within the features grid
      const features = featureContainer?.querySelectorAll('.flex.items-center.gap-3')
      expect(features?.length).toBe(defaultProps.features.length) // One flex container per feature
    })

    it('handles empty features array', () => {
      const { container } = render(<ServiceCardContent {...defaultProps} features={[]} />)
      
      // Grid should still be rendered but empty
      const featureContainer = container.querySelector('.grid.gap-4')
      expect(featureContainer).toBeInTheDocument()
      expect(featureContainer?.children.length).toBe(0)
    })

    it('handles single feature', () => {
      render(<ServiceCardContent {...defaultProps} features={['Single feature']} />)
      
      expect(screen.getByText('Single feature')).toBeInTheDocument()
    })

    it('handles many features', () => {
      const manyFeatures = [
        'Feature 1',
        'Feature 2',
        'Feature 3',
        'Feature 4',
        'Feature 5',
        'Feature 6',
      ]
      
      render(<ServiceCardContent {...defaultProps} features={manyFeatures} />)
      
      manyFeatures.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument()
      })
    })
  })

  describe('Different Service Configurations', () => {
    it('renders correctly for 1-on-1 Personal Training', () => {
      const personalTraining = {
        icon: Users,
        title: '1-on-1 Personal Training',
        description: 'Completely personalized program designed just for you and your goals.',
        price: '$80',
        features: [
          'Fully customized workout plans',
          'Flexible location (home, park, studio)',
          'Postnatal recovery focus',
          'One-on-one guidance & support',
        ],
      }
      
      render(<ServiceCardContent {...personalTraining} />)
      
      expect(screen.getByRole('heading', { name: '1-on-1 Personal Training' })).toBeInTheDocument()
      expect(screen.getByText('$80')).toBeInTheDocument()
      // Check all features are rendered
      personalTraining.features.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument()
      })
    })

  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<ServiceCardContent {...defaultProps} />)
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('uses semantic HTML elements', () => {
      render(<ServiceCardContent {...defaultProps} />)
      
      // Should use heading for title
      expect(screen.getByRole('heading', { name: '1-on-1 Personal Training' })).toBeInTheDocument()
      
      // Should use paragraph for description
      expect(screen.getByRole('paragraph')).toBeInTheDocument()
      
      // Features are rendered as divs with checkmarks, not a list
      const featureTexts = screen.getAllByText(/Fully customized|Flexible location|Postnatal recovery|One-on-one guidance/)
      expect(featureTexts).toHaveLength(4)
    })

    it('provides appropriate text hierarchy', () => {
      render(<ServiceCardContent {...defaultProps} />)
      
      const heading = screen.getByRole('heading')
      expect(heading.tagName).toBe('H3')
    })

    it('maintains readability with long content', () => {
      const longContent = {
        ...defaultProps,
        title: 'This is an extremely long service title that should still be readable',
        description: 'This is a very long description that goes on and on to test how the component handles extensive text content without breaking the layout or compromising readability.',
        features: [
          'This is a very long feature description that explains in great detail what the service offers',
          'Another extremely detailed feature that provides comprehensive information about the service',
        ],
      }
      
      render(<ServiceCardContent {...longContent} />)
      
      expect(screen.getByRole('heading')).toBeInTheDocument()
      expect(screen.getByText(longContent.description)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles special characters in content', () => {
      // Arrange
      const specialChars = {
        ...defaultProps,
        title: 'Training & Fitness',
        description: 'Get fit & healthy with our "special" program!',
        price: '$80+',
        features: [
          'Feature with & ampersand',
          'Feature with "quotes"',
          'Feature with <brackets>',
        ],
      }
      
      // Act
      render(<ServiceCardContent {...specialChars} />)
      
      // Assert
      expect(screen.getByRole('heading', { name: 'Training & Fitness' })).toMatchObject({
        textContent: expect.stringContaining('Training & Fitness')
      })
      expect(screen.getByText('Feature with & ampersand')).toBeInTheDocument()
    })

    it('handles price without dollar sign', () => {
      // Arrange & Act
      render(<ServiceCardContent {...defaultProps} price="80" />)
      
      // Assert
      expect(screen.getByText('80')).toMatchObject({
        textContent: '80'
      })
    })

    it('handles very long price string', () => {
      // Arrange & Act
      render(<ServiceCardContent {...defaultProps} price="$80-120 depending on location" />)
      
      // Assert
      expect(screen.getByText('$80-120 depending on location')).toMatchObject({
        textContent: '$80-120 depending on location'
      })
    })

    it('handles undefined optional props gracefully', () => {
      // Arrange
      const minimalProps = {
        icon: Users,
        title: 'Service Title',
        description: 'Service Description',
        price: '$50',
        features: [],
      }
      
      // Act
      render(<ServiceCardContent {...minimalProps} />)
      
      // Assert
      expect(screen.getByRole('heading', { name: 'Service Title' })).toMatchObject({
        textContent: 'Service Title'
      })
    })

    it('handles missing required props gracefully', () => {
      // Arrange & Act
      render(<ServiceCardContent {...defaultProps} title={undefined as any} />)

      // Assert
      const container = screen.getByRole('heading').parentElement
      expect(container).toMatchObject({
        tagName: expect.any(String)
      })
    })
  })

  describe('Visual Styling', () => {
    it('applies gradient background to icon container', () => {
      const { container } = render(<ServiceCardContent {...defaultProps} />)
      
      // Look for the icon container by its classes instead of role
      const iconContainer = container.querySelector('.bg-gradient-to-r.from-rose-500.to-pink-500')
      expect(iconContainer).toBeInTheDocument()
      expect(iconContainer?.className).toContain('rounded-3xl')
      expect(iconContainer?.className).toContain('shadow-xl')
    })

    it('applies styling to price', () => {
      render(<ServiceCardContent {...defaultProps} />)
      
      const priceValue = screen.getByText('$80')
      // The actual implementation uses text-rose-600 for price styling
      expect(priceValue.className).toContain('text-3xl')
      expect(priceValue.className).toContain('font-bold')
      expect(priceValue.className).toContain('text-rose-600')
    })

    it('maintains consistent spacing', () => {
      const { container } = render(<ServiceCardContent {...defaultProps} />)
      
      // Check for space-y classes for vertical spacing
      const spacedElements = container.querySelectorAll('[class*="space-y"]')
      expect(spacedElements.length).toBeGreaterThanOrEqual(1) // At least one element with spacing
    })
  })
})
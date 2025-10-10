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
      const { container } = render(<ServiceCardContent {...defaultProps} />)
      
      // Check for icon container by its classes
      const iconContainer = container.querySelector('.bg-gradient-to-r.from-rose-500.to-pink-500')
      expect(iconContainer).toBeInTheDocument()
      
      // Check for SVG element
      const svg = iconContainer?.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('applies correct icon styling', () => {
      const { container } = render(<ServiceCardContent {...defaultProps} />)
      
      const iconContainer = container.querySelector('.bg-gradient-to-r.from-rose-500.to-pink-500')
      expect(iconContainer?.className).toContain('p-6')
      expect(iconContainer?.className).toContain('rounded-3xl')
      expect(iconContainer?.className).toContain('shadow-xl')
    })

    it('renders Users icon correctly', () => {
      const { container } = render(<ServiceCardContent {...defaultProps} icon={Users} />)
      
      const iconContainer = container.querySelector('.bg-gradient-to-r.from-rose-500.to-pink-500')
      const svg = iconContainer?.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders Heart icon correctly', () => {
      const { container } = render(<ServiceCardContent {...defaultProps} icon={Heart} />)
      
      const iconContainer = container.querySelector('.bg-gradient-to-r.from-rose-500.to-pink-500')
      const svg = iconContainer?.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders Calendar icon correctly', () => {
      const { container } = render(<ServiceCardContent {...defaultProps} icon={Calendar} />)
      
      const iconContainer = container.querySelector('.bg-gradient-to-r.from-rose-500.to-pink-500')
      const svg = iconContainer?.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Title and Description', () => {
    it('renders the service title', () => {
      render(<ServiceCardContent {...defaultProps} />)
      
      const title = screen.getByRole('heading', { name: '1-on-1 Personal Training' })
      expect(title).toBeInTheDocument()
    })

    it('applies correct title styling', () => {
      render(<ServiceCardContent {...defaultProps} />)
      
      const title = screen.getByRole('heading')
      expect(title.className).toContain('text-2xl')
      expect(title.className).toContain('font-bold')
      expect(title.className).toContain('text-stone-800')
    })

    it('renders the service description', () => {
      render(<ServiceCardContent {...defaultProps} />)
      
      const description = screen.getByText(defaultProps.description)
      expect(description).toBeInTheDocument()
    })

    it('applies correct description styling', () => {
      render(<ServiceCardContent {...defaultProps} />)
      
      const description = screen.getByText(defaultProps.description)
      expect(description.className).toContain('text-stone-600')
      expect(description.className).toContain('leading-relaxed')
    })
  })

  describe('Price Display', () => {
    it('renders the price with correct formatting', () => {
      render(<ServiceCardContent {...defaultProps} />)
      
      expect(screen.getByText('$80')).toBeInTheDocument()
      expect(screen.getByText('per session')).toBeInTheDocument()
    })

    it('applies correct price styling', () => {
      render(<ServiceCardContent {...defaultProps} />)
      
      const priceValue = screen.getByText('$80')
      expect(priceValue.className).toContain('text-3xl')
      expect(priceValue.className).toContain('font-bold')
      expect(priceValue.className).toContain('text-rose-600')
    })

    it('renders different price values correctly', () => {
      render(<ServiceCardContent {...defaultProps} price="$40" />)
      
      expect(screen.getByText('$40')).toBeInTheDocument()
    })

    it('includes per session label', () => {
      render(<ServiceCardContent {...defaultProps} />)
      
      const sessionLabel = screen.getByText('per session')
      expect(sessionLabel).toBeInTheDocument()
      expect(sessionLabel.className).toContain('text-stone-500')
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
      
      // Check individual feature styling
      const features = container.querySelectorAll('.flex.items-center.gap-3')
      expect(features.length).toBeGreaterThan(0)
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

    it('renders correctly for Double Trouble & Tiny Toots', () => {
      const doubleTraining = {
        icon: Heart,
        title: 'Double Trouble & Tiny Toots',
        description: 'Personalised private training for two mums',
        price: '$40',
        features: [
          'Training for two mums together',
          'Share the cost and the fun',
          'Flexible location options',
          'Baby-friendly environment',
        ],
      }
      
      render(<ServiceCardContent {...doubleTraining} />)
      
      expect(screen.getByRole('heading', { name: 'Double Trouble & Tiny Toots' })).toBeInTheDocument()
      expect(screen.getByText('$40')).toBeInTheDocument()
      // Features are rendered as divs with checkmarks, not list items
      const features = screen.getAllByText(/Training for two mums|Share the cost|Flexible location|Baby-friendly/)
      expect(features).toHaveLength(4)
    })

    it('renders correctly for Small Mums & Bubs Classes', () => {
      const groupClass = {
        icon: Calendar,
        title: 'Small Mums & Bubs Classes',
        description: 'Coming soon in parks - small groups up to 10 people',
        price: '$20',
        features: [
          'Small group support (max 10 mums)',
          'Baby-friendly park sessions',
          'Build lasting friendships',
          'Affordable community option',
        ],
      }
      
      render(<ServiceCardContent {...groupClass} />)
      
      expect(screen.getByRole('heading', { name: 'Small Mums & Bubs Classes' })).toBeInTheDocument()
      expect(screen.getByText('$20')).toBeInTheDocument()
      // Features are rendered as divs with checkmarks, not list items
      const features = screen.getAllByText(/Small group support|Baby-friendly park|Build lasting friendships|Affordable community/)
      expect(features).toHaveLength(4)
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
      
      render(<ServiceCardContent {...specialChars} />)
      
      expect(screen.getByRole('heading', { name: 'Training & Fitness' })).toBeInTheDocument()
      expect(screen.getByText('Feature with & ampersand')).toBeInTheDocument()
    })

    it('handles price without dollar sign', () => {
      render(<ServiceCardContent {...defaultProps} price="80" />)
      
      expect(screen.getByText('80')).toBeInTheDocument()
    })

    it('handles very long price string', () => {
      render(<ServiceCardContent {...defaultProps} price="$80-120 depending on location" />)
      
      expect(screen.getByText('$80-120 depending on location')).toBeInTheDocument()
    })

    it('handles undefined optional props gracefully', () => {
      const minimalProps = {
        icon: Users,
        title: 'Service Title',
        description: 'Service Description',
        price: '$50',
        features: [],
      }
      
      render(<ServiceCardContent {...minimalProps} />)
      
      expect(screen.getByRole('heading', { name: 'Service Title' })).toBeInTheDocument()
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
      expect(spacedElements.length).toBeGreaterThan(0)
    })
  })
})
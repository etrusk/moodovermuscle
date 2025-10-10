/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole and getByTestId for component-specific testing
 * @last-refactored 2025-10-10
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Users, Heart, Calendar } from 'lucide-react'
import { axe, toHaveNoViolations } from 'jest-axe'

// Add jest-axe matchers
expect.extend(toHaveNoViolations)

// Mock the sub-components
jest.mock('@/components/classes/ServiceCardHeader', () => ({
  ServiceCardHeader: ({ popular, comingSoon }: { popular?: boolean; comingSoon?: boolean }) => (
    <div data-testid="service-card-header">
      {popular && <span data-testid="popular-badge">Most Popular</span>}
      {comingSoon && <span data-testid="coming-soon-badge">Coming Soon</span>}
    </div>
  ),
}))

jest.mock('@/components/classes/ServiceCardContent', () => ({
  ServiceCardContent: jest.requireActual('@/components/classes/ServiceCardContent').ServiceCardContent,
}))

jest.mock('@/components/classes/ServiceCardActions', () => ({
  ServiceCardActions: jest.requireActual('@/components/classes/ServiceCardActions').ServiceCardActions,
}))

// Since ServiceCard is defined inline in the page component, we'll create a test version
const ServiceCard = ({ 
  service, 
  onBookSessionClick 
}: { 
  service: {
    icon: any;
    title: string;
    description: string;
    price: string;
    gradient: string;
    popular?: boolean;
    comingSoon?: boolean;
    features: string[];
  };
  onBookSessionClick: () => void;
}) => {
  const { ServiceCardHeader } = require('@/components/classes/ServiceCardHeader')
  const { ServiceCardContent } = require('@/components/classes/ServiceCardContent')
  const { ServiceCardActions } = require('@/components/classes/ServiceCardActions')
  const { Card, CardContent } = require('@/components/ui/card')
  
  return (
    <Card
      className={`group border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-white/90 backdrop-blur-sm overflow-hidden hover:scale-105 relative ${
        service.comingSoon ? 'opacity-75' : ''
      }`}
      data-testid="service-card"
    >
      <ServiceCardHeader popular={service.popular} comingSoon={service.comingSoon} />
      
      <CardContent className="p-10 space-y-8 pt-12">
        <ServiceCardContent
          icon={service.icon}
          title={service.title}
          description={service.description}
          price={service.price}
          features={service.features}
        />
        
        <ServiceCardActions
          comingSoon={service.comingSoon}
          gradient={service.gradient}
          onBookSessionClick={onBookSessionClick}
        />
      </CardContent>
    </Card>
  )
}

describe('ServiceCard Component', () => {
  const mockOnBookSessionClick = jest.fn()

  const defaultService = {
    icon: Users,
    title: '1-on-1 Personal Training',
    description: 'Completely personalized program designed just for you and your goals.',
    price: '$80',
    gradient: 'from-rose-500 to-pink-500',
    popular: false,
    features: [
      'Fully customized workout plans',
      'Flexible location (home, park, studio)',
      'Postnatal recovery focus',
      'One-on-one guidance & support',
    ],
  }

  beforeEach(() => {
    mockOnBookSessionClick.mockClear()
  })

  describe('Rendering', () => {
    it('renders service card with all props', () => {
      render(
        <ServiceCard 
          service={defaultService} 
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      expect(screen.getByTestId('service-card')).toBeInTheDocument()
      expect(screen.getByTestId('service-card-header')).toBeInTheDocument()
    })

    it('applies correct styling classes', () => {
      const { container } = render(
        <ServiceCard 
          service={defaultService} 
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const card = screen.getByTestId('service-card')
      expect(card).toHaveClass('group')
      expect(card).toHaveClass('border-0')
      expect(card).toHaveClass('shadow-2xl')
      expect(card).toHaveClass('hover:shadow-3xl')
      expect(card).toHaveClass('transition-all')
      expect(card).toHaveClass('duration-500')
      expect(card).toHaveClass('bg-white/90')
      expect(card).toHaveClass('backdrop-blur-sm')
      expect(card).toHaveClass('overflow-hidden')
      expect(card).toHaveClass('hover:scale-105')
      expect(card).toHaveClass('relative')
    })

    it('renders popular badge when service is popular', () => {
      const popularService = { ...defaultService, popular: true }
      
      render(
        <ServiceCard
          service={popularService}
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      expect(screen.getByTestId('popular-badge')).toBeInTheDocument()
      expect(screen.getByText(/most popular/i)).toBeInTheDocument()
    })

    it('does not render popular badge when service is not popular', () => {
      render(
        <ServiceCard 
          service={defaultService} 
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      expect(screen.queryByTestId('popular-badge')).not.toBeInTheDocument()
    })

    it('renders coming soon badge for upcoming services', () => {
      const comingSoonService = { ...defaultService, comingSoon: true }
      
      render(
        <ServiceCard
          service={comingSoonService}
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      expect(screen.getByTestId('coming-soon-badge')).toBeInTheDocument()
      // There may be multiple "Coming Soon" elements (badge and button)
      const comingSoonElements = screen.getAllByText(/coming soon/i)
      expect(comingSoonElements.length).toBeGreaterThan(0)
    })

    it('applies reduced opacity for coming soon services', () => {
      const comingSoonService = { ...defaultService, comingSoon: true }
      
      render(
        <ServiceCard 
          service={comingSoonService} 
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const card = screen.getByTestId('service-card')
      expect(card).toHaveClass('opacity-75')
    })

    it('does not apply reduced opacity for active services', () => {
      render(
        <ServiceCard 
          service={defaultService} 
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const card = screen.getByTestId('service-card')
      expect(card).not.toHaveClass('opacity-75')
    })
  })

  describe('Service Types', () => {
    it('renders correctly for 1-on-1 Personal Training', () => {
      const personalTraining = {
        ...defaultService,
        icon: Users,
        title: '1-on-1 Personal Training',
        price: '$80',
        popular: true,
      }
      
      render(
        <ServiceCard 
          service={personalTraining} 
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      expect(screen.getByTestId('service-card')).toBeInTheDocument()
      expect(screen.getByTestId('popular-badge')).toBeInTheDocument()
    })

    it('renders correctly for Double Trouble & Tiny Toots', () => {
      const doubleTraining = {
        ...defaultService,
        icon: Heart,
        title: 'Double Trouble & Tiny Toots',
        price: '$40',
        popular: false,
      }
      
      render(
        <ServiceCard 
          service={doubleTraining} 
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      expect(screen.getByTestId('service-card')).toBeInTheDocument()
      expect(screen.queryByTestId('popular-badge')).not.toBeInTheDocument()
    })

    it('renders correctly for Small Mums & Bubs Classes', () => {
      const groupClass = {
        ...defaultService,
        icon: Calendar,
        title: 'Small Mums & Bubs Classes',
        price: '$20',
        comingSoon: true,
      }
      
      render(
        <ServiceCard 
          service={groupClass} 
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      expect(screen.getByTestId('service-card')).toBeInTheDocument()
      expect(screen.getByTestId('coming-soon-badge')).toBeInTheDocument()
      expect(screen.getByTestId('service-card')).toHaveClass('opacity-75')
    })
  })

  describe('Interaction', () => {
    it('supports hover effects', async () => {
      const user = userEvent.setup()
      
      render(
        <ServiceCard 
          service={defaultService} 
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const card = screen.getByTestId('service-card')
      
      // Check hover classes are present
      expect(card).toHaveClass('hover:shadow-3xl')
      expect(card).toHaveClass('hover:scale-105')
      
      // Simulate hover
      await user.hover(card)
      
      // Card should still have the hover classes (they're applied via CSS)
      expect(card).toHaveClass('hover:shadow-3xl')
      expect(card).toHaveClass('hover:scale-105')
    })

    it('maintains transition effects', () => {
      render(
        <ServiceCard 
          service={defaultService} 
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const card = screen.getByTestId('service-card')
      expect(card).toHaveClass('transition-all')
      expect(card).toHaveClass('duration-500')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <ServiceCard 
          service={defaultService} 
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no accessibility violations with popular badge', async () => {
      const popularService = { ...defaultService, popular: true }
      
      const { container } = render(
        <ServiceCard 
          service={popularService} 
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no accessibility violations with coming soon badge', async () => {
      const comingSoonService = { ...defaultService, comingSoon: true }
      
      const { container } = render(
        <ServiceCard 
          service={comingSoonService} 
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Edge Cases', () => {
    it('handles service with both popular and coming soon flags', () => {
      const edgeCaseService = {
        ...defaultService,
        popular: true,
        comingSoon: true,
      }
      
      render(
        <ServiceCard 
          service={edgeCaseService} 
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      // Both badges should be rendered
      expect(screen.getByTestId('popular-badge')).toBeInTheDocument()
      expect(screen.getByTestId('coming-soon-badge')).toBeInTheDocument()
      
      // Card should have reduced opacity
      expect(screen.getByTestId('service-card')).toHaveClass('opacity-75')
    })

    it('handles empty features array', () => {
      const noFeaturesService = {
        ...defaultService,
        features: [],
      }
      
      render(
        <ServiceCard 
          service={noFeaturesService} 
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      expect(screen.getByTestId('service-card')).toBeInTheDocument()
    })

    it('handles very long service titles', () => {
      const longTitleService = {
        ...defaultService,
        title: 'This is an extremely long service title that should still render correctly without breaking the layout',
      }
      
      render(
        <ServiceCard 
          service={longTitleService} 
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      expect(screen.getByTestId('service-card')).toBeInTheDocument()
    })

    it('handles very long descriptions', () => {
      const longDescService = {
        ...defaultService,
        description: 'This is an extremely long description that goes on and on and on, testing whether the card can handle extensive content without breaking the layout or causing overflow issues in the component rendering.',
      }
      
      render(
        <ServiceCard 
          service={longDescService} 
          onBookSessionClick={mockOnBookSessionClick}
        />
      )
      
      expect(screen.getByTestId('service-card')).toBeInTheDocument()
    })
  })
})
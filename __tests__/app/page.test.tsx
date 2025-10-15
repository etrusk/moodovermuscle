import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Home from '@/app/page'

// Mock all the section components since we're only testing the page logic
vi.mock('@/components/header', () => ({
  Header: ({ onBookSessionClick }: { onBookSessionClick: () => void }) => (
    <header data-testid="header">
      <button onClick={onBookSessionClick}>Book Session</button>
    </header>
  ),
}))

vi.mock('@/components/booking-form', () => ({
  BookingForm: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <div data-testid="booking-form" data-open={isOpen}>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}))

vi.mock('@/components/sections/hero-section', () => ({
  HeroSection: ({ onBookSessionClick }: { onBookSessionClick: () => void }) => (
    <section data-testid="hero-section">
      <button onClick={onBookSessionClick}>Hero Book</button>
    </section>
  ),
}))

vi.mock('@/components/sections/about-section', () => ({
  AboutSection: () => <section data-testid="about-section" />,
}))

vi.mock('@/components/sections/how-it-works-section', () => ({
  HowItWorksSection: () => <section data-testid="how-it-works-section" />,
}))

vi.mock('@/components/sections/gallery-section', () => ({
  GallerySection: () => <section data-testid="gallery-section" />,
}))

vi.mock('@/components/sections/location-contact-section', () => ({
  LocationContactSection: () => <section data-testid="location-contact-section" />,
}))

vi.mock('@/components/sections/final-cta-section', () => ({
  FinalCtaSection: () => <section data-testid="final-cta-section" />,
}))

vi.mock('@/components/sections/footer-section', () => ({
  FooterSection: () => <footer data-testid="footer-section" />,
}))

describe('Home Page', () => {
  it('renders all page sections', () => {
    render(<Home />)

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
    expect(screen.getByTestId('about-section')).toBeInTheDocument()
    expect(screen.getByTestId('how-it-works-section')).toBeInTheDocument()
    expect(screen.getByTestId('gallery-section')).toBeInTheDocument()
    expect(screen.getByTestId('location-contact-section')).toBeInTheDocument()
    expect(screen.getByTestId('final-cta-section')).toBeInTheDocument()
    expect(screen.getByTestId('footer-section')).toBeInTheDocument()
    expect(screen.getByTestId('booking-form')).toBeInTheDocument()
  })

  it('opens booking form when book session is clicked', async () => {
    const user = userEvent.setup()
    render(<Home />)

    const bookingForm = screen.getByTestId('booking-form')
    expect(bookingForm).toHaveAttribute('data-open', 'false')

    const bookButton = screen.getByText('Book Session')
    await user.click(bookButton)

    await waitFor(() => {
      expect(bookingForm).toHaveAttribute('data-open', 'true')
    })
  })

  it('closes booking form when close is clicked', async () => {
    const user = userEvent.setup()
    render(<Home />)

    // Open the form first
    const bookButton = screen.getByText('Book Session')
    await user.click(bookButton)

    const bookingForm = screen.getByTestId('booking-form')
    await waitFor(() => {
      expect(bookingForm).toHaveAttribute('data-open', 'true')
    })

    // Close the form
    const closeButton = screen.getByText('Close')
    await user.click(closeButton)

    await waitFor(() => {
      expect(bookingForm).toHaveAttribute('data-open', 'false')
    })
  })

  it('can open booking form from multiple locations', async () => {
    const user = userEvent.setup()
    render(<Home />)

    const bookingForm = screen.getByTestId('booking-form')
    
    // Test opening from header
    const headerButton = screen.getByText('Book Session')
    await user.click(headerButton)
    
    await waitFor(() => {
      expect(bookingForm).toHaveAttribute('data-open', 'true')
    })

    // Close it
    await user.click(screen.getByText('Close'))
    
    await waitFor(() => {
      expect(bookingForm).toHaveAttribute('data-open', 'false')
    })

    // Test opening from hero section
    const heroButton = screen.getByText('Hero Book')
    await user.click(heroButton)
    
    await waitFor(() => {
      expect(bookingForm).toHaveAttribute('data-open', 'true')
    })
  })
})
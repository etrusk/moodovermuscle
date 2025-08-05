'use client'

import { useState } from 'react'
import { Logo } from './header/Logo'
import { DesktopNavigation } from './header/DesktopNavigation'
import { MobileMenuButton } from './header/MobileMenuButton'
import { MobileMenu } from './header/MobileMenu'

interface HeaderProps {
  onBookSessionClick: () => void
}

export function Header({
  onBookSessionClick,
}: HeaderProps): React.ReactElement {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleToggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleCloseMobileMenu = (): void => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/20 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-20 md:h-24 items-center px-4 md:px-6 max-w-7xl mx-auto">
        <Logo />
        <DesktopNavigation onBookSessionClick={onBookSessionClick} />
        <MobileMenuButton
          isMobileMenuOpen={isMobileMenuOpen}
          onToggle={handleToggleMobileMenu}
        />
      </div>
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onBookSessionClick={onBookSessionClick}
        onClose={handleCloseMobileMenu}
      />
    </header>
  )
}

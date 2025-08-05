'use client'

import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

interface MobileMenuButtonProps {
  isMobileMenuOpen: boolean
  onToggle: () => void
}

export function MobileMenuButton({
  isMobileMenuOpen,
  onToggle,
}: MobileMenuButtonProps): React.ReactElement {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="md:hidden ml-auto hover:bg-rose-50 transition-colors"
      aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      onClick={onToggle}
    >
      {isMobileMenuOpen ? (
        <X className="h-5 w-5 stroke-1" />
      ) : (
        <Menu className="h-5 w-5 stroke-1" />
      )}
    </Button>
  )
}

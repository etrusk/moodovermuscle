'use client'

import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { MobileMenuItems } from './MobileMenuItems'

interface MobileMenuProps {
  isOpen: boolean
  onBookSessionClick: () => void
  onClose: () => void
}

export function MobileMenu({
  isOpen,
  onBookSessionClick,
  onClose,
}: MobileMenuProps): React.ReactElement | null {
  if (!isOpen) return null

  return (
    <div className="md:hidden border-t border-white/20 bg-white/95 backdrop-blur-xl animate-fade-in-up">
      <div className="container px-4 py-6 space-y-4 max-w-7xl mx-auto">
        <MobileMenuItems onClose={onClose} />
        <Button
          onClick={() => {
            onBookSessionClick()
            onClose()
          }}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full py-4 text-lg font-medium mt-4 shadow-lg"
        >
          Start Your FREE Session
          <Sparkles className="ml-2 h-4 w-4 stroke-1" />
        </Button>
      </div>
    </div>
  )
}

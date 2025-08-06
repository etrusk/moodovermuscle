'use client'

import Link from 'next/link'

interface MobileMenuItemProps {
  href: string
  onClick: () => void
  children: React.ReactNode
}

function MobileMenuItem({
  href,
  onClick,
  children,
}: MobileMenuItemProps): React.ReactElement {
  return (
    <Link
      href={href}
      className="block text-lg font-medium text-stone-700 hover:text-rose-500 transition-colors py-3 border-b border-stone-100"
      onClick={onClick}
    >
      {children}
    </Link>
  )
}

interface MobileMenuItemsProps {
  onClose: () => void
}

export function MobileMenuItems({
  onClose,
}: MobileMenuItemsProps): React.ReactElement {
  return (
    <>
      <MobileMenuItem href="/#about" onClick={onClose}>
        About
      </MobileMenuItem>
      <MobileMenuItem href="/classes" onClick={onClose}>
        Classes
      </MobileMenuItem>
      <MobileMenuItem href="/#contact" onClick={onClose}>
        Contact
      </MobileMenuItem>
      <MobileMenuItem href="/#gallery" onClick={onClose}>
        Gallery
      </MobileMenuItem>
    </>
  )
}

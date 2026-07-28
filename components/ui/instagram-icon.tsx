import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Instagram mark, kept locally because lucide-react v1 dropped every brand
 * icon. Geometry and default attributes are lucide 0.454's output verbatim, so
 * the footer and gallery render exactly as before.
 */
export function InstagramIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>): React.JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('lucide lucide-instagram', className)}
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

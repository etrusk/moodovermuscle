'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useSidebar } from './provider'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const SIDEBAR_WIDTH_MOBILE = '18rem'

// Main Sidebar component
// Render non-collapsible sidebar
const renderNonCollapsible = (
  sidebarId: string,
  className: string | undefined,
  ref: React.ForwardedRef<HTMLDivElement>,
  props: React.ComponentProps<'div'>,
  children: React.ReactNode
): React.ReactElement => (
  <div
    id={sidebarId}
    className={cn(
      'flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground',
      className
    )}
    ref={ref}
    {...props}
  >
    {children}
  </div>
)

// Render mobile sidebar
const renderMobileSidebar = (params: {
  sidebarId: string
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  side: 'left' | 'right'
  props: React.ComponentProps<'div'>
  children: React.ReactNode
}): React.ReactElement => (
  <Sheet
    open={params.openMobile}
    onOpenChange={params.setOpenMobile}
    {...params.props}
  >
    <SheetContent
      id={params.sidebarId}
      data-sidebar="sidebar"
      data-mobile="true"
      className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
      style={
        {
          '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
        } as React.CSSProperties
      }
      side={params.side}
    >
      <div className="flex h-full w-full flex-col">{params.children}</div>
    </SheetContent>
  </Sheet>
)

// Render desktop sidebar - decomposed for better readability
const renderDesktopSidebar = (params: {
  sidebarId: string
  state: string
  collapsible: string
  variant: string
  side: string
  className: string | undefined
  props: React.ComponentProps<'div'>
  children: React.ReactNode
  ref: React.ForwardedRef<HTMLDivElement>
}): React.ReactElement => (
  <div
    id={params.sidebarId}
    ref={params.ref}
    className="group peer hidden md:block text-sidebar-foreground"
    data-state={params.state}
    data-collapsible={params.state === 'collapsed' ? params.collapsible : ''}
    data-variant={params.variant}
    data-side={params.side}
  >
    <DesktopSidebarGap variant={params.variant} />
    <DesktopSidebarContent
      side={params.side}
      variant={params.variant}
      className={params.className}
      props={params.props}
    >
      {params.children}
    </DesktopSidebarContent>
  </div>
)

// Extracted gap handler component
const DesktopSidebarGap = ({
  variant,
}: {
  variant: string
}): React.ReactElement => (
  <div
    className={cn(
      'duration-200 relative h-svh w-(--sidebar-width) bg-transparent transition-[width] ease-linear',
      'group-data-[collapsible=offcanvas]:w-0',
      'group-data-[side=right]:rotate-180',
      variant === 'floating' || variant === 'inset'
        ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
        : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)'
    )}
  />
)

// Extracted content wrapper component
const DesktopSidebarContent = ({
  side,
  variant,
  className,
  props,
  children,
}: {
  side: string
  variant: string
  className: string | undefined
  props: React.ComponentProps<'div'>
  children: React.ReactNode
}): React.ReactElement => (
  <div className={getDesktopSidebarStyles(side, variant, className)} {...props}>
    <div
      data-sidebar="sidebar"
      className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm"
    >
      {children}
    </div>
  </div>
)

// Extracted styles function to reduce complexity
const getDesktopSidebarStyles = (
  side: string,
  variant: string,
  className: string | undefined
): string =>
  cn(
    'duration-200 fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] ease-linear md:flex',
    side === 'left'
      ? 'left-0 group-data-[collapsible=offcanvas]:-left-(--sidebar-width)'
      : 'right-0 group-data-[collapsible=offcanvas]:-right-(--sidebar-width)',
    variant === 'floating' || variant === 'inset'
      ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
      : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l',
    className
  )

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    side?: 'left' | 'right'
    variant?: 'sidebar' | 'floating' | 'inset'
    collapsible?: 'offcanvas' | 'icon' | 'none'
  }
>(
  (
    {
      side = 'left',
      variant = 'sidebar',
      collapsible = 'offcanvas',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile, sidebarId } =
      useSidebar()

    if (collapsible === 'none') {
      return renderNonCollapsible(sidebarId, className, ref, props, children)
    }

    if (isMobile) {
      return renderMobileSidebar({
        sidebarId,
        openMobile,
        setOpenMobile,
        side,
        props,
        children,
      })
    }

    return renderDesktopSidebar({
      sidebarId,
      state,
      collapsible,
      variant,
      side,
      className,
      props,
      children,
      ref,
    })
  }
)
Sidebar.displayName = 'Sidebar'

// Sidebar inset component for main content area
export const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'main'>
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        'relative flex min-h-svh flex-1 flex-col bg-background',
        'peer-data-[variant=inset]:min-h-[calc(100svh-(--spacing(4)))] md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm',
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = 'SidebarInset'

// Sidebar content container
export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = 'SidebarContent'

// Sidebar header component
export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = 'SidebarHeader'

// Sidebar footer component
export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = 'SidebarFooter'

// Sidebar input component
export const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        'h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        className
      )}
      {...props}
    />
  )
})
SidebarInput.displayName = 'SidebarInput'

// Sidebar separator component
export const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn('mx-2 w-auto bg-sidebar-border', className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = 'SidebarSeparator'

// Sidebar group component
export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
      {...props}
    />
  )
})
SidebarGroup.displayName = 'SidebarGroup'

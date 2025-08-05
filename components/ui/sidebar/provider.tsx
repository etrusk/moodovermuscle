"use client"

import * as React from "react"
import { useIsMobile } from "@/components/ui/use-mobile"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Constants extracted for provider logic
const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

// Context type definition
export type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
  sidebarId: string
}

// Context creation
const SidebarContext = React.createContext<SidebarContext | null>(null)

// Custom hook for consuming sidebar context
export function useSidebar(): SidebarContext {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

// Provider component with extracted business logic
// Cookie persistence logic
const useCookiePersistence = (openProp: boolean | undefined, setOpen: (value: boolean) => void): void => {
  React.useEffect(() => {
    if (typeof window !== "undefined" && openProp === undefined) {
      try {
        const cookieValue = document.cookie
          .split("; ")
          .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
          ?.split("=")[1]

        if (cookieValue !== undefined) setOpen(cookieValue === "true")
      } catch (error) {
        console.error("Failed to parse sidebar cookie:", error)
      }
    }
  }, [openProp, setOpen])
}

// Keyboard shortcut handling
const useKeyboardShortcut = (toggleSidebar: () => void): void => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])
}

export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const sidebarId = React.useId()
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    // Internal state management
    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open

    // State setter with cookie persistence
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }

        // Cookie persistence
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; SameSite=Lax; Secure`
      },
      [setOpenProp, open]
    )

    // Toggle functionality
    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open)
    }, [isMobile, setOpen, setOpenMobile])

    // Use extracted hooks
    useCookiePersistence(openProp, _setOpen)
    useKeyboardShortcut(toggleSidebar)

    // State derivation
    const state = open ? "expanded" : "collapsed"

    // Context value memoization
    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
        sidebarId,
      }),
      [
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
        sidebarId,
      ]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          {/* Screen reader announcements */}
          <div className="sr-only" aria-live="polite">
            {state === "expanded" ? "Sidebar expanded" : "Sidebar collapsed"}
          </div>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

// Export constants for use in other modules
export {
  SIDEBAR_COOKIE_NAME,
  SIDEBAR_COOKIE_MAX_AGE,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_ICON,
  SIDEBAR_KEYBOARD_SHORTCUT,
}
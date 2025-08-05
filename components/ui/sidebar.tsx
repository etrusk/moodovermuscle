"use client"

// Main sidebar module - Composed architecture using decomposed modules
// Following API Function Decomposition Pattern for UI components

// Provider and context exports
export { SidebarProvider, useSidebar } from "./sidebar/provider"
export type { SidebarContext } from "./sidebar/provider"

// Core sidebar components exports
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarInput,
  SidebarSeparator,
} from "./sidebar/core"

// Menu components exports
export {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "./sidebar/menu"

// Utility components exports
export {
  SidebarRail,
  SidebarTrigger,
} from "./sidebar/utils"

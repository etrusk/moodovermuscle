'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface AdminSession {
  user: {
    id: string
    email: string
    name: string
  } | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AdminAuthContextType extends AdminSession {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AdminSession>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async (): Promise<void> => {
    try {
      const response = await fetch('/api/admin/session', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setSession({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
        })
      } else {
        setSession({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } catch (error) {
      console.error('Admin auth check error:', error)
      setSession({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setSession({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
        })
        return { success: true }
      } else {
        return { 
          success: false, 
          error: data.error || 'Login failed' 
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      }
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/admin/session', {
        method: 'DELETE',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear session
      setSession({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
      
      router.replace('/admin/login')
    }
  }

  const refreshSession = async (): Promise<void> => {
    await checkAdminAuth()
  }

  const value: AdminAuthContextType = {
    ...session,
    login,
    logout,
    refreshSession,
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}
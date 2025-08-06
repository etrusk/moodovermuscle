'use client'

import { useEffect, useState } from 'react'
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

export function useAdminAuth(): AdminSession & {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
} {
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
      
      setSession({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
      
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout API fails, clear local session
      setSession({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
      router.push('/admin/login')
    }
  }

  const refreshSession = async (): Promise<void> => {
    await checkAdminAuth()
  }

  return {
    ...session,
    login,
    logout,
    refreshSession,
  }
}
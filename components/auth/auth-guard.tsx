"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAppState } from "@/lib/store"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "owner" | "partner" | "staff"
  allowedRoles?: ("owner" | "partner" | "staff")[]
}

export function AuthGuard({ children, requiredRole, allowedRoles }: AuthGuardProps) {
  const { state } = useAppState()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          router.push("/auth/login")
          return
        }

        // If we have a user but no session in state, wait for it to load
        if (!state.authSession.isAuthenticated) {
          // Give some time for the auth state to update
          setTimeout(() => setIsLoading(false), 1000)
          return
        }

        const userRole = state.authSession.user?.role

        if (requiredRole && userRole !== requiredRole) {
          router.push("/unauthorized")
          return
        }

        if (allowedRoles && !allowedRoles.includes(userRole as any)) {
          router.push("/unauthorized")
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [state.authSession, requiredRole, allowedRoles, router, supabase.auth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!state.authSession.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  const userRole = state.authSession.user?.role

  if (requiredRole && userRole !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  if (allowedRoles && !allowedRoles.includes(userRole as any)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

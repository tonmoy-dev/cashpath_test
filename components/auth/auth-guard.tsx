"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "owner" | "partner" | "staff"
  allowedRoles?: ("owner" | "partner" | "staff")[]
}

export function AuthGuard({ children, requiredRole, allowedRoles }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") {
      return
    }

    if (status === "unauthenticated" || !session?.user) {
      router.push("/auth/login")
      return
    }

    const userRole = session.user.role as "owner" | "partner" | "staff"

    if (requiredRole && userRole !== requiredRole) {
      router.push("/unauthorized")
      return
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      router.push("/unauthorized")
      return
    }

    setIsLoading(false)
  }, [session, status, requiredRole, allowedRoles, router])

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  const userRole = session.user.role as "owner" | "partner" | "staff"

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

  if (allowedRoles && !allowedRoles.includes(userRole)) {
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

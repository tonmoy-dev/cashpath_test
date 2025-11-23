"use client"

import type React from "react"

import { AppProvider } from "@/lib/store"
import { Suspense } from "react"
import { ErrorBoundary } from "@/components/error-boundary"
import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <AppProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </AppProvider>
      </SessionProvider>
    </ErrorBoundary>
  )
}

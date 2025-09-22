"use client"

import type React from "react"

import { AppProvider } from "@/lib/store"
import { Suspense } from "react"
import { ErrorBoundary } from "@/components/error-boundary"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Suspense fallback={null}>{children}</Suspense>
      </AppProvider>
    </ErrorBoundary>
  )
}

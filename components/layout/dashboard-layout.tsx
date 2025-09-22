"use client"

import type React from "react"
import { useState } from "react"
import { AppHeader } from "./app-header"
import { Sidebar } from "./sidebar"
import type { JSX } from "react/jsx-runtime"

interface DashboardLayoutProps {
  children: React.ReactNode
  showShortcuts?: boolean
  showBusinessTeam?: boolean
}

export function DashboardLayout({
  children,
  showShortcuts = true,
  showBusinessTeam = true,
}: DashboardLayoutProps): JSX.Element {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false)

  const handleMobileMenuToggle = (): void => {
    setIsMobileSidebarOpen(true)
  }

  const handleSidebarClose = (): void => {
    setIsMobileSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        onMobileMenuToggle={handleMobileMenuToggle}
        showShortcuts={showShortcuts}
        showBusinessTeam={showBusinessTeam}
      />

      <div className="flex">
        <Sidebar isOpen={isMobileSidebarOpen} onClose={handleSidebarClose} />

        {isMobileSidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={handleSidebarClose} />
        )}

        <main className="flex-1 p-4 sm:p-6 lg:ml-0 min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  )
}

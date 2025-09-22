"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Book, Users, Settings, X, UserPlus, Crown } from "@/components/icons/simple-icons"
import { useAuth } from "@/lib/store"
import type { JSX } from "react/jsx-runtime"

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  className?: string
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  section?: string
  allowedRoles?: ("owner" | "partner" | "staff")[]
}

export function Sidebar({ isOpen = true, onClose, className = "" }: SidebarProps): JSX.Element {
  const pathname = usePathname()
  const { authSession } = useAuth()

  const navItems: NavItem[] = [
    {
      href: "/dashboard",
      label: "PCash Books",
      icon: Book,
      section: "Book Keeping",
      allowedRoles: ["owner", "partner", "staff"],
    },
    {
      href: "/dashboard/accounts",
      label: "Accounts",
      icon: Book,
      section: "Book Keeping",
      allowedRoles: ["owner", "partner", "staff"],
    },
    {
      href: "/dashboard/team",
      label: "Team",
      icon: Users,
      section: "Management",
      allowedRoles: ["owner", "partner"],
    },
    {
      href: "/dashboard/invitations",
      label: "Invitations",
      icon: UserPlus,
      section: "Management",
      allowedRoles: ["owner"],
    },
    {
      href: "/dashboard/business-settings",
      label: "Business Settings",
      icon: Settings,
      section: "Settings",
      allowedRoles: ["owner"],
    },
  ]

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) => {
    if (!authSession.user || !item.allowedRoles) return true
    return item.allowedRoles.includes(authSession.user.role)
  })

  const groupedItems = filteredNavItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const section = item.section || "Other"
    if (!acc[section]) acc[section] = []
    acc[section].push(item)
    return acc
  }, {})

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 min-h-screen transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${className}
      `}
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <span className="text-base sm:text-lg font-semibold text-gray-800">Menu</span>
          {onClose && (
            <Button variant="ghost" size="sm" className="p-1 h-8 w-8" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {authSession.user && (
          <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              {authSession.user.role === "owner" && <Crown className="w-4 h-4 text-yellow-600" />}
              {authSession.user.role === "partner" && <Users className="w-4 h-4 text-green-600" />}
              {authSession.user.role === "staff" && <Users className="w-4 h-4 text-blue-600" />}
              <div>
                <div className="text-sm font-medium text-gray-900">{authSession.user.name}</div>
                <div className="text-xs text-gray-600 capitalize">{authSession.user.role}</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {Object.entries(groupedItems).map(([section, items]) => (
            <div key={section}>
              <div className="text-xs sm:text-sm font-medium text-gray-500 mb-3 sm:mb-4 px-1">{section}</div>
              {items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base
                      ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50"}
                    `}
                    onClick={onClose}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
              <div className="mt-4 sm:mt-6" />
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

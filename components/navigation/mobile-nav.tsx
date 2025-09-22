"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Users, Settings, Book } from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
}

interface MobileNavProps {
  items?: NavItem[]
  title?: string
  className?: string
}

const defaultNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard", label: "PCash Books", icon: Book },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/business-settings", label: "Settings", icon: Settings },
]

export function MobileNav({ items = defaultNavItems, title = "Menu", className = "" }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className={`lg:hidden p-1 h-8 w-8 ${className}`}>
          <Menu className="w-5 h-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-left">{title}</SheetTitle>
        </SheetHeader>
        <nav className="p-4">
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                    ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50"}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        isActive ? "bg-white/20" : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

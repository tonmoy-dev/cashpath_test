"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
  showHome?: boolean
  className?: string
}

export function BreadcrumbNav({ items, showHome = true, className = "" }: BreadcrumbNavProps) {
  return (
    <nav className={`flex items-center space-x-1 text-sm text-gray-500 ${className}`} aria-label="Breadcrumb">
      {showHome && (
        <>
          <Link href="/dashboard" className="flex items-center hover:text-blue-600 transition-colors">
            <Home className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </Link>
          {items.length > 0 && <ChevronRight className="w-4 h-4" />}
        </>
      )}

      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          {item.href && !item.current ? (
            <Link href={item.href} className="hover:text-blue-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className={item.current ? "text-gray-900 font-medium" : ""}>{item.label}</span>
          )}
          {index < items.length - 1 && <ChevronRight className="w-4 h-4" />}
        </div>
      ))}
    </nav>
  )
}

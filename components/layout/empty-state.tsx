"use client"

import type React from "react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-4 ${className || ""}`}>
      {icon && <div className="mx-auto w-16 h-16 mb-4 text-gray-400 flex items-center justify-center">{icon}</div>}
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="bg-blue-600 hover:bg-blue-700">
          {action.label}
        </Button>
      )}
    </div>
  )
}

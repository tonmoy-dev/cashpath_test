"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { FileX, Plus, Search, AlertCircle } from "lucide-react"

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "ghost"
  }
  size?: "sm" | "md" | "lg"
  className?: string
}

export function EmptyState({
  icon: Icon = FileX,
  title,
  description,
  action,
  size = "md",
  className = "",
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: "py-8",
      icon: "w-12 h-12",
      title: "text-lg",
      description: "text-sm",
    },
    md: {
      container: "py-12",
      icon: "w-16 h-16",
      title: "text-xl",
      description: "text-base",
    },
    lg: {
      container: "py-16",
      icon: "w-20 h-20",
      title: "text-2xl",
      description: "text-lg",
    },
  }

  return (
    <div className={`text-center ${sizeClasses[size].container} ${className}`}>
      <div className="flex justify-center mb-4">
        <Icon className={`${sizeClasses[size].icon} text-gray-400`} />
      </div>

      <h3 className={`${sizeClasses[size].title} font-semibold text-gray-900 mb-2`}>{title}</h3>

      {description && (
        <p className={`${sizeClasses[size].description} text-gray-600 mb-6 max-w-md mx-auto`}>{description}</p>
      )}

      {action && (
        <Button variant={action.variant || "default"} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Predefined empty states
export const NoDataFound = ({ onRefresh }: { onRefresh?: () => void }) => (
  <EmptyState
    icon={Search}
    title="No data found"
    description="We couldn't find any results matching your criteria. Try adjusting your search or filters."
    action={onRefresh ? { label: "Refresh", onClick: onRefresh, variant: "outline" } : undefined}
  />
)

export const NoItemsYet = ({ itemName, onAdd }: { itemName: string; onAdd: () => void }) => (
  <EmptyState
    icon={Plus}
    title={`No ${itemName} yet`}
    description={`Get started by creating your first ${itemName}.`}
    action={{ label: `Add ${itemName}`, onClick: onAdd }}
  />
)

export const ErrorState = ({ onRetry }: { onRetry?: () => void }) => (
  <EmptyState
    icon={AlertCircle}
    title="Something went wrong"
    description="We encountered an error while loading your data. Please try again."
    action={onRetry ? { label: "Try again", onClick: onRetry, variant: "outline" } : undefined}
  />
)

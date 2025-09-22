"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, AlertCircle, Minus } from "lucide-react"

interface StatusBadgeProps {
  status: string
  variant?: "default" | "with-icon"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function StatusBadge({ status, variant = "default", size = "md", className = "" }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toLowerCase()

    switch (normalizedStatus) {
      case "active":
      case "completed":
      case "success":
      case "approved":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
        }

      case "pending":
      case "in-progress":
      case "processing":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: Clock,
        }

      case "inactive":
      case "failed":
      case "rejected":
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
        }

      case "warning":
      case "attention":
        return {
          color: "bg-orange-100 text-orange-800 border-orange-200",
          icon: AlertCircle,
        }

      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Minus,
        }
    }
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <Badge
      variant="secondary"
      className={`${config.color} ${sizeClasses[size]} border ${
        variant === "with-icon" ? "flex items-center gap-1" : ""
      } ${className}`}
    >
      {variant === "with-icon" && <Icon className={iconSizes[size]} />}
      {status}
    </Badge>
  )
}

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
  variant?: "default" | "success" | "warning" | "danger"
  className?: string
}

export function StatsCard({ title, value, subtitle, icon, trend, variant = "default", className }: StatsCardProps) {
  const variantClasses = {
    default: "border-blue-200 bg-blue-50/50",
    success: "border-green-200 bg-green-50/50",
    warning: "border-yellow-200 bg-yellow-50/50",
    danger: "border-red-200 bg-red-50/50",
  }

  const valueClasses = {
    default: "text-blue-800",
    success: "text-green-800",
    warning: "text-yellow-800",
    danger: "text-red-800",
  }

  return (
    <Card className={cn(variantClasses[variant], className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
            <p className={cn("text-xl sm:text-2xl font-bold", valueClasses[variant])}>{value}</p>
            {subtitle && <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>}
            {trend && (
              <div
                className={cn("text-xs sm:text-sm font-medium", trend.isPositive ? "text-green-600" : "text-red-600")}
              >
                {trend.isPositive ? "↗" : "↘"} {trend.value}
              </div>
            )}
          </div>
          {icon && <div className="ml-4 flex-shrink-0">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  )
}

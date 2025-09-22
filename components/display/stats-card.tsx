"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: "increase" | "decrease" | "neutral"
    period?: string
  }
  icon?: React.ComponentType<{ className?: string }>
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "gray"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  color = "blue",
  size = "md",
  className = "",
}: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    yellow: "bg-yellow-100 text-yellow-600",
    purple: "bg-purple-100 text-purple-600",
    gray: "bg-gray-100 text-gray-600",
  }

  const sizeClasses = {
    sm: {
      card: "p-3",
      icon: "w-8 h-8",
      iconSize: "w-4 h-4",
      title: "text-xs",
      value: "text-lg",
      change: "text-xs",
    },
    md: {
      card: "p-4",
      icon: "w-10 h-10",
      iconSize: "w-5 h-5",
      title: "text-sm",
      value: "text-2xl",
      change: "text-sm",
    },
    lg: {
      card: "p-6",
      icon: "w-12 h-12",
      iconSize: "w-6 h-6",
      title: "text-base",
      value: "text-3xl",
      change: "text-base",
    },
  }

  const getChangeIcon = () => {
    if (!change) return null

    switch (change.type) {
      case "increase":
        return <TrendingUp className="w-3 h-3" />
      case "decrease":
        return <TrendingDown className="w-3 h-3" />
      default:
        return <Minus className="w-3 h-3" />
    }
  }

  const getChangeColor = () => {
    if (!change) return ""

    switch (change.type) {
      case "increase":
        return "text-green-600 bg-green-100"
      case "decrease":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardContent className={sizeClasses[size].card}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={`${sizeClasses[size].title} font-medium text-gray-600 mb-1`}>{title}</p>
            <p className={`${sizeClasses[size].value} font-bold text-gray-900`}>{value}</p>

            {change && (
              <div className="flex items-center gap-1 mt-2">
                <Badge variant="secondary" className={`${getChangeColor()} ${sizeClasses[size].change} px-2 py-0.5`}>
                  <div className="flex items-center gap-1">
                    {getChangeIcon()}
                    <span>{Math.abs(change.value)}%</span>
                  </div>
                </Badge>
                {change.period && (
                  <span className={`${sizeClasses[size].change} text-gray-500`}>vs {change.period}</span>
                )}
              </div>
            )}
          </div>

          {Icon && (
            <div
              className={`${sizeClasses[size].icon} ${colorClasses[color]} rounded-lg flex items-center justify-center flex-shrink-0`}
            >
              <Icon className={sizeClasses[size].iconSize} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

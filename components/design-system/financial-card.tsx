import { cn } from "@/lib/utils"
import type React from "react"

interface FinancialCardProps {
  children: React.ReactNode
  variant?: "positive" | "negative" | "neutral" | "default"
  className?: string
}

export function FinancialCard({ children, variant = "default", className }: FinancialCardProps) {
  const variantClasses = {
    positive: "financial-positive",
    negative: "financial-negative",
    neutral: "financial-neutral",
    default: "bg-white border-gray-200",
  }

  return <div className={cn("financial-card", variantClasses[variant], className)}>{children}</div>
}

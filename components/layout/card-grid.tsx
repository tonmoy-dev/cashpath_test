import type React from "react"
import { cn } from "@/lib/utils"

interface CardGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  gap?: "sm" | "md" | "lg"
  className?: string
}

export function CardGrid({ children, columns = 3, gap = "md", className }: CardGridProps) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }

  const gapClasses = {
    sm: "gap-3",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8",
  }

  return <div className={cn("grid", columnClasses[columns], gapClasses[gap], className)}>{children}</div>
}

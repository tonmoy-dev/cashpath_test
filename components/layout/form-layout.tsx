import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FormLayoutProps {
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function FormLayout({ title, description, children, actions, className }: FormLayoutProps) {
  return (
    <Card className={`border-blue-200 ${className || ""}`}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl sm:text-2xl text-blue-800">{title}</CardTitle>
        {description && <CardDescription className="text-sm sm:text-base">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {children}
        {actions && <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">{actions}</div>}
      </CardContent>
    </Card>
  )
}

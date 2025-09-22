import type React from "react"

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  actions?: React.ReactNode
}

export function PageHeader({ title, description, children, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
        {description && <p className="text-sm sm:text-base text-gray-600">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-col sm:flex-row gap-2">{actions}</div>}
    </div>
  )
}

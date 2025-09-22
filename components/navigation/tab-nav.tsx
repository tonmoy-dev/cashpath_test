"use client"

interface TabItem {
  id: string
  label: string
  count?: number
  disabled?: boolean
}

interface TabNavProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  variant?: "default" | "pills" | "underline"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function TabNav({
  tabs,
  activeTab,
  onTabChange,
  variant = "underline",
  size = "md",
  className = "",
}: TabNavProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-2",
    lg: "text-base px-4 py-3",
  }

  const getTabClasses = (tab: TabItem) => {
    const baseClasses = `${sizeClasses[size]} font-medium transition-colors`
    const isActive = activeTab === tab.id

    switch (variant) {
      case "pills":
        return `${baseClasses} rounded-lg ${
          isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        } ${tab.disabled ? "opacity-50 cursor-not-allowed" : ""}`

      case "underline":
        return `${baseClasses} border-b-2 ${
          isActive
            ? "border-blue-600 text-blue-600"
            : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
        } ${tab.disabled ? "opacity-50 cursor-not-allowed" : ""}`

      default:
        return `${baseClasses} ${
          isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        } ${tab.disabled ? "opacity-50 cursor-not-allowed" : ""}`
    }
  }

  return (
    <div className={`flex items-center ${variant === "underline" ? "border-b border-gray-200" : "gap-1"} ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          disabled={tab.disabled}
          className={getTabClasses(tab)}
        >
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span
              className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.id ? "bg-white/20" : "bg-gray-200 text-gray-600"
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

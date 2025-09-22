"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, FileText, Users, Settings, Download, Upload } from "lucide-react"

interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  disabled?: boolean
  separator?: boolean
}

interface QuickActionsProps {
  actions: QuickAction[]
  triggerLabel?: string
  triggerIcon?: React.ComponentType<{ className?: string }>
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function QuickActions({
  actions,
  triggerLabel = "Quick Actions",
  triggerIcon: TriggerIcon = Plus,
  variant = "default",
  size = "md",
  className = "",
}: QuickActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <TriggerIcon className="w-4 h-4 mr-2" />
          {triggerLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {actions.map((action, index) => (
          <div key={action.id}>
            <DropdownMenuItem onClick={action.onClick} disabled={action.disabled} className="flex items-center gap-2">
              <action.icon className="w-4 h-4" />
              {action.label}
            </DropdownMenuItem>
            {action.separator && index < actions.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Predefined quick action sets
export const dashboardQuickActions: QuickAction[] = [
  {
    id: "add-book",
    label: "Add New Book",
    icon: FileText,
    onClick: () => console.log("Add book"),
  },
  {
    id: "add-member",
    label: "Add Team Member",
    icon: Users,
    onClick: () => console.log("Add member"),
    separator: true,
  },
  {
    id: "export-data",
    label: "Export Data",
    icon: Download,
    onClick: () => console.log("Export data"),
  },
  {
    id: "import-data",
    label: "Import Data",
    icon: Upload,
    onClick: () => console.log("Import data"),
    separator: true,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    onClick: () => console.log("Settings"),
  },
]

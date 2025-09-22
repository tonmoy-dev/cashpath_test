"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useBusinesses } from "@/lib/store"
import { Users, LogOut, User, Menu } from "@/components/icons/simple-icons"
import type { JSX } from "react/jsx-runtime"

interface AppHeaderProps {
  onMobileMenuToggle?: () => void
  showMobileMenuButton?: boolean
  showBusinessTeam?: boolean
}

export function AppHeader({
  onMobileMenuToggle,
  showMobileMenuButton = true,
  showBusinessTeam = true,
}: AppHeaderProps): JSX.Element {
  const { businesses, currentBusiness, addBusiness, setCurrentBusiness } = useBusinesses()
  const [userName, setUserName] = useState<string>("")
  const [showAddBusiness, setShowAddBusiness] = useState<boolean>(false)
  const [newBusinessName, setNewBusinessName] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedType, setSelectedType] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const user: string | null = localStorage.getItem("pcash_user_name")
    if (user) {
      setUserName(user)
    }
  }, [])

  const handleAddBusiness = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (!newBusinessName.trim()) return

    try {
      const newBusiness = addBusiness(newBusinessName)
      setCurrentBusiness(newBusiness.id)
      setNewBusinessName("")
      setShowAddBusiness(false)
    } catch (error) {
      console.error("Failed to add business:", error)
    }
  }

  const handleLogout = (): void => {
    localStorage.removeItem("pcash_user")
    localStorage.removeItem("pcash_user_name")
    router.push("/")
  }

  const handleBusinessChange = (value: string): void => {
    if (value === "add-new") {
      setShowAddBusiness(true)
    } else {
      setCurrentBusiness(value)
    }
  }

  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewBusinessName(e.target.value)
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-2 sm:py-4 shadow-sm">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-4 min-w-0 flex-1">
            {showMobileMenuButton && (
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-1 h-8 w-8 flex-shrink-0"
                onClick={onMobileMenuToggle}
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xs sm:text-lg">C</span>
                </div>
                <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent hidden xs:block">
                  Cashify
                </span>
              </div>
            </div>

            <Select value={currentBusiness || ""} onValueChange={handleBusinessChange}>
              <SelectTrigger className="w-24 sm:w-48 border-0 bg-transparent hover:bg-blue-50 text-xs sm:text-base min-w-0">
                <SelectValue placeholder="Select Business" />
              </SelectTrigger>
              <SelectContent>
                {businesses.map((business) => (
                  <SelectItem key={business.id} value={business.id}>
                    {business.name}
                  </SelectItem>
                ))}
                <SelectItem value="add-new" className="text-blue-600 font-medium">
                  + Add New Business
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
            {showBusinessTeam && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-blue-200 hover:bg-blue-50 bg-transparent hidden sm:flex px-2 sm:px-3"
              >
                <Link href="/dashboard/team">
                  <Users className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden lg:inline text-sm">Business Team</span>
                </Link>
              </Button>
            )}
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline truncate max-w-20 sm:max-w-none">
                {userName || "User"}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors flex-shrink-0">
                    <span className="text-white text-xs sm:text-sm font-medium">
                      {userName ? userName.charAt(0).toUpperCase() : "U"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/user-profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Add Business Dialog */}
      <Dialog open={showAddBusiness} onOpenChange={setShowAddBusiness}>
        <DialogContent className="border-blue-200 w-[95vw] sm:w-[90vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-blue-800 text-lg sm:text-xl">Add New Business</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddBusiness} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm sm:text-base">
                Business Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="businessName"
                value={newBusinessName}
                onChange={handleBusinessNameChange}
                placeholder="Add Business Name"
                required
                className="border-blue-200 focus:border-blue-500 h-10 sm:h-12 text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-10 sm:h-auto text-sm sm:text-base"
                disabled={!newBusinessName.trim()}
              >
                Create Business
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-blue-200 hover:bg-blue-50 bg-transparent h-10 sm:h-auto text-sm sm:text-base"
                onClick={() => {
                  setShowAddBusiness(false)
                  setNewBusinessName("")
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

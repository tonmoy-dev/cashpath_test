"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"

const businessCategories = [
  { id: "agriculture", name: "Agriculture", icon: "🚜" },
  { id: "construction", name: "Construction", icon: "🏗️" },
  { id: "education", name: "Education", icon: "📚" },
  { id: "electronics", name: "Electronics", icon: "📱" },
  { id: "financial", name: "Financial Services", icon: "💰" },
  { id: "food", name: "Food/Restaurant", icon: "🍽️" },
  { id: "fashion", name: "Clothes/Fashion", icon: "👕" },
  { id: "hardware", name: "Hardware", icon: "🔧" },
  { id: "jewellery", name: "Jewellery", icon: "💎" },
  { id: "healthcare", name: "Healthcare & Fitness", icon: "🏥" },
  { id: "grocery", name: "Kirana/Grocery", icon: "🛒" },
  { id: "transport", name: "Transport", icon: "🚛" },
  { id: "other", name: "Other", icon: "📋" },
]

const businessTypes = [
  { id: "retailer", name: "Retailer", icon: "🏪" },
  { id: "distributor", name: "Distributor", icon: "🚚" },
  { id: "manufacturer", name: "Manufacturer", icon: "🏭" },
  { id: "service", name: "Service Provider", icon: "🛠️" },
  { id: "trader", name: "Trader", icon: "📊" },
  { id: "other", name: "Other", icon: "📋" },
]

export default function CreateBusinessPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [businessName, setBusinessName] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [showCategories, setShowCategories] = useState(true)
  const [showTypes, setShowTypes] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessName.trim() || !selectedCategory || !selectedType) return

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Redirect to dashboard
      window.location.href = "/dashboard"
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-8">
          <Link href="/auth/email">
            <Button variant="ghost" size="sm" className="p-1 sm:p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xs sm:text-sm">C</span>
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Cashify
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-600 hidden xs:block">Tonmoy Roy</span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs sm:text-sm font-medium">T</span>
            </div>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="pb-4 sm:pb-6">
            <h1 className="text-xl sm:text-2xl font-bold">Add your first business</h1>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-sm sm:text-base">
                  Business Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Add Business Name"
                  className="h-10 sm:h-12 text-sm sm:text-base"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>

              {/* Business Category */}
              <div className="space-y-3">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowCategories(!showCategories)}
                >
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Select Business Category</Label>
                    <p className="text-xs sm:text-sm text-gray-600">This will help us personalize your business</p>
                  </div>
                  {showCategories ? (
                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 border rounded-lg bg-gray-50">
                  {businessCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-center min-h-[80px] sm:min-h-[90px] ${
                        selectedCategory === category.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="text-lg sm:text-2xl mb-1 sm:mb-2">{category.icon}</div>
                      <div className="text-xs sm:text-xs font-medium leading-tight">{category.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Business Type */}
              <div className="space-y-3">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowTypes(!showTypes)}
                >
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Select Business Type</Label>
                    <p className="text-xs sm:text-sm text-gray-600">This will help us personalize your business</p>
                  </div>
                  {showTypes ? (
                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 border rounded-lg bg-gray-50">
                  {businessTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-center min-h-[80px] sm:min-h-[90px] ${
                        selectedType === type.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="text-lg sm:text-2xl mb-1 sm:mb-2">{type.icon}</div>
                      <div className="text-xs sm:text-sm font-medium">{type.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 sm:pt-6">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 px-6 sm:px-8 h-10 sm:h-12 text-white text-sm sm:text-base w-full sm:w-auto"
                  disabled={isLoading || !businessName.trim() || !selectedCategory || !selectedType}
                >
                  {isLoading ? "Creating Business..." : "Create Business"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

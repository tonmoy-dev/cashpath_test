"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useBusinesses } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Building2, User } from "lucide-react"

export default function OnboardingPage() {
  const [fullName, setFullName] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [useType, setUseType] = useState<"business" | "personal" | null>(null)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const router = useRouter()
  const { addBusiness, setCurrentBusiness } = useBusinesses()

  const handleGetStarted = (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim()) {
      setShowErrorDialog(true)
      return
    }

    if (!useType) {
      setShowErrorDialog(true)
      return
    }

    localStorage.setItem("pcash_user_name", fullName)
    localStorage.setItem("pcash_use_type", useType)

    if (useType === "business" && businessName.trim()) {
      const newBusiness = addBusiness(businessName.trim())
      setCurrentBusiness(newBusiness.id)
    } else if (useType === "personal") {
      // For personal use, create a default personal business entry
      const personalBusiness = addBusiness(`${fullName}'s Personal Finance`)
      setCurrentBusiness(personalBusiness.id)
    }

    localStorage.setItem("pcash_onboarding_complete", "true")
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-lg border-blue-200 shadow-xl">
        <CardHeader className="text-center px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg sm:text-2xl">C</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Cashify
            </span>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-blue-800">Welcome to Cashify</CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-600">
            Add your details to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <form onSubmit={handleGetStarted} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm sm:text-base">
                Your Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-10 sm:h-12 border-blue-200 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm sm:text-base">
                How will you use Cashify? <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUseType("business")}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    useType === "business"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  <Building2 className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Business</div>
                  <div className="text-xs text-gray-500 mt-1">Manage business finances</div>
                </button>
                <button
                  type="button"
                  onClick={() => setUseType("personal")}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    useType === "personal"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  <User className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Personal</div>
                  <div className="text-xs text-gray-500 mt-1">Track personal expenses</div>
                </button>
              </div>
            </div>

            {useType === "business" && (
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-sm sm:text-base">
                  Business Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Enter your business name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required={useType === "business"}
                  className="h-10 sm:h-12 border-blue-200 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 sm:h-12 text-sm sm:text-base bg-blue-600 hover:bg-blue-700"
              disabled={!fullName.trim() || !useType || (useType === "business" && !businessName.trim())}
            >
              Get Started
            </Button>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent className="w-[95vw] max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Required Field Missing</AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              Please fill in all required fields to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)} className="text-sm sm:text-base">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

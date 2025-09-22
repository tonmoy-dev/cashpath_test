"use client"

import dynamic from "next/dynamic"
import type React from "react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, AlertCircle, Key, User, ArrowLeft } from "lucide-react"

function ProfileSettingsPage() {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const update = sessionResult?.update
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to set password")
        return
      }

      setSuccess("Password set successfully! You can now use email and password to sign in.")
      setPasswordData({ newPassword: "", confirmPassword: "" })

      // Update session to reflect changes
      if (update) {
        await update()
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and security</p>
        </div>

        {/* Profile Information Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                <p className="mt-1 text-gray-900">{session.user.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                <p className="mt-1 text-gray-900">{session.user.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Role</Label>
                <p className="mt-1 text-gray-900 capitalize">{session.user.role}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Account Type</Label>
                <p className="mt-1 text-gray-900">{session.user.role === "owner" ? "Business Owner" : "Team Member"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Password Settings
            </CardTitle>
            <p className="text-sm text-gray-600">
              {session.user.role === "owner"
                ? "Set a password to enable email/password login in addition to Google sign-in"
                : "Update your password for secure access to your account"}
            </p>
          </CardHeader>
          <CardContent>
            {(error || success) && (
              <Alert className={`mb-6 ${success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                {success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={success ? "text-green-700" : "text-red-700"}>
                  {error || success}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  className="h-12"
                />
              </div>

              <Separator className="my-4" />

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPasswordData({ newPassword: "", confirmPassword: "" })}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? "Setting Password..." : "Set Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Security Notice</h3>
              <p className="text-sm text-blue-700 mt-1">
                Once you set a password, you'll be able to sign in using either your email/password combination or
                continue using Google sign-in. Your account security is our priority.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default dynamic(() => Promise.resolve(ProfileSettingsPage), {
  ssr: false,
})

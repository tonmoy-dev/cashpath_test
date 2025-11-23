"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, ArrowLeft, Mail } from "lucide-react"

interface ForgotPasswordFormProps {
  onBack: () => void
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      console.log("[v0] Attempting password reset for:", email)

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email")
      }

      console.log("[v0] Password reset email sent successfully")
      setSuccess(
        "Password reset email sent! Please check your inbox and follow the instructions to reset your password.",
      )
    } catch (err: any) {
      console.log("[v0] Password reset error:", err)
      setError("Failed to send reset email. Please check your email address and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-0 shadow-2xl">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Cashify
            </span>
          </div>
          <CardTitle className="text-2xl text-center text-gray-900">Reset Password</CardTitle>
          <p className="text-center text-gray-600">Enter your email to receive reset instructions</p>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Forgot Your Password?</h3>
            <p className="text-sm text-gray-600">No worries! We'll send you reset instructions.</p>
          </div>

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

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <Input
                id="reset-email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                required
                className="h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Sending Reset Email..." : "Send Reset Email"}
            </Button>

            <Button type="button" variant="outline" className="w-full h-12 bg-transparent" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Remember your password?{" "}
              <button type="button" onClick={onBack} className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in instead
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

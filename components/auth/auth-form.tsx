"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Info } from "lucide-react"

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const fillDemoCredentials = (role: "owner" | "admin" | "user") => {
    const credentials = {
      owner: { email: "owner@cashify.com", password: "owner123" },
      admin: { email: "admin@cashify.com", password: "admin123" },
      user: { email: "user@cashify.com", password: "user123" },
    }
    setEmail(credentials[role].email)
    setPassword(credentials[role].password)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("[v0] Attempting login with:", { email, password: "***" })

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      console.log("[v0] Login successful, redirecting to dashboard")
      setSuccess("Login successful! Redirecting...")
      setTimeout(() => router.push("/dashboard"), 1000)
    } catch (err: any) {
      console.log("[v0] Login error:", err)
      setError("Invalid credentials. Please check your email and password.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      console.log("[v0] Attempting signup with:", { email, name })

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            name,
            role: "owner",
          },
        },
      })

      if (error) throw error

      console.log("[v0] Signup successful:", data)
      setSuccess("Account created successfully! Please check your email to confirm your account.")
    } catch (err: any) {
      console.log("[v0] Signup error:", err)
      setError(err.message || "Signup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Cashify
                </span>
              </div>
              <CardTitle className="text-2xl">{isSignUp ? "Create Account" : "Welcome Back"}</CardTitle>
              <CardDescription>
                {isSignUp ? "Join Cashify to manage your finances" : "Sign in to your account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isSignUp && (
                <Alert className="mb-4 border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    <div className="text-sm font-medium mb-2">Demo Accounts:</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Owner:</span>
                        <button
                          type="button"
                          onClick={() => fillDemoCredentials("owner")}
                          className="text-blue-600 hover:underline"
                        >
                          owner@cashify.com / owner123
                        </button>
                      </div>
                      <div className="flex justify-between">
                        <span>Admin:</span>
                        <button
                          type="button"
                          onClick={() => fillDemoCredentials("admin")}
                          className="text-blue-600 hover:underline"
                        >
                          admin@cashify.com / admin123
                        </button>
                      </div>
                      <div className="flex justify-between">
                        <span>User:</span>
                        <button
                          type="button"
                          onClick={() => fillDemoCredentials("user")}
                          className="text-blue-600 hover:underline"
                        >
                          user@cashify.com / user123
                        </button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
                <div className="flex flex-col gap-6">
                  {(error || success) && (
                    <Alert className={success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
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

                  {isSignUp && (
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={isSignUp ? "Enter your email" : "owner@cashify.com"}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={isSignUp ? "Create a password (min 6 characters)" : "owner123"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {isSignUp && (
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading
                      ? isSignUp
                        ? "Creating Account..."
                        : "Signing In..."
                      : isSignUp
                        ? "Create Account"
                        : "Sign In"}
                  </Button>
                </div>

                <div className="mt-4 text-center text-sm">
                  {isSignUp ? (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(false)
                          setError(null)
                          setSuccess(null)
                          setName("")
                          setConfirmPassword("")
                        }}
                        className="underline underline-offset-4"
                      >
                        Sign In
                      </button>
                    </>
                  ) : (
                    <>
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(true)
                          setError(null)
                          setSuccess(null)
                        }}
                        className="underline underline-offset-4"
                      >
                        Create Account
                      </button>
                    </>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

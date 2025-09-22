"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Crown, Users, User, CheckCircle, AlertCircle, UserPlus } from "lucide-react"
import { ForgotPasswordForm } from "./forgot-password-form"

export function EnhancedRoleLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("owner")
  const [showOwnerSignup, setShowOwnerSignup] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showMemberRegistration, setShowMemberRegistration] = useState(false)
  const [invitationCode, setInvitationCode] = useState("")
  const [invitationRole, setInvitationRole] = useState<"partner" | "staff">("staff")
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const invitation = searchParams.get("invitation")
    if (invitation) {
      setInvitationCode(invitation)
      checkInvitationRole(invitation)
      setSuccess("Invitation found! Please complete your registration or sign in if you already have an account.")
    }
  }, [searchParams])

  const checkInvitationRole = async (code: string) => {
    try {
      const { data: teamMember } = await supabase
        .from("team_members")
        .select("role")
        .eq("invitation_code", code)
        .eq("status", "pending")
        .single()

      if (teamMember) {
        setInvitationRole(teamMember.role)
        setActiveTab(teamMember.role)
      }
    } catch (error) {
      console.log("[v0] Error checking invitation role:", error)
    }
  }

  const handleOwnerLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      console.log("[v0] Attempting owner login with:", email)

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      console.log("[v0] Owner login successful, redirecting to dashboard")
      setSuccess("Login successful! Redirecting...")
      setTimeout(() => router.push("/dashboard"), 1000)
    } catch (err: any) {
      console.log("[v0] Owner login error:", err)
      setError("Invalid credentials. Please check your email and password.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOwnerSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string
    const businessName = formData.get("businessName") as string

    try {
      console.log("[v0] Attempting owner signup with:", email)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            name,
            role: "owner",
            business_name: businessName,
          },
        },
      })

      if (error) throw error

      console.log("[v0] Owner signup successful:", data)

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: email,
          first_name: name.split(" ")[0] || name,
          last_name: name.split(" ").slice(1).join(" ") || "",
          role: "owner",
        })

        if (profileError) {
          console.log("[v0] Profile creation error:", profileError)
        } else {
          const { data: businessData, error: businessError } = await supabase
            .from("businesses")
            .insert({
              name: businessName,
              owner_id: data.user.id,
              email: email,
            })
            .select()
            .single()

          if (businessError) {
            console.log("[v0] Business creation error:", businessError)
          }
        }
      }

      setSuccess("Account created successfully! Redirecting to dashboard...")
      setTimeout(() => router.push("/dashboard"), 1000)
    } catch (err: any) {
      console.log("[v0] Owner signup error:", err)
      setError(err.message || "Signup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMemberLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      console.log("[v0] Attempting member login with:", email)

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      console.log("[v0] Member login successful, redirecting to dashboard")
      setSuccess("Login successful! Redirecting...")
      setTimeout(() => router.push("/dashboard"), 1000)
    } catch (err: any) {
      console.log("[v0] Member login error:", err)
      setError("Invalid credentials. Please check your email and password.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMemberRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string
    const inviteCode = formData.get("invitationCode") as string

    try {
      console.log("[v0] Attempting member registration with invitation:", inviteCode)

      const response = await fetch("/api/auth/register-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
          invitationCode: inviteCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      console.log("[v0] Member registration successful")
      setSuccess("Account created successfully! You can now sign in with your credentials.")
      setShowMemberRegistration(false)
      router.replace("/auth/login")
    } catch (err: any) {
      console.log("[v0] Member registration error:", err)
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackFromForgotPassword = () => {
    setShowForgotPassword(false)
    setError("")
    setSuccess("")
  }

  if (showForgotPassword) {
    return <ForgotPasswordForm onBack={handleBackFromForgotPassword} />
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
          <CardTitle className="text-2xl text-center text-gray-900">Welcome Back</CardTitle>
          <p className="text-center text-gray-600">Choose your role to continue</p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="owner" className="flex items-center gap-2 text-xs">
                <Crown className="w-4 h-4" />
                <span className="hidden sm:inline">Owner</span>
              </TabsTrigger>
              <TabsTrigger value="partner" className="flex items-center gap-2 text-xs">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Partner</span>
              </TabsTrigger>
              <TabsTrigger value="staff" className="flex items-center gap-2 text-xs">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Staff</span>
              </TabsTrigger>
            </TabsList>

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

            <TabsContent value="owner" className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">Business Owner</h3>
                <p className="text-sm text-gray-600">Manage your business and team</p>
              </div>

              {!showOwnerSignup ? (
                <form onSubmit={handleOwnerLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="owner-email">Email Address</Label>
                    <Input
                      id="owner-email"
                      name="email"
                      type="email"
                      placeholder="Enter your business email"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner-password">Password</Label>
                    <Input
                      id="owner-password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In as Owner"}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setShowOwnerSignup(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Create Owner Account
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleOwnerSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="owner-signup-name">Full Name</Label>
                    <Input
                      id="owner-signup-name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner-signup-business">Business Name</Label>
                    <Input
                      id="owner-signup-business"
                      name="businessName"
                      type="text"
                      placeholder="Enter your business name"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner-signup-email">Email Address</Label>
                    <Input
                      id="owner-signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your business email"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner-signup-password">Password</Label>
                    <Input
                      id="owner-signup-password"
                      name="password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      required
                      className="h-12"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Owner Account"}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setShowOwnerSignup(false)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </TabsContent>

            <TabsContent value="partner" className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">Business Partner</h3>
                <p className="text-sm text-gray-600">Admin access to business operations</p>
              </div>

              {invitationCode && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <UserPlus className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Partner Invitation Found</span>
                  </div>
                  <p className="text-sm text-green-700 mb-3">
                    You've been invited to join as a Partner. Create your account or sign in if you already have one.
                  </p>
                  <Button
                    onClick={() => setShowMemberRegistration(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    Create Partner Account
                  </Button>
                </div>
              )}

              <form onSubmit={handleMemberLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="partner-login-email">Email Address</Label>
                  <Input
                    id="partner-login-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner-login-password">Password</Label>
                  <Input
                    id="partner-login-password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    className="h-12"
                  />
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In as Partner"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="staff" className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">Staff Member</h3>
                <p className="text-sm text-gray-600">Access to assigned business functions</p>
              </div>

              {invitationCode && (
                <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <UserPlus className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Staff Invitation Found</span>
                  </div>
                  <p className="text-sm text-purple-700 mb-3">
                    You've been invited to join as a Staff Member. Create your account or sign in if you already have
                    one.
                  </p>
                  <Button
                    onClick={() => setShowMemberRegistration(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    size="sm"
                  >
                    Create Staff Account
                  </Button>
                </div>
              )}

              <form onSubmit={handleMemberLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-login-email">Email Address</Label>
                  <Input
                    id="staff-login-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-login-password">Password</Label>
                  <Input
                    id="staff-login-password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    className="h-12"
                  />
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In as Staff"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact your business owner or{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                support team
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showMemberRegistration} onOpenChange={setShowMemberRegistration}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Complete Your Registration
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMemberRegistration} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="member-name">Full Name</Label>
              <Input
                id="member-name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-email">Email Address</Label>
              <Input
                id="member-email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-password">Password</Label>
              <Input
                id="member-password"
                name="password"
                type="password"
                placeholder="Create a password (min 6 characters)"
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-invitation-code">Invitation Code</Label>
              <Input
                id="member-invitation-code"
                name="invitationCode"
                type="text"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                placeholder="Enter invitation code"
                required
                className="h-12 font-mono"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMemberRegistration(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={`flex-1 ${
                  invitationRole === "partner" ? "bg-green-600 hover:bg-green-700" : "bg-purple-600 hover:bg-purple-700"
                } text-white`}
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : `Create ${invitationRole === "partner" ? "Partner" : "Staff"} Account`}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

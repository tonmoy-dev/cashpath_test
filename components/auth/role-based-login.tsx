"use client"
import { EnhancedRoleLogin } from "./enhanced-role-login"

export function RoleBasedLogin() {
  return <EnhancedRoleLogin />
}

// Owner login with Google OAuth simulation
// const handleOwnerLogin = async (e: React.FormEvent<HTMLFormElement>) => {
//   e.preventDefault()
//   setIsLoading(true)
//   setError("")

//   const formData = new FormData(e.currentTarget)
//   const email = formData.get("email") as string
//   const password = formData.get("password") as string

//   try {
//     // Simulate API call
//     await new Promise((resolve) => setTimeout(resolve, 1000))

//     const user = getUserByEmail(email)
//     if (user && user.role === "owner") {
//       login(user)
//       router.push("/dashboard")
//     } else {
//       setError("Invalid owner credentials")
//     }
//   } catch (err) {
//     setError("Login failed. Please try again.")
//   } finally {
//     setIsLoading(false)
//   }
// }

// // Google OAuth simulation for owner signup
// const handleGoogleSignup = async () => {
//   setIsLoading(true)
//   try {
//     // Simulate Google OAuth
//     await new Promise((resolve) => setTimeout(resolve, 1500))

//     // For demo, create a new owner account
//     const newUser = addUser({
//       email: "owner@example.com",
//       name: "New Owner",
//       role: "owner",
//       businessId: `business-${Date.now()}`,
//       isActive: true,
//     })

//     login(newUser)
//     router.push("/onboarding")
//   } catch (err) {
//     setError("Google signup failed. Please try again.")
//   } finally {
//     setIsLoading(false)
//   }
// }

// // Member login with invitation code
// const handleMemberLogin = async (e: React.FormEvent<HTMLFormElement>) => {
//   e.preventDefault()
//   setIsLoading(true)
//   setError("")

//   const formData = new FormData(e.currentTarget)
//   const invitationCode = formData.get("invitationCode") as string
//   const email = formData.get("email") as string
//   const password = formData.get("password") as string
//   const name = formData.get("name") as string

//   try {
//     await new Promise((resolve) => setTimeout(resolve, 1000))

//     // Check if user already exists (returning member)
//     const existingUser = getUserByEmail(email)
//     if (existingUser && (existingUser.role === "partner" || existingUser.role === "staff")) {
//       login(existingUser)
//       router.push("/dashboard")
//       return
//     }

//     // First-time login with invitation code
//     if (invitationCode) {
//       const invitation = getInvitationByCode(invitationCode)
//       if (!invitation) {
//         setError("Invalid or expired invitation code")
//         return
//       }

//       // Create new user account
//       const newUser = addUser({
//         email,
//         name,
//         role: invitation.role,
//         businessId: invitation.businessId,
//         isActive: true,
//       })

//       // Mark invitation as used
//       const invitationId = invitation.id
//       const newUserId = newUser.id
//       useInvitation(invitationId, newUserId)

//       login(newUser)
//       router.push("/dashboard")
//     } else {
//       setError("Invitation code is required for first-time login")
//     }
//   } catch (err) {
//     setError("Login failed. Please try again.")
//   } finally {
//     setIsLoading(false)
//   }
// }

// return (
//   <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//     <Card className="w-full max-w-md">
//       <CardHeader className="space-y-1">
//         <div className="flex items-center justify-center gap-2 mb-4">
//           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//             <span className="text-white font-bold text-lg">C</span>
//           </div>
//           <span className="text-2xl font-bold">Cashify</span>
//         </div>
//         <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Tabs defaultValue="owner" className="w-full">
//           <TabsList className="grid w-full grid-cols-3">
//             <TabsTrigger value="owner" className="flex items-center gap-1">
//               <Crown className="w-3 h-3" />
//               Owner
//             </TabsTrigger>
//             <TabsTrigger value="partner" className="flex items-center gap-1">
//               <Users className="w-3 h-3" />
//               Partner
//             </TabsTrigger>
//             <TabsTrigger value="staff" className="flex items-center gap-1">
//               <User className="w-3 h-3" />
//               Staff
//             </TabsTrigger>
//           </TabsList>

//           {error && (
//             <Alert className="mt-4 border-red-200 bg-red-50">
//               <AlertDescription className="text-red-700">{error}</AlertDescription>
//             </Alert>
//           )}

//           <TabsContent value="owner" className="space-y-4">
//             <div className="text-center mb-4">
//               <h3 className="font-semibold text-gray-900">Business Owner Login</h3>
//               <p className="text-sm text-gray-600">Sign in to manage your business</p>
//             </div>

//             <form onSubmit={handleOwnerLogin} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="owner-email">Email</Label>
//                 <Input id="owner-email" name="email" type="email" placeholder="Enter your email" required />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="owner-password">Password</Label>
//                 <Input
//                   id="owner-password"
//                   name="password"
//                   type="password"
//                   placeholder="Enter your password"
//                   required
//                 />
//               </div>
//               <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
//                 {isLoading ? "Signing in..." : "Sign In"}
//               </Button>
//             </form>

//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <span className="w-full border-t" />
//               </div>
//               <div className="relative flex justify-center text-xs uppercase">
//                 <span className="bg-white px-2 text-gray-500">Or</span>
//               </div>
//             </div>

//             <Button
//               onClick={handleGoogleSignup}
//               variant="outline"
//               className="w-full bg-transparent"
//               disabled={isLoading}
//             >
//               <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
//                 <path
//                   fill="currentColor"
//                   d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//                 />
//                 <path
//                   fill="currentColor"
//                   d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//                 />
//                 <path
//                   fill="currentColor"
//                   d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//                 />
//                 <path
//                   fill="currentColor"
//                   d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//                 />
//               </svg>
//               {isLoading ? "Signing up..." : "Sign up with Google"}
//             </Button>
//           </TabsContent>

//           <TabsContent value="partner" className="space-y-4">
//             <div className="text-center mb-4">
//               <h3 className="font-semibold text-gray-900">Partner Login</h3>
//               <p className="text-sm text-gray-600">Use invitation code for first-time login</p>
//             </div>

//             <form onSubmit={handleMemberLogin} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="partner-name">Full Name</Label>
//                 <Input id="partner-name" name="name" type="text" placeholder="Enter your full name" />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="partner-email">Email</Label>
//                 <Input id="partner-email" name="email" type="email" placeholder="Enter your email" required />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="partner-password">Password</Label>
//                 <Input
//                   id="partner-password"
//                   name="password"
//                   type="password"
//                   placeholder="Enter your password"
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="partner-code">Invitation Code (First-time only)</Label>
//                 <Input id="partner-code" name="invitationCode" type="text" placeholder="Enter invitation code" />
//               </div>
//               <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
//                 {isLoading ? "Signing in..." : "Sign In"}
//               </Button>
//             </form>
//           </TabsContent>

//           <TabsContent value="staff" className="space-y-4">
//             <div className="text-center mb-4">
//               <h3 className="font-semibold text-gray-900">Staff Member Login</h3>
//               <p className="text-sm text-gray-600">Use invitation code for first-time login</p>
//             </div>

//             <form onSubmit={handleMemberLogin} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="staff-name">Full Name</Label>
//                 <Input id="staff-name" name="name" type="text" placeholder="Enter your full name" />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="staff-email">Email</Label>
//                 <Input id="staff-email" name="email" type="email" placeholder="Enter your email" required />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="staff-password">Password</Label>
//                 <Input
//                   id="staff-password"
//                   name="password"
//                   type="password"
//                   placeholder="Enter your password"
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="staff-code">Invitation Code (First-time only)</Label>
//                 <Input id="staff-code" name="invitationCode" type="text" placeholder="Enter invitation code" />
//               </div>
//               <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
//                 {isLoading ? "Signing in..." : "Sign In"}
//               </Button>
//             </form>
//           </TabsContent>
//         </Tabs>
//       </CardContent>
//     </Card>
//   </div>
// )

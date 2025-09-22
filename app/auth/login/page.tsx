"use client"

import { EnhancedRoleLogin } from "@/components/auth/enhanced-role-login"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <EnhancedRoleLogin />
    </div>
  )
}

"use client"

import dynamic from "next/dynamic"

import { AuthGuard } from "@/components/auth/auth-guard"
import { InvitationManager } from "@/components/auth/invitation-manager"

function TeamPage() {
  return (
    <AuthGuard requiredRole="owner">
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-2">Manage your team members with invitation links and codes</p>
          </div>
          <InvitationManager />
        </div>
      </div>
    </AuthGuard>
  )
}

export default dynamic(() => Promise.resolve(TeamPage), {
  ssr: false,
})

"use client"

import dynamic from "next/dynamic"

import { AuthGuard } from "@/components/auth/auth-guard"
import { InvitationManager } from "@/components/invitations/invitation-manager"

function InvitationsPage() {
  return (
    <AuthGuard requiredRole="owner">
      <div className="container mx-auto py-6">
        <InvitationManager />
      </div>
    </AuthGuard>
  )
}

export default dynamic(() => Promise.resolve(InvitationsPage), {
  ssr: false,
})

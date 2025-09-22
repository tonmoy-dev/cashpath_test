"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useInvitations } from "@/lib/store"

export function InvitationLinkHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getInvitationByCode } = useInvitations()

  useEffect(() => {
    const invitationCode = searchParams.get("invitation")
    if (invitationCode) {
      const invitation = getInvitationByCode(invitationCode)
      if (invitation) {
        // Pre-fill the invitation code in the login form
        const roleTab = invitation.role === "partner" ? "partner" : "staff"
        // Store the invitation code in sessionStorage for the login form to use
        sessionStorage.setItem("invitationCode", invitationCode)
        sessionStorage.setItem("invitationRole", roleTab)
        // Redirect to login with the appropriate tab
        router.push(`/auth/login#${roleTab}`)
      } else {
        // Invalid or expired invitation
        router.push("/auth/login?error=invalid_invitation")
      }
    }
  }, [searchParams, getInvitationByCode, router])

  return null
}

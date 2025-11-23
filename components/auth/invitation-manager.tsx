"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Copy, Plus, Users, User, Calendar, CheckCircle, XCircle } from "lucide-react"

interface TeamMember {
  id: string
  business_id: string
  user_id?: string
  email: string
  role: "partner" | "staff"
  status: "pending" | "active" | "inactive"
  invitation_code?: string
  invitation_expires_at?: string
  joined_at?: string
  created_at: string
  profiles?: {
    first_name?: string
    last_name?: string
    email: string
  }
}

export function InvitationManager() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newInvitation, setNewInvitation] = useState({
    role: "staff" as "partner" | "staff",
    email: "",
  })
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    loadTeamMembers()
  }, [])

  const loadTeamMembers = async () => {
    try {
      const response = await fetch("/api/team-members")
      if (response.ok) {
        const data = await response.json()
        setTeamMembers(data)
      }
    } catch (error) {
      console.error("Failed to load team members:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateInvitation = async () => {
    if (!newInvitation.email.trim()) return

    setIsCreating(true)
    try {
      const response = await fetch("/api/team-members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newInvitation),
      })

      if (response.ok) {
        const newMember = await response.json()
        setTeamMembers((prev) => [...prev, newMember])
        setNewInvitation({ role: "staff", email: "" })

        // Auto-copy the invitation code
        if (newMember.invitation_code) {
          copyToClipboard(newMember.invitation_code)
        }
      } else {
        const error = await response.json()
        console.error("Failed to create invitation:", error)
      }
    } catch (error) {
      console.error("Failed to create invitation:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getInvitationLink = (code: string) => {
    return `${window.location.origin}/auth/login?invitation=${code}`
  }

  const copyInvitationLink = (code: string) => {
    const link = getInvitationLink(code)
    navigator.clipboard.writeText(link)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const activePartners = teamMembers.filter((m) => m.role === "partner" && m.status === "active").length
  const activeStaff = teamMembers.filter((m) => m.role === "staff" && m.status === "active").length
  const pendingMembers = teamMembers.filter((m) => m.status === "pending").length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading team members...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">1</div>
              <div className="text-sm text-blue-700">Owners</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{activePartners}</div>
              <div className="text-sm text-green-700">Active Partners</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{activeStaff}</div>
              <div className="text-sm text-purple-700">Active Staff</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{pendingMembers}</div>
              <div className="text-sm text-orange-700">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Plus className="w-5 h-5" />
            Add New Team Member
          </CardTitle>
          <p className="text-sm text-blue-600 mt-1">
            Create an invitation to add a new partner or staff member to your team
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Member Role</Label>
              <Select
                value={newInvitation.role}
                onValueChange={(value: "partner" | "staff") => setNewInvitation((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partner">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Partner (Admin)
                    </div>
                  </SelectItem>
                  <SelectItem value="staff">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Staff Member
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="member@example.com"
                value={newInvitation.email}
                onChange={(e) => setNewInvitation((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>
          <Button
            onClick={handleCreateInvitation}
            disabled={isCreating || !newInvitation.email.trim()}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {isCreating ? "Creating Invitation..." : "Create Invitation & Add Member"}
          </Button>
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            💡 <strong>How it works:</strong> Creating an invitation automatically adds the member to your team with
            "Pending" status. They'll become "Active" once they use the invitation code to complete their registration.
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            All Team Members
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">View all team members including those with pending invitations</p>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No team members yet</p>
              <p className="text-sm">Create your first invitation above to add a team member</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => {
                const isExpired = member.invitation_expires_at
                  ? new Date(member.invitation_expires_at) <= new Date()
                  : false
                const isActive = member.status === "active"
                const isPending = member.status === "pending" && !isExpired

                const memberName = member.profiles
                  ? `${member.profiles.first_name || ""} ${member.profiles.last_name || ""}`.trim()
                  : member.email.split("@")[0]

                const memberAvatar = memberName.charAt(0).toUpperCase()

                return (
                  <div key={member.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {memberAvatar}
                        </div>
                        <div>
                          <div className="font-medium">{memberName || member.email}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={member.role === "partner" ? "default" : "secondary"}
                          className={
                            member.role === "partner" ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"
                          }
                        >
                          {member.role === "partner" ? (
                            <>
                              <Users className="w-3 h-3 mr-1" /> Partner
                            </>
                          ) : (
                            <>
                              <User className="w-3 h-3 mr-1" /> Staff
                            </>
                          )}
                        </Badge>
                        <Badge
                          variant={isActive ? "default" : "secondary"}
                          className={
                            isActive
                              ? "bg-green-100 text-green-800"
                              : isPending
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" /> Active
                            </>
                          ) : isPending ? (
                            <>
                              <Calendar className="w-3 h-3 mr-1" /> Pending
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" /> Expired
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {isActive
                          ? `Joined: ${member.joined_at ? new Date(member.joined_at).toLocaleDateString() : "Unknown"}`
                          : `Invited: ${new Date(member.created_at).toLocaleDateString()}`}
                      </div>
                    </div>

                    {isPending && member.invitation_code && (
                      <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="text-sm font-medium text-orange-800 mb-2">
                          📧 Invitation Details - Share with {memberName || member.email}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input value={member.invitation_code} readOnly className="font-mono text-sm bg-white" />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(member.invitation_code!)}
                              className="flex-shrink-0"
                            >
                              <Copy className="w-4 h-4" />
                              {copiedCode === member.invitation_code ? "Copied!" : "Copy Code"}
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyInvitationLink(member.invitation_code!)}
                            className="w-full bg-white hover:bg-gray-50"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Full Invitation Link
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

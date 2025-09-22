"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useInvitations, useAuth } from "@/lib/store"
import { Copy, Plus, Users, User, Clock, CheckCircle, XCircle } from "lucide-react"

export function InvitationManager() {
  const { invitations, createInvitation, deleteInvitation, getInvitationsByBusiness } = useInvitations()
  const { authSession } = useAuth()
  const [isCreating, setIsCreating] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"partner" | "staff">("partner")
  const [email, setEmail] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [copiedCode, setCopiedCode] = useState("")

  const currentBusinessInvitations = authSession.user ? getInvitationsByBusiness(authSession.user.businessId) : []

  const handleCreateInvitation = async () => {
    if (!authSession.user) return

    setIsCreating(true)
    try {
      const invitation = createInvitation(authSession.user.businessId, selectedRole, authSession.user.id, email)
      setEmail("")
      setShowCreateDialog(false)
      // Auto-copy the invitation code
      if (invitation) {
        await navigator.clipboard.writeText(invitation.code)
        setCopiedCode(invitation.code)
        setTimeout(() => setCopiedCode(""), 3000)
      }
    } catch (error) {
      console.error("Failed to create invitation:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const copyInvitationCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(""), 2000)
    } catch (error) {
      console.error("Failed to copy code:", error)
    }
  }

  const copyInvitationLink = async (code: string) => {
    try {
      const link = `${window.location.origin}/auth/login?invitation=${code}`
      await navigator.clipboard.writeText(link)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(""), 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  const getStatusIcon = (invitation: any) => {
    if (invitation.isUsed) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    }
    if (new Date(invitation.expiresAt) < new Date()) {
      return <XCircle className="w-4 h-4 text-red-600" />
    }
    return <Clock className="w-4 h-4 text-yellow-600" />
  }

  const getStatusText = (invitation: any) => {
    if (invitation.isUsed) return "Used"
    if (new Date(invitation.expiresAt) < new Date()) return "Expired"
    return "Active"
  }

  const getStatusColor = (invitation: any) => {
    if (invitation.isUsed) return "bg-green-100 text-green-800"
    if (new Date(invitation.expiresAt) < new Date()) return "bg-red-100 text-red-800"
    return "bg-yellow-100 text-yellow-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Invitations</h2>
          <p className="text-gray-600">Manage invitations for partners and staff members</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Invitation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Invitation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={selectedRole} onValueChange={(value: "partner" | "staff") => setSelectedRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
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
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateInvitation} className="w-full" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Invitation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {copiedCode && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Invitation code copied to clipboard! Share it with the new member.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {currentBusinessInvitations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No invitations yet</h3>
              <p className="text-gray-600 text-center mb-4">
                Create your first invitation to add team members to your business
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Invitation
              </Button>
            </CardContent>
          </Card>
        ) : (
          currentBusinessInvitations.map((invitation) => (
            <Card key={invitation.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {invitation.role === "partner" ? (
                      <Users className="w-5 h-5 text-green-600" />
                    ) : (
                      <User className="w-5 h-5 text-blue-600" />
                    )}
                    <div>
                      <CardTitle className="text-lg">
                        {invitation.role === "partner" ? "Partner" : "Staff Member"} Invitation
                      </CardTitle>
                      {invitation.email && <p className="text-sm text-gray-600">{invitation.email}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(invitation)}
                    <Badge className={getStatusColor(invitation)}>{getStatusText(invitation)}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Invitation Code</Label>
                  <div className="flex items-center gap-2">
                    <Input value={invitation.code} readOnly className="font-mono text-sm" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyInvitationCode(invitation.code)}
                      className="shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Invitation Link</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={`${window.location.origin}/auth/login?invitation=${invitation.code}`}
                      readOnly
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyInvitationLink(invitation.code)}
                      className="shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Created: {new Date(invitation.createdAt).toLocaleDateString()}</span>
                  <span>Expires: {new Date(invitation.expiresAt).toLocaleDateString()}</span>
                </div>

                {invitation.isUsed && invitation.usedAt && (
                  <div className="text-sm text-green-600">
                    Used on: {new Date(invitation.usedAt).toLocaleDateString()}
                  </div>
                )}

                {!invitation.isUsed && new Date(invitation.expiresAt) > new Date() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteInvitation(invitation.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Revoke Invitation
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

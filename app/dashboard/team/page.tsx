"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useTeamMembers, type TeamMember } from "@/lib/store"
import { Users, Plus, Mail, Phone, MoreVertical, Edit, Trash2 } from "lucide-react"
import type { JSX } from "react/jsx-runtime"

export default function TeamPage(): JSX.Element {
  const { teamMembers, addTeamMember, updateTeamMember, deleteTeamMember } = useTeamMembers()

  const [addMemberOpen, setAddMemberOpen] = useState<boolean>(false)
  const [editMemberOpen, setEditMemberOpen] = useState<boolean>(false)
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false)
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null)

  const handleAddMember = (formData: FormData): void => {
    const name = formData.get("name")
    const email = formData.get("email")
    const phone = formData.get("phone")
    const role = formData.get("role")

    if (!name || typeof name !== "string" || !email || typeof email !== "string" || !role || typeof role !== "string") {
      console.error("Required fields are missing")
      return
    }

    const memberData = {
      name,
      email,
      phone: typeof phone === "string" ? phone : "",
      role,
      status: "Pending" as const,
      joinedDate: new Date().toISOString().split("T")[0],
      avatar: name.charAt(0).toUpperCase(),
    }

    addTeamMember(memberData)
    setAddMemberOpen(false)
  }

  const handleEditMember = (member: TeamMember): void => {
    setMemberToEdit(member)
    setEditMemberOpen(true)
  }

  const handleUpdateMember = (formData: FormData): void => {
    if (!memberToEdit) return

    const name = formData.get("name")
    const email = formData.get("email")
    const phone = formData.get("phone")
    const role = formData.get("role")
    const status = formData.get("status")

    if (
      !name ||
      typeof name !== "string" ||
      !email ||
      typeof email !== "string" ||
      !role ||
      typeof role !== "string" ||
      !status ||
      typeof status !== "string"
    ) {
      console.error("Required fields are missing")
      return
    }

    const updatedMember: TeamMember = {
      ...memberToEdit,
      name,
      email,
      phone: typeof phone === "string" ? phone : "",
      role,
      status: status as "Active" | "Pending",
      avatar: name.charAt(0).toUpperCase(),
    }

    updateTeamMember(updatedMember)
    setEditMemberOpen(false)
    setMemberToEdit(null)
  }

  const handleDeleteMember = (memberId: string): void => {
    setMemberToDelete(memberId)
    setShowDeleteDialog(true)
  }

  const confirmDeleteMember = (): void => {
    if (memberToDelete) {
      deleteTeamMember(memberToDelete)
      setShowDeleteDialog(false)
      setMemberToDelete(null)
    }
  }

  const getRoleColor = (role: string): string => {
    switch (role.toLowerCase()) {
      case "owner":
        return "bg-orange-100 text-orange-800"
      case "business partner":
        return "bg-purple-100 text-purple-800"
      case "staff member":
        return "bg-teal-100 text-teal-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalMembers = teamMembers.length
  const activeMembers = teamMembers.filter((m) => m.status === "Active").length
  const pendingMembers = teamMembers.filter((m) => m.status === "Pending").length

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
            <h1 className="text-xl sm:text-2xl font-bold">Total Members ({totalMembers})</h1>
            <div className="flex items-center gap-3 sm:gap-4 text-sm">
              <span className="text-green-600 font-medium">{activeMembers} Active</span>
              <span className="text-yellow-600 font-medium">{pendingMembers} Pending</span>
            </div>
            <Link
              href="/roles"
              className="text-blue-600 text-sm hover:underline flex items-center gap-1 whitespace-nowrap"
            >
              View roles & permissions
              <span>→</span>
            </Link>
          </div>

          <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add team member
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
              </DialogHeader>
              <form action={handleAddMember} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" placeholder="Enter full name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" name="email" type="email" placeholder="Enter email address" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" placeholder="Enter phone number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select name="role" defaultValue="Staff Member">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Business Partner">Business Partner</SelectItem>
                      <SelectItem value="Staff Member">Staff Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Send Invitation
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setAddMemberOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-2">Add members & Assign Roles</h2>
              <p className="text-sm sm:text-base text-gray-600">Give access to limited features & books</p>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md text-left sm:text-right">
              Add your business partners or staffs to this business and manage cashflow together
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {teamMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        member.role === "Owner"
                          ? "bg-orange-500"
                          : member.role === "Business Partner"
                            ? "bg-purple-500"
                            : "bg-teal-500"
                      }`}
                    >
                      <span className="text-white font-medium text-sm sm:text-base">{member.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                        <h3 className="font-semibold text-base sm:text-lg">{member.name}</h3>
                        {member.role === "Owner" && <span className="text-xs sm:text-sm text-gray-500">(You)</span>}
                        <Badge variant="secondary" className={`${getRoleColor(member.role)} text-xs`}>
                          {member.role}
                        </Badge>
                        <Badge variant="secondary" className={`${getStatusColor(member.status)} text-xs`}>
                          {member.status}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
                        <span className="flex items-center gap-1 break-all">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          {member.email}
                        </span>
                        {member.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            {member.phone}
                          </span>
                        )}
                        <span className="whitespace-nowrap">Joined {member.joinedDate}</span>
                      </div>
                    </div>
                  </div>

                  {member.role !== "Owner" && (
                    <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 sm:h-9 sm:w-9"
                        onClick={() => handleEditMember(member)}
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 h-8 w-8 sm:h-9 sm:w-9"
                        onClick={() => handleDeleteMember(member.id)}
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9">
                        <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 sm:mt-12">
          <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Role Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-sm sm:text-base">Owner</h4>
                </div>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-2">
                  <li>• Full access to all features</li>
                  <li>• Manage team members</li>
                  <li>• Business settings control</li>
                  <li>• Financial reports access</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-sm sm:text-base">Business Partner</h4>
                </div>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-2">
                  <li>• Full transaction access</li>
                  <li>• View financial reports</li>
                  <li>• Manage PCash books</li>
                  <li>• Limited team access</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                  </div>
                  <h4 className="font-semibold text-sm sm:text-base">Staff Member</h4>
                </div>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-2">
                  <li>• Add transactions only</li>
                  <li>• View assigned PCash books</li>
                  <li>• Limited report access</li>
                  <li>• No team management</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={editMemberOpen} onOpenChange={setEditMemberOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          {memberToEdit && (
            <form action={handleUpdateMember} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  placeholder="Enter full name"
                  defaultValue={memberToEdit.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address *</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  defaultValue={memberToEdit.email}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  placeholder="Enter phone number"
                  defaultValue={memberToEdit.phone}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role *</Label>
                <Select name="role" defaultValue={memberToEdit.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Business Partner">Business Partner</SelectItem>
                    <SelectItem value="Staff Member">Staff Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status *</Label>
                <Select name="status" defaultValue={memberToEdit.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Update Member
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditMemberOpen(false)
                    setMemberToEdit(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this team member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteMember}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}

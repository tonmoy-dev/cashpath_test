export interface TeamMember {
  id: string
  businessId: string
  userId: string // Reference to User

  // Member details
  name: string
  email: string
  phone?: string
  role: "owner" | "partner" | "staff"
  status: "active" | "pending" | "inactive"
  avatar: string

  // Permissions
  permissions: TeamPermissions

  // Access control
  allowedBooks: string[] // Book IDs this member can access
  allowedAccounts: string[] // Account IDs this member can access

  // Dates
  joinedDate: string
  invitedAt?: string
  lastActiveAt?: string

  // Invitation details
  invitationCode?: string
  invitedBy?: string // User ID of inviter
}

export interface TeamPermissions {
  // Transaction permissions
  canCreateTransactions: boolean
  canEditTransactions: boolean
  canDeleteTransactions: boolean
  canViewAllTransactions: boolean

  // Account permissions
  canCreateAccounts: boolean
  canEditAccounts: boolean
  canDeleteAccounts: boolean
  canViewAllAccounts: boolean

  // Book permissions
  canCreateBooks: boolean
  canEditBooks: boolean
  canDeleteBooks: boolean
  canViewAllBooks: boolean

  // Team permissions
  canInviteMembers: boolean
  canEditMembers: boolean
  canRemoveMembers: boolean
  canViewTeam: boolean

  // Report permissions
  canViewReports: boolean
  canExportReports: boolean
  canViewFinancialSummary: boolean

  // Business permissions
  canEditBusinessSettings: boolean
  canViewBusinessSettings: boolean
}

export interface Invitation {
  id: string
  businessId: string
  code: string // Unique invitation code

  // Invitation details
  role: "partner" | "staff"
  email?: string
  invitedBy: string // User ID of inviter

  // Status
  isUsed: boolean
  usedBy?: string // User ID who used the invitation
  usedAt?: string

  // Expiration
  expiresAt: string
  createdAt: string

  // Permissions for this invitation
  permissions: TeamPermissions
  allowedBooks: string[]
  allowedAccounts: string[]
}

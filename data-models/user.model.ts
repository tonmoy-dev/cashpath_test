export interface User {
  id: string
  email: string
  password?: string // Optional for invitation-based users
  name: string
  role: "owner" | "partner" | "staff"
  businessId: string
  avatar?: string
  phone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string

  // Authentication related
  isEmailVerified: boolean
  emailVerificationToken?: string
  passwordResetToken?: string
  passwordResetExpires?: string

  // Invitation related (for partners and staff)
  invitationCode?: string
  invitedBy?: string // User ID of the owner who invited
  invitedAt?: string
  acceptedAt?: string
}

export interface AuthSession {
  isAuthenticated: boolean
  user: User | null
  token?: string
  expiresAt?: string
}

export type UserRole = "owner" | "partner" | "staff"
export type UserStatus = "active" | "pending" | "inactive"

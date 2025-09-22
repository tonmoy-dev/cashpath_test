import type { UserRole } from "./user-role.model" // Assuming UserRole is defined in another file

export interface AuditLog {
  id: string
  businessId: string

  // Action details
  action: AuditAction
  entityType: "user" | "business" | "account" | "transaction" | "book" | "team_member" | "invitation"
  entityId: string

  // Changes
  oldValues?: Record<string, any>
  newValues?: Record<string, any>

  // Context
  userId: string // Who performed the action
  userRole: UserRole
  ipAddress?: string
  userAgent?: string

  // Metadata
  timestamp: string
  description: string
}

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "invite_sent"
  | "invite_accepted"
  | "permission_changed"
  | "password_reset"
  | "email_verified"
  | "account_activated"
  | "account_deactivated"
  | "export_data"
  | "import_data"

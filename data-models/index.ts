// User Management
export * from "./user.model"
export * from "./business.model"
export * from "./team.model"

// Financial Management
export * from "./financial.model"

// Reporting
export * from "./reports.model"

// System
export * from "./audit.model"
export * from "./system.model"

// Common types
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Database relationships
export interface DatabaseRelations {
  // User -> Business (many-to-one)
  "users.businessId": "businesses.id"

  // TeamMember -> User (one-to-one)
  "team_members.userId": "users.id"

  // TeamMember -> Business (many-to-one)
  "team_members.businessId": "businesses.id"

  // Account -> Business (many-to-one)
  "accounts.businessId": "businesses.id"

  // Book -> Business (many-to-one)
  "books.businessId": "businesses.id"

  // Transaction -> Business (many-to-one)
  "transactions.businessId": "businesses.id"

  // Transaction -> Book (many-to-one)
  "transactions.bookId": "books.id"

  // Transaction -> Account (many-to-one)
  "transactions.accountId": "accounts.id"

  // Category -> Business (many-to-one)
  "categories.businessId": "businesses.id"

  // Attachment -> Transaction (many-to-one)
  "attachments.transactionId": "transactions.id"

  // Invitation -> Business (many-to-one)
  "invitations.businessId": "businesses.id"

  // AuditLog -> Business (many-to-one)
  "audit_logs.businessId": "businesses.id"
}

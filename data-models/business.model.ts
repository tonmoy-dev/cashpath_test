export interface Business {
  id: string
  name: string
  type: "personal" | "business"
  ownerId: string // User ID of the owner
  description?: string
  industry?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  taxId?: string
  registrationNumber?: string

  // Settings
  currency: string
  timezone: string
  fiscalYearStart: string // MM-DD format

  // Metadata
  isActive: boolean
  createdAt: string
  updatedAt: string

  // Team settings
  maxTeamMembers: number
  allowPartnerInvites: boolean
  allowStaffInvites: boolean
}

export interface BusinessSettings {
  businessId: string

  // Financial settings
  defaultPaymentMode: string
  enableMultiCurrency: boolean
  autoBackup: boolean
  backupFrequency: "daily" | "weekly" | "monthly"

  // Security settings
  requireTwoFactor: boolean
  sessionTimeout: number // in minutes
  allowMobileAccess: boolean

  // Notification settings
  emailNotifications: boolean
  smsNotifications: boolean
  transactionAlerts: boolean
  lowBalanceAlerts: boolean

  updatedAt: string
}

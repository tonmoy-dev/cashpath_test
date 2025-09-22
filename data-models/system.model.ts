export interface SystemSettings {
  id: string

  // Application settings
  appName: string
  appVersion: string
  maintenanceMode: boolean

  // Security settings
  passwordMinLength: number
  passwordRequireSpecialChars: boolean
  sessionTimeoutMinutes: number
  maxLoginAttempts: number
  lockoutDurationMinutes: number

  // Invitation settings
  invitationExpiryDays: number
  maxInvitationsPerBusiness: number

  // File upload settings
  maxFileSize: number // in bytes
  allowedFileTypes: string[]

  // Backup settings
  autoBackupEnabled: boolean
  backupRetentionDays: number

  updatedAt: string
  updatedBy: string // User ID
}

export interface AppMetadata {
  totalUsers: number
  totalBusinesses: number
  totalTransactions: number
  totalAccounts: number

  // Usage statistics
  activeUsersToday: number
  activeUsersThisMonth: number
  transactionsToday: number
  transactionsThisMonth: number

  // System health
  lastBackupAt?: string
  systemStatus: "healthy" | "warning" | "error"

  updatedAt: string
}

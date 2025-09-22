export interface Account {
  id: string
  businessId: string
  name: string
  type: "cash" | "bank" | "credit" | "investment"

  // Account details
  accountNumber?: string
  bankName?: string
  branchName?: string
  ifscCode?: string

  // Balance tracking
  initialBalance: number
  currentBalance: number

  // Settings
  isActive: boolean
  currency: string

  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string // User ID
}

export interface Book {
  id: string
  businessId: string
  name: string
  description?: string

  // Book settings
  bookType: "general" | "project" | "expense" | "payable" | "receivable"
  isActive: boolean

  // Access control
  allowedMembers: string[] // User IDs who can access this book

  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string // User ID
}

export interface Transaction {
  id: string
  businessId: string
  bookId: string
  accountId: string

  // Transaction details
  type: "income" | "expense" | "transfer"
  amount: number
  note: string
  description?: string

  // Payment details
  paymentMode: "cash" | "bank_transfer" | "cheque" | "card" | "upi" | "other"
  referenceNumber?: string

  // Transfer specific (when type is 'transfer')
  fromAccountId?: string
  toAccountId?: string
  transferFee?: number

  // Categorization
  categoryId?: string
  subcategoryId?: string
  tags: string[]

  // Attachments
  attachments: Attachment[]

  // Dates
  date: string // Transaction date
  createdAt: string
  updatedAt: string

  // Audit
  createdBy: string // User ID
  updatedBy?: string // User ID

  // Status
  status: "pending" | "completed" | "cancelled"
  isRecurring: boolean
  recurringPattern?: RecurringPattern
}

export interface RecurringPattern {
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  interval: number // Every X days/weeks/months/years
  endDate?: string
  maxOccurrences?: number
  nextDueDate: string
}

export interface Category {
  id: string
  businessId: string
  name: string
  type: "income" | "expense"
  color: string
  icon?: string

  // Hierarchy
  parentId?: string // For subcategories

  // Settings
  isActive: boolean
  isDefault: boolean

  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string // User ID
}

export interface Attachment {
  id: string
  transactionId: string

  // File details
  fileName: string
  fileType: string
  fileSize: number
  mimeType: string

  // Storage
  base64Data: string // For local storage
  url?: string // For cloud storage

  // Metadata
  uploadedAt: string
  uploadedBy: string // User ID
}

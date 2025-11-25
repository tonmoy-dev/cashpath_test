import { pgTable, uuid, text, timestamp, boolean, jsonb, decimal, date, pgEnum, index, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Enums
export const userRoleEnum = pgEnum("user_role", ["owner", "partner", "staff"])
export const teamMemberStatusEnum = pgEnum("team_member_status", ["pending", "active", "inactive", "expired"])
export const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense", "transfer"])
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "cleared", "reconciled"])

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  emailVerified: timestamp("email_verified"),
  name: text("name"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Profiles table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").default("owner").notNull(),
  avatarUrl: text("avatar_url"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("profiles_email_idx").on(table.userId),
}))

// User settings table
export const userSettings = pgTable("user_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  theme: text("theme").default("light").notNull(),
  language: text("language").default("en").notNull(),
  currency: text("currency").default("USD").notNull(),
  dateFormat: text("date_format").default("MM/DD/YYYY").notNull(),
  numberFormat: text("number_format").default("en-US").notNull(),
  currentBusinessId: uuid("current_business_id"),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  notifications: jsonb("notifications").default({ email: true, push: true, sms: false }).notNull(),
  backupSettings: jsonb("backup_settings").default({ auto_backup: true, frequency: "daily" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Businesses table
export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  logoUrl: text("logo_url"),
  address: text("address"),
  description: text("description"),
  industry: text("industry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  ownerIdx: index("businesses_owner_id_idx").on(table.ownerId),
}))

// Team members table
export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  email: text("email").notNull(),
  role: text("role").notNull(),
  status: text("status").default("pending").notNull(),
  invitationCode: text("invitation_code").unique(),
  invitationExpiresAt: timestamp("invitation_expires_at"),
  invitedBy: uuid("invited_by").references(() => users.id, { onDelete: "set null" }),
  joinedAt: timestamp("joined_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  businessEmailUnique: uniqueIndex("team_members_business_email_unique").on(table.businessId, table.email),
  businessIdx: index("team_members_business_id_idx").on(table.businessId),
  userIdx: index("team_members_user_id_idx").on(table.userId),
  emailIdx: index("team_members_email_idx").on(table.email),
  invitationCodeIdx: index("team_members_invitation_code_idx").on(table.invitationCode),
  statusIdx: index("team_members_status_idx").on(table.status),
}))

// Accounts table
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  category: text("category"),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0").notNull(),
  currency: text("currency").default("USD").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  businessNameUnique: uniqueIndex("accounts_business_name_unique").on(table.businessId, table.name),
  businessIdx: index("accounts_business_id_idx").on(table.businessId),
  typeIdx: index("accounts_type_idx").on(table.type),
  isActiveIdx: index("accounts_is_active_idx").on(table.isActive),
}))

// Categories table
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  color: text("color").default("#6B7280").notNull(),
  icon: text("icon").default("folder").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  businessNameTypeUnique: uniqueIndex("categories_business_name_type_unique").on(table.businessId, table.name, table.type),
  businessIdx: index("categories_business_id_idx").on(table.businessId),
  typeIdx: index("categories_type_idx").on(table.type),
  isActiveIdx: index("categories_is_active_idx").on(table.isActive),
}))

// Books table (must be defined before transactions since transactions references it)
export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  bookType: text("book_type").default("general").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  businessNameUnique: uniqueIndex("books_business_name_unique").on(table.businessId, table.name),
  businessBookTypeUnique: uniqueIndex("books_business_book_type_unique").on(table.businessId, table.bookType),
  businessIdx: index("books_business_id_idx").on(table.businessId),
  userIdx: index("books_user_id_idx").on(table.userId),
  bookTypeIdx: index("books_book_type_idx").on(table.bookType),
}))

// Transactions table
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  bookId: uuid("book_id").references(() => books.id, { onDelete: "set null" }),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  type: text("type").notNull(),
  date: date("date").defaultNow().notNull(),
  note: text("note"),
  paymentMode: text("payment_mode"),
  transferId: uuid("transfer_id"),
  linkedTransactionId: uuid("linked_transaction_id"),
  attachments: jsonb("attachments").default([]).notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  status: text("status").default("cleared").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  businessIdx: index("transactions_business_id_idx").on(table.businessId),
  accountIdx: index("transactions_account_id_idx").on(table.accountId),
  bookIdx: index("transactions_book_id_idx").on(table.bookId),
  categoryIdx: index("transactions_category_id_idx").on(table.categoryId),
  dateIdx: index("transactions_date_idx").on(table.date),
  typeIdx: index("transactions_type_idx").on(table.type),
  createdAtIdx: index("transactions_created_at_idx").on(table.createdAt),
  transferIdIdx: index("transactions_transfer_id_idx").on(table.transferId),
}))

// Audit logs table
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  action: text("action").notNull(),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  businessIdx: index("audit_logs_business_id_idx").on(table.businessId),
  userIdx: index("audit_logs_user_id_idx").on(table.userId),
  entityTypeIdx: index("audit_logs_entity_type_idx").on(table.entityType),
  entityIdIdx: index("audit_logs_entity_id_idx").on(table.entityId),
  actionIdx: index("audit_logs_action_idx").on(table.action),
  createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
}))

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  userSettings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
  businesses: many(businesses),
  teamMembers: many(teamMembers),
  accounts: many(accounts),
  categories: many(categories),
  transactions: many(transactions),
  books: many(books),
  auditLogs: many(auditLogs),
}))

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}))

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  owner: one(users, {
    fields: [businesses.ownerId],
    references: [users.id],
  }),
  teamMembers: many(teamMembers),
  accounts: many(accounts),
  categories: many(categories),
  transactions: many(transactions),
  books: many(books),
  auditLogs: many(auditLogs),
}))

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  business: one(businesses, {
    fields: [teamMembers.businessId],
    references: [businesses.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}))

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  business: one(businesses, {
    fields: [accounts.businessId],
    references: [businesses.id],
  }),
  createdByUser: one(users, {
    fields: [accounts.createdBy],
    references: [users.id],
  }),
  transactions: many(transactions),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  business: one(businesses, {
    fields: [categories.businessId],
    references: [businesses.id],
  }),
  createdByUser: one(users, {
    fields: [categories.createdBy],
    references: [users.id],
  }),
  transactions: many(transactions),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  business: one(businesses, {
    fields: [transactions.businessId],
    references: [businesses.id],
  }),
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  book: one(books, {
    fields: [transactions.bookId],
    references: [books.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  createdByUser: one(users, {
    fields: [transactions.createdBy],
    references: [users.id],
  }),
}))

export const booksRelations = relations(books, ({ one, many }) => ({
  business: one(businesses, {
    fields: [books.businessId],
    references: [businesses.id],
  }),
  user: one(users, {
    fields: [books.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}))

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  business: one(businesses, {
    fields: [auditLogs.businessId],
    references: [businesses.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}))


"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

// Types
export interface Attachment {
  id: string
  name: string
  size: number
  mime: string
  base64Data: string
  uploadedAt: string
}

export interface Business {
  id: string
  name: string
  createdAt: string
  isActive: boolean
  type?: "business" | "personal"
}

export interface Account {
  id: string
  name: string
  businessId: string
  createdAt: string
  type: string
  balance: number
}

export interface Transaction {
  id: string
  businessId: string
  accountId: string
  date: string
  amount: number
  type: "income" | "expense" | "transfer-out" | "transfer-in"
  categoryId: string
  paymentMode: string
  note: string
  attachments: Attachment[]
  createdBy: string
  createdAt: string
  linkedTransactionId?: string
  transferToAccountId?: string
  transferId?: string
  fromAccountId?: string
}

export interface Category {
  id: string
  name: string
  type: "income" | "expense"
  businessId: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  phone?: string
  role: "owner" | "partner" | "staff"
  status: "Active" | "Pending"
  joinedDate: string
  avatar: string
  invitationCode?: string
  invitedBy?: string
  invitedAt?: string
}

export interface User {
  id: string
  email: string
  name: string
  role: "owner" | "partner" | "staff"
  businessId: string
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
  avatar?: string
  phone?: string
}

export interface Invitation {
  id: string
  code: string
  businessId: string
  role: "partner" | "staff"
  createdBy: string
  createdAt: string
  expiresAt: string
  isUsed: boolean
  usedBy?: string
  usedAt?: string
  email?: string
}

export interface AuthSession {
  user: User | null
  isAuthenticated: boolean
  token?: string
}

export interface AppState {
  businesses: Business[]
  accounts: Account[]
  transactions: Transaction[]
  categories: Category[]
  teamMembers: TeamMember[]
  currentBusiness: string | null
  currentAccount: string | null
  users: User[]
  invitations: Invitation[]
  authSession: AuthSession
  isLoading: boolean
  error: string | null
}

const initialState: AppState = {
  businesses: [],
  accounts: [],
  categories: [],
  transactions: [],
  teamMembers: [],
  currentBusiness: null,
  currentAccount: null,
  users: [],
  invitations: [],
  authSession: {
    user: null,
    isAuthenticated: false,
  },
  isLoading: false,
  error: null,
}

type Action =
  | { type: "SET_STATE"; payload: Partial<AppState> }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_BUSINESS"; payload: Business }
  | { type: "SET_CURRENT_BUSINESS"; payload: string }
  | { type: "ADD_ACCOUNT"; payload: Account }
  | { type: "UPDATE_ACCOUNT"; payload: Account }
  | { type: "SET_CURRENT_ACCOUNT"; payload: string }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "UPDATE_TRANSACTION"; payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "UPDATE_CATEGORY"; payload: Category }
  | { type: "DELETE_CATEGORY"; payload: string }
  | { type: "ADD_TEAM_MEMBER"; payload: TeamMember }
  | { type: "UPDATE_TEAM_MEMBER"; payload: TeamMember }
  | { type: "DELETE_TEAM_MEMBER"; payload: string }
  | { type: "SET_AUTH_SESSION"; payload: AuthSession }
  | { type: "ADD_USER"; payload: User }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "DELETE_USER"; payload: string }
  | { type: "ADD_INVITATION"; payload: Invitation }
  | { type: "UPDATE_INVITATION"; payload: Invitation }
  | { type: "DELETE_INVITATION"; payload: string }

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_STATE":
      return { ...state, ...action.payload }

    case "SET_LOADING":
      return { ...state, isLoading: action.payload }

    case "SET_ERROR":
      return { ...state, error: action.payload }

    case "ADD_BUSINESS":
      return {
        ...state,
        businesses: [...state.businesses, action.payload],
      }

    case "SET_CURRENT_BUSINESS":
      return {
        ...state,
        currentBusiness: action.payload,
      }

    case "ADD_ACCOUNT":
      return {
        ...state,
        accounts: [...state.accounts, action.payload],
      }

    case "UPDATE_ACCOUNT":
      return {
        ...state,
        accounts: state.accounts.map((a) => (a.id === action.payload.id ? action.payload : a)),
      }

    case "SET_CURRENT_ACCOUNT":
      return {
        ...state,
        currentAccount: action.payload,
      }

    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      }

    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((t) => (t.id === action.payload.id ? action.payload : t)),
      }

    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      }

    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [...state.categories, action.payload],
      }

    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((c) => (c.id === action.payload.id ? action.payload : c)),
      }

    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
      }

    case "ADD_TEAM_MEMBER":
      return {
        ...state,
        teamMembers: [...state.teamMembers, action.payload],
      }

    case "UPDATE_TEAM_MEMBER":
      return {
        ...state,
        teamMembers: state.teamMembers.map((m) => (m.id === action.payload.id ? action.payload : m)),
      }

    case "DELETE_TEAM_MEMBER":
      return {
        ...state,
        teamMembers: state.teamMembers.filter((m) => m.id !== action.payload),
      }

    case "SET_AUTH_SESSION":
      return {
        ...state,
        authSession: action.payload,
      }

    case "ADD_USER":
      return {
        ...state,
        users: [...state.users, action.payload],
      }

    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.payload.id ? action.payload : u)),
      }

    case "DELETE_USER":
      return {
        ...state,
        users: state.users.filter((u) => u.id !== action.payload),
      }

    case "ADD_INVITATION":
      return {
        ...state,
        invitations: [...state.invitations, action.payload],
      }

    case "UPDATE_INVITATION":
      return {
        ...state,
        invitations: state.invitations.map((i) => (i.id === action.payload.id ? action.payload : i)),
      }

    case "DELETE_INVITATION":
      return {
        ...state,
        invitations: state.invitations.filter((i) => i.id !== action.payload),
      }

    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<Action>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    const supabase = createClient()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state change:", event, session?.user?.id)

      if (session?.user) {
        try {
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

          const authSession: AuthSession = {
            user: {
              id: session.user.id,
              email: session.user.email || "",
              name: profile?.name || session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "",
              role: profile?.role || "owner",
              businessId: profile?.business_id || "",
              isActive: true,
              createdAt: session.user.created_at,
              avatar: profile?.avatar_url,
              phone: profile?.phone,
            },
            isAuthenticated: true,
          }
          dispatch({ type: "SET_AUTH_SESSION", payload: authSession })

          // Load user data from database
          await loadUserData()
        } catch (error) {
          console.error("[v0] Error loading profile:", error)
          // Still set basic auth session even if profile loading fails
          const authSession: AuthSession = {
            user: {
              id: session.user.id,
              email: session.user.email || "",
              name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "",
              role: "owner",
              businessId: "",
              isActive: true,
              createdAt: session.user.created_at,
            },
            isAuthenticated: true,
          }
          dispatch({ type: "SET_AUTH_SESSION", payload: authSession })
        }
      } else {
        console.log("[v0] No session, clearing auth state")
        dispatch({ type: "SET_AUTH_SESSION", payload: { user: null, isAuthenticated: false } })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserData = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const supabase = createClient()

      const [businessesRes, accountsRes, categoriesRes] = await Promise.all([
        supabase.from("businesses").select("*").order("created_at", { ascending: false }),
        supabase.from("accounts").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("created_at", { ascending: false }),
      ])

      if (businessesRes.data && businessesRes.data.length > 0) {
        dispatch({ type: "SET_STATE", payload: { businesses: businessesRes.data } })

        // Set current business to the first one if none is selected
        const currentBusinessId = localStorage.getItem("currentBusinessId")
        if (!currentBusinessId && businessesRes.data[0]) {
          dispatch({ type: "SET_CURRENT_BUSINESS", payload: businessesRes.data[0].id })
          localStorage.setItem("currentBusinessId", businessesRes.data[0].id)
        } else if (currentBusinessId) {
          dispatch({ type: "SET_CURRENT_BUSINESS", payload: currentBusinessId })
        }
      }

      if (accountsRes.data) {
        dispatch({ type: "SET_STATE", payload: { accounts: accountsRes.data } })
      }

      if (categoriesRes.data) {
        dispatch({ type: "SET_STATE", payload: { categories: categoriesRes.data } })
      }
    } catch (error) {
      console.error("[v0] Error loading user data:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to load user data" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useAppState() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppState must be used within an AppProvider")
  }
  return context
}

export function useBusinesses() {
  const { state, dispatch } = useAppState()

  const addBusiness = async (name: string, type: "business" | "personal" = "business") => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, industry: type }),
      })

      if (!response.ok) throw new Error("Failed to create business")

      const newBusiness = await response.json()
      dispatch({ type: "ADD_BUSINESS", payload: newBusiness })
      return newBusiness
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to create business" })
      return null
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const setCurrentBusiness = async (businessId: string) => {
    dispatch({ type: "SET_CURRENT_BUSINESS", payload: businessId })

    localStorage.setItem("currentBusinessId", businessId)

    // Update user settings
    try {
      await fetch("/api/user-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_business_id: businessId }),
      })
    } catch (error) {
      console.error("Failed to update current business:", error)
    }
  }

  const getCurrentUseType = (): "business" | "personal" | null => {
    return "business" // Default to business, can be enhanced later
  }

  return {
    businesses: state.businesses,
    currentBusiness: state.currentBusiness,
    addBusiness,
    setCurrentBusiness,
    getCurrentUseType,
  }
}

export function useAccounts() {
  const { state, dispatch } = useAppState()

  const addAccount = async (name: string, type = "Cash") => {
    if (!state.currentBusiness) {
      dispatch({ type: "SET_ERROR", payload: "No current business selected" })
      return null
    }

    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          business_id: state.currentBusiness,
          balance: 0,
          currency: "BDT",
          is_active: true,
        }),
      })

      if (!response.ok) throw new Error("Failed to create account")

      const newAccount = await response.json()
      dispatch({ type: "ADD_ACCOUNT", payload: newAccount })
      return newAccount
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to create account" })
      return null
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const updateAccount = async (account: Account) => {
    try {
      const response = await fetch(`/api/accounts/${account.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account),
      })

      if (!response.ok) throw new Error("Failed to update account")

      const updatedAccount = await response.json()
      dispatch({ type: "UPDATE_ACCOUNT", payload: updatedAccount })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to update account" })
    }
  }

  const setCurrentAccount = (accountId: string) => {
    dispatch({ type: "SET_CURRENT_ACCOUNT", payload: accountId })
  }

  const getCurrentBusinessAccounts = () => {
    return state.accounts.filter((account) => account.businessId === state.currentBusiness)
  }

  const calculateRunningBalance = (accountId: string): number => {
    const accountTransactions = state.transactions
      .filter((t) => t.accountId === accountId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    let balance = 0
    for (const transaction of accountTransactions) {
      if (transaction.type === "income") {
        balance += transaction.amount
      } else if (transaction.type === "expense") {
        balance -= transaction.amount
      }
    }
    return balance
  }

  return {
    accounts: state.accounts,
    currentAccount: state.currentAccount,
    addAccount,
    updateAccount,
    setCurrentAccount,
    getCurrentBusinessAccounts,
    calculateRunningBalance,
  }
}

export function useTransactions() {
  const { state, dispatch } = useAppState()

  const addTransaction = async (transaction: Omit<Transaction, "id" | "createdAt">) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      })

      if (!response.ok) throw new Error("Failed to create transaction")

      const newTransaction = await response.json()
      dispatch({ type: "ADD_TRANSACTION", payload: newTransaction })
      return newTransaction
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to create transaction" })
      return null
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const createTransfer = (transferData: {
    businessId: string
    fromAccountId: string
    toAccountId: string
    amount: number
    note: string
    date: string
    attachments: Attachment[]
    createdBy: string
  }) => {
    const transferId = `transfer-${Date.now()}`
    const now = new Date().toISOString()

    const debitTransaction: Transaction = {
      id: `${transferId}-out`,
      businessId: transferData.businessId,
      accountId: transferData.fromAccountId,
      date: transferData.date,
      amount: transferData.amount,
      type: "transfer-out" as any,
      categoryId: "transfer",
      paymentMode: "Transfer",
      note: transferData.note,
      attachments: transferData.attachments,
      createdBy: transferData.createdBy,
      createdAt: now,
      transferId,
      toAccountId: transferData.toAccountId,
    }

    const creditTransaction: Transaction = {
      id: `${transferId}-in`,
      businessId: transferData.businessId,
      accountId: transferData.toAccountId,
      date: transferData.date,
      amount: transferData.amount,
      type: "transfer-in" as any,
      categoryId: "transfer",
      paymentMode: "Transfer",
      note: transferData.note,
      attachments: transferData.attachments,
      createdBy: transferData.createdBy,
      createdAt: now,
      transferId,
      fromAccountId: transferData.fromAccountId,
    }

    dispatch({ type: "ADD_TRANSACTION", payload: debitTransaction })
    dispatch({ type: "ADD_TRANSACTION", payload: creditTransaction })

    return { debitTransaction, creditTransaction }
  }

  const updateTransaction = (transaction: Transaction) => {
    dispatch({ type: "UPDATE_TRANSACTION", payload: transaction })
  }

  const deleteTransaction = (transactionId: string) => {
    dispatch({ type: "DELETE_TRANSACTION", payload: transactionId })
  }

  const getCurrentAccountTransactions = () => {
    return state.transactions.filter((transaction) => transaction.accountId === state.currentAccount)
  }

  const getCurrentBookTransactions = () => {
    return state.transactions.filter((transaction) => transaction.businessId === state.currentBusiness)
  }

  const getTransactionsByAccount = (accountId: string) => {
    return state.transactions.filter((transaction) => transaction.accountId === accountId)
  }

  return {
    transactions: state.transactions,
    addTransaction,
    createTransfer,
    updateTransaction,
    deleteTransaction,
    getCurrentAccountTransactions,
    getCurrentBookTransactions,
    getTransactionsByAccount,
  }
}

export function useCategories() {
  const { state, dispatch } = useAppState()

  const addCategory = async (name: string, type: "income" | "expense") => {
    if (!state.currentBusiness) return null

    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          business_id: state.currentBusiness,
          is_active: true,
        }),
      })

      if (!response.ok) throw new Error("Failed to create category")

      const newCategory = await response.json()
      dispatch({ type: "ADD_CATEGORY", payload: newCategory })
      return newCategory
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to create category" })
      return null
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const updateCategory = (category: Category) => {
    dispatch({ type: "UPDATE_CATEGORY", payload: category })
  }

  const deleteCategory = (categoryId: string) => {
    dispatch({ type: "DELETE_CATEGORY", payload: categoryId })
  }

  const getCurrentBusinessCategories = () => {
    return state.categories.filter((category) => category.businessId === state.currentBusiness)
  }

  return {
    categories: state.categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCurrentBusinessCategories,
  }
}

export function useTeamMembers() {
  const { state, dispatch } = useAppState()
  const { createInvitation, markInvitationAsUsed, getInvitationByCode } = useInvitations()

  const addTeamMember = (member: Omit<TeamMember, "id">) => {
    const newMember: TeamMember = {
      ...member,
      id: `member-${Date.now()}`,
    }
    dispatch({ type: "ADD_TEAM_MEMBER", payload: newMember })
    return newMember
  }

  const createTeamMemberInvitation = (email: string, role: "partner" | "staff", createdBy: string) => {
    const invitation = createInvitation(state.currentBusiness || "", role, createdBy, email)

    const pendingMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: email.split("@")[0],
      email,
      role,
      status: "Pending",
      joinedDate: new Date().toISOString().split("T")[0],
      avatar: email.charAt(0).toUpperCase(),
      invitationCode: invitation.code,
      invitedBy: createdBy,
      invitedAt: invitation.createdAt,
    }

    dispatch({ type: "ADD_TEAM_MEMBER", payload: pendingMember })
    return { member: pendingMember, invitation }
  }

  const activateTeamMember = (invitationCode: string, userData: { name: string; phone?: string }) => {
    const invitation = getInvitationByCode(invitationCode)
    if (!invitation) return null

    const pendingMember = state.teamMembers.find((m) => m.invitationCode === invitationCode)
    if (!pendingMember) return null

    const activatedMember: TeamMember = {
      ...pendingMember,
      name: userData.name,
      phone: userData.phone,
      status: "Active",
      joinedDate: new Date().toISOString().split("T")[0],
    }

    dispatch({ type: "UPDATE_TEAM_MEMBER", payload: activatedMember })
    return activatedMember
  }

  const updateTeamMember = (member: TeamMember) => {
    dispatch({ type: "UPDATE_TEAM_MEMBER", payload: member })
  }

  const deleteTeamMember = (memberId: string) => {
    dispatch({ type: "DELETE_TEAM_MEMBER", payload: memberId })
  }

  return {
    teamMembers: state.teamMembers,
    addTeamMember,
    createTeamMemberInvitation,
    activateTeamMember,
    updateTeamMember,
    deleteTeamMember,
  }
}

export function useAuth() {
  const { state, dispatch } = useAppState()

  const login = (user: User, token?: string) => {
    const authSession: AuthSession = {
      user,
      isAuthenticated: true,
      token,
    }
    dispatch({ type: "SET_AUTH_SESSION", payload: authSession })

    const updatedUser = { ...user, lastLoginAt: new Date().toISOString() }
    dispatch({ type: "UPDATE_USER", payload: updatedUser })
  }

  const logout = () => {
    const authSession: AuthSession = {
      user: null,
      isAuthenticated: false,
    }
    dispatch({ type: "SET_AUTH_SESSION", payload: authSession })
  }

  const register = (userData: Omit<User, "id" | "createdAt">) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: "ADD_USER", payload: newUser })
    return newUser
  }

  return {
    authSession: state.authSession,
    login,
    logout,
    register,
  }
}

export function useUsers() {
  const { state, dispatch } = useAppState()

  const addUser = (userData: Omit<User, "id" | "createdAt">) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: "ADD_USER", payload: newUser })
    return newUser
  }

  const updateUser = (user: User) => {
    dispatch({ type: "UPDATE_USER", payload: user })
  }

  const deleteUser = (userId: string) => {
    dispatch({ type: "DELETE_USER", payload: userId })
  }

  const getUsersByBusiness = (businessId: string) => {
    return state.users.filter((user) => user.businessId === businessId)
  }

  const getUserByEmail = (email: string) => {
    return state.users.find((user) => user.email === email)
  }

  return {
    users: state.users,
    addUser,
    updateUser,
    deleteUser,
    getUsersByBusiness,
    getUserByEmail,
  }
}

export function useInvitations() {
  const { state, dispatch } = useAppState()

  const createInvitation = (businessId: string, role: "partner" | "staff", createdBy: string, email?: string) => {
    const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const newInvitation: Invitation = {
      id: `invitation-${Date.now()}`,
      code,
      businessId,
      role,
      createdBy,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      isUsed: false,
      email,
    }

    dispatch({ type: "ADD_INVITATION", payload: newInvitation })
    return newInvitation
  }

  const markInvitationAsUsed = (invitationId: string, userId: string) => {
    const invitation = state.invitations.find((inv) => inv.id === invitationId)
    if (!invitation) return null

    const updatedInvitation: Invitation = {
      ...invitation,
      isUsed: true,
      usedBy: userId,
      usedAt: new Date().toISOString(),
    }

    dispatch({ type: "UPDATE_INVITATION", payload: updatedInvitation })
    return updatedInvitation
  }

  const getInvitationByCode = (code: string) => {
    return state.invitations.find((inv) => inv.code === code && !inv.isUsed && new Date(inv.expiresAt) > new Date())
  }

  const getInvitationsByBusiness = (businessId: string) => {
    return state.invitations.filter((inv) => inv.businessId === businessId)
  }

  const deleteInvitation = (invitationId: string) => {
    dispatch({ type: "DELETE_INVITATION", payload: invitationId })
  }

  return {
    invitations: state.invitations,
    createInvitation,
    markInvitationAsUsed,
    getInvitationByCode,
    getInvitationsByBusiness,
    deleteInvitation,
  }
}

export function useBooks() {
  const accountsHook = useAccounts()

  const getCurrentBusinessBooks = () => {
    return accountsHook.getCurrentBusinessAccounts()
  }

  const addBook = (name: string, type = "Cash") => {
    console.log("[v0] useBooks.addBook called with:", { name, type })
    return accountsHook.addAccount(name, type)
  }

  return {
    ...accountsHook,
    getCurrentBusinessBooks,
    addBook, // Explicitly returning addBook function
  }
}

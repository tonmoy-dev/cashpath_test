"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import { useSession } from "next-auth/react"

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
  bookId?: string
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

export interface Book {
  id: string
  businessId: string
  userId: string
  name: string
  bookType: "general" | "expense" | "income" | "project" | "payable" | "receivable"
  description?: string
  createdAt: string
  updatedAt: string
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
}

export interface AppState {
  authSession: AuthSession
  businesses: Business[]
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  books: Book[]
  teamMembers: TeamMember[]
  invitations: Invitation[]
  currentBusinessId: string | null
  currentAccount: string | null
  currentBookId: string | null
  isLoading: boolean
  error: string | null
}

const initialState: AppState = {
  authSession: {
    user: null,
    isAuthenticated: false,
  },
  businesses: [],
  accounts: [],
  categories: [],
  transactions: [],
  books: [],
  teamMembers: [],
  invitations: [],
  currentBusinessId: null,
  currentAccount: null,
  currentBookId: null,
  isLoading: false,
  error: null,
}

type Action =
  | { type: "SET_AUTH_SESSION"; payload: AuthSession }
  | { type: "SET_STATE"; payload: Partial<AppState> }
  | { type: "SET_CURRENT_BUSINESS"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_BUSINESS"; payload: Business }
  | { type: "UPDATE_BUSINESS"; payload: Business }
  | { type: "DELETE_BUSINESS"; payload: string }
  | { type: "ADD_ACCOUNT"; payload: Account }
  | { type: "UPDATE_ACCOUNT"; payload: Account }
  | { type: "DELETE_ACCOUNT"; payload: string }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "UPDATE_TRANSACTION"; payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "UPDATE_CATEGORY"; payload: Category }
  | { type: "DELETE_CATEGORY"; payload: string }
  | { type: "ADD_TEAM_MEMBER"; payload: TeamMember }
  | { type: "UPDATE_TEAM_MEMBER"; payload: TeamMember }
  | { type: "DELETE_TEAM_MEMBER"; payload: string }
  | { type: "ADD_INVITATION"; payload: Invitation }
  | { type: "DELETE_INVITATION"; payload: string }
  | { type: "ADD_BOOK"; payload: Book }
  | { type: "UPDATE_BOOK"; payload: Book }
  | { type: "DELETE_BOOK"; payload: string }
  | { type: "SET_CURRENT_ACCOUNT"; payload: string | null }
  | { type: "SET_CURRENT_BOOK"; payload: string | null }

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_AUTH_SESSION":
      return { ...state, authSession: action.payload }

    case "SET_STATE":
      return { ...state, ...action.payload }

    case "SET_CURRENT_BUSINESS":
      localStorage.setItem("currentBusinessId", action.payload)
      return { ...state, currentBusinessId: action.payload }

    case "SET_LOADING":
      return { ...state, isLoading: action.payload }

    case "SET_ERROR":
      return { ...state, error: action.payload }

    case "ADD_BUSINESS":
      return { ...state, businesses: [...state.businesses, action.payload] }

    case "UPDATE_BUSINESS":
      return {
        ...state,
        businesses: state.businesses.map((b) => (b.id === action.payload.id ? action.payload : b)),
      }

    case "DELETE_BUSINESS":
      return { ...state, businesses: state.businesses.filter((b) => b.id !== action.payload) }

    case "ADD_ACCOUNT":
      return { ...state, accounts: [...state.accounts, action.payload] }

    case "UPDATE_ACCOUNT":
      return {
        ...state,
        accounts: state.accounts.map((a) => (a.id === action.payload.id ? action.payload : a)),
      }

    case "DELETE_ACCOUNT":
      return { ...state, accounts: state.accounts.filter((a) => a.id !== action.payload) }

    case "ADD_TRANSACTION":
      return { ...state, transactions: [...state.transactions, action.payload] }

    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((t) => (t.id === action.payload.id ? action.payload : t)),
      }

    case "DELETE_TRANSACTION":
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.payload) }

    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.payload] }

    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((c) => (c.id === action.payload.id ? action.payload : c)),
      }

    case "DELETE_CATEGORY":
      return { ...state, categories: state.categories.filter((c) => c.id !== action.payload) }

    case "ADD_TEAM_MEMBER":
      return { ...state, teamMembers: [...state.teamMembers, action.payload] }

    case "UPDATE_TEAM_MEMBER":
      return {
        ...state,
        teamMembers: state.teamMembers.map((tm) => (tm.id === action.payload.id ? action.payload : tm)),
      }

    case "DELETE_TEAM_MEMBER":
      return { ...state, teamMembers: state.teamMembers.filter((tm) => tm.id !== action.payload) }

    case "ADD_INVITATION":
      return { ...state, invitations: [...state.invitations, action.payload] }

    case "DELETE_INVITATION":
      return { ...state, invitations: state.invitations.filter((i) => i.id !== action.payload) }

    case "ADD_BOOK":
      return { ...state, books: [...state.books, action.payload] }

    case "UPDATE_BOOK":
      return {
        ...state,
        books: state.books.map((b) => (b.id === action.payload.id ? action.payload : b)),
      }

    case "DELETE_BOOK":
      return { ...state, books: state.books.filter((b) => b.id !== action.payload) }

    case "SET_CURRENT_ACCOUNT":
      return { ...state, currentAccount: action.payload }

    case "SET_CURRENT_BOOK":
      return { ...state, currentBookId: action.payload }

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
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return

    if (status === "authenticated" && session?.user) {
      const authSession: AuthSession = {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role as "owner" | "partner" | "staff",
          businessId: session.user.businessId,
          isActive: true,
          createdAt: new Date().toISOString(),
          avatar: session.user.avatar,
          phone: session.user.phone,
        },
        isAuthenticated: true,
      }
      dispatch({ type: "SET_AUTH_SESSION", payload: authSession })
      loadUserData()
      
      // Load current book from localStorage
      const currentBookId = localStorage.getItem("currentBookId")
      if (currentBookId) {
        dispatch({ type: "SET_CURRENT_BOOK", payload: currentBookId })
      }
    } else {
      dispatch({ type: "SET_AUTH_SESSION", payload: { user: null, isAuthenticated: false } })
    }
  }, [session, status])

  const loadUserData = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const [businessesRes, accountsRes, categoriesRes, booksRes] = await Promise.all([
        fetch("/api/businesses").then((r) => r.json()),
        fetch("/api/accounts").then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()),
        fetch("/api/books").then((r) => r.json()).catch(() => []),
      ])

      if (Array.isArray(businessesRes) && businessesRes.length > 0) {
        dispatch({ type: "SET_STATE", payload: { businesses: businessesRes } })

        const currentBusinessId = localStorage.getItem("currentBusinessId")
        if (!currentBusinessId && businessesRes[0]) {
          dispatch({ type: "SET_CURRENT_BUSINESS", payload: businessesRes[0].id })
          localStorage.setItem("currentBusinessId", businessesRes[0].id)
        } else if (currentBusinessId) {
          dispatch({ type: "SET_CURRENT_BUSINESS", payload: currentBusinessId })
        }
      }

      if (Array.isArray(accountsRes)) {
        dispatch({ type: "SET_STATE", payload: { accounts: accountsRes } })
      }

      if (Array.isArray(categoriesRes)) {
        dispatch({ type: "SET_STATE", payload: { categories: categoriesRes } })
      }

      if (Array.isArray(booksRes)) {
        dispatch({ type: "SET_STATE", payload: { books: booksRes } })
        
        // Set first book as current if none is set
        const currentBookId = localStorage.getItem("currentBookId")
        if (!currentBookId && booksRes.length > 0) {
          dispatch({ type: "SET_CURRENT_BOOK", payload: booksRes[0].id })
          localStorage.setItem("currentBookId", booksRes[0].id)
        }
      }
      
      // Load transactions
      try {
        const transactionsRes = await fetch("/api/transactions").then((r) => r.json()).catch(() => [])
        if (Array.isArray(transactionsRes)) {
          dispatch({ type: "SET_STATE", payload: { transactions: transactionsRes } })
        }
      } catch (error) {
        console.error("Failed to load transactions:", error)
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

// Convenience hooks
export function useAuth() {
  const { state } = useAppState()
  return {
    authSession: state.authSession,
    user: state.authSession.user,
    isAuthenticated: state.authSession.isAuthenticated,
  }
}

export function useBusinesses() {
  const { state, dispatch } = useAppState()
  return {
    businesses: state.businesses,
    currentBusiness: state.currentBusinessId,
    setCurrentBusiness: (businessId: string) => {
      dispatch({ type: "SET_CURRENT_BUSINESS", payload: businessId })
    },
    addBusiness: async (name: string) => {
      try {
        const response = await fetch("/api/businesses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        })
        const business = await response.json()
        dispatch({ type: "ADD_BUSINESS", payload: business })
        return business
      } catch (error) {
        console.error("Failed to add business:", error)
        throw error
      }
    },
  }
}

export function useBooks() {
  const { state, dispatch } = useAppState()
  return {
    books: state.books,
    currentBook: state.currentBookId || null,
    setCurrentBook: (bookId: string | null) => {
      if (bookId) {
        localStorage.setItem("currentBookId", bookId)
      } else {
        localStorage.removeItem("currentBookId")
      }
      dispatch({ type: "SET_CURRENT_BOOK", payload: bookId })
    },
    getCurrentBusinessBooks: () => {
      if (!state.currentBusinessId) return []
      return state.books.filter((book) => book.businessId === state.currentBusinessId)
    },
    addBook: async (name: string, bookType: string, description?: string) => {
      try {
        if (!state.currentBusinessId) {
          throw new Error("No business selected")
        }

        const response = await fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            bookType,
            description,
            businessId: state.currentBusinessId,
          }),
        })

        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          throw new Error(error.error || "Failed to create book")
        }

        const newBook = await response.json()
        dispatch({ type: "ADD_BOOK", payload: newBook })
        return newBook
      } catch (error) {
        console.error("Failed to add book:", error)
        throw error
      }
    },
  }
}

export function useTransactions() {
  const { state, dispatch } = useAppState()
  return {
    transactions: state.transactions,
    getCurrentBookTransactions: (bookId?: string) => {
      const targetBookId = bookId || state.currentBookId
      return state.transactions.filter((t) => {
        if (t.businessId !== state.currentBusinessId) return false
        if (targetBookId && (t as any).bookId !== targetBookId) return false
        return true
      })
    },
    getCurrentAccountTransactions: () => {
      if (!state.currentAccount) return []
      return state.transactions.filter((t) => t.accountId === state.currentAccount)
    },
    addTransaction: async (transactionData: Partial<Transaction>) => {
      try {
        // Ensure bookId is included if currentBookId is set
        const dataToSend = {
          ...transactionData,
          bookId: transactionData.bookId || state.currentBookId || null,
        }
        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        })
        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          throw new Error(error.error || "Failed to create transaction")
        }
        const transaction = await response.json()
        dispatch({ type: "ADD_TRANSACTION", payload: transaction })
        return transaction
      } catch (error) {
        console.error("Failed to add transaction:", error)
        throw error
      }
    },
    updateTransaction: async (id: string, transactionData: Partial<Transaction>) => {
      try {
        const response = await fetch(`/api/transactions/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transactionData),
        })
        const transaction = await response.json()
        dispatch({ type: "UPDATE_TRANSACTION", payload: transaction })
        return transaction
      } catch (error) {
        console.error("Failed to update transaction:", error)
        throw error
      }
    },
    deleteTransaction: async (id: string) => {
      try {
        await fetch(`/api/transactions/${id}`, { method: "DELETE" })
        dispatch({ type: "DELETE_TRANSACTION", payload: id })
      } catch (error) {
        console.error("Failed to delete transaction:", error)
        throw error
      }
    },
    createTransfer: async (transferData: {
      businessId: string
      bookId?: string
      fromAccountId: string
      toAccountId: string
      amount: number
      date: string
      note?: string
      attachments?: Attachment[]
    }) => {
      try {
        // Create two transactions for transfer
        const transferId = crypto.randomUUID()
        const fromTransaction: Partial<Transaction> = {
          accountId: transferData.fromAccountId,
          businessId: transferData.businessId,
          bookId: transferData.bookId || state.currentBookId || null,
          amount: transferData.amount,
          type: "transfer-out",
          date: transferData.date,
          note: transferData.note,
          attachments: transferData.attachments || [],
          transferId,
        }
        const toTransaction: Partial<Transaction> = {
          accountId: transferData.toAccountId,
          businessId: transferData.businessId,
          bookId: transferData.bookId || state.currentBookId || null,
          amount: transferData.amount,
          type: "transfer-in",
          date: transferData.date,
          note: transferData.note,
          attachments: transferData.attachments || [],
          transferId,
          linkedTransactionId: transferId,
        }
        
        // Create both transactions via API
        const [fromRes, toRes] = await Promise.all([
          fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fromTransaction),
          }),
          fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(toTransaction),
          }),
        ])
        
        if (!fromRes.ok || !toRes.ok) {
          throw new Error("Failed to create transfer transactions")
        }
        
        const fromTx = await fromRes.json()
        const toTx = await toRes.json()
        
        dispatch({ type: "ADD_TRANSACTION", payload: fromTx })
        dispatch({ type: "ADD_TRANSACTION", payload: toTx })
        
        return { fromTransaction: fromTx, toTransaction: toTx }
      } catch (error) {
        console.error("Failed to create transfer:", error)
        throw error
      }
    },
  }
}

export function useAccounts() {
  const { state, dispatch } = useAppState()
  return {
    accounts: state.accounts,
    currentAccount: state.currentAccount,
    setCurrentAccount: (accountId: string | null) => {
      dispatch({ type: "SET_CURRENT_ACCOUNT", payload: accountId })
    },
    getCurrentBusinessAccounts: () => {
      if (!state.currentBusinessId) return []
      return state.accounts.filter((account) => account.businessId === state.currentBusinessId)
    },
    calculateRunningBalance: (accountId: string) => {
      const accountTransactions = state.transactions.filter((t) => t.accountId === accountId)
      return accountTransactions.reduce((balance, t) => {
        if (t.type === "income" || t.type === "transfer-in") {
          return balance + t.amount
        } else if (t.type === "expense" || t.type === "transfer-out") {
          return balance - t.amount
        }
        return balance
      }, 0)
    },
  }
}

export function useTeamMembers() {
  const { state, dispatch } = useAppState()
  
  // Load team members from API
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        const response = await fetch("/api/team-members")
        if (response.ok) {
          const data = await response.json()
          // Transform API response to match TeamMember interface
          const formattedMembers: TeamMember[] = data.map((m: any) => ({
            id: m.id,
            name: m.profiles 
              ? `${m.profiles.first_name || ""} ${m.profiles.last_name || ""}`.trim() || m.profiles.email
              : m.email,
            email: m.profiles?.email || m.email,
            phone: m.profiles?.phone || "",
            role: m.role === "owner" ? "owner" : m.role === "partner" ? "partner" : "staff",
            status: m.status === "active" ? "Active" : m.status === "pending" ? "Pending" : "Active",
            joinedDate: m.joinedAt ? new Date(m.joinedAt).toISOString().split("T")[0] : new Date(m.createdAt).toISOString().split("T")[0],
            avatar: m.profiles 
              ? `${m.profiles.first_name?.[0] || ""}${m.profiles.last_name?.[0] || ""}`.toUpperCase() || m.email[0].toUpperCase()
              : m.email[0].toUpperCase(),
            invitationCode: m.invitationCode,
            invitedBy: m.invitedBy,
            invitedAt: m.createdAt,
          }))
          dispatch({ type: "SET_STATE", payload: { teamMembers: formattedMembers } })
        }
      } catch (error) {
        console.error("Failed to load team members:", error)
      }
    }
    
    if (state.authSession.isAuthenticated) {
      loadTeamMembers()
    }
  }, [state.authSession.isAuthenticated])

  return {
    teamMembers: state.teamMembers,
    addTeamMember: async (memberData: Omit<TeamMember, "id" | "joinedDate" | "avatar" | "invitationCode" | "invitedBy" | "invitedAt">) => {
      try {
        const response = await fetch("/api/team-members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: memberData.email,
            role: memberData.role === "owner" ? "owner" : memberData.role === "partner" ? "partner" : "staff",
          }),
        })
        if (response.ok) {
          // Reload team members to get updated list
          const reloadResponse = await fetch("/api/team-members")
          if (reloadResponse.ok) {
            const data = await reloadResponse.json()
            const formattedMembers: TeamMember[] = data.map((m: any) => ({
              id: m.id,
              name: m.profiles 
                ? `${m.profiles.first_name || ""} ${m.profiles.last_name || ""}`.trim() || m.profiles.email
                : m.email,
              email: m.profiles?.email || m.email,
              phone: m.profiles?.phone || "",
              role: m.role === "owner" ? "owner" : m.role === "partner" ? "partner" : "staff",
              status: m.status === "active" ? "Active" : m.status === "pending" ? "Pending" : "Active",
              joinedDate: m.joinedAt ? new Date(m.joinedAt).toISOString().split("T")[0] : new Date(m.createdAt).toISOString().split("T")[0],
              avatar: m.profiles 
                ? `${m.profiles.first_name?.[0] || ""}${m.profiles.last_name?.[0] || ""}`.toUpperCase() || m.email[0].toUpperCase()
                : m.email[0].toUpperCase(),
              invitationCode: m.invitationCode,
              invitedBy: m.invitedBy,
              invitedAt: m.createdAt,
            }))
            dispatch({ type: "SET_STATE", payload: { teamMembers: formattedMembers } })
          }
          return { success: true }
        } else {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to add team member")
        }
      } catch (error) {
        console.error("Failed to add team member:", error)
        throw error
      }
    },
    updateTeamMember: async (member: TeamMember) => {
      try {
        const response = await fetch(`/api/team-members/${member.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: member.role === "owner" ? "owner" : member.role === "partner" ? "partner" : "staff",
            status: member.status.toLowerCase(),
          }),
        })
        if (response.ok) {
          // Reload team members to get updated list
          const reloadResponse = await fetch("/api/team-members")
          if (reloadResponse.ok) {
            const data = await reloadResponse.json()
            const formattedMembers: TeamMember[] = data.map((m: any) => ({
              id: m.id,
              name: m.profiles 
                ? `${m.profiles.first_name || ""} ${m.profiles.last_name || ""}`.trim() || m.profiles.email
                : m.email,
              email: m.profiles?.email || m.email,
              phone: m.profiles?.phone || "",
              role: m.role === "owner" ? "owner" : m.role === "partner" ? "partner" : "staff",
              status: m.status === "active" ? "Active" : m.status === "pending" ? "Pending" : "Active",
              joinedDate: m.joinedAt ? new Date(m.joinedAt).toISOString().split("T")[0] : new Date(m.createdAt).toISOString().split("T")[0],
              avatar: m.profiles 
                ? `${m.profiles.first_name?.[0] || ""}${m.profiles.last_name?.[0] || ""}`.toUpperCase() || m.email[0].toUpperCase()
                : m.email[0].toUpperCase(),
              invitationCode: m.invitationCode,
              invitedBy: m.invitedBy,
              invitedAt: m.createdAt,
            }))
            dispatch({ type: "SET_STATE", payload: { teamMembers: formattedMembers } })
          }
          return member
        } else {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to update team member")
        }
      } catch (error) {
        console.error("Failed to update team member:", error)
        throw error
      }
    },
    deleteTeamMember: async (memberId: string) => {
      try {
        const response = await fetch(`/api/team-members/${memberId}`, {
          method: "DELETE",
        })
        if (response.ok) {
          // Reload team members to get updated list
          const reloadResponse = await fetch("/api/team-members")
          if (reloadResponse.ok) {
            const data = await reloadResponse.json()
            const formattedMembers: TeamMember[] = data.map((m: any) => ({
              id: m.id,
              name: m.profiles 
                ? `${m.profiles.first_name || ""} ${m.profiles.last_name || ""}`.trim() || m.profiles.email
                : m.email,
              email: m.profiles?.email || m.email,
              phone: m.profiles?.phone || "",
              role: m.role === "owner" ? "owner" : m.role === "partner" ? "partner" : "staff",
              status: m.status === "active" ? "Active" : m.status === "pending" ? "Pending" : "Active",
              joinedDate: m.joinedAt ? new Date(m.joinedAt).toISOString().split("T")[0] : new Date(m.createdAt).toISOString().split("T")[0],
              avatar: m.profiles 
                ? `${m.profiles.first_name?.[0] || ""}${m.profiles.last_name?.[0] || ""}`.toUpperCase() || m.email[0].toUpperCase()
                : m.email[0].toUpperCase(),
              invitationCode: m.invitationCode,
              invitedBy: m.invitedBy,
              invitedAt: m.createdAt,
            }))
            dispatch({ type: "SET_STATE", payload: { teamMembers: formattedMembers } })
          }
        } else {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to delete team member")
        }
      } catch (error) {
        console.error("Failed to delete team member:", error)
        throw error
      }
    },
  }
}

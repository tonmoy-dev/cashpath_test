import type { Transaction } from "./transaction.model" // Assuming Transaction is defined in another file

export interface FinancialSummary {
  businessId: string
  period: {
    startDate: string
    endDate: string
    type: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  }

  // Income/Expense Summary
  totalIncome: number
  totalExpense: number
  netProfit: number
  profitMargin: number

  // Account Summary
  totalCashBalance: number
  totalBankBalance: number
  totalCreditBalance: number
  totalInvestmentBalance: number

  // Transaction Summary
  totalTransactions: number
  incomeTransactions: number
  expenseTransactions: number
  transferTransactions: number

  // Category breakdown
  incomeByCategory: CategorySummary[]
  expenseByCategory: CategorySummary[]

  // Monthly trends
  monthlyTrends: MonthlyTrend[]

  generatedAt: string
  generatedBy: string // User ID
}

export interface CategorySummary {
  categoryId: string
  categoryName: string
  amount: number
  percentage: number
  transactionCount: number
}

export interface MonthlyTrend {
  month: string // YYYY-MM
  income: number
  expense: number
  netProfit: number
  transactionCount: number
}

export interface AccountStatement {
  accountId: string
  accountName: string
  period: {
    startDate: string
    endDate: string
  }

  openingBalance: number
  closingBalance: number
  totalCredits: number
  totalDebits: number

  transactions: TransactionWithBalance[]

  generatedAt: string
  generatedBy: string // User ID
}

export interface TransactionWithBalance {
  transaction: Transaction
  runningBalance: number
}

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { transactions, businesses, teamMembers, accounts } from "@/db/schema"
import { eq, and, inArray, desc } from "drizzle-orm"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user's accessible businesses
  const userBusinesses = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.ownerId, session.user.id))

  const userTeamMemberships = await db
    .select({ businessId: teamMembers.businessId })
    .from(teamMembers)
    .where(and(eq(teamMembers.userId, session.user.id), eq(teamMembers.status, "active")))

  const businessIds = [
    ...userBusinesses.map((b) => b.id),
    ...userTeamMemberships.map((tm) => tm.businessId),
  ]

  if (businessIds.length === 0) {
    return NextResponse.json({
      totalRevenue: 0,
      totalExpenses: 0,
      totalAccounts: 0,
      totalTransactions: 0,
      recentTransactions: [],
    })
  }

  // Get transactions for revenue/expense calculation
  const allTransactions = await db
    .select()
    .from(transactions)
    .where(inArray(transactions.businessId, businessIds))

  const totalRevenue = allTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpenses = allTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  // Get total accounts count
  const accountsList = await db
    .select()
    .from(accounts)
    .where(and(inArray(accounts.businessId, businessIds), eq(accounts.isActive, true)))

  const totalAccounts = accountsList.length

  // Get total transactions count
  const totalTransactions = allTransactions.length

  // Get recent transactions
  const recentTransactionsData = await db
    .select({
      transaction: transactions,
      account: {
        name: accounts.name,
        type: accounts.type,
      },
    })
    .from(transactions)
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(inArray(transactions.businessId, businessIds))
    .orderBy(desc(transactions.createdAt))
    .limit(5)

  const recentTransactions = recentTransactionsData.map((r) => ({
    ...r.transaction,
    account: r.account,
  }))

  return NextResponse.json({
    totalRevenue,
    totalExpenses,
    totalAccounts,
    totalTransactions,
    recentTransactions,
  })
}

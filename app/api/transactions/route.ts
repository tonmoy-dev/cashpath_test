import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { transactions, businesses, teamMembers, accounts } from "@/db/schema"
import { eq, and, inArray, desc } from "drizzle-orm"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get("account_id")

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
    return NextResponse.json([])
  }

  let query = db
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
    .orderBy(desc(transactions.date))

  if (accountId) {
    query = query.where(and(inArray(transactions.businessId, businessIds), eq(transactions.accountId, accountId))) as any
  }

  const results = await query

  // Format response
  const formattedTransactions = results.map((r) => ({
    ...r.transaction,
    account: r.account,
  }))

  return NextResponse.json(formattedTransactions)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const now = new Date()

  // Use Drizzle transaction to ensure atomicity
  const result = await db.transaction(async (tx) => {
    // Create transaction
    const [newTransaction] = await tx
      .insert(transactions)
      .values({
        id: randomUUID(),
        ...body,
        createdBy: session.user.id,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    // Calculate and update account balance
    const accountTransactions = await tx
      .select()
      .from(transactions)
      .where(eq(transactions.accountId, body.account_id))

    const balance = accountTransactions.reduce((sum, t) => {
      if (t.type === "income") {
        return Number(sum) + Number(t.amount)
      } else if (t.type === "expense") {
        return Number(sum) - Number(t.amount)
      }
      return Number(sum)
    }, 0)

    await tx
      .update(accounts)
      .set({ balance: balance.toString() })
      .where(eq(accounts.id, body.account_id))

    return newTransaction
  })

  return NextResponse.json(result)
}

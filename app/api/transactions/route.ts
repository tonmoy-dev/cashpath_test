import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { transactions, businesses, teamMembers, accounts, books } from "@/db/schema"
import { eq, and, inArray, desc } from "drizzle-orm"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get("account_id")
  const bookId = searchParams.get("book_id")

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

  // Build where conditions
  const whereConditions: any[] = [inArray(transactions.businessId, businessIds)]
  
  if (accountId) {
    whereConditions.push(eq(transactions.accountId, accountId))
  }
  
  if (bookId) {
    whereConditions.push(eq(transactions.bookId, bookId))
  }
  
  const finalWhere = whereConditions.length > 1 
    ? and(...whereConditions)
    : whereConditions[0]

  const results = await db
    .select({
      transaction: transactions,
      account: {
        name: accounts.name,
        type: accounts.type,
      },
      book: {
        id: books.id,
        name: books.name,
      },
    })
    .from(transactions)
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .leftJoin(books, eq(transactions.bookId, books.id))
    .where(finalWhere)
    .orderBy(desc(transactions.date))

  // Format response
  const formattedTransactions = results.map((r) => ({
    ...r.transaction,
    account: r.account,
    book: r.book,
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
        businessId: body.businessId || body.business_id,
        accountId: body.accountId || body.account_id,
        bookId: body.bookId || body.book_id || null,
        categoryId: body.categoryId || body.category_id || null,
        amount: body.amount,
        type: body.type,
        date: body.date || new Date().toISOString().split("T")[0],
        note: body.note || null,
        paymentMode: body.paymentMode || body.payment_mode || null,
        transferId: body.transferId || body.transfer_id || null,
        linkedTransactionId: body.linkedTransactionId || body.linked_transaction_id || null,
        attachments: body.attachments || [],
        status: body.status || "cleared",
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

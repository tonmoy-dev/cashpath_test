import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { accounts, businesses, teamMembers } from "@/db/schema"
import { eq, and, inArray } from "drizzle-orm"
import { randomUUID } from "crypto"

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
    return NextResponse.json([])
  }

  const accountsList = await db
    .select()
    .from(accounts)
    .where(and(inArray(accounts.businessId, businessIds), eq(accounts.isActive, true)))

  return NextResponse.json(accountsList)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const now = new Date()

  const [newAccount] = await db
    .insert(accounts)
    .values({
      id: randomUUID(),
      ...body,
      createdBy: session.user.id,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  return NextResponse.json(newAccount)
}

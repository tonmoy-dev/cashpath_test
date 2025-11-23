import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { categories, businesses, teamMembers } from "@/db/schema"
import { eq, and, inArray } from "drizzle-orm"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const businessId = searchParams.get("business_id")

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

  let whereConditions: any[] = [inArray(categories.businessId, businessIds), eq(categories.isActive, true)]

  if (businessId) {
    whereConditions = [eq(categories.businessId, businessId), eq(categories.isActive, true)]
  }

  const categoriesList = await db
    .select()
    .from(categories)
    .where(and(...whereConditions))

  return NextResponse.json(categoriesList)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const now = new Date()

  const [newCategory] = await db
    .insert(categories)
    .values({
      id: randomUUID(),
      ...body,
      createdBy: session.user.id,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  return NextResponse.json(newCategory)
}

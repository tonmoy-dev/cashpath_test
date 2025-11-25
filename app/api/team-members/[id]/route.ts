import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { teamMembers, businesses } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user's business
  const [business] = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.ownerId, session.user.id))
    .limit(1)

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 })
  }

  const body = await request.json()

  // Verify the team member belongs to user's business
  const [existingMember] = await db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.id, params.id),
        eq(teamMembers.businessId, business.id)
      )
    )
    .limit(1)

  if (!existingMember) {
    return NextResponse.json({ error: "Team member not found" }, { status: 404 })
  }

  const [updated] = await db
    .update(teamMembers)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where(eq(teamMembers.id, params.id))
    .returning()

  return NextResponse.json(updated)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user's business
  const [business] = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.ownerId, session.user.id))
    .limit(1)

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 })
  }

  // Verify the team member belongs to user's business
  const [existingMember] = await db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.id, params.id),
        eq(teamMembers.businessId, business.id)
      )
    )
    .limit(1)

  if (!existingMember) {
    return NextResponse.json({ error: "Team member not found" }, { status: 404 })
  }

  await db
    .delete(teamMembers)
    .where(eq(teamMembers.id, params.id))

  return NextResponse.json({ success: true })
}


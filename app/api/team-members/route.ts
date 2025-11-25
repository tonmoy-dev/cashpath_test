import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { teamMembers, businesses, users, profiles } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { nanoid } from "nanoid"
import { randomUUID } from "crypto"

export async function GET() {
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

  const members = await db
    .select({
      teamMember: teamMembers,
      user: users,
      profile: profiles,
    })
    .from(teamMembers)
    .leftJoin(users, eq(teamMembers.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(teamMembers.businessId, business.id))

  // Format response to match expected structure
  const formattedMembers = members.map((m) => ({
    ...m.teamMember,
    profiles: m.user
      ? {
          first_name: m.profile?.firstName || "",
          last_name: m.profile?.lastName || "",
          email: m.user.email,
          phone: m.profile?.phone || "",
        }
      : null,
    user: m.user ? {
      email: m.user.email,
      name: m.user.name,
    } : null,
  }))

  return NextResponse.json(formattedMembers)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  // Get user's business
  const [business] = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.ownerId, session.user.id))
    .limit(1)

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 })
  }

  // Generate invitation code
  const invitationCode = nanoid(8).toUpperCase()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now
  const now = new Date()

  const [newTeamMember] = await db
    .insert(teamMembers)
    .values({
      id: randomUUID(),
      businessId: business.id,
      email: body.email,
      role: body.role,
      invitationCode,
      invitationExpiresAt: expiresAt,
      invitedBy: session.user.id,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  return NextResponse.json(newTeamMember)
}

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { profiles } from "@/db/schema"
import { eq } from "drizzle-orm"
import { randomUUID } from "crypto"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1)

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  return NextResponse.json(profile)
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const [existingProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1)

  let profile
  if (existingProfile) {
    const [updated] = await db
      .update(profiles)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(profiles.userId, session.user.id))
      .returning()
    profile = updated
  } else {
    const now = new Date()
    const [created] = await db
      .insert(profiles)
      .values({
        id: randomUUID(),
        userId: session.user.id,
        ...body,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
    profile = created
  }

  return NextResponse.json(profile)
}

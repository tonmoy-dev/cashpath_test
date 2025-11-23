import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { userSettings } from "@/db/schema"
import { eq } from "drizzle-orm"
import { randomUUID } from "crypto"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, session.user.id))
    .limit(1)

  // Return default settings if none exist
  if (!settings) {
    const defaultSettings = {
      userId: session.user.id,
      theme: "light",
      language: "en",
      currency: "USD",
      dateFormat: "MM/DD/YYYY",
      numberFormat: "en-US",
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      backupSettings: {
        auto_backup: true,
        frequency: "daily",
      },
      onboardingCompleted: false,
      currentBusinessId: null,
    }
    return NextResponse.json(defaultSettings)
  }

  return NextResponse.json(settings)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const [existingSettings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, session.user.id))
    .limit(1)

  let settings
  if (existingSettings) {
    const [updated] = await db
      .update(userSettings)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(userSettings.userId, session.user.id))
      .returning()
    settings = updated
  } else {
    const now = new Date()
    const [created] = await db
      .insert(userSettings)
      .values({
        id: randomUUID(),
        userId: session.user.id,
        ...body,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
    settings = created
  }

  return NextResponse.json(settings)
}

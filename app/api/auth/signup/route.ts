import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { users, profiles, businesses } from "@/db/schema"
import { eq } from "drizzle-orm"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, businessName } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if email already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user, profile, and business in a transaction
    const result = await db.transaction(async (tx) => {
      const now = new Date()
      
      // Generate UUIDs
      const userId = randomUUID()
      const profileId = randomUUID()

      // Create user
      const [user] = await tx
        .insert(users)
        .values({
          id: userId,
          email,
          passwordHash: hashedPassword,
          name,
          createdAt: now,
          updatedAt: now,
        })
        .returning()

      // Create profile
      await tx.insert(profiles).values({
        id: profileId,
        userId: user.id,
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" ") || "",
        role: "owner",
        createdAt: now,
        updatedAt: now,
      })

      // Create business if businessName is provided
      if (businessName) {
        await tx.insert(businesses).values({
          id: randomUUID(),
          name: businessName,
          ownerId: user.id,
          email: email,
          createdAt: now,
          updatedAt: now,
        })
      }

      return user
    })

    return NextResponse.json({
      success: true,
      message: "Account created successfully. You can now sign in.",
      userId: result.id,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { books, businesses } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const businessId = searchParams.get("business_id")

  let query = db
    .select()
    .from(books)
    .where(eq(books.userId, session.user.id))

  if (businessId) {
    query = query.where(and(eq(books.userId, session.user.id), eq(books.businessId, businessId))) as any
  }

  const booksList = await query

  return NextResponse.json(booksList)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  // Verify business belongs to user
  const [business] = await db
    .select()
    .from(businesses)
    .where(and(eq(businesses.id, body.businessId), eq(businesses.ownerId, session.user.id)))
    .limit(1)

  if (!business) {
    return NextResponse.json({ error: "Business not found or unauthorized" }, { status: 404 })
  }

  const now = new Date()

  const [newBook] = await db
    .insert(books)
    .values({
      id: randomUUID(),
      businessId: body.businessId,
      userId: session.user.id,
      name: body.name,
      bookType: body.bookType || "general",
      description: body.description || null,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  return NextResponse.json(newBook)
}


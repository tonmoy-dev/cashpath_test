import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { books, businesses } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [book] = await db
    .select()
    .from(books)
    .where(
      and(
        eq(books.id, params.id),
        eq(books.userId, session.user.id)
      )
    )
    .limit(1)

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }

  return NextResponse.json(book)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const [existingBook] = await db
    .select()
    .from(books)
    .where(
      and(
        eq(books.id, params.id),
        eq(books.userId, session.user.id)
      )
    )
    .limit(1)

  if (!existingBook) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }

  const [updated] = await db
    .update(books)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where(eq(books.id, params.id))
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

  const [existingBook] = await db
    .select()
    .from(books)
    .where(
      and(
        eq(books.id, params.id),
        eq(books.userId, session.user.id)
      )
    )
    .limit(1)

  if (!existingBook) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }

  await db
    .delete(books)
    .where(eq(books.id, params.id))

  return NextResponse.json({ success: true })
}


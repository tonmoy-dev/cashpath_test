import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { businesses } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [business] = await db
    .select()
    .from(businesses)
    .where(
      and(
        eq(businesses.id, params.id),
        eq(businesses.ownerId, session.user.id)
      )
    )
    .limit(1)

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 })
  }

  return NextResponse.json(business)
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

  // Verify the business belongs to the user
  const [existingBusiness] = await db
    .select()
    .from(businesses)
    .where(
      and(
        eq(businesses.id, params.id),
        eq(businesses.ownerId, session.user.id)
      )
    )
    .limit(1)

  if (!existingBusiness) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 })
  }

  const [updated] = await db
    .update(businesses)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where(eq(businesses.id, params.id))
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

  // Verify the business belongs to the user
  const [existingBusiness] = await db
    .select()
    .from(businesses)
    .where(
      and(
        eq(businesses.id, params.id),
        eq(businesses.ownerId, session.user.id)
      )
    )
    .limit(1)

  if (!existingBusiness) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 })
  }

  await db
    .delete(businesses)
    .where(eq(businesses.id, params.id))

  return NextResponse.json({ success: true })
}


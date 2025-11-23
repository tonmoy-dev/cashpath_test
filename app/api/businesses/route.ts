import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { businesses, categories } from "@/db/schema"
import { eq } from "drizzle-orm"
import { randomUUID } from "crypto"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const businessesList = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, session.user.id))

  return NextResponse.json(businessesList)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const now = new Date()

  const [newBusiness] = await db
    .insert(businesses)
    .values({
      id: randomUUID(),
      ...body,
      ownerId: session.user.id,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  // Create default categories for the business
  const defaultCategories = [
    { name: "Sales Revenue", type: "income", color: "#10B981", icon: "trending-up" },
    { name: "Service Income", type: "income", color: "#059669", icon: "briefcase" },
    { name: "Investment Income", type: "income", color: "#047857", icon: "bar-chart" },
    { name: "Other Income", type: "income", color: "#065F46", icon: "plus-circle" },
    { name: "Office Supplies", type: "expense", color: "#EF4444", icon: "package" },
    { name: "Marketing", type: "expense", color: "#DC2626", icon: "megaphone" },
    { name: "Travel", type: "expense", color: "#B91C1C", icon: "map-pin" },
    { name: "Utilities", type: "expense", color: "#991B1B", icon: "zap" },
    { name: "Professional Services", type: "expense", color: "#7F1D1D", icon: "users" },
    { name: "Other Expenses", type: "expense", color: "#6B1D1D", icon: "minus-circle" },
    { name: "Account Transfer", type: "transfer", color: "#6B7280", icon: "arrow-right-left" },
  ]

  await db.insert(categories).values(
    defaultCategories.map((cat) => ({
      id: randomUUID(),
      ...cat,
      businessId: newBusiness.id,
      createdBy: session.user.id,
      createdAt: now,
      updatedAt: now,
    }))
  )

  return NextResponse.json(newBusiness)
}

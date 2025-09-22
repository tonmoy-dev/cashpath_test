import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const businessId = searchParams.get("business_id")

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user's accessible businesses
  const { data: businesses } = await supabase.from("businesses").select("id").eq("owner_id", user.id)

  const { data: teamMemberships } = await supabase
    .from("team_members")
    .select("business_id")
    .eq("user_id", user.id)
    .eq("status", "active")

  const businessIds = [...(businesses?.map((b) => b.id) || []), ...(teamMemberships?.map((tm) => tm.business_id) || [])]

  if (businessIds.length === 0) {
    return NextResponse.json([])
  }

  let query = supabase.from("categories").select("*").in("business_id", businessIds).eq("is_active", true)

  if (businessId) {
    query = query.eq("business_id", businessId)
  }

  const { data: categories, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(categories)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const { data: category, error } = await supabase
    .from("categories")
    .insert({
      ...body,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(category)
}

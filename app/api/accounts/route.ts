import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

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

  const { data: accounts, error } = await supabase
    .from("accounts")
    .select("*")
    .in("business_id", businessIds)
    .eq("is_active", true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(accounts)
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

  const { data: account, error } = await supabase
    .from("accounts")
    .insert({
      ...body,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(account)
}

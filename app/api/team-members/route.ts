import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { nanoid } from "nanoid"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user's business
  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single()

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 })
  }

  const { data: teamMembers, error } = await supabase
    .from("team_members")
    .select("*, profiles(first_name, last_name, email)")
    .eq("business_id", business.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(teamMembers)
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

  // Get user's business
  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single()

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 })
  }

  // Generate invitation code
  const invitationCode = nanoid(8).toUpperCase()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

  const { data: teamMember, error } = await supabase
    .from("team_members")
    .insert({
      business_id: business.id,
      email: body.email,
      role: body.role,
      invitation_code: invitationCode,
      invitation_expires_at: expiresAt.toISOString(),
      invited_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(teamMember)
}

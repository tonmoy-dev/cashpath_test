import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, invitationCode } = await request.json()

    if (!email || !password || !name || !invitationCode) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify invitation code
    const { data: invitation, error: invitationError } = await supabase
      .from("team_members")
      .select("*")
      .eq("invitation_code", invitationCode)
      .eq("status", "pending")
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json({ error: "Invalid or expired invitation code" }, { status: 400 })
    }

    // Check if email already exists
    const { data: existingProfile } = await supabase.from("profiles").select("id").eq("email", email).single()

    if (existingProfile) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user profile
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      email,
      full_name: name,
      password_hash: hashedPassword,
      role: invitation.role,
      business_id: invitation.business_id,
      created_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
    }

    // Update team member invitation
    const { error: updateError } = await supabase
      .from("team_members")
      .update({
        user_id: userId,
        status: "active",
        joined_at: new Date().toISOString(),
      })
      .eq("invitation_code", invitationCode)

    if (updateError) {
      console.error("Error updating team member:", updateError)
      return NextResponse.json({ error: "Failed to activate membership" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully. You can now sign in.",
    })
  } catch (error) {
    console.error("Register member error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { password } = await request.json()

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      console.error("Error updating password:", error)
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Set password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

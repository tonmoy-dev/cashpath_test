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

  const { data: settings, error } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found"
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Return default settings if none exist
  if (!settings) {
    const defaultSettings = {
      user_id: user.id,
      theme: "light",
      language: "English",
      currency: "BDT",
      date_format: "DD/MM/YYYY",
      number_format: "1,234.56",
      notifications: {
        email: true,
        push: false,
        weekly_reports: true,
        transaction_alerts: true,
      },
      backup_settings: {
        auto_backup: false,
        backup_frequency: "weekly",
      },
      onboarding_completed: false,
      current_business_id: null,
    }
    return NextResponse.json(defaultSettings)
  }

  return NextResponse.json(settings)
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

  const { data: settings, error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: user.id,
      ...body,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(settings)
}

import { createClient } from "@/lib/supabase/server"

export async function auth() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    return {
      user: {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.full_name || user.email,
        role: profile?.role || "owner",
        businessId: profile?.business_id || "",
        avatar: profile?.avatar_url,
        phone: profile?.phone,
      },
    }
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

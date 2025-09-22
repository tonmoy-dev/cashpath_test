import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; role?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user && params.role === "owner") {
        // Create business for new owner
        redirect("/onboarding")
      } else {
        redirect("/dashboard")
      }
    }
  }

  // Return the user to an error page with instructions
  redirect("/auth/auth-code-error")
}

import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; role?: string }>
}) {
  const params = await searchParams
  const session = await getServerSession(authOptions)

  if (session?.user) {
    if (params.role === "owner") {
      // Create business for new owner
      redirect("/onboarding")
    } else {
      redirect("/dashboard")
    }
  }

  // Return the user to an error page with instructions
  redirect("/auth/auth-code-error")
}

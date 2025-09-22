import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 p-6">
      <h1 className="text-2xl font-bold">Protected Page</h1>
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">User Information</h2>
        <pre className="text-sm bg-muted p-4 rounded overflow-auto">{JSON.stringify({ user: data.user }, null, 2)}</pre>
      </div>
    </div>
  )
}

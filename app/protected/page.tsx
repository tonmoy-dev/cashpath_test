import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 p-6">
      <h1 className="text-2xl font-bold">Protected Page</h1>
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">User Information</h2>
        <pre className="text-sm bg-muted p-4 rounded overflow-auto">{JSON.stringify({ user: session.user }, null, 2)}</pre>
      </div>
    </div>
  )
}

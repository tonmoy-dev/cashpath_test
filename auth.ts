import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { users, profiles, businesses, teamMembers } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function auth() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  try {
    // Get user profile and business info from database
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        image: users.image,
        profile: profiles,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.id, session.user.id))
      .limit(1)

    if (!user) {
      return null
    }

    const userBusinesses = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.ownerId, user.id))

    const userTeamMemberships = await db
      .select({ businessId: teamMembers.businessId })
      .from(teamMembers)
      .where(and(eq(teamMembers.userId, user.id), eq(teamMembers.status, "active")))

    const businessIds = [
      ...userBusinesses.map((b) => b.id),
      ...userTeamMemberships.map((tm) => tm.businessId),
    ]

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.profile?.firstName || user.email,
        role: user.profile?.role || "owner",
        businessId: businessIds[0] || "",
        avatar: user.image || user.profile?.avatarUrl,
        phone: user.profile?.phone,
      },
    }
  } catch (error) {
    console.error("Auth helper error:", error)
    return null
  }
}

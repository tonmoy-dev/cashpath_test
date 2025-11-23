import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { users, profiles, businesses, teamMembers } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const [user] = await db
            .select({
              id: users.id,
              email: users.email,
              passwordHash: users.passwordHash,
              name: users.name,
              image: users.image,
              profile: profiles,
            })
            .from(users)
            .leftJoin(profiles, eq(users.id, profiles.userId))
            .where(eq(users.email, credentials.email))
            .limit(1)

          if (!user || !user.passwordHash) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash)

          if (!isPasswordValid) {
            return null
          }

          // Get user's businesses
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
            id: user.id,
            email: user.email,
            name: user.name || user.profile?.firstName || user.email,
            role: user.profile?.role || "owner",
            businessId: businessIds[0] || "",
            avatar: user.image || user.profile?.avatarUrl,
            phone: user.profile?.phone,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.businessId = user.businessId
        token.avatar = user.avatar
        token.phone = user.phone
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.businessId = token.businessId as string
        session.user.avatar = token.avatar as string
        session.user.phone = token.phone as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/auth-code-error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

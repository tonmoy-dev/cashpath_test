import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user's accessible businesses
  const { data: businesses } = await supabase.from("businesses").select("id").eq("owner_id", user.id)

  const { data: teamMemberships } = await supabase
    .from("team_members")
    .select("business_id")
    .eq("user_id", user.id)
    .eq("status", "active")

  const businessIds = [...(businesses?.map((b) => b.id) || []), ...(teamMemberships?.map((tm) => tm.business_id) || [])]

  if (businessIds.length === 0) {
    return NextResponse.json({
      totalRevenue: 0,
      totalExpenses: 0,
      totalAccounts: 0,
      totalTransactions: 0,
      recentTransactions: [],
    })
  }

  // Get revenue accounts total
  const { data: revenueAccounts } = await supabase
    .from("accounts")
    .select("balance")
    .in("business_id", businessIds)
    .eq("type", "revenue")

  // Get expense accounts total
  const { data: expenseAccounts } = await supabase
    .from("accounts")
    .select("balance")
    .in("business_id", businessIds)
    .eq("type", "expense")

  // Get total accounts count
  const { count: totalAccounts } = await supabase
    .from("accounts")
    .select("*", { count: "exact", head: true })
    .in("business_id", businessIds)
    .eq("is_active", true)

  // Get total transactions count
  const { count: totalTransactions } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .in("business_id", businessIds)

  // Get recent transactions
  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select("*, accounts(name, type)")
    .in("business_id", businessIds)
    .order("created_at", { ascending: false })
    .limit(5)

  const totalRevenue = revenueAccounts?.reduce((sum, account) => sum + Number(account.balance), 0) || 0
  const totalExpenses = expenseAccounts?.reduce((sum, account) => sum + Number(account.balance), 0) || 0

  return NextResponse.json({
    totalRevenue,
    totalExpenses,
    totalAccounts: totalAccounts || 0,
    totalTransactions: totalTransactions || 0,
    recentTransactions: recentTransactions || [],
  })
}

import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get("account_id")

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
    return NextResponse.json([])
  }

  let query = supabase
    .from("transactions")
    .select("*, accounts(name, type)")
    .in("business_id", businessIds)
    .order("transaction_date", { ascending: false })

  if (accountId) {
    query = query.eq("account_id", accountId)
  }

  const { data: transactions, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(transactions)
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

  // Start a transaction to update both transaction and account balance
  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .insert({
      ...body,
      created_by: user.id,
    })
    .select()
    .single()

  if (transactionError) {
    return NextResponse.json({ error: transactionError.message }, { status: 500 })
  }

  // Update account balance
  const balanceChange = body.type === "debit" ? body.amount : -body.amount
  const { error: balanceError } = await supabase.rpc("update_account_balance", {
    account_id: body.account_id,
    amount_change: balanceChange,
  })

  if (balanceError) {
    // Rollback transaction if balance update fails
    await supabase.from("transactions").delete().eq("id", transaction.id)
    return NextResponse.json({ error: "Failed to update account balance" }, { status: 500 })
  }

  return NextResponse.json(transaction)
}

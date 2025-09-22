"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AttachmentViewer } from "@/components/attachments/attachment-viewer"
import { useAccounts, useTransactions, useBusinesses, type Transaction } from "@/lib/store"
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Paperclip,
} from "lucide-react"

export default function AccountsPage() {
  const { businesses, currentBusiness } = useBusinesses()
  const { accounts, getCurrentBusinessAccounts, calculateRunningBalance, addAccount } = useAccounts()
  const { transactions, getTransactionsByAccount } = useTransactions()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [addAccountOpen, setAddAccountOpen] = useState(false)

  const businessAccounts = getCurrentBusinessAccounts()
  const selectedBusinessName = businesses.find((b) => b.id === currentBusiness)?.name || "Business"

  const filteredAccounts = businessAccounts.filter((account) =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const calculateTransactionRunningBalance = (accountId: string): Array<Transaction & { runningBalance: number }> => {
    const accountTransactions = getTransactionsByAccount(accountId).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    let runningBalance = 0
    return accountTransactions
      .map((transaction) => {
        if (transaction.type === "income") {
          runningBalance += transaction.amount
        } else if (transaction.type === "expense") {
          runningBalance -= transaction.amount
        }
        // Transfer transactions don't affect running balance calculation here
        // as they're handled separately in the transfer logic

        return {
          ...transaction,
          runningBalance,
        }
      })
      .reverse() // Show most recent first
  }

  const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "cash":
        return <Banknote className="w-5 h-5" />
      case "bank":
        return <CreditCard className="w-5 h-5" />
      default:
        return <Wallet className="w-5 h-5" />
    }
  }

  const handleAddAccount = (formData: FormData) => {
    const name = formData.get("name") as string
    const type = formData.get("type") as string

    if (name && type) {
      addAccount(name, type)
      setAddAccountOpen(false)
    }
  }

  const totalBalance = businessAccounts.reduce((sum, account) => {
    const runningBalance = calculateRunningBalance(account.id)
    return sum + runningBalance[runningBalance.length - 1]?.runningBalance || 0
  }, 0)

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
            <p className="text-gray-600">Manage your business accounts and track running balances</p>
          </div>

          <Dialog open={addAccountOpen} onOpenChange={setAddAccountOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
              </DialogHeader>
              <form action={handleAddAccount} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Account Name</Label>
                  <Input id="name" name="name" placeholder="Enter account name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Account Type</Label>
                  <Select name="type" defaultValue="Cash">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Bank">Bank Account</SelectItem>
                      <SelectItem value="Credit">Credit Account</SelectItem>
                      <SelectItem value="Investment">Investment Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Create Account
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setAddAccountOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Balance</p>
                  <p className={`text-2xl font-bold ${totalBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ₹{totalBalance.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${totalBalance >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                  {totalBalance >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Accounts</p>
                  <p className="text-2xl font-bold text-blue-600">{businessAccounts.length}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Business</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedBusinessName}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search accounts..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAccounts.map((account) => {
            const runningBalance = calculateRunningBalance(account.id)
            const transactionsWithBalance = calculateTransactionRunningBalance(account.id)
            const recentTransactions = transactionsWithBalance.slice(0, 5)

            return (
              <Card key={account.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">{getAccountIcon(account.type)}</div>
                      <div>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        <p className="text-sm text-gray-600">{account.type} Account</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {transactionsWithBalance.length} transactions
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Running Balance Display */}
                  <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Running Balance</span>
                      <span className={`text-xl font-bold ${runningBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ₹{runningBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Recent Transactions with Running Balance */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Recent Transactions</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedAccount(selectedAccount === account.id ? null : account.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {selectedAccount === account.id ? "Hide" : "View All"}
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {(selectedAccount === account.id ? transactionsWithBalance : recentTransactions).map(
                        (transaction) => (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    transaction.type === "income"
                                      ? "bg-green-500"
                                      : transaction.type === "expense"
                                        ? "bg-red-500"
                                        : "bg-blue-500"
                                  }`}
                                />
                                <p className="font-medium text-sm truncate">{transaction.note}</p>
                                {transaction.attachments.length > 0 && <Paperclip className="w-3 h-3 text-gray-400" />}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                <span>{transaction.date}</span>
                                <span>{transaction.paymentMode}</span>
                                <span className="font-medium">
                                  Balance: ₹{transaction.runningBalance.toLocaleString()}
                                </span>
                              </div>
                              {transaction.attachments.length > 0 && selectedAccount === account.id && (
                                <div className="mt-2">
                                  <AttachmentViewer attachments={transaction.attachments} showThumbnails={false} />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-semibold ${
                                  transaction.type === "income"
                                    ? "text-green-600"
                                    : transaction.type === "expense"
                                      ? "text-red-600"
                                      : "text-blue-600"
                                }`}
                              >
                                {transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}₹
                                {transaction.amount.toLocaleString()}
                              </span>
                              {transaction.type === "income" ? (
                                <ArrowUpRight className="w-4 h-4 text-green-600" />
                              ) : transaction.type === "expense" ? (
                                <ArrowDownRight className="w-4 h-4 text-red-600" />
                              ) : null}
                            </div>
                          </div>
                        ),
                      )}
                    </div>

                    {recentTransactions.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">No transactions yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredAccounts.length === 0 && (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "No accounts match your search." : "Create your first account to get started."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setAddAccountOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useBusinesses, useTransactions, useAccounts, type Transaction, type Attachment } from "@/lib/store"
import { AttachmentUpload } from "@/components/attachments/attachment-upload"
import { AttachmentViewer } from "@/components/attachments/attachment-viewer"
import { Search, Plus, Minus, Edit, Trash2, Paperclip, ArrowRightLeft } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BookForm } from "@/components/forms/book-form"
import { useToast } from "@/hooks/use-toast"

export default function BusinessBookPage() {
  const { businesses, currentBusiness, setCurrentBusiness } = useBusinesses()
  const { accounts, currentAccount, getCurrentBusinessAccounts, calculateRunningBalance } = useAccounts()
  const { getCurrentAccountTransactions, addTransaction, updateTransaction, deleteTransaction, createTransfer } =
    useTransactions()
  const { toast } = useToast()

  const selectedBusinessName = businesses.find((b) => b.id === currentBusiness)?.name || "Dev"
  const transactions = getCurrentAccountTransactions()
  const currentAccountData = accounts.find((a) => a.id === currentAccount)
  const businessAccounts = getCurrentBusinessAccounts()

  const [cashInOpen, setCashInOpen] = useState(false)
  const [cashOutOpen, setCashOutOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false)
  const [reportsOpen, setReportsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
  const [showAddBook, setShowAddBook] = useState(false)

  const [cashInAttachments, setCashInAttachments] = useState<Attachment[]>([])
  const [cashOutAttachments, setCashOutAttachments] = useState<Attachment[]>([])
  const [transferAttachments, setTransferAttachments] = useState<Attachment[]>([])
  const [editAttachments, setEditAttachments] = useState<Attachment[]>([])

  const [filters, setFilters] = useState({
    duration: "all-time",
    type: "all-types",
    contact: "all-contacts",
    member: "all-members",
    paymentMode: "all-payment",
    category: "all-categories",
  })

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const handleBookSuccess = (bookId: string) => {
    toast({
      title: "Success!",
      description: "Book created successfully!",
      variant: "default",
    })
    setShowAddBook(false)
  }

  const handleAddTransaction = (type: "income" | "expense", formData: FormData, attachments: Attachment[]) => {
    if (!currentBusiness || !currentAccount) return

    const newTransactionData = {
      businessId: currentBusiness,
      accountId: currentAccount,
      type,
      amount: Number(formData.get("amount")),
      note: formData.get("description") as string,
      categoryId: formData.get("category") as string,
      paymentMode: formData.get("paymentMode") as string,
      date: formData.get("date") as string,
      attachments,
      createdBy: "member-1", // Should be current user ID
    }

    addTransaction(newTransactionData)

    // Reset form state
    if (type === "income") {
      setCashInOpen(false)
      setCashInAttachments([])
    } else {
      setCashOutOpen(false)
      setCashOutAttachments([])
    }
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setEditAttachments([...transaction.attachments])
    setEditDialogOpen(true)
  }

  const handleUpdateTransaction = (formData: FormData) => {
    if (!editingTransaction) return

    const updatedTransaction: Transaction = {
      ...editingTransaction,
      amount: Number(formData.get("amount")),
      note: formData.get("description") as string,
      categoryId: formData.get("category") as string,
      paymentMode: formData.get("paymentMode") as string,
      date: formData.get("date") as string,
      attachments: editAttachments,
    }

    updateTransaction(updatedTransaction)
    setEditDialogOpen(false)
    setEditingTransaction(null)
    setEditAttachments([])
  }

  const handleDeleteTransaction = (transactionId: string) => {
    setTransactionToDelete(transactionId)
    setShowDeleteDialog(true)
  }

  const confirmDeleteTransaction = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete)
      setShowDeleteDialog(false)
      setTransactionToDelete(null)
    }
  }

  const handleBulkUpload = (formData: FormData) => {
    const file = formData.get("csvFile") as File
    if (file) {
      const bulkTransactions = [
        {
          bookId: "book-1",
          type: "cash-in" as const,
          amount: 5000,
          description: "Bulk Import - Client Payment 1",
          category: "Service Income",
          paymentMode: "Bank Transfer",
          contact: "Bulk Client 1",
          date: "2025-01-05",
          member: "Owner",
        },
        {
          bookId: "book-1",
          type: "cash-out" as const,
          amount: 1500,
          description: "Bulk Import - Office Supplies",
          category: "Office Expenses",
          paymentMode: "Cash",
          contact: "Supplier 1",
          date: "2025-01-05",
          member: "Owner",
        },
        {
          bookId: "book-1",
          type: "cash-in" as const,
          amount: 7500,
          description: "Bulk Import - Consulting Fee",
          category: "Service Income",
          paymentMode: "UPI",
          contact: "Consulting Client",
          date: "2025-01-05",
          member: "Owner",
        },
      ]

      bulkTransactions.forEach((transaction) => addTransaction(transaction))
      setBulkUploadOpen(false)
    }
  }

  const handleGenerateReport = (format: string, dateRange: string) => {
    const reportData = {
      format,
      dateRange,
      totalTransactions: transactions.length,
      totalIncome,
      totalExpense,
      balance,
      transactions,
    }

    console.log("Generating report:", reportData)

    if (format === "CSV") {
      const csvContent = [
        "Date,Type,Description,Category,Amount,Payment Mode,Contact,Member",
        ...transactions.map(
          (t) =>
            `${t.date},${t.type},${t.description},${t.category},${t.amount},${
              t.paymentMode
            },${t.contact || ""},${t.member}`,
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `pcash-report-${dateRange}.csv`
      a.click()
    } else if (format === "PDF") {
      alert("PDF report would be generated and downloaded")
    }

    setReportsOpen(false)
  }

  const handleTransfer = (formData: FormData, attachments: Attachment[]) => {
    if (!currentBusiness || !currentAccount) return

    const fromAccountId = currentAccount
    const toAccountId = formData.get("toAccount") as string
    const amount = Number(formData.get("amount"))
    const note = formData.get("description") as string
    const date = formData.get("date") as string

    if (fromAccountId === toAccountId) {
      alert("Cannot transfer to the same account")
      return
    }

    createTransfer({
      businessId: currentBusiness,
      fromAccountId,
      toAccountId,
      amount,
      note,
      date,
      attachments,
      createdBy: "member-1", // Should be current user ID
    })

    setTransferOpen(false)
    setTransferAttachments([])
  }

  const calculateTransactionRunningBalance = (): Array<Transaction & { runningBalance: number }> => {
    if (!currentAccount) return []

    const accountTransactions = transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    let runningBalance = 0
    return accountTransactions
      .map((transaction) => {
        if (transaction.type === "income") {
          runningBalance += transaction.amount
        } else if (transaction.type === "expense") {
          runningBalance -= transaction.amount
        } else if (transaction.type === "transfer-out") {
          runningBalance -= transaction.amount
        } else if (transaction.type === "transfer-in") {
          runningBalance += transaction.amount
        }

        return {
          ...transaction,
          runningBalance,
        }
      })
      .reverse() // Show most recent first
  }

  const transactionsWithBalance = calculateTransactionRunningBalance()
  const filteredTransactionsWithBalance = transactionsWithBalance.filter((transaction) => {
    const matchesSearch = transaction.note.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const totalIncome = transactionsWithBalance.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactionsWithBalance.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense
  const runningBalance = currentAccount ? calculateRunningBalance(currentAccount) : 0

  return (
    <DashboardLayout>
      {/* Main Content */}
      <main className="flex-1 lg:ml-0">
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Cashify Books</h1>
            <p className="text-gray-600">Manage your business transactions and financial records</p>
          </div>
        </div>

        {/* Role Banner and Controls */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto">
            {/* Role Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">ℹ</span>
                </div>
                <span className="text-blue-800 font-medium">Your Role: Owner</span>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0 h-auto">
                  View
                </Button>
              </div>
            </div>

            {/* Search and Action Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by book name..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4">
                <Select defaultValue="last-updated">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-updated">Last Updated</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="created">Created Date</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => setShowAddBook(true)}
                  className="bg-blue-600 hover:bg-blue-700 shadow-md w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Book
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards - improved mobile layout with better spacing and grid */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-full">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-sm text-gray-600 mb-2">Total Income</div>
                <div className="text-xl sm:text-2xl font-bold text-green-600">৳{totalIncome.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-sm text-gray-600 mb-2">Total Expense</div>
                <div className="text-xl sm:text-2xl font-bold text-red-600">৳{totalExpense.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-sm text-gray-600 mb-2">Balance</div>
                <div className={`text-xl sm:text-2xl font-bold ${balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                  ৳{balance.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters - improved mobile layout with better spacing */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Select
              value={filters.duration}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, duration: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.type} onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-types">All</SelectItem>
                <SelectItem value="cash-in">Cash In</SelectItem>
                <SelectItem value="cash-out">Cash Out</SelectItem>
                <SelectItem value="transfer-out">Transfer Out</SelectItem>
                <SelectItem value="transfer-in">Transfer In</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.contact}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, contact: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-contacts">All</SelectItem>
                <SelectItem value="customers">Customers</SelectItem>
                <SelectItem value="suppliers">Suppliers</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.member}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, member: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-members">All</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.paymentMode}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, paymentMode: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-payment">All</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="credit-card">Credit Card</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search and Action Buttons - improved mobile layout */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search transactions..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <Dialog open={cashInOpen} onOpenChange={setCashInOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto py-2 px-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Cash In
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-green-600">Add Cash In Entry</DialogTitle>
                  </DialogHeader>
                  <form
                    action={(formData) => handleAddTransaction("income", formData, cashInAttachments)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input id="amount" name="amount" type="number" placeholder="Enter amount" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" placeholder="Enter description" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" defaultValue="cat-1">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cat-1">Service Income</SelectItem>
                          <SelectItem value="sales-income">Sales Income</SelectItem>
                          <SelectItem value="design-income">Design Income</SelectItem>
                          <SelectItem value="other-income">Other Income</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentMode">Payment Mode</Label>
                      <Select name="paymentMode" defaultValue="Cash">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Cheque">Cheque</SelectItem>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <AttachmentUpload attachments={cashInAttachments} onAttachmentsChange={setCashInAttachments} />

                    <input type="hidden" name="date" defaultValue={new Date().toISOString().split("T")[0]} />

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        Save Entry
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setCashInOpen(false)
                          setCashInAttachments([])
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={cashOutOpen} onOpenChange={setCashOutOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto py-2 px-4">
                    <Minus className="w-4 h-4 mr-2" />
                    Cash Out
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-red-600">Add Cash Out Entry</DialogTitle>
                  </DialogHeader>
                  <form
                    action={(formData) => handleAddTransaction("expense", formData, cashOutAttachments)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input id="amount" name="amount" type="number" placeholder="Enter amount" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" placeholder="Enter description" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" defaultValue="cat-2">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cat-2">Office Expenses</SelectItem>
                          <SelectItem value="travel-expenses">Travel Expenses</SelectItem>
                          <SelectItem value="cat-3">Marketing Expenses</SelectItem>
                          <SelectItem value="software-expenses">Software Expenses</SelectItem>
                          <SelectItem value="utility-expenses">Utility Expenses</SelectItem>
                          <SelectItem value="other-expenses">Other Expenses</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentMode">Payment Mode</Label>
                      <Select name="paymentMode" defaultValue="Cash">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Cheque">Cheque</SelectItem>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <AttachmentUpload attachments={cashOutAttachments} onAttachmentsChange={setCashOutAttachments} />

                    <input type="hidden" name="date" defaultValue={new Date().toISOString().split("T")[0]} />

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        Save Entry
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setCashOutOpen(false)
                          setCashOutAttachments([])
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto py-2 px-4">
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Transfer
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-blue-600">Transfer Between Accounts</DialogTitle>
                  </DialogHeader>
                  <form action={(formData) => handleTransfer(formData, transferAttachments)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromAccount">From Account</Label>
                      <Input
                        id="fromAccount"
                        value={currentAccountData?.name || "Current Account"}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="toAccount">To Account</Label>
                      <Select name="toAccount" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination account" />
                        </SelectTrigger>
                        <SelectContent>
                          {businessAccounts
                            .filter((account) => account.id !== currentAccount)
                            .map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input id="amount" name="amount" type="number" placeholder="Enter amount" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" placeholder="Transfer description" required />
                    </div>

                    <AttachmentUpload attachments={transferAttachments} onAttachmentsChange={setTransferAttachments} />

                    <input type="hidden" name="date" defaultValue={new Date().toISOString().split("T")[0]} />

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        Transfer Funds
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setTransferOpen(false)
                          setTransferAttachments([])
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Transaction</DialogTitle>
                  </DialogHeader>
                  {editingTransaction && (
                    <form action={handleUpdateTransaction} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-amount">Amount *</Label>
                        <Input
                          id="edit-amount"
                          name="amount"
                          type="number"
                          defaultValue={editingTransaction.amount}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Description *</Label>
                        <Textarea
                          id="edit-description"
                          name="description"
                          defaultValue={editingTransaction.note}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-category">Category</Label>
                        <Select name="category" defaultValue={editingTransaction.categoryId}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {editingTransaction.type === "income" ? (
                              <>
                                <SelectItem value="cat-1">Service Income</SelectItem>
                                <SelectItem value="sales-income">Sales Income</SelectItem>
                                <SelectItem value="design-income">Design Income</SelectItem>
                                <SelectItem value="other-income">Other Income</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="cat-2">Office Expenses</SelectItem>
                                <SelectItem value="travel-expenses">Travel Expenses</SelectItem>
                                <SelectItem value="cat-3">Marketing Expenses</SelectItem>
                                <SelectItem value="software-expenses">Software Expenses</SelectItem>
                                <SelectItem value="utility-expenses">Utility Expenses</SelectItem>
                                <SelectItem value="other-expenses">Other Expenses</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-paymentMode">Payment Mode</Label>
                        <Select name="paymentMode" defaultValue={editingTransaction.paymentMode}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                            <SelectItem value="Cheque">Cheque</SelectItem>
                            <SelectItem value="Credit Card">Credit Card</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-date">Date</Label>
                        <Input id="edit-date" name="date" type="date" defaultValue={editingTransaction.date} required />
                      </div>

                      <AttachmentUpload attachments={editAttachments} onAttachmentsChange={setEditAttachments} />

                      <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">
                          Update Transaction
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditDialogOpen(false)
                            setEditAttachments([])
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Transaction List - improved mobile card layout */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-1">
                {currentAccountData?.name || "Account Overview"}
              </h2>
              <p className="text-sm text-gray-600">
                Running Balance:{" "}
                <span className="font-semibold text-green-600">৳{runningBalance.toLocaleString()}</span>
              </p>
            </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-3">
            {filteredTransactionsWithBalance.map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            transaction.type === "income"
                              ? "bg-green-500"
                              : transaction.type === "expense"
                                ? "bg-red-500"
                                : transaction.type === "transfer-out"
                                  ? "bg-orange-500"
                                  : transaction.type === "transfer-in"
                                    ? "bg-blue-500"
                                    : "bg-gray-500"
                          }`}
                        />
                        <h4 className="font-medium">{transaction.note}</h4>
                        {transaction.attachments.length > 0 && <Paperclip className="w-4 h-4 text-gray-400" />}
                        {(transaction.type === "transfer-out" || transaction.type === "transfer-in") && (
                          <ArrowRightLeft className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {transaction.type === "transfer-out" || transaction.type === "transfer-in" ? (
                          <p>
                            Transfer {transaction.type === "transfer-out" ? "to" : "from"}:{" "}
                            {transaction.type === "transfer-out"
                              ? businessAccounts.find((a) => a.id === transaction.toAccountId)?.name ||
                                "Unknown Account"
                              : businessAccounts.find((a) => a.id === transaction.fromAccountId)?.name ||
                                "Unknown Account"}
                          </p>
                        ) : (
                          <p>
                            Category: {transaction.categoryId} • Payment: {transaction.paymentMode}
                          </p>
                        )}
                        <p>Date: {transaction.date}</p>
                        {transaction.transferId && (
                          <p className="text-xs text-blue-600">Transfer ID: {transaction.transferId}</p>
                        )}
                        <p className="font-medium text-blue-600">
                          Running Balance: ৳{transaction.runningBalance.toLocaleString()}
                        </p>
                        {transaction.attachments.length > 0 && (
                          <AttachmentViewer attachments={transaction.attachments} />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-semibold ${
                          transaction.type === "income" || transaction.type === "transfer-in"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" || transaction.type === "transfer-in" ? "+" : "-"}৳
                        {transaction.amount.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTransaction(transaction)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTransaction}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* BookForm component for Add New Book functionality */}
      <BookForm open={showAddBook} onOpenChange={setShowAddBook} onSuccess={handleBookSuccess} />
    </DashboardLayout>
  )
}

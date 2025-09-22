"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BookForm } from "@/components/forms/book-form"
import { useBusinesses, useBooks, useTransactions } from "@/lib/store"
import { Search, Plus, Book, MessageCircle } from "lucide-react"
import type { JSX } from "react/jsx-runtime"

export default function DashboardPage(): JSX.Element {
  const { businesses, currentBusiness } = useBusinesses()
  const { getCurrentBusinessBooks } = useBooks()
  const { getCurrentBookTransactions } = useTransactions()

  const [showAddBook, setShowAddBook] = useState<boolean>(false)
  const [newBookName, setNewBookName] = useState<string>("")
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>("")

  const currentBusinessBooks = getCurrentBusinessBooks()
  const selectedBusinessName = businesses.find((b) => b.id === currentBusiness)?.name || ""

  const handleAddBook = (template: string): void => {
    setNewBookName(template)
    setShowAddBook(true)
  }

  const handleBookSuccess = (): void => {
    setSuccessMessage("Book created successfully!")
    setShowSuccessDialog(true)
  }

  const handleSuccessDialogClose = (): void => {
    setShowSuccessDialog(false)
  }

  const quickTemplates: readonly string[] = [
    "September Expenses",
    "Project Book",
    "Payable Book",
    "Home Expense",
  ] as const

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by book name..."
              className="pl-10 w-full sm:w-80 border-blue-200 focus:border-blue-500"
            />
          </div>
          <Select defaultValue="last-updated">
            <SelectTrigger className="w-full sm:w-40 border-blue-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-updated">Last Updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="created">Created Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => setShowAddBook(true)}
          className="bg-blue-600 hover:bg-blue-700 shadow-md w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Book
        </Button>
      </div>

      <div className="space-y-4">
        {currentBusinessBooks.map((book) => {
          const bookTransactions = getCurrentBookTransactions()
          const transactionCount = bookTransactions.filter((t) => t.accountId === book.id).length

          return (
            <Card key={book.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Book className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div>
                      <Link href="/dashboard/business-book">
                        <h3 className="font-semibold text-base sm:text-lg hover:text-blue-600 cursor-pointer">
                          {book.name}
                        </h3>
                      </Link>
                      <p className="text-xs sm:text-sm text-gray-500">Created {book.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {transactionCount}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-100 hover:bg-green-200"
                    >
                      <MessageCircle className="w-4 h-4 text-green-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base sm:text-lg">Add New Book</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Click to quickly add books for</p>

                <div className="flex flex-wrap gap-2">
                  {quickTemplates.map((template) => (
                    <Button
                      key={template}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent text-xs sm:text-sm"
                      onClick={() => handleAddBook(template)}
                    >
                      {template}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BookForm
        open={showAddBook}
        onOpenChange={setShowAddBook}
        onSuccess={handleBookSuccess}
        initialName={newBookName}
      />

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="w-[95vw] max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Success!</AlertDialogTitle>
            <AlertDialogDescription>{successMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSuccessDialogClose}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}

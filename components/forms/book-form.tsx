"use client"

import type React from "react"
import { useState } from "react"
import { InputField, SelectField } from "./form-field"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useBooks } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

interface BookFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (bookId: string) => void
  initialName?: string
  title?: string
}

const bookTypes = [
  { value: "general", label: "General Book" },
  { value: "expense", label: "Expense Book" },
  { value: "income", label: "Income Book" },
  { value: "project", label: "Project Book" },
  { value: "payable", label: "Payable Book" },
  { value: "receivable", label: "Receivable Book" },
]

export function BookForm({ open, onOpenChange, onSuccess, initialName = "", title = "Add New Book" }: BookFormProps) {
  const { addBook } = useBooks()
  const { toast } = useToast()
  const [bookName, setBookName] = useState(initialName)
  const [bookType, setBookType] = useState("general")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    console.log("[v0] Book form submission started:", { bookName: bookName.trim(), bookType })

    if (!bookName.trim()) {
      setError("Book name is required")
      return
    }

    try {
      console.log("[v0] Calling addBook function...")
      const newBook = await addBook(bookName.trim(), bookType)
      console.log("[v0] addBook result:", newBook)

      if (newBook) {
        console.log("[v0] Book created successfully:", newBook)

        toast({
          title: "Success!",
          description: `Book "${bookName}" created successfully!`,
          variant: "default",
        })

        setBookName("")
        setBookType("general")
        setError("")
        onOpenChange(false)

        if (onSuccess) {
          onSuccess(newBook.id)
        }
      } else {
        console.error("[v0] addBook returned null - likely no current business")
        setError("Failed to create book. Please ensure a business is selected.")
      }
    } catch (err) {
      console.error("[v0] Error creating book:", err)
      setError("Failed to create book. Please try again.")
    }
  }

  const handleCancel = () => {
    setBookName("")
    setBookType("general")
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-blue-200 w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-blue-800">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            id="bookName"
            label="Book Name"
            value={bookName}
            onChange={setBookName}
            placeholder="Enter book name"
            required
            error={error}
          />

          <SelectField
            id="bookType"
            label="Book Type"
            value={bookType}
            onChange={setBookType}
            options={bookTypes}
            placeholder="Select book type"
          />

          <div className="flex gap-2">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              Create Book
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-blue-200 hover:bg-blue-50 bg-transparent"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

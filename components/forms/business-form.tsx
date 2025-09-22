"use client"

import type React from "react"
import { useState } from "react"
import { InputField } from "./form-field"
import { FormContainer } from "./form-container"
import { useBusinesses } from "@/lib/store"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { JSX } from "react/jsx-runtime"

interface BusinessFormProps {
  title?: string
  description?: string
  submitText?: string
  onSuccess?: (businessId: string) => void
  onCancel?: () => void
  initialName?: string
}

export function BusinessForm({
  title = "Add New Business",
  description = "Enter your business details",
  submitText = "Create Business",
  onSuccess,
  onCancel,
  initialName = "",
}: BusinessFormProps): JSX.Element {
  const { addBusiness, setCurrentBusiness } = useBusinesses()
  const [businessName, setBusinessName] = useState<string>(initialName)
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [error, setError] = useState<string>("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    setError("")

    if (!businessName.trim()) {
      setError("Business name is required")
      return
    }

    try {
      const newBusiness = addBusiness(businessName.trim())
      setCurrentBusiness(newBusiness.id)
      setSuccessMessage(`Business "${businessName}" created successfully!`)
      setShowSuccessDialog(true)

      if (onSuccess) {
        onSuccess(newBusiness.id)
      }
    } catch (err: unknown) {
      console.error("Failed to create business:", err)
      setError("Failed to create business. Please try again.")
    }
  }

  const handleBusinessNameChange = (value: string): void => {
    setBusinessName(value)
  }

  const handleSuccessDialogClose = (): void => {
    setShowSuccessDialog(false)
  }

  return (
    <>
      <FormContainer title={title} description={description} onSubmit={handleSubmit} submitText={submitText}>
        <InputField
          id="businessName"
          label="Business Name"
          value={businessName}
          onChange={handleBusinessNameChange}
          placeholder="Enter business name"
          required
          error={error}
        />
      </FormContainer>

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
    </>
  )
}

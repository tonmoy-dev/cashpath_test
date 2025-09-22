"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface FormContainerProps {
  title: string
  description?: string
  logo?: boolean
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
  submitText?: string
  submitDisabled?: boolean
  isLoading?: boolean
  className?: string
  cardClassName?: string
}

export function FormContainer({
  title,
  description,
  logo = true,
  children,
  onSubmit,
  submitText = "Submit",
  submitDisabled = false,
  isLoading = false,
  className = "",
  cardClassName = "",
}: FormContainerProps) {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-3 sm:p-4 ${className}`}
    >
      <Card className={`w-full max-w-lg border-blue-200 shadow-xl ${cardClassName}`}>
        <CardHeader className="text-center px-4 sm:px-6 py-4 sm:py-6">
          {logo && (
            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg sm:text-2xl">C</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Cashify
              </span>
            </div>
          )}
          <CardTitle className="text-xl sm:text-2xl font-bold text-blue-800">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm sm:text-base text-gray-600">{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
            {children}
            <Button
              type="submit"
              disabled={submitDisabled || isLoading}
              className="w-full h-10 sm:h-12 text-sm sm:text-base bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Loading..." : submitText}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

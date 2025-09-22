"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { JSX } from "react/jsx-runtime"
import type React from "react"

interface BaseFieldProps {
  label: string
  id: string
  required?: boolean
  error?: string
  className?: string
}

interface InputFieldProps extends BaseFieldProps {
  type?: "text" | "email" | "password" | "number" | "tel"
  placeholder?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

interface TextareaFieldProps extends BaseFieldProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  rows?: number
  disabled?: boolean
}

interface SelectFieldProps extends BaseFieldProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
}

interface CheckboxFieldProps extends Omit<BaseFieldProps, "required"> {
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
  disabled?: boolean
}

export function InputField({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  className = "",
}: InputFieldProps): JSX.Element {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(e.target.value)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-sm sm:text-base">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        required={required}
        disabled={disabled}
        className={`h-10 sm:h-12 border-blue-200 focus:border-blue-500 text-sm sm:text-base ${
          error ? "border-red-500 focus:border-red-500" : ""
        }`}
      />
      {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}
    </div>
  )
}

export function TextareaField({
  label,
  id,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  rows = 4,
  disabled = false,
  className = "",
}: TextareaFieldProps): JSX.Element {
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    onChange(e.target.value)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-sm sm:text-base">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={handleTextareaChange}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`border-blue-200 focus:border-blue-500 text-sm sm:text-base ${
          error ? "border-red-500 focus:border-red-500" : ""
        }`}
      />
      {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}
    </div>
  )
}

export function SelectField({
  label,
  id,
  placeholder,
  value,
  onChange,
  options,
  required = false,
  error,
  disabled = false,
  className = "",
}: SelectFieldProps): JSX.Element {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-sm sm:text-base">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          className={`h-10 sm:h-12 border-blue-200 focus:border-blue-500 text-sm sm:text-base ${
            error ? "border-red-500 focus:border-red-500" : ""
          }`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}
    </div>
  )
}

export function CheckboxField({
  label,
  id,
  checked,
  onChange,
  description,
  error,
  disabled = false,
  className = "",
}: CheckboxFieldProps): JSX.Element {
  const handleCheckboxChange = (checked: boolean | string): void => {
    onChange(checked as boolean)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start space-x-2 sm:space-x-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={handleCheckboxChange}
          disabled={disabled}
          className="border-blue-300 mt-0.5"
        />
        <div className="flex-1">
          <Label htmlFor={id} className="text-sm sm:text-base">
            {label}
          </Label>
          {description && <p className="text-xs sm:text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      </div>
      {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}
    </div>
  )
}

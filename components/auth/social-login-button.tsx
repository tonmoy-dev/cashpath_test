"use client"

import { Button } from "@/components/ui/button"
import { Mail, User } from "@/components/icons/simple-icons"
import type { JSX } from "react"

interface SocialLoginButtonProps {
  provider: "google" | "email"
  onClick: () => void
  className?: string
}

export function SocialLoginButton({ provider, onClick, className }: SocialLoginButtonProps): JSX.Element {
  const config: Record<
    SocialLoginButtonProps["provider"],
    {
      icon: JSX.Element
      text: string
      bgColor: string
    }
  > = {
    google: {
      icon: (
        <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
          <User className="w-3 h-3 text-white" />
        </div>
      ),
      text: "Continue With Google",
      bgColor: "hover:bg-red-50 border-gray-200",
    },
    email: {
      icon: (
        <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
          <Mail className="w-3 h-3 text-white" />
        </div>
      ),
      text: "Continue With Email",
      bgColor: "hover:bg-blue-50 border-gray-200",
    },
  }

  return (
    <Button
      onClick={onClick}
      variant="outline"
      className={`w-full h-12 text-left justify-center gap-3 bg-white ${config[provider].bgColor} transition-all duration-200 font-medium text-gray-700 shadow-sm hover:shadow-md ${className || ""}`}
    >
      {config[provider].icon}
      <span>{config[provider].text}</span>
    </Button>
  )
}

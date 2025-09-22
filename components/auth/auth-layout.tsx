import type React from "react"

interface AuthLayoutProps {
  children: React.ReactNode
  preview?: React.ReactNode
}

export function AuthLayout({ children, preview }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex">
      {/* Left Side - App Preview */}
      {preview && (
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-100 to-blue-200 items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-50 opacity-50"></div>
          <div className="relative z-10">{preview}</div>
        </div>
      )}

      {/* Right Side - Auth Content */}
      <div className={`w-full ${preview ? "lg:w-1/2" : ""} flex items-center justify-center p-4 sm:p-6 lg:p-8`}>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">{children}</div>
      </div>
    </div>
  )
}

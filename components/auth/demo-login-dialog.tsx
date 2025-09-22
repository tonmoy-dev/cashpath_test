"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Lock } from "@/components/icons/simple-icons"
import type { JSX } from "react/jsx-runtime"

interface DemoLoginDialogProps {
  onLogin: (username: string, password: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DEMO_CREDENTIALS = {
  USERNAME: "admin",
  PASSWORD: "admin",
} as const

export function DemoLoginDialog({ onLogin, open, onOpenChange }: DemoLoginDialogProps): JSX.Element {
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string>("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    if (username === DEMO_CREDENTIALS.USERNAME && password === DEMO_CREDENTIALS.PASSWORD) {
      onLogin(username, password)
      setError("")
      onOpenChange(false)
    } else {
      setError(`Invalid credentials. Use ${DEMO_CREDENTIALS.USERNAME}/${DEMO_CREDENTIALS.PASSWORD} to login.`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="w-full text-emerald-600 hover:text-emerald-700 font-medium flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Try Demo Login
        </Button>
      </DialogTrigger>
      <DialogContent className="border-emerald-200 w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-emerald-800 text-xl font-bold">Demo Access</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-700 font-medium">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              required
              className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 h-11"
            />
          </div>
          {error && <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
          <div className="text-sm text-emerald-700 bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4" />
              <strong>Demo Credentials</strong>
            </div>
            <div className="space-y-1 text-emerald-600">
              <div>
                Username: <span className="font-mono bg-white px-2 py-1 rounded">{DEMO_CREDENTIALS.USERNAME}</span>
              </div>
              <div>
                Password: <span className="font-mono bg-white px-2 py-1 rounded">{DEMO_CREDENTIALS.PASSWORD}</span>
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 font-medium shadow-sm">
            Access Demo
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

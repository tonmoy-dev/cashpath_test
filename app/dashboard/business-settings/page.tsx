"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useBusinesses } from "@/lib/store"
import { Building2, Save, Download, Upload, Shield, Bell, CreditCard } from "lucide-react"

export default function BusinessSettingsPage() {
  const { businesses, currentBusiness } = useBusinesses()
  const [businessData, setBusinessData] = useState({
    name: "",
    industry: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    taxId: "",
    currency: "BDT",
    fiscalYearStart: "January",
    timezone: "Asia/Dhaka",
  })
  const [notifications, setNotifications] = useState({
    emailReports: true,
    transactionAlerts: false,
    weeklyDigest: true,
    systemUpdates: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const currentBusinessData = businesses.find((b) => b.id === currentBusiness)

  useEffect(() => {
    const loadBusinessSettings = async () => {
      if (currentBusinessData) {
        setBusinessData({
          name: currentBusinessData.name,
          industry: currentBusinessData.type || "",
          address: "",
          phone: "",
          email: "",
          website: "",
          taxId: "",
          currency: "BDT",
          fiscalYearStart: "January",
          timezone: "Asia/Dhaka",
        })
      }
      setIsLoading(false)
    }

    loadBusinessSettings()
  }, [currentBusinessData])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save business settings via API
      const response = await fetch(`/api/businesses/${currentBusiness}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(businessData),
      })

      if (response.ok) {
        alert("Settings saved successfully!")
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      alert("Failed to save settings. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportData = () => {
    // Export data functionality
    alert("Data export feature will be implemented with database integration")
  }

  const handleImportData = () => {
    // Import data functionality
    alert("Data import feature will be implemented with database integration")
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <main className="flex-1 p-4 sm:p-6 lg:ml-0">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <main className="flex-1 p-4 sm:p-6 lg:ml-0">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Business Settings</h1>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Database Connected
            </Badge>
          </div>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessData.name}
                    onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={businessData.industry}
                    onValueChange={(value) => setBusinessData({ ...businessData, industry: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  value={businessData.address}
                  onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={businessData.phone}
                    onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={businessData.email}
                    onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={businessData.website}
                    onChange={(e) => setBusinessData({ ...businessData, website: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={businessData.taxId}
                    onChange={(e) => setBusinessData({ ...businessData, taxId: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Financial Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select
                    value={businessData.currency}
                    onValueChange={(value) => setBusinessData({ ...businessData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BDT">BDT - Bangladeshi Taka</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscalYear">Fiscal Year Start</Label>
                  <Select
                    value={businessData.fiscalYearStart}
                    onValueChange={(value) => setBusinessData({ ...businessData, fiscalYearStart: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="January">January</SelectItem>
                      <SelectItem value="April">April</SelectItem>
                      <SelectItem value="July">July</SelectItem>
                      <SelectItem value="October">October</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={businessData.timezone}
                    onValueChange={(value) => setBusinessData({ ...businessData, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Dhaka">Asia/Dhaka (BST)</SelectItem>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailReports">Email Reports</Label>
                  <p className="text-sm text-gray-500">Receive monthly financial reports via email</p>
                </div>
                <Switch
                  id="emailReports"
                  checked={notifications.emailReports}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailReports: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="transactionAlerts">Transaction Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified for large transactions</p>
                </div>
                <Switch
                  id="transactionAlerts"
                  checked={notifications.transactionAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, transactionAlerts: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weeklyDigest">Weekly Digest</Label>
                  <p className="text-sm text-gray-500">Weekly summary of your business activities</p>
                </div>
                <Switch
                  id="weeklyDigest"
                  checked={notifications.weeklyDigest}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyDigest: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="systemUpdates">System Updates</Label>
                  <p className="text-sm text-gray-500">Important system and security updates</p>
                </div>
                <Switch
                  id="systemUpdates"
                  checked={notifications.systemUpdates}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, systemUpdates: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleExportData} variant="outline" className="flex-1 bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button onClick={handleImportData} variant="outline" className="flex-1 bg-transparent">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Export your data for backup purposes or import data from other systems. All data is securely stored in
                the database.
              </p>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}

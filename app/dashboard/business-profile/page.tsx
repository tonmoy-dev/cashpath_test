"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Edit, AlertTriangle, Save } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useBusinesses } from "@/lib/store";

export default function BusinessProfilePage() {
  const { businesses, currentBusiness } = useBusinesses()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profileStrength, setProfileStrength] = useState(32)
  const [businessData, setBusinessData] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
    gstin: "",
    businessCategory: "",
    businessSubcategory: "",
    businessType: "",
    registrationType: "",
  })

  const currentBusinessData = businesses.find((b) => b.id === currentBusiness)

  useEffect(() => {
    const loadBusinessData = async () => {
      if (!currentBusiness) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/businesses/${currentBusiness}`)
        if (response.ok) {
          const data = await response.json()
          setBusinessData({
            name: data.name || "",
            address: data.address || "",
            email: data.email || "",
            phone: data.phone || "",
            website: data.website || "",
            industry: data.industry || "",
            gstin: "",
            businessCategory: "",
            businessSubcategory: "",
            businessType: "",
            registrationType: "",
          })
          // Calculate profile strength
          const filledFields = Object.values(data).filter(v => v && v !== "").length
          setProfileStrength(Math.min(100, Math.round((filledFields / 10) * 100)))
        }
      } catch (error) {
        console.error("Failed to load business data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBusinessData()
  }, [currentBusiness])

  const handleSave = async () => {
    if (!currentBusiness) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/businesses/${currentBusiness}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(businessData),
      })

      if (response.ok) {
        setIsEditing(false)
        // Recalculate profile strength
        const filledFields = Object.values(businessData).filter(v => v && v !== "").length
        setProfileStrength(Math.min(100, Math.round((filledFields / 10) * 100)))
        alert("Business profile updated successfully!")
      } else {
        throw new Error("Failed to update business profile")
      }
    } catch (error) {
      console.error("Failed to save business profile:", error)
      alert("Failed to update business profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <main className="flex-1 p-6">
          <div className="max-w-4xl">
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
      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-4xl">
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Business Profile</h1>
              <p className="text-gray-600">Edit business details</p>
            </div>
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>

          {/* Profile Strength Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏢</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{businessData.name || "Business Name"}</h3>
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600">
                      Incomplete business profile
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">
                          Profile Strength:
                        </span>
                        <span className="text-sm font-medium">
                          {profileStrength}%
                        </span>
                      </div>
                      <Progress value={profileStrength} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs">i</span>
                </div>
                <p className="text-sm text-blue-800">
                  4 out of 10 fields are incomplete. Fill these to complete your
                  profile.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="basics" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basics">Basics</TabsTrigger>
                  <TabsTrigger value="business-info">Business Info</TabsTrigger>
                  <TabsTrigger value="communication">Communication</TabsTrigger>
                </TabsList>

                <TabsContent value="basics" className="mt-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="business-name">Business Name</Label>
                        <Input 
                          id="business-name" 
                          value={businessData.name}
                          onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-address">
                          Business Address
                        </Label>
                        <Input
                          id="business-address"
                          placeholder="Enter address"
                          value={businessData.address}
                          onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gstin">GSTIN</Label>
                      <Input 
                        id="gstin" 
                        placeholder="Enter GSTIN" 
                        value={businessData.gstin}
                        onChange={(e) => setBusinessData({ ...businessData, gstin: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="business-info" className="mt-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="business-category">
                          Business Category
                        </Label>
                        <Select 
                          value={businessData.businessCategory}
                          onValueChange={(value) => setBusinessData({ ...businessData, businessCategory: value })}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="agriculture">
                              Agriculture
                            </SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="services">Services</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-subcategory">
                          Business Subcategory
                        </Label>
                        <Input
                          id="business-subcategory"
                          placeholder="Enter subcategory"
                          value={businessData.businessSubcategory}
                          onChange={(e) => setBusinessData({ ...businessData, businessSubcategory: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="business-type">Business Type</Label>
                        <Select 
                          value={businessData.businessType}
                          onValueChange={(value) => setBusinessData({ ...businessData, businessType: value })}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="retailer">Retailer</SelectItem>
                            <SelectItem value="wholesaler">
                              Wholesaler
                            </SelectItem>
                            <SelectItem value="manufacturer">
                              Manufacturer
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registration-type">
                          Business Registration Type
                        </Label>
                        <Input
                          id="registration-type"
                          placeholder="Enter registration type"
                          value={businessData.registrationType}
                          onChange={(e) => setBusinessData({ ...businessData, registrationType: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="communication" className="mt-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="mobile-number">
                          Business Mobile Number
                        </Label>
                        <Input
                          id="mobile-number"
                          placeholder="Enter mobile number"
                          value={businessData.phone}
                          onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-email">Business Email</Label>
                        <Input
                          id="business-email"
                          type="email"
                          value={businessData.email}
                          onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        placeholder="Enter website URL"
                        value={businessData.website}
                        onChange={(e) => setBusinessData({ ...businessData, website: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </DashboardLayout>
  );
}

"use client";

import { useState } from "react";
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
import { ArrowLeft, Edit, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function BusinessProfilePage() {
  const [profileStrength, setProfileStrength] = useState(32);

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
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
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
                    <h3 className="font-semibold">Dev</h3>
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
                        <Input id="business-name" defaultValue="Dev" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-address">
                          Business Address
                        </Label>
                        <Input
                          id="business-address"
                          placeholder="Enter address"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gstin">GSTIN</Label>
                      <Input id="gstin" placeholder="Enter GSTIN" />
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
                        <Select defaultValue="agriculture">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="agriculture">
                              Agriculture
                            </SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="services">Services</SelectItem>
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
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="business-type">Business Type</Label>
                        <Select defaultValue="retailer">
                          <SelectTrigger>
                            <SelectValue />
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
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-email">Business Email</Label>
                        <Input
                          id="business-email"
                          defaultValue="tonmoy.softdev@gmail.com"
                        />
                      </div>
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

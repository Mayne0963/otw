"use client";

import type { Metadata } from "next";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { User, CreditCard, MapPin, Bell, Shield, LogOut } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("account");

  // Mock user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    avatar: "/images/avatar.jpg",
    memberSince: "January 2023",
    tier: "Silver",
    addresses: [
      {
        id: 1,
        name: "Home",
        street: "123 Main St",
        city: "Fort Wayne",
        state: "IN",
        zip: "46802",
        default: true,
      },
      {
        id: 2,
        name: "Work",
        street: "456 Office Blvd",
        city: "Fort Wayne",
        state: "IN",
        zip: "46805",
        default: false,
      },
    ],
    paymentMethods: [
      {
        id: 1,
        type: "Visa",
        last4: "4242",
        expiry: "04/25",
        default: true,
      },
      {
        id: 2,
        type: "Mastercard",
        last4: "5555",
        expiry: "08/24",
        default: false,
      },
    ],
  };

  return (
    <div className="min-h-screen pb-20 pt-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                    />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle>{user.name}</CardTitle>
                  <CardDescription>
                    Member since {user.memberSince}
                  </CardDescription>
                  <Badge className="mt-2 bg-otw-gold text-black">
                    {user.tier} Member
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <nav className="flex flex-col space-y-1">
                  <Button
                    variant={activeTab === "account" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => setActiveTab("account")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </Button>
                  <Button
                    variant={activeTab === "addresses" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => setActiveTab("addresses")}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Addresses
                  </Button>
                  <Button
                    variant={activeTab === "payment" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => setActiveTab("payment")}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment Methods
                  </Button>
                  <Button
                    variant={
                      activeTab === "notifications" ? "default" : "ghost"
                    }
                    className="justify-start"
                    onClick={() => setActiveTab("notifications")}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </Button>
                  <Button
                    variant={activeTab === "security" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => setActiveTab("security")}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Security
                  </Button>
                </nav>
              </CardContent>
              <CardFooter>
                <Button variant="destructive" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardFooter>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Tier Membership</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span>Current Tier:</span>
                  <Badge className="bg-otw-gold text-black">{user.tier}</Badge>
                </div>
                <Link href="/tier">
                  <Button variant="outline" className="w-full">
                    Manage Membership
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Account Tab */}
            {activeTab === "account" && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          defaultValue={user.name}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue={user.email}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          defaultValue={user.phone}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input id="dob" type="date" className="mt-1" />
                      </div>
                    </div>

                    <div>
                      <Button>Save Changes</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <Card>
                <CardHeader>
                  <CardTitle>Saved Addresses</CardTitle>
                  <CardDescription>
                    Manage your delivery addresses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {user.addresses.map((address) => (
                      <div
                        key={address.id}
                        className="bg-gray-900 p-4 rounded-lg border border-gray-800"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{address.name}</h3>
                            <p className="text-sm text-gray-400">
                              {address.street}
                              <br />
                              {address.city}, {address.state} {address.zip}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm">
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      Add New Address
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Methods Tab */}
            {activeTab === "payment" && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment options</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {user.paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="bg-gray-900 p-4 rounded-lg border border-gray-800"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-bold">
                                {method.type} •••• {method.last4}
                              </h3>
                              {method.default && (
                                <Badge className="ml-2 bg-otw-gold text-black">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-400 mt-1">
                              Expires {method.expiry}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {!method.default && (
                              <Button variant="outline" size="sm">
                                Set as Default
                              </Button>
                            )}
                            {!method.default && (
                              <Button variant="destructive" size="sm">
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button>Add New Payment Method</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how we contact you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">Order Updates</h3>
                        <p className="text-gray-400">
                          Receive updates about your orders
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="order-email"
                            className="rounded border-gray-600 text-otw-gold focus:ring-otw-gold"
                            defaultChecked
                          />
                          <Label htmlFor="order-email">Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="order-sms"
                            className="rounded border-gray-600 text-otw-gold focus:ring-otw-gold"
                            defaultChecked
                          />
                          <Label htmlFor="order-sms">SMS</Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">Promotions</h3>
                        <p className="text-gray-400">
                          Receive special offers and promotions
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="promo-email"
                            className="rounded border-gray-600 text-otw-gold focus:ring-otw-gold"
                            defaultChecked
                          />
                          <Label htmlFor="promo-email">Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="promo-sms"
                            className="rounded border-gray-600 text-otw-gold focus:ring-otw-gold"
                          />
                          <Label htmlFor="promo-sms">SMS</Label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Button>Save Changes</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

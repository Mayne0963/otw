import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";

export const metadata: Metadata = {
  title: "Settings | On The Way",
  description: "Manage your account settings and preferences",
};

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      defaultValue="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="Your email"
                      defaultValue="john@example.com"
                      type="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="Your phone number"
                      defaultValue="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Your address"
                      defaultValue="123 Main St, Anytown, USA"
                    />
                  </div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Update your password.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label
                        htmlFor="email-notifications"
                        className="font-medium"
                      >
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive order updates via email
                      </p>
                    </div>
                    <Switch id="email-notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label
                        htmlFor="sms-notifications"
                        className="font-medium"
                      >
                        SMS Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive order updates via text message
                      </p>
                    </div>
                    <Switch id="sms-notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label
                        htmlFor="push-notifications"
                        className="font-medium"
                      >
                        Push Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications on your device
                      </p>
                    </div>
                    <Switch id="push-notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing-emails" className="font-medium">
                        Marketing Emails
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive promotional emails and offers
                      </p>
                    </div>
                    <Switch id="marketing-emails" />
                  </div>
                </div>
                <Button>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Manage your privacy preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="location-sharing" className="font-medium">
                        Location Sharing
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow us to access your location for better service
                      </p>
                    </div>
                    <Switch id="location-sharing" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="data-collection" className="font-medium">
                        Data Collection
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow us to collect usage data to improve our services
                      </p>
                    </div>
                    <Switch id="data-collection" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label
                        htmlFor="third-party-sharing"
                        className="font-medium"
                      >
                        Third-Party Sharing
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow us to share your data with trusted partners
                      </p>
                    </div>
                    <Switch id="third-party-sharing" />
                  </div>
                </div>
                <Button>Save Privacy Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Data</CardTitle>
                <CardDescription>Manage your account data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button variant="outline">Download My Data</Button>
                  <Button variant="destructive">Delete My Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your payment methods.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-6 bg-blue-600 rounded"></div>
                      <div>
                        <p className="font-medium">Visa ending in 4242</p>
                        <p className="text-sm text-muted-foreground">
                          Expires 12/25
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-6 bg-red-600 rounded"></div>
                      <div>
                        <p className="font-medium">Mastercard ending in 5555</p>
                        <p className="text-sm text-muted-foreground">
                          Expires 10/24
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>

                  <Button className="w-full">Add Payment Method</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
                <CardDescription>Manage your billing address.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billing-name">Name</Label>
                    <Input
                      id="billing-name"
                      placeholder="Name on card"
                      defaultValue="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing-address">Address</Label>
                    <Input
                      id="billing-address"
                      placeholder="Street address"
                      defaultValue="123 Main St"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing-city">City</Label>
                    <Input
                      id="billing-city"
                      placeholder="City"
                      defaultValue="Anytown"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing-state">State</Label>
                    <Input
                      id="billing-state"
                      placeholder="State"
                      defaultValue="CA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing-zip">ZIP Code</Label>
                    <Input
                      id="billing-zip"
                      placeholder="ZIP Code"
                      defaultValue="12345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing-country">Country</Label>
                    <Input
                      id="billing-country"
                      placeholder="Country"
                      defaultValue="United States"
                    />
                  </div>
                </div>
                <Button>Save Billing Address</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

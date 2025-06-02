"use client";

import type { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
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
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";

export const metadata: Metadata = {
  title: "Help & Support | On The Way",
  description: "Get help and support for On The Way services",
};

export const dynamic = "force-dynamic";

export default function HelpPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
          <p className="text-muted-foreground">
            Find answers to common questions or contact our support team.
          </p>
        </div>

        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to the most common questions about our services.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      How do I place an order?
                    </AccordionTrigger>
                    <AccordionContent>
                      To place an order, simply browse our restaurants or
                      services, select the items you want, add them to your
                      cart, and proceed to checkout. You'll need to be logged in
                      to complete your order.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>
                      What are the delivery hours?
                    </AccordionTrigger>
                    <AccordionContent>
                      Our delivery hours vary by location and service type.
                      Generally, we offer delivery from 8 AM to 10 PM, but some
                      areas may have extended hours. You can check the specific
                      hours for your location during the checkout process.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>
                      How do I track my order?
                    </AccordionTrigger>
                    <AccordionContent>
                      Once your order is confirmed, you can track it in
                      real-time through the "Track" page. You'll receive updates
                      via email, SMS, or push notifications (depending on your
                      preferences) as your order progresses.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>
                      What payment methods do you accept?
                    </AccordionTrigger>
                    <AccordionContent>
                      We accept all major credit and debit cards, including
                      Visa, Mastercard, American Express, and Discover. We also
                      support digital wallets like Apple Pay and Google Pay, as
                      well as cash on delivery in select areas.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger>
                      How do I cancel my order?
                    </AccordionTrigger>
                    <AccordionContent>
                      You can cancel your order within 5 minutes of placing it
                      by going to your order history and selecting "Cancel
                      Order." After this window, please contact our customer
                      support for assistance.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6">
                    <AccordionTrigger>
                      What is the OTW Loyalty Program?
                    </AccordionTrigger>
                    <AccordionContent>
                      The OTW Loyalty Program rewards you for using our
                      services. You earn points on every order, which can be
                      redeemed for discounts, free delivery, exclusive offers,
                      and more. Visit the Loyalty page to learn more about tiers
                      and benefits.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7">
                    <AccordionTrigger>
                      How do I become a delivery driver?
                    </AccordionTrigger>
                    <AccordionContent>
                      To become a delivery driver, visit our "Become a Driver"
                      page and fill out the application form. You'll need to
                      provide some personal information, vehicle details, and
                      undergo a background check. Once approved, you can start
                      accepting delivery requests.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-8">
                    <AccordionTrigger>
                      What if there's an issue with my order?
                    </AccordionTrigger>
                    <AccordionContent>
                      If there's an issue with your order, you can report it
                      through the app or website by going to your order history
                      and selecting "Report Issue." Our customer support team
                      will assist you promptly. You can also contact us directly
                      through the "Contact Us" page.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Our Support Team</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as
                  possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Name</Label>
                      <Input id="contact-name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email</Label>
                      <Input
                        id="contact-email"
                        placeholder="Your email"
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-subject">Subject</Label>
                    <Input
                      id="contact-subject"
                      placeholder="What is this regarding?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea
                      id="contact-message"
                      placeholder="Please describe your issue or question in detail"
                      rows={5}
                    />
                  </div>

                  <Button type="submit">Submit</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Other Ways to Reach Us</CardTitle>
                <CardDescription>
                  Choose the method that works best for you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="mb-2 flex justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      1-800-OTW-HELP
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Available 24/7
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg text-center">
                    <div className="mb-2 flex justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                      </svg>
                    </div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      support@otw.com
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Response within 24 hours
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg text-center">
                    <div className="mb-2 flex justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </div>
                    <h3 className="font-medium">Live Chat</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Available in the app
                    </p>
                    <p className="text-sm text-muted-foreground">
                      9 AM - 9 PM daily
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guides" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Guides</CardTitle>
                <CardDescription>
                  Step-by-step guides to help you get the most out of our
                  services.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-lg mb-2">
                      Getting Started
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Learn how to create an account and place your first order.
                    </p>
                    <Button variant="outline" className="w-full">
                      View Guide
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-lg mb-2">
                      Tracking Orders
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Learn how to track your orders in real-time.
                    </p>
                    <Button variant="outline" className="w-full">
                      View Guide
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-lg mb-2">
                      Loyalty Program
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Learn how to earn and redeem loyalty points.
                    </p>
                    <Button variant="outline" className="w-full">
                      View Guide
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-lg mb-2">
                      Payment Methods
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Learn how to add and manage payment methods.
                    </p>
                    <Button variant="outline" className="w-full">
                      View Guide
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-lg mb-2">
                      Scheduling Deliveries
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Learn how to schedule deliveries in advance.
                    </p>
                    <Button variant="outline" className="w-full">
                      View Guide
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-lg mb-2">
                      Driver Instructions
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Learn how to provide special instructions for drivers.
                    </p>
                    <Button variant="outline" className="w-full">
                      View Guide
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Video Tutorials</CardTitle>
                <CardDescription>
                  Watch our video tutorials for visual guidance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-10 w-10"
                      >
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium">How to Place an Order</h3>
                      <p className="text-sm text-muted-foreground">2:45</p>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-10 w-10"
                      >
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium">Using the Loyalty Program</h3>
                      <p className="text-sm text-muted-foreground">3:12</p>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-10 w-10"
                      >
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium">Tracking Your Delivery</h3>
                      <p className="text-sm text-muted-foreground">1:58</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

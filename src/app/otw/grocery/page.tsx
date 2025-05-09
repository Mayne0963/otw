import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Calendar } from "../../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover"
import { CalendarIcon, Clock, MapPin, ShoppingBag, Info } from "lucide-react"
import Link from "next/link"

export default function GroceryDeliveryPage() {
  return (
    <div className="min-h-screen pb-20 pt-24">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-70 z-10"></div>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/grocery-hero.jpg')" }}
          ></div>
        </div>
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-5xl font-bold mb-4 text-white">Grocery Shop & Drop</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            We'll shop for your groceries and deliver them right to your door.
          </p>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-800 p-8">
              <h2 className="text-2xl font-bold mb-6">Schedule Your Grocery Delivery</h2>

              <div className="mb-6">
                <Label htmlFor="delivery-address">Delivery Address</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="delivery-address" placeholder="Enter your delivery address" className="pl-10" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label>Preferred Store</Label>
                  <div className="relative mt-1">
                    <ShoppingBag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Select>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select store" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kroger">Kroger</SelectItem>
                        <SelectItem value="walmart">Walmart</SelectItem>
                        <SelectItem value="target">Target</SelectItem>
                        <SelectItem value="aldi">Aldi</SelectItem>
                        <SelectItem value="meijer">Meijer</SelectItem>
                        <SelectItem value="other">Other (specify in notes)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Order Size</Label>
                  <div className="relative mt-1">
                    <ShoppingBag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Select>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select order size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (1-15 items)</SelectItem>
                        <SelectItem value="medium">Medium (16-30 items)</SelectItem>
                        <SelectItem value="large">Large (31-50 items)</SelectItem>
                        <SelectItem value="xlarge">Extra Large (50+ items)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label>Delivery Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>Pick a date</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Delivery Time</Label>
                  <div className="relative mt-1">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Select>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (8am-12pm)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12pm-5pm)</SelectItem>
                        <SelectItem value="evening">Evening (5pm-9pm)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <Label htmlFor="grocery-list">Grocery List</Label>
                <Textarea
                  id="grocery-list"
                  placeholder="Enter your grocery list with quantities and any specific brands or preferences"
                  className="mt-1 min-h-[150px]"
                />
              </div>

              <div className="mb-6">
                <Label htmlFor="special-instructions">Special Instructions (Optional)</Label>
                <Textarea
                  id="special-instructions"
                  placeholder="Any special instructions for shopping or delivery"
                  className="mt-1"
                />
              </div>

              <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300">
                    You'll only pay the actual cost of groceries plus our service fee. We'll provide a receipt with your
                    delivery.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/checkout" className="flex-1">
                  <Button className="w-full">Schedule Delivery</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-otw-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-otw-gold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Submit Your List</h3>
              <p className="text-gray-400">Tell us what you need, including brands and quantities.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-otw-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-otw-gold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">We Shop For You</h3>
              <p className="text-gray-400">
                Our shoppers carefully select your items with attention to quality and detail.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-otw-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-otw-gold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Real-Time Updates</h3>
              <p className="text-gray-400">We'll contact you about any out-of-stock items and suggest alternatives.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-otw-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-otw-gold">4</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Doorstep Delivery</h3>
              <p className="text-gray-400">We deliver your groceries right to your door at your scheduled time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Simple, Transparent Pricing</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-bold mb-4">Service Fee</h3>
              <p className="text-3xl font-bold text-otw-gold mb-4">$15.99</p>
              <p className="text-gray-400 mb-4">Base fee for shopping and delivery</p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-otw-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Up to 15 items
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-otw-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Within 5 miles
                </li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-bold mb-4">Additional Items</h3>
              <p className="text-3xl font-bold text-otw-gold mb-4">$0.50</p>
              <p className="text-gray-400 mb-4">Per item over 15 items</p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-otw-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Transparent pricing
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-otw-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  No hidden fees
                </li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-bold mb-4">Distance Fee</h3>
              <p className="text-3xl font-bold text-otw-gold mb-4">$1.00</p>
              <p className="text-gray-400 mb-4">Per mile over 5 miles</p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-otw-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Calculated at checkout
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-otw-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Up to 20 miles radius
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tier Membership CTA */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Save More with Tier Membership</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join our Tier Membership program and enjoy exclusive benefits like discounted service fees, free delivery,
              and priority scheduling.
            </p>
            <Link href="/tier">
              <Button size="lg">Learn About Tier Membership</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

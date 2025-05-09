import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Calendar } from "../../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover"
import { CalendarIcon, Clock, MapPin, Package, Info } from "lucide-react"
import Link from "next/link"

export default function PackageDeliveryPage() {
  return (
    <div className="min-h-screen pb-20 pt-24">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-70 z-10"></div>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/package-hero.jpg')" }}
          ></div>
        </div>
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-5xl font-bold mb-4 text-white">Package Delivery</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Fast, reliable package delivery across Fort Wayne and surrounding areas.
          </p>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-800 p-8">
              <h2 className="text-2xl font-bold mb-6">Schedule Your Package Delivery</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="pickup">Pickup Location</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="pickup" placeholder="Enter pickup address" className="pl-10" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="destination">Destination</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="destination" placeholder="Enter destination address" className="pl-10" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <Label>Package Size</Label>
                  <div className="relative mt-1">
                    <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Select>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (under 5 lbs)</SelectItem>
                        <SelectItem value="medium">Medium (5-15 lbs)</SelectItem>
                        <SelectItem value="large">Large (15-30 lbs)</SelectItem>
                        <SelectItem value="xlarge">Extra Large (30+ lbs)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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
                        <SelectItem value="asap">As soon as possible</SelectItem>
                        <SelectItem value="morning">Morning (8am-12pm)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12pm-5pm)</SelectItem>
                        <SelectItem value="evening">Evening (5pm-9pm)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <Label htmlFor="package-description">Package Description</Label>
                <Textarea
                  id="package-description"
                  placeholder="Describe your package (contents, fragility, special handling requirements, etc.)"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="sender-name">Sender's Name</Label>
                  <Input id="sender-name" placeholder="Enter sender's full name" className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="sender-phone">Sender's Phone</Label>
                  <Input id="sender-phone" placeholder="Enter sender's phone number" className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="recipient-name">Recipient's Name</Label>
                  <Input id="recipient-name" placeholder="Enter recipient's full name" className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="recipient-phone">Recipient's Phone</Label>
                  <Input id="recipient-phone" placeholder="Enter recipient's phone number" className="mt-1" />
                </div>
              </div>

              <div className="mb-6">
                <Label htmlFor="special-instructions">Special Instructions (Optional)</Label>
                <Textarea id="special-instructions" placeholder="Any special delivery instructions" className="mt-1" />
              </div>

              <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300">
                    Delivery fees are calculated based on distance and package size. You'll see the exact fee before
                    confirming your booking.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="flex-1">Calculate Fee</Button>
                <Link href="/checkout" className="flex-1">
                  <Button className="w-full">Schedule Delivery</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose OTW Package Delivery</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-otw-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-otw-red" />
              </div>
              <h3 className="text-xl font-bold mb-3">Same-Day Delivery</h3>
              <p className="text-gray-400">
                Need it there today? We offer same-day delivery for packages booked before 2 PM.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-otw-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-otw-red" />
              </div>
              <h3 className="text-xl font-bold mb-3">Careful Handling</h3>
              <p className="text-gray-400">
                Your packages are treated with care. We ensure safe handling from pickup to delivery.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-otw-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-otw-red" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-Time Tracking</h3>
              <p className="text-gray-400">
                Track your package in real-time from pickup to delivery with our tracking system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Simple, Transparent Pricing</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-bold mb-4">Small Package</h3>
              <p className="text-3xl font-bold text-otw-gold mb-4">$9.99</p>
              <p className="text-gray-400 mb-4">Under 5 lbs</p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-otw-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Up to 5 miles
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-otw-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Standard handling
                </li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-bold mb-4">Medium Package</h3>
              <p className="text-3xl font-bold text-otw-gold mb-4">$14.99</p>
              <p className="text-gray-400 mb-4">5-15 lbs</p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-otw-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Up to 5 miles
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-otw-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Careful handling
                </li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-bold mb-4">Large Package</h3>
              <p className="text-3xl font-bold text-otw-gold mb-4">$19.99</p>
              <p className="text-gray-400 mb-4">15-30 lbs</p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-otw-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Up to 5 miles
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-otw-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Special handling
                </li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-bold mb-4">Extra Large</h3>
              <p className="text-3xl font-bold text-otw-gold mb-4">$29.99</p>
              <p className="text-gray-400 mb-4">30+ lbs</p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-otw-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Up to 5 miles
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-otw-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Premium handling
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-400">
            <p>Additional fee of $1.00 per mile applies for distances over 5 miles.</p>
            <p>Same-day delivery fee: Additional $5.00 (orders placed before 2 PM).</p>
          </div>
        </div>
      </section>

      {/* Tier Membership CTA */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Save More with Tier Membership</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join our Tier Membership program and enjoy exclusive benefits like discounted delivery fees, priority
              scheduling, and free same-day delivery.
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

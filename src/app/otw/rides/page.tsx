import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Calendar } from "../../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover"
import { CalendarIcon, Clock, MapPin, Car, CreditCard, Info } from "lucide-react"
import Link from "next/link"

export default function RidesPage() {
  return (
    <div className="min-h-screen pb-20 pt-24">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-70 z-10"></div>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/rides-hero.jpg')" }}
          ></div>
        </div>
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-5xl font-bold mb-4 text-white">Book a Ride</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Safe, reliable transportation throughout Fort Wayne and surrounding areas.
          </p>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-800 p-8">
              <h2 className="text-2xl font-bold mb-6">Schedule Your Ride</h2>

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
                  <Label>Date</Label>
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
                  <Label>Time</Label>
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

                <div>
                  <Label>Vehicle Type</Label>
                  <div className="relative mt-1">
                    <Car className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Select>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (4 passengers)</SelectItem>
                        <SelectItem value="suv">SUV (6 passengers)</SelectItem>
                        <SelectItem value="luxury">Luxury (4 passengers)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <Label htmlFor="notes">Special Instructions (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requirements or instructions for your driver"
                  className="mt-1"
                />
              </div>

              <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300">
                    Your fare will be calculated based on distance and vehicle type. You'll see the exact fare before
                    confirming your booking.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="flex-1">Calculate Fare</Button>
                <Link href="/checkout" className="flex-1">
                  <Button className="w-full">Book Now</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose OTW Rides</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-otw-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-otw-red" />
              </div>
              <h3 className="text-xl font-bold mb-3">Reliable & Punctual</h3>
              <p className="text-gray-400">
                Our drivers are always on time. We value your schedule and ensure prompt service.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-otw-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8 text-otw-red" />
              </div>
              <h3 className="text-xl font-bold mb-3">Transparent Pricing</h3>
              <p className="text-gray-400">
                No hidden fees or surge pricing. Know exactly what you'll pay before booking.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-otw-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="w-8 h-8 text-otw-red" />
              </div>
              <h3 className="text-xl font-bold mb-3">Professional Drivers</h3>
              <p className="text-gray-400">
                All our drivers are professionally trained, background-checked, and committed to your safety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tier Membership CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-800 p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Save More with Tier Membership</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join our Tier Membership program and enjoy exclusive benefits like discounted rides, priority booking, and
              more.
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

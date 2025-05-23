import { Button } from "../../components/ui/button";
import { Check, Star, Shield, Clock, Gift, Zap } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function TierMembershipPage() {
  return (
    <div className="min-h-screen pb-20 pt-24">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-70 z-10"></div>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/tier-hero.jpg')" }}
          ></div>
        </div>
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-5xl font-bold mb-4 text-white">
            OTW Tier Membership
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Join our premium membership program and unlock exclusive benefits,
            savings, and perks.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 -mt-20 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Bronze Tier */}
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-800 hover:border-otw-gold transition-all duration-300">
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">Bronze</h3>
                <div className="text-4xl font-bold text-otw-gold mb-4">
                  $9.99
                  <span className="text-lg font-normal text-gray-400">
                    /month
                  </span>
                </div>
                <p className="text-gray-400 mb-6">
                  Perfect for occasional users who want to save on fees.
                </p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span>No service fees on food delivery</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span>10% off package delivery</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span>2 free ride tokens per month</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span>Standard customer support</span>
                  </li>
                </ul>

                <Link href="/checkout?plan=bronze">
                  <Button className="w-full">Join Bronze</Button>
                </Link>
              </div>
            </div>

            {/* Silver Tier */}
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl border-2 border-otw-gold transform scale-105 z-10">
              <div className="bg-otw-gold text-black text-center py-2 font-bold text-sm">
                MOST POPULAR
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">Silver</h3>
                <div className="text-4xl font-bold text-otw-gold mb-4">
                  $19.99
                  <span className="text-lg font-normal text-gray-400">
                    /month
                  </span>
                </div>
                <p className="text-gray-400 mb-6">
                  Great for regular users who want premium benefits.
                </p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span>All Bronze benefits</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span>20% off package delivery</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span>5 free ride tokens per month</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span>Priority customer support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span>Free grocery delivery (up to 3 per month)</span>
                  </li>
                </ul>

                <Link href="/checkout?plan=silver">
                  <Button className="w-full">Join Silver</Button>
                </Link>
              </div>
            </div>

            {/* Gold Tier */}
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-800 hover:border-otw-gold transition-all duration-300">
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">Gold</h3>
                <div className="text-4xl font-bold text-otw-gold mb-4">
                  $39.99
                  <span className="text-lg font-normal text-gray-400">
                    /month
                  </span>
                </div>
                <p className="text-gray-400 mb-6">
                  For power users who want the ultimate OTW experience.
                </p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span>All Silver benefits</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span>Unlimited free food delivery</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span>50% off package delivery</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span>10 free ride tokens per month</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span>VIP customer support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span>Free unlimited grocery delivery</span>
                  </li>
                </ul>

                <Link href="/checkout?plan=gold">
                  <Button className="w-full">Join Gold</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Membership Benefits
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="w-12 h-12 bg-otw-red/10 rounded-full flex items-center justify-center mb-6">
                <Star className="w-6 h-6 text-otw-red" />
              </div>
              <h3 className="text-xl font-bold mb-3">Exclusive Savings</h3>
              <p className="text-gray-400">
                Save on delivery fees, service charges, and enjoy special
                member-only discounts on all OTW services.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="w-12 h-12 bg-otw-red/10 rounded-full flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-otw-red" />
              </div>
              <h3 className="text-xl font-bold mb-3">Priority Service</h3>
              <p className="text-gray-400">
                Skip the queue with priority booking, faster delivery times, and
                preferred scheduling for all services.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="w-12 h-12 bg-otw-red/10 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-otw-red" />
              </div>
              <h3 className="text-xl font-bold mb-3">Premium Support</h3>
              <p className="text-gray-400">
                Enjoy dedicated customer support with faster response times and
                personalized assistance.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="w-12 h-12 bg-otw-red/10 rounded-full flex items-center justify-center mb-6">
                <Gift className="w-6 h-6 text-otw-red" />
              </div>
              <h3 className="text-xl font-bold mb-3">Free Ride Tokens</h3>
              <p className="text-gray-400">
                Receive monthly ride tokens that can be redeemed for free rides
                anywhere in our service area.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="w-12 h-12 bg-otw-red/10 rounded-full flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-otw-red" />
              </div>
              <h3 className="text-xl font-bold mb-3">Exclusive Features</h3>
              <p className="text-gray-400">
                Access member-only features like advanced scheduling, recurring
                deliveries, and special requests.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="w-12 h-12 bg-otw-red/10 rounded-full flex items-center justify-center mb-6">
                <Star className="w-6 h-6 text-otw-red" />
              </div>
              <h3 className="text-xl font-bold mb-3">Special Events</h3>
              <p className="text-gray-400">
                Get invited to exclusive member events, tastings, and special
                promotions throughout the year.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            What Our Members Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="flex items-center text-otw-gold mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "The Silver membership has paid for itself in just two weeks! I
                use OTW for food delivery almost daily, and the savings on fees
                alone is worth it."
              </p>
              <p className="font-bold">- Michael R.</p>
              <p className="text-sm text-gray-400">Silver Member</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="flex items-center text-otw-gold mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "As a Gold member, I love the unlimited free grocery delivery.
                It's so convenient to have my groceries delivered whenever I
                need them without worrying about fees."
              </p>
              <p className="font-bold">- Jessica T.</p>
              <p className="text-sm text-gray-400">Gold Member</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="flex items-center text-otw-gold mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "The ride tokens that come with my Bronze membership are perfect
                for my needs. I use them for my weekly grocery trips and save a
                ton on transportation costs."
              </p>
              <p className="font-bold">- David L.</p>
              <p className="text-sm text-gray-400">Bronze Member</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">
                How do ride tokens work?
              </h3>
              <p className="text-gray-400">
                Ride tokens are credits you can use for OTW rides. Each token is
                worth up to $10 in ride value. They're automatically applied to
                your account each month and expire at the end of the month if
                unused.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">
                Can I cancel my membership anytime?
              </h3>
              <p className="text-gray-400">
                Yes, you can cancel your membership at any time. Your benefits
                will continue until the end of your current billing cycle.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">
                How do I upgrade my membership?
              </h3>
              <p className="text-gray-400">
                You can upgrade your membership at any time from your account
                settings. The new rate will be prorated for the remainder of
                your billing cycle.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">
                Is there a family plan available?
              </h3>
              <p className="text-gray-400">
                Yes, we offer family plans that allow up to 5 members to share
                benefits under one account. Contact our customer support for
                more information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Join?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start saving today with an OTW Tier Membership. Choose the plan
            that's right for you and enjoy exclusive benefits.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/checkout?plan=bronze">
              <Button size="lg">Join Bronze</Button>
            </Link>
            <Link href="/checkout?plan=silver">
              <Button
                size="lg"
                className="bg-otw-gold text-black hover:bg-otw-gold/90"
              >
                Join Silver
              </Button>
            </Link>
            <Link href="/checkout?plan=gold">
              <Button size="lg">Join Gold</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Star, Clock, MapPin, Utensils, Award, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default function BroskisKitchenPage() {
  return (
    <div className="min-h-screen pb-20 pt-24">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-70 z-10"></div>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/broskis-hero.jpg')" }}
          ></div>
        </div>
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-5xl font-bold mb-4 text-white">
            Broski's Kitchen
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Luxury street gourmet cuisine delivered to your door
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/menu">
              <Button size="lg">View Menu</Button>
            </Link>
            <Link href="/order">
              <Button variant="outline" size="lg">
                Order Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                About Broski's Kitchen
              </h2>
              <p className="text-gray-300 mb-4">
                Broski's Kitchen was founded in 2018 with a simple mission: to
                bring luxury street food to the masses. Our founder, Chef Marcus
                Broski, combined his fine dining background with his love for
                street food to create a unique culinary experience.
              </p>
              <p className="text-gray-300 mb-4">
                We source only the finest ingredients, prepare everything fresh
                daily, and deliver an unforgettable dining experience whether
                you're eating in our restaurant or enjoying our food at home.
              </p>
              <p className="text-gray-300 mb-6">
                Our commitment to quality, innovation, and customer satisfaction
                has made us Fort Wayne's premier destination for gourmet street
                food.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <Star className="text-otw-gold mr-2" />
                  <span>4.8/5 Rating</span>
                </div>
                <div className="flex items-center">
                  <Users className="text-otw-gold mr-2" />
                  <span>10,000+ Happy Customers</span>
                </div>
                <div className="flex items-center">
                  <Award className="text-otw-gold mr-2" />
                  <span>Award-Winning Chef</span>
                </div>
              </div>
            </div>
            <div className="relative h-80 md:h-96 rounded-lg overflow-hidden">
              <Image
                src="/assets/images/broskis.jpg"
                alt="Broski's Kitchen Chef"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Featured Menu Items
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="relative h-48">
                <Image
                  src="/assets/images/lobster-tacos.jpg"
                  alt="Luxury Burger"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold">Luxury Burger</h3>
                  <span className="text-otw-gold font-bold">$18.99</span>
                </div>
                <p className="text-gray-400 mb-4">
                  Wagyu beef, truffle aioli, gold leaf, brioche bun
                </p>
                <div className="flex justify-between">
                  <div className="flex items-center text-otw-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Link href="/menu">
                    <Button variant="outline" size="sm">
                      Order
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="relative h-48">
                <Image
                  src="/assets/images/truffle-fries.jpg"
                  alt="Lobster Tacos"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold">Truffle Fries</h3>
                  <span className="text-otw-gold font-bold">$12.99</span>
                </div>
                <p className="text-gray-400 mb-4">
                  Hand-cut fries, truffle oil, parmesan, herbs
                </p>
                <div className="flex justify-between">
                  <div className="flex items-center text-otw-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Link href="/menu">
                    <Button variant="outline" size="sm">
                      Order
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="relative h-48">
                <Image
                  src="/assets/images/vegan-burger.jpg"
                  alt="Truffle Fries"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold">Truffle Fries</h3>
                  <span className="text-otw-gold font-bold">$12.99</span>
                </div>
                <p className="text-gray-400 mb-4">
                  Hand-cut fries, truffle oil, parmesan, herbs
                </p>
                <div className="flex justify-between">
                  <div className="flex items-center text-otw-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Link href="/menu">
                    <Button variant="outline" size="sm">
                      Order
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/menu">
              <Button size="lg">View Full Menu</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Our Locations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
              <div className="relative h-64">
                <Image
                  src="/assets/images/menu-1.jpg"
                  alt="Downtown Location"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Downtown Fort Wayne</h3>
                <div className="flex items-center mb-2">
                  <MapPin className="text-otw-gold mr-2" />
                  <span>1127 Broadway, Fort Wayne, IN 46802</span>
                </div>
                <div className="flex items-center mb-4">
                  <Clock className="text-otw-gold mr-2" />
                  <span>Open 11am - 10pm Daily</span>
                </div>
                <div className="flex items-center mb-4">
                  <Utensils className="text-otw-gold mr-2" />
                  <span>Dine-in, Takeout, Delivery</span>
                </div>
                <Link href="/locations">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
              <div className="relative h-64">
                <Image
                  src="/assets/images/menu-3.jpg"
                  alt="North Location"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">North Fort Wayne</h3>
                <div className="flex items-center mb-2">
                  <MapPin className="text-otw-gold mr-2" />
                  <span>456 Coliseum Blvd, Fort Wayne, IN 46805</span>
                </div>
                <div className="flex items-center mb-4">
                  <Clock className="text-otw-gold mr-2" />
                  <span>Open 11am - 11pm Daily</span>
                </div>
                <div className="flex items-center mb-4">
                  <Utensils className="text-otw-gold mr-2" />
                  <span>Dine-in, Takeout, Delivery</span>
                </div>
                <Link href="/locations">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/locations">
              <Button size="lg">View All Locations</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            What Our Customers Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center text-otw-gold mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "The Luxury Burger is out of this world! I've never tasted
                anything like it. Worth every penny."
              </p>
              <p className="font-bold">- Sarah J.</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center text-otw-gold mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "Broski's Kitchen has the best delivery service in town. Food
                always arrives hot and fresh!"
              </p>
              <p className="font-bold">- Michael T.</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center text-otw-gold mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "The Lobster Tacos are a must-try! Perfect blend of flavors and
                the presentation is Instagram-worthy."
              </p>
              <p className="font-bold">- Jessica R.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Experience Broski's Kitchen?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Order now and discover why we're Fort Wayne's favorite luxury street
            food destination.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/menu">
              <Button size="lg">View Menu</Button>
            </Link>
            <Link href="/order">
              <Button variant="outline" size="lg">
                Order Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

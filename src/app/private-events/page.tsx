'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock,
  Phone,
  Mail,
  Star,
  CheckCircle,
  Heart,
  Gift,
  Camera,
  Music,
  Utensils,
  Cake,
  PartyPopper,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from '../../components/ui/use-toast';

interface EventPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  guestCount: string;
  features: string[];
  popular?: boolean;
  premium?: boolean;
}

interface EventType {
  id: string;
  name: string;
  icon: any;
  description: string;
  minGuests: number;
  maxGuests: number;
  basePrice: number;
}

const EVENT_PACKAGES: EventPackage[] = [
  {
    id: 'intimate',
    name: 'Intimate Gathering',
    description: 'Perfect for small celebrations with close friends and family',
    price: 299,
    duration: '3 hours',
    guestCount: '10-20 guests',
    features: [
      'Dedicated event coordinator',
      'Custom menu planning',
      'Table setup and decoration',
      'Professional service staff',
      'Basic sound system',
      'Cleanup service'
    ]
  },
  {
    id: 'celebration',
    name: 'Celebration Package',
    description: 'Ideal for birthdays, anniversaries, and milestone events',
    price: 599,
    duration: '4 hours',
    guestCount: '20-50 guests',
    features: [
      'Everything in Intimate package',
      'Enhanced decorations',
      'Photography service (2 hours)',
      'Custom cake or dessert station',
      'Premium sound system',
      'Dance floor setup',
      'Personalized menu cards'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium Experience',
    description: 'Luxury event experience with all the bells and whistles',
    price: 1299,
    duration: '6 hours',
    guestCount: '50-100 guests',
    features: [
      'Everything in Celebration package',
      'Full photography & videography',
      'Live music or DJ service',
      'Premium bar service',
      'Gourmet multi-course menu',
      'Floral arrangements',
      'Valet parking service',
      'Custom lighting design'
    ],
    premium: true
  }
];

const EVENT_TYPES: EventType[] = [
  {
    id: 'birthday',
    name: 'Birthday Parties',
    icon: Cake,
    description: 'Memorable birthday celebrations for all ages',
    minGuests: 10,
    maxGuests: 100,
    basePrice: 25
  },
  {
    id: 'anniversary',
    name: 'Anniversaries',
    icon: Heart,
    description: 'Romantic celebrations for couples',
    minGuests: 10,
    maxGuests: 80,
    basePrice: 30
  },
  {
    id: 'corporate',
    name: 'Corporate Events',
    icon: Users,
    description: 'Professional gatherings and team building',
    minGuests: 20,
    maxGuests: 150,
    basePrice: 35
  },
  {
    id: 'graduation',
    name: 'Graduations',
    icon: Crown,
    description: 'Celebrate academic achievements',
    minGuests: 15,
    maxGuests: 75,
    basePrice: 28
  },
  {
    id: 'baby-shower',
    name: 'Baby Showers',
    icon: Gift,
    description: 'Welcome new arrivals with style',
    minGuests: 10,
    maxGuests: 50,
    basePrice: 25
  },
  {
    id: 'holiday',
    name: 'Holiday Parties',
    icon: PartyPopper,
    description: 'Festive celebrations for any holiday',
    minGuests: 15,
    maxGuests: 100,
    basePrice: 32
  }
];

export default function PrivateEventsPage() {
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    guestCount: '',
    eventType: '',
    packageType: '',
    venue: '',
    budget: '',
    specialRequests: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate API call
    try {
      // In a real app, this would send to your API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Quote Request Submitted!",
        description: "We'll contact you within 24 hours with a custom quote.",
      });
      
      setShowQuoteForm(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        eventDate: '',
        guestCount: '',
        eventType: '',
        packageType: '',
        venue: '',
        budget: '',
        specialRequests: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit quote request. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-otw-black via-otw-black-800 to-otw-black-900">
      {/* Hero Section */}
      <div className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-otw-gold/10 to-transparent" />
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="w-20 h-20 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6">
                <PartyPopper className="w-10 h-10 text-black" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Private <span className="text-otw-gold">Events</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                Create unforgettable memories with our premium private event services. From intimate gatherings to grand celebrations, we handle every detail.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setShowQuoteForm(true)}
                  className="bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold px-8 py-3 rounded-full hover:shadow-lg transition-all duration-300"
                >
                  Get Custom Quote
                </Button>
                <Button variant="outline" className="border-2 border-otw-gold text-otw-gold hover:bg-otw-gold hover:text-black px-8 py-3 rounded-full transition-all duration-300">
                  <Phone className="w-5 h-5 mr-2" />
                  Call (260) 555-EVENTS
                </Button>
              </div>
            </div>
            
            <div className="flex-1 max-w-lg">
              <div className="relative h-80 rounded-2xl overflow-hidden">
                <Image
                  src="/images/events/private-event-hero.jpg"
                  alt="Private Event Setup"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Types */}
      <div className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Event <span className="text-otw-gold">Types</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              We specialize in a variety of private events, each tailored to your unique vision
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EVENT_TYPES.map((eventType) => {
              const IconComponent = eventType.icon;
              return (
                <Card 
                  key={eventType.id} 
                  className={`bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border transition-all duration-300 hover:shadow-2xl hover:shadow-otw-gold/10 cursor-pointer ${
                    selectedEventType === eventType.id 
                      ? 'border-otw-gold/60 shadow-lg shadow-otw-gold/20' 
                      : 'border-otw-gold/20 hover:border-otw-gold/40'
                  }`}
                  onClick={() => setSelectedEventType(eventType.id)}
                >
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-black" />
                    </div>
                    <CardTitle className="text-white">{eventType.name}</CardTitle>
                    <CardDescription className="text-gray-300">
                      {eventType.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex justify-between">
                        <span>Guest Range:</span>
                        <span className="text-otw-gold">{eventType.minGuests}-{eventType.maxGuests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Starting at:</span>
                        <span className="text-otw-gold">${eventType.basePrice}/person</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Packages */}
      <div className="py-16 px-4 bg-gradient-to-r from-otw-gold/5 to-transparent">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Event <span className="text-otw-gold">Packages</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Choose from our curated packages or let us create a custom experience just for you
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {EVENT_PACKAGES.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border transition-all duration-300 hover:shadow-2xl hover:shadow-otw-gold/10 relative ${
                  selectedPackage === pkg.id 
                    ? 'border-otw-gold/60 shadow-lg shadow-otw-gold/20 scale-105' 
                    : 'border-otw-gold/20 hover:border-otw-gold/40'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-red-500 text-white px-4 py-2 text-sm font-semibold">
                      🔥 Most Popular
                    </Badge>
                  </div>
                )}
                {pkg.premium && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm font-semibold">
                      ✨ Premium
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-white mb-2">{pkg.name}</CardTitle>
                  <CardDescription className="text-gray-300 mb-4">
                    {pkg.description}
                  </CardDescription>
                  <div className="text-4xl font-bold text-otw-gold mb-2">
                    ${pkg.price}
                  </div>
                  <div className="text-sm text-gray-400">
                    {pkg.duration} • {pkg.guestCount}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => {
                      setSelectedPackage(pkg.id);
                      setFormData(prev => ({ ...prev, packageType: pkg.name }));
                      setShowQuoteForm(true);
                    }}
                    className={`w-full py-3 rounded-xl transition-all duration-300 ${
                      pkg.premium 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/20'
                        : 'bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold hover:shadow-lg hover:shadow-otw-gold/20'
                    }`}
                  >
                    Select Package
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Services & Features */}
      <div className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Our <span className="text-otw-gold">Services</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Comprehensive event services to make your celebration perfect
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Catering</h3>
              <p className="text-gray-300 text-sm">Custom menus from local restaurants and professional chefs</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Photography</h3>
              <p className="text-gray-300 text-sm">Professional photography and videography services</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Entertainment</h3>
              <p className="text-gray-300 text-sm">DJ services, live music, and entertainment options</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Venue Setup</h3>
              <p className="text-gray-300 text-sm">Complete venue decoration and setup services</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 px-4 bg-gradient-to-r from-otw-gold/5 to-transparent">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Client <span className="text-otw-gold">Testimonials</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  "The team made our anniversary celebration absolutely perfect. Every detail was handled with care and professionalism."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-otw-gold rounded-full flex items-center justify-center">
                    <span className="text-black font-semibold">SM</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Sarah & Mike</p>
                    <p className="text-gray-400 text-sm">25th Anniversary</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  "Our corporate event was a huge success thanks to their attention to detail and seamless execution."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-otw-gold rounded-full flex items-center justify-center">
                    <span className="text-black font-semibold">JD</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Jennifer Davis</p>
                    <p className="text-gray-400 text-sm">Corporate Event</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  "They turned our daughter's graduation party into an unforgettable celebration. Highly recommended!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-otw-gold rounded-full flex items-center justify-center">
                    <span className="text-black font-semibold">RT</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Robert Thompson</p>
                    <p className="text-gray-400 text-sm">Graduation Party</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Quote Form Modal */}
      {showQuoteForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-gradient-to-br from-otw-black-800 to-otw-black-900 border border-otw-gold/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Get Custom Quote</span>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowQuoteForm(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </CardTitle>
              <CardDescription className="text-gray-300">
                Tell us about your event and we'll create a custom quote for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitQuote} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">Full Name *</label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="bg-otw-black-800 border-otw-gold/30 text-white"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Email *</label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-otw-black-800 border-otw-gold/30 text-white"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">Phone Number *</label>
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="bg-otw-black-800 border-otw-gold/30 text-white"
                      placeholder="(260) 555-0123"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Event Date *</label>
                    <Input
                      name="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      required
                      className="bg-otw-black-800 border-otw-gold/30 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">Guest Count *</label>
                    <Input
                      name="guestCount"
                      type="number"
                      value={formData.guestCount}
                      onChange={handleInputChange}
                      required
                      className="bg-otw-black-800 border-otw-gold/30 text-white"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Budget Range</label>
                    <Input
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="bg-otw-black-800 border-otw-gold/30 text-white"
                      placeholder="$500 - $1000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2">Venue Location</label>
                  <Input
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    className="bg-otw-black-800 border-otw-gold/30 text-white"
                    placeholder="Your venue or 'Need venue recommendation'"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Special Requests</label>
                  <Textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    className="bg-otw-black-800 border-otw-gold/30 text-white"
                    placeholder="Any special requirements, dietary restrictions, themes, etc."
                    rows={4}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowQuoteForm(false)}
                    className="flex-1 border-otw-gold/30 text-otw-gold hover:bg-otw-gold/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold"
                  >
                    Submit Quote Request
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CTA Section */}
      <div className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Plan Your <span className="text-otw-gold">Event</span>?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Let our experienced team create an unforgettable experience for you and your guests.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowQuoteForm(true)}
              className="bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold px-8 py-3 rounded-full hover:shadow-lg transition-all duration-300"
            >
              Get Started Today
            </Button>
            <Link href="/catering">
              <Button variant="outline" className="border-2 border-otw-gold text-otw-gold hover:bg-otw-gold hover:text-black px-8 py-3 rounded-full transition-all duration-300">
                View Catering Options
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
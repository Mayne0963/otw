'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Heart, 
  Users, 
  Clock, 
  MapPin, 
  Star,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  Award,
  Truck,
  Package,
  Coffee
} from 'lucide-react';
import { toast } from '../../components/ui/use-toast';

interface VolunteerApplication {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  availability: string[];
  interests: string[];
  experience: string;
  motivation: string;
  emergencyContact: string;
  emergencyPhone: string;
}

const VOLUNTEER_OPPORTUNITIES = [
  {
    id: 'delivery',
    title: 'Delivery Volunteer',
    description: 'Help deliver food and groceries to community members',
    icon: Truck,
    timeCommitment: '4-8 hours/week',
    requirements: ['Valid driver\'s license', 'Reliable vehicle', 'Background check'],
    benefits: ['Flexible schedule', 'Mileage reimbursement', 'Community impact']
  },
  {
    id: 'packing',
    title: 'Order Packing',
    description: 'Assist with organizing and packing orders at our fulfillment center',
    icon: Package,
    timeCommitment: '3-6 hours/week',
    requirements: ['Ability to lift 25lbs', 'Attention to detail', 'Team player'],
    benefits: ['Indoor work', 'Team environment', 'Skill development']
  },
  {
    id: 'events',
    title: 'Event Support',
    description: 'Help with community events, fundraisers, and special initiatives',
    icon: Calendar,
    timeCommitment: '2-4 hours/event',
    requirements: ['Good communication skills', 'Enthusiasm', 'Reliability'],
    benefits: ['Networking opportunities', 'Event planning experience', 'Fun environment']
  },
  {
    id: 'customer-service',
    title: 'Customer Support',
    description: 'Provide assistance to customers via phone, chat, or in-person',
    icon: Coffee,
    timeCommitment: '4-6 hours/week',
    requirements: ['Excellent communication', 'Problem-solving skills', 'Patience'],
    benefits: ['Customer service experience', 'Flexible remote options', 'Training provided']
  }
];

const AVAILABILITY_OPTIONS = [
  'Monday Morning',
  'Monday Afternoon',
  'Monday Evening',
  'Tuesday Morning',
  'Tuesday Afternoon',
  'Tuesday Evening',
  'Wednesday Morning',
  'Wednesday Afternoon',
  'Wednesday Evening',
  'Thursday Morning',
  'Thursday Afternoon',
  'Thursday Evening',
  'Friday Morning',
  'Friday Afternoon',
  'Friday Evening',
  'Saturday Morning',
  'Saturday Afternoon',
  'Saturday Evening',
  'Sunday Morning',
  'Sunday Afternoon',
  'Sunday Evening'
];

export default function VolunteersPage() {
  const [application, setApplication] = useState<VolunteerApplication>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    availability: [],
    interests: [],
    experience: '',
    motivation: '',
    emergencyContact: '',
    emergencyPhone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApplication, setShowApplication] = useState(false);

  const handleInputChange = (field: keyof VolunteerApplication, value: string) => {
    setApplication(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'availability' | 'interests', value: string, checked: boolean) => {
    setApplication(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest in volunteering. We'll be in touch soon!",
      });
      
      // Reset form
      setApplication({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        availability: [],
        interests: [],
        experience: '',
        motivation: '',
        emergencyContact: '',
        emergencyPhone: ''
      });
      setShowApplication(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-otw-black via-otw-black-800 to-otw-black-900">
      {/* Hero Section */}
      <div className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-otw-gold/10 to-transparent" />
        <div className="container mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full">
              <Heart className="w-12 h-12 text-black" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Volunteer with <span className="text-otw-gold">OTW</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join our community of volunteers and make a real difference in Fort Wayne. 
            Help us deliver food, support events, and build stronger communities together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setShowApplication(true)}
              className="bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold px-8 py-4 rounded-full text-lg hover:shadow-lg transition-all duration-300"
            >
              Apply to Volunteer
            </Button>
            <Button
              variant="outline"
              className="border-2 border-otw-gold text-otw-gold hover:bg-otw-gold hover:text-black px-8 py-4 rounded-full text-lg transition-all duration-300"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-otw-gold mb-2">500+</div>
              <div className="text-gray-300">Active Volunteers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-otw-gold mb-2">10K+</div>
              <div className="text-gray-300">Deliveries Made</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-otw-gold mb-2">50+</div>
              <div className="text-gray-300">Events Supported</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-otw-gold mb-2">95%</div>
              <div className="text-gray-300">Volunteer Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Volunteer Opportunities */}
      <div className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Volunteer <span className="text-otw-gold">Opportunities</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose from various volunteer roles that match your interests, skills, and availability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {VOLUNTEER_OPPORTUNITIES.map((opportunity) => {
              const Icon = opportunity.icon;
              return (
                <Card key={opportunity.id} className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20 hover:border-otw-gold/40 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full">
                        <Icon className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-xl">{opportunity.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">{opportunity.timeCommitment}</span>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-gray-300 text-base">
                      {opportunity.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white font-semibold mb-2">Requirements:</h4>
                        <ul className="space-y-1">
                          {opportunity.requirements.map((req, index) => (
                            <li key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-2">Benefits:</h4>
                        <ul className="space-y-1">
                          {opportunity.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                              <Star className="w-4 h-4 text-otw-gold" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 px-4 bg-gradient-to-r from-otw-gold/5 to-transparent">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Volunteer <span className="text-otw-gold">Stories</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Sarah M.</h4>
                    <p className="text-gray-400 text-sm">Delivery Volunteer</p>
                  </div>
                </div>
                <p className="text-gray-300 italic">
                  "Volunteering with OTW has been incredibly rewarding. I love being able to help 
                  families in my community while meeting amazing people along the way."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Mike R.</h4>
                    <p className="text-gray-400 text-sm">Event Support</p>
                  </div>
                </div>
                <p className="text-gray-300 italic">
                  "The events team is like a family. We work together to create memorable experiences 
                  for the community, and I've gained valuable event planning skills."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Lisa K.</h4>
                    <p className="text-gray-400 text-sm">Customer Support</p>
                  </div>
                </div>
                <p className="text-gray-300 italic">
                  "Helping customers solve their problems and seeing their satisfaction makes every 
                  shift worthwhile. The flexible schedule works perfectly with my studies."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-otw-black-800 to-otw-black-900 rounded-2xl border border-otw-gold/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Volunteer Application</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowApplication(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-white">First Name *</Label>
                    <Input
                      id="firstName"
                      value={application.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                      className="bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-white">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={application.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                      className="bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-white">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={application.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-white">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={application.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                      className="bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-white">Address *</Label>
                  <Input
                    id="address"
                    value={application.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                    className="bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="dateOfBirth" className="text-white">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={application.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    required
                    className="bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>

                {/* Availability */}
                <div>
                  <Label className="text-white mb-3 block">Availability (select all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                    {AVAILABILITY_OPTIONS.map((time) => (
                      <label key={time} className="flex items-center gap-2 text-gray-300 text-sm">
                        <input
                          type="checkbox"
                          checked={application.availability.includes(time)}
                          onChange={(e) => handleArrayChange('availability', time, e.target.checked)}
                          className="rounded border-gray-700 bg-gray-800/50"
                        />
                        {time}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <Label className="text-white mb-3 block">Areas of Interest (select all that apply)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {VOLUNTEER_OPPORTUNITIES.map((opportunity) => (
                      <label key={opportunity.id} className="flex items-center gap-2 text-gray-300">
                        <input
                          type="checkbox"
                          checked={application.interests.includes(opportunity.id)}
                          onChange={(e) => handleArrayChange('interests', opportunity.id, e.target.checked)}
                          className="rounded border-gray-700 bg-gray-800/50"
                        />
                        {opportunity.title}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <Label htmlFor="experience" className="text-white">Previous Volunteer Experience</Label>
                  <Textarea
                    id="experience"
                    value={application.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="Tell us about any previous volunteer work or relevant experience..."
                    className="bg-gray-800/50 border-gray-700 text-white"
                    rows={3}
                  />
                </div>

                {/* Motivation */}
                <div>
                  <Label htmlFor="motivation" className="text-white">Why do you want to volunteer with OTW? *</Label>
                  <Textarea
                    id="motivation"
                    value={application.motivation}
                    onChange={(e) => handleInputChange('motivation', e.target.value)}
                    required
                    placeholder="Share your motivation for volunteering with us..."
                    className="bg-gray-800/50 border-gray-700 text-white"
                    rows={3}
                  />
                </div>

                {/* Emergency Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContact" className="text-white">Emergency Contact Name *</Label>
                    <Input
                      id="emergencyContact"
                      value={application.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      required
                      className="bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone" className="text-white">Emergency Contact Phone *</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={application.emergencyPhone}
                      onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                      required
                      className="bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowApplication(false)}
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Questions About Volunteering?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Our volunteer coordinator is here to help answer any questions you might have
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex items-center gap-2 text-gray-300">
              <Phone className="w-5 h-5 text-otw-gold" />
              <span>(260) 555-VOLUNTEER</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Mail className="w-5 h-5 text-otw-gold" />
              <span>volunteers@otw.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  FileText,
  Scale,
  Shield,
  Users,
  CreditCard,
  Truck,
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Download,
  Print
} from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  const lastUpdated = "January 15, 2024";
  const effectiveDate = "January 1, 2024";

  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: FileText,
      content: [
        'By accessing and using the OTW platform, you accept and agree to be bound by the terms and provision of this agreement.',
        'If you do not agree to abide by the above, please do not use this service.',
        'These Terms of Service constitute a legally binding agreement between you and OTW.'
      ]
    },
    {
      id: 'definitions',
      title: 'Definitions',
      icon: Users,
      content: [
        '"Service" refers to the OTW platform, including all websites, mobile applications, and related services.',
        '"User" refers to any individual who accesses or uses our Service.',
        '"Driver" refers to independent contractors who provide delivery services through our platform.',
        '"Restaurant Partner" refers to food establishments that offer their services through our platform.',
        '"Order" refers to a request for food delivery or pickup placed through our Service.'
      ]
    },
    {
      id: 'eligibility',
      title: 'User Eligibility',
      icon: Shield,
      content: [
        'You must be at least 18 years old to use our Service.',
        'You must provide accurate, current, and complete information during registration.',
        'You are responsible for maintaining the confidentiality of your account credentials.',
        'You may not use our Service if you have been previously banned or suspended.',
        'Commercial use of the Service requires prior written consent from OTW.'
      ]
    },
    {
      id: 'orders',
      title: 'Orders and Payments',
      icon: CreditCard,
      content: [
        'All orders are subject to acceptance by the restaurant and availability of delivery drivers.',
        'Prices are set by restaurant partners and may vary from in-store prices.',
        'Payment is processed at the time of order placement.',
        'Delivery fees, service fees, and taxes are additional to menu prices.',
        'Tips for drivers are optional but encouraged.',
        'Refunds are processed according to our refund policy outlined below.'
      ]
    },
    {
      id: 'delivery',
      title: 'Delivery Services',
      icon: Truck,
      content: [
        'Delivery times are estimates and may vary due to weather, traffic, or high demand.',
        'You must be available to receive your order at the specified delivery address.',
        'OTW is not responsible for orders that cannot be delivered due to incorrect address information.',
        'Special delivery instructions should be clearly specified in your order.',
        'Drivers have the right to refuse delivery to unsafe locations or intoxicated customers.'
      ]
    },
    {
      id: 'refunds',
      title: 'Refunds and Cancellations',
      icon: AlertTriangle,
      content: [
        'Orders may be cancelled within 2 minutes of placement for a full refund.',
        'Refunds for quality issues must be reported within 24 hours of delivery.',
        'Missing items will be refunded or replaced at our discretion.',
        'Refunds are processed to the original payment method within 3-5 business days.',
        'Repeated refund requests may result in account suspension.',
        'Restaurant partners are responsible for food quality and preparation.'
      ]
    },
    {
      id: 'prohibited',
      title: 'Prohibited Uses',
      icon: Scale,
      content: [
        'You may not use our Service for any unlawful purpose or to solicit others to perform unlawful acts.',
        'You may not violate any international, federal, provincial, or state regulations, rules, or laws.',
        'You may not transmit any worms, viruses, or any code of a destructive nature.',
        'You may not infringe upon or violate our intellectual property rights or the intellectual property rights of others.',
        'You may not harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate.',
        'You may not submit false or misleading information.'
      ]
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      icon: Shield,
      content: [
        'OTW acts as an intermediary between customers, restaurants, and drivers.',
        'We are not responsible for the quality, safety, or preparation of food items.',
        'Our liability is limited to the amount paid for the specific order in question.',
        'We are not liable for indirect, incidental, special, consequential, or punitive damages.',
        'Some jurisdictions do not allow the exclusion of certain warranties or the limitation of liability for consequential damages.'
      ]
    },
    {
      id: 'intellectual',
      title: 'Intellectual Property',
      icon: FileText,
      content: [
        'The Service and its original content, features, and functionality are owned by OTW.',
        'The Service is protected by copyright, trademark, and other laws.',
        'Our trademarks and trade dress may not be used without our prior written consent.',
        'You retain ownership of content you submit, but grant us a license to use it.',
        'You may not reproduce, distribute, or create derivative works without permission.'
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: Shield,
      content: [
        'Your privacy is important to us. Please review our Privacy Policy.',
        'By using our Service, you agree to the collection and use of information in accordance with our Privacy Policy.',
        'We implement appropriate security measures to protect your personal information.',
        'We do not sell, trade, or rent your personal information to third parties.',
        'You have the right to access, update, or delete your personal information.'
      ]
    },
    {
      id: 'termination',
      title: 'Termination',
      icon: AlertTriangle,
      content: [
        'We may terminate or suspend your account immediately for any breach of these Terms.',
        'Upon termination, your right to use the Service will cease immediately.',
        'You may terminate your account at any time by contacting customer support.',
        'All provisions which by their nature should survive termination shall survive.',
        'Termination does not relieve you of any obligations incurred prior to termination.'
      ]
    },
    {
      id: 'changes',
      title: 'Changes to Terms',
      icon: Clock,
      content: [
        'We reserve the right to modify these terms at any time.',
        'Changes will be effective immediately upon posting on this page.',
        'Your continued use of the Service after changes constitutes acceptance.',
        'We will notify users of significant changes via email or in-app notification.',
        'It is your responsibility to review these terms periodically.'
      ]
    },
    {
      id: 'governing',
      title: 'Governing Law',
      icon: Scale,
      content: [
        'These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which OTW operates.',
        'Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in that jurisdiction.',
        'If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in effect.',
        'These Terms constitute the entire agreement between you and OTW regarding the Service.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-otw-black via-otw-black-800 to-otw-black-900">
      {/* Hero Section */}
      <div className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-otw-gold/10 to-transparent" />
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Scale className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Terms of <span className="text-otw-gold">Service</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Please read these Terms of Service carefully before using the OTW platform. By using our service, you agree to these terms.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Badge className="bg-otw-gold/20 text-otw-gold border-otw-gold/30 px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                Last Updated: {lastUpdated}
              </Badge>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2">
                <FileText className="w-4 h-4 mr-2" />
                Effective: {effectiveDate}
              </Badge>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold px-6 py-3 rounded-full hover:shadow-lg transition-all duration-300">
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="border-2 border-otw-gold text-otw-gold hover:bg-otw-gold hover:text-black px-6 py-3 rounded-full transition-all duration-300">
                <Print className="w-5 h-5 mr-2" />
                Print Terms
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="py-16 px-4 bg-gradient-to-r from-otw-gold/5 to-transparent">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Quick <span className="text-otw-gold">Navigation</span>
            </h2>
            <p className="text-gray-300">Jump to specific sections</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="group p-4 bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20 hover:border-otw-gold/40 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-otw-gold/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-4 h-4 text-black" />
                    </div>
                    <span className="text-white text-sm font-medium group-hover:text-otw-gold transition-colors duration-300">
                      {section.title}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Terms Content */}
      <div className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-12">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <Card 
                  key={section.id} 
                  id={section.id}
                  className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20 hover:border-otw-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-otw-gold/10"
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-black" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-white text-2xl">
                          {index + 1}. {section.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {section.content.map((paragraph, pIndex) => (
                        <p key={pIndex} className="text-gray-300 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="py-16 px-4 bg-gradient-to-r from-otw-gold/5 to-transparent">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Questions About These <span className="text-otw-gold">Terms</span>?
            </h2>
            <p className="text-gray-300">Contact us if you have any questions or concerns</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20 hover:border-otw-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-otw-gold/10">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-white font-semibold mb-2">Email Support</h3>
                <p className="text-gray-300 text-sm mb-4">Get help via email</p>
                <a href="mailto:legal@otw.com" className="text-otw-gold hover:underline">
                  legal@otw.com
                </a>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20 hover:border-otw-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-otw-gold/10">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-white font-semibold mb-2">Phone Support</h3>
                <p className="text-gray-300 text-sm mb-4">Speak with our legal team</p>
                <a href="tel:1-800-OTW-LEGAL" className="text-otw-gold hover:underline">
                  1-800-OTW-LEGAL
                </a>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20 hover:border-otw-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-otw-gold/10">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-white font-semibold mb-2">Mailing Address</h3>
                <p className="text-gray-300 text-sm mb-4">Send us mail</p>
                <div className="text-otw-gold text-sm">
                  <p>OTW Legal Department</p>
                  <p>123 Food Street</p>
                  <p>Delivery City, DC 12345</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Related Links */}
      <div className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Related <span className="text-otw-gold">Documents</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/privacy-policy">
              <Button className="bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold px-8 py-3 rounded-full hover:shadow-lg transition-all duration-300">
                <Shield className="w-5 h-5 mr-2" />
                Privacy Policy
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="outline" className="border-2 border-otw-gold text-otw-gold hover:bg-otw-gold hover:text-black px-8 py-3 rounded-full transition-all duration-300">
                <ExternalLink className="w-5 h-5 mr-2" />
                Help Center
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
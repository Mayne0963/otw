'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Shield,
  Eye,
  Lock,
  Database,
  Share2,
  Cookie,
  UserCheck,
  Baby,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Download,
  Printer,
  AlertTriangle,
  Clock,
  Globe,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  const lastUpdated = "January 15, 2024";
  const effectiveDate = "January 1, 2024";

  const sections = [
    {
      id: 'overview',
      title: 'Privacy Overview',
      icon: Shield,
      content: [
        'At OTW, we are committed to protecting your privacy and ensuring the security of your personal information.',
        'This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.',
        'By using our Service, you consent to the data practices described in this policy.',
        'We encourage you to read this policy carefully and contact us if you have any questions.'
      ]
    },
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: Database,
      content: [
        'Personal Information: Name, email address, phone number, delivery address, and payment information.',
        'Account Information: Username, password, profile preferences, and order history.',
        'Location Data: GPS coordinates and delivery addresses to facilitate order delivery.',
        'Device Information: Device type, operating system, browser type, and IP address.',
        'Usage Data: How you interact with our platform, including pages visited and features used.',
        'Communication Data: Messages, reviews, and feedback you provide through our platform.'
      ]
    },
    {
      id: 'how-we-use',
      title: 'How We Use Your Information',
      icon: Settings,
      content: [
        'To process and fulfill your food delivery orders.',
        'To communicate with you about your orders, account, and our services.',
        'To improve our platform and develop new features.',
        'To personalize your experience and provide relevant recommendations.',
        'To prevent fraud and ensure the security of our platform.',
        'To comply with legal obligations and resolve disputes.',
        'To send you marketing communications (with your consent).'
      ]
    },
    {
      id: 'information-sharing',
      title: 'Information Sharing',
      icon: Share2,
      content: [
        'Restaurant Partners: We share order details with restaurants to fulfill your orders.',
        'Delivery Drivers: We share delivery information necessary to complete your order.',
        'Payment Processors: We share payment information with secure payment processing services.',
        'Service Providers: We may share information with trusted third-party service providers.',
        'Legal Requirements: We may disclose information when required by law or to protect our rights.',
        'Business Transfers: Information may be transferred in connection with mergers or acquisitions.',
        'We do not sell your personal information to third parties for marketing purposes.'
      ]
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: Lock,
      content: [
        'We implement industry-standard security measures to protect your personal information.',
        'All payment information is encrypted using SSL technology.',
        'We regularly monitor our systems for potential vulnerabilities and attacks.',
        'Access to personal information is restricted to authorized personnel only.',
        'We conduct regular security audits and assessments.',
        'In the event of a data breach, we will notify affected users promptly.',
        'However, no method of transmission over the internet is 100% secure.'
      ]
    },
    {
      id: 'cookies',
      title: 'Cookies and Tracking',
      icon: Cookie,
      content: [
        'We use cookies and similar technologies to enhance your experience on our platform.',
        'Essential cookies are necessary for the platform to function properly.',
        'Analytics cookies help us understand how users interact with our platform.',
        'Marketing cookies are used to deliver relevant advertisements.',
        'You can control cookie preferences through your browser settings.',
        'Disabling certain cookies may limit the functionality of our platform.',
        'We also use web beacons and pixel tags for analytics and marketing purposes.'
      ]
    },
    {
      id: 'user-rights',
      title: 'Your Rights and Choices',
      icon: UserCheck,
      content: [
        'Access: You can request access to the personal information we hold about you.',
        'Correction: You can request correction of inaccurate or incomplete information.',
        'Deletion: You can request deletion of your personal information, subject to certain exceptions.',
        'Portability: You can request a copy of your data in a structured, machine-readable format.',
        'Opt-out: You can opt out of marketing communications at any time.',
        'Location Services: You can disable location tracking through your device settings.',
        'Account Deletion: You can delete your account through the app or by contacting support.'
      ]
    },
    {
      id: 'data-retention',
      title: 'Data Retention',
      icon: Clock,
      content: [
        'We retain personal information for as long as necessary to provide our services.',
        'Account information is retained until you delete your account.',
        'Order history is retained for 7 years for business and legal purposes.',
        'Payment information is retained according to payment processor requirements.',
        'Marketing data is retained until you opt out of communications.',
        'Some information may be retained longer if required by law.',
        'We regularly review and delete information that is no longer necessary.'
      ]
    },
    {
      id: 'international',
      title: 'International Transfers',
      icon: Globe,
      content: [
        'Your information may be transferred to and processed in countries other than your own.',
        'We ensure appropriate safeguards are in place for international transfers.',
        'We comply with applicable data protection laws in all jurisdictions where we operate.',
        'Standard contractual clauses are used to protect data transferred outside the EU.',
        'You consent to the transfer of your information to countries with different privacy laws.',
        'We will notify you of any significant changes to our international transfer practices.'
      ]
    },
    {
      id: 'children',
      title: "Children's Privacy",
      icon: Baby,
      content: [
        'Our Service is not intended for children under the age of 13.',
        'We do not knowingly collect personal information from children under 13.',
        'If we become aware that we have collected information from a child under 13, we will delete it.',
        'Parents or guardians who believe their child has provided information should contact us.',
        'Users between 13 and 18 should have parental consent before using our Service.',
        'We encourage parents to monitor their children\'s online activities.'
      ]
    },
    {
      id: 'third-party',
      title: 'Third-Party Services',
      icon: ExternalLink,
      content: [
        'Our platform may contain links to third-party websites and services.',
        'This Privacy Policy does not apply to third-party websites or services.',
        'We are not responsible for the privacy practices of third-party services.',
        'We encourage you to read the privacy policies of any third-party services you use.',
        'Social media plugins may collect information about your visit to our platform.',
        'Third-party analytics services help us understand platform usage.'
      ]
    },
    {
      id: 'california',
      title: 'California Privacy Rights',
      icon: AlertTriangle,
      content: [
        'California residents have additional rights under the California Consumer Privacy Act (CCPA).',
        'You have the right to know what personal information we collect and how it is used.',
        'You have the right to delete personal information we have collected about you.',
        'You have the right to opt out of the sale of personal information (we do not sell personal information).',
        'You have the right to non-discrimination for exercising your privacy rights.',
        'To exercise these rights, please contact us using the information provided below.'
      ]
    },
    {
      id: 'changes',
      title: 'Changes to This Policy',
      icon: Settings,
      content: [
        'We may update this Privacy Policy from time to time to reflect changes in our practices.',
        'We will notify you of any material changes by posting the new policy on this page.',
        'We will also notify you via email or in-app notification for significant changes.',
        'Your continued use of our Service after changes constitutes acceptance of the new policy.',
        'We encourage you to review this policy periodically for any updates.',
        'The "Last Updated" date at the top of this policy indicates when it was last revised.'
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
              <Shield className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Privacy <span className="text-otw-gold">Policy</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Badge className="bg-otw-gold/20 text-otw-gold border-otw-gold/30 px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                Last Updated: {lastUpdated}
              </Badge>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                Effective: {effectiveDate}
              </Badge>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold px-6 py-3 rounded-full hover:shadow-lg transition-all duration-300">
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="border-2 border-otw-gold text-otw-gold hover:bg-otw-gold hover:text-black px-6 py-3 rounded-full transition-all duration-300">
                <Printer className="w-5 h-5 mr-2" />
                Print Policy
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

      {/* Privacy Content */}
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

      {/* Data Rights Section */}
      <div className="py-16 px-4 bg-gradient-to-r from-otw-gold/5 to-transparent">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Exercise Your <span className="text-otw-gold">Rights</span>
            </h2>
            <p className="text-gray-300">Manage your privacy preferences and data</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20 hover:border-otw-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-otw-gold/10">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-white font-semibold mb-2">Access Data</h3>
                <p className="text-gray-300 text-sm mb-4">Request a copy of your data</p>
                <Button className="w-full bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold">
                  Request Data
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20 hover:border-otw-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-otw-gold/10">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-white font-semibold mb-2">Update Info</h3>
                <p className="text-gray-300 text-sm mb-4">Correct your information</p>
                <Button className="w-full bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold">
                  Update Data
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20 hover:border-otw-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-otw-gold/10">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-white font-semibold mb-2">Delete Data</h3>
                <p className="text-gray-300 text-sm mb-4">Request data deletion</p>
                <Button className="w-full bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold">
                  Delete Data
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20 hover:border-otw-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-otw-gold/10">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Cookie className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-white font-semibold mb-2">Cookie Settings</h3>
                <p className="text-gray-300 text-sm mb-4">Manage cookie preferences</p>
                <Button className="w-full bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold">
                  Manage Cookies
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Privacy <span className="text-otw-gold">Questions</span>?
            </h2>
            <p className="text-gray-300">Contact our privacy team for any concerns</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20 hover:border-otw-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-otw-gold/10">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-white font-semibold mb-2">Email Privacy Team</h3>
                <p className="text-gray-300 text-sm mb-4">Get privacy support via email</p>
                <a href="mailto:privacy@otw.com" className="text-otw-gold hover:underline">
                  privacy@otw.com
                </a>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20 hover:border-otw-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-otw-gold/10">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-white font-semibold mb-2">Privacy Hotline</h3>
                <p className="text-gray-300 text-sm mb-4">Speak with privacy experts</p>
                <a href="tel:1-800-OTW-PRIVACY" className="text-otw-gold hover:underline">
                  1-800-OTW-PRIVACY
                </a>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20 hover:border-otw-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-otw-gold/10">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-white font-semibold mb-2">Privacy Office</h3>
                <p className="text-gray-300 text-sm mb-4">Send privacy inquiries</p>
                <div className="text-otw-gold text-sm">
                  <p>OTW Privacy Office</p>
                  <p>123 Privacy Street</p>
                  <p>Secure City, SC 12345</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Related Links */}
      <div className="py-16 px-4 bg-gradient-to-r from-otw-gold/5 to-transparent">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Related <span className="text-otw-gold">Documents</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/terms">
              <Button className="bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold px-8 py-3 rounded-full hover:shadow-lg transition-all duration-300">
                <Shield className="w-5 h-5 mr-2" />
                Terms of Service
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
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Shield,
  Lock,
  Eye,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Database,
  Globe,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'December 15, 2024';

  return (
    <div className="min-h-screen bg-gradient-to-br from-otw-black via-otw-black-800 to-otw-black-900">
      {/* Hero Section */}
      <div className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-otw-gold/10 to-transparent" />
        <div className="container mx-auto relative z-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Privacy <span className="text-otw-gold">Policy</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
          </p>
          <Badge className="bg-otw-gold/20 text-otw-gold border border-otw-gold/30 px-4 py-2">
            <Calendar className="w-4 h-4 mr-2" />
            Last Updated: {lastUpdated}
          </Badge>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="py-8 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-otw-gold" />
                Quick Navigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a href="#information-collection" className="text-otw-gold hover:text-yellow-400 transition-colors">
                  Information Collection
                </a>
                <a href="#data-usage" className="text-otw-gold hover:text-yellow-400 transition-colors">
                  How We Use Data
                </a>
                <a href="#data-sharing" className="text-otw-gold hover:text-yellow-400 transition-colors">
                  Data Sharing
                </a>
                <a href="#data-security" className="text-otw-gold hover:text-yellow-400 transition-colors">
                  Data Security
                </a>
                <a href="#cookies" className="text-otw-gold hover:text-yellow-400 transition-colors">
                  Cookies & Tracking
                </a>
                <a href="#user-rights" className="text-otw-gold hover:text-yellow-400 transition-colors">
                  Your Rights
                </a>
                <a href="#children" className="text-otw-gold hover:text-yellow-400 transition-colors">
                  Children's Privacy
                </a>
                <a href="#contact" className="text-otw-gold hover:text-yellow-400 transition-colors">
                  Contact Us
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16 px-4">
        <div className="container mx-auto max-w-4xl space-y-12">

          {/* Information We Collect */}
          <section id="information-collection">
            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-6 h-6 text-otw-gold" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Personal Information</h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Name, email address, and phone number</li>
                    <li>Delivery addresses and location data</li>
                    <li>Payment information (processed securely through third-party providers)</li>
                    <li>Account preferences and settings</li>
                    <li>Profile photos and user-generated content</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Usage Information</h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Order history and preferences</li>
                    <li>App usage patterns and interactions</li>
                    <li>Device information and IP addresses</li>
                    <li>Location data when using our services</li>
                    <li>Communication records with customer support</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Automatically Collected Data</h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Cookies and similar tracking technologies</li>
                    <li>Log files and analytics data</li>
                    <li>Performance and error reporting</li>
                    <li>Marketing campaign effectiveness</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* How We Use Your Data */}
          <section id="data-usage">
            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-6 h-6 text-otw-gold" />
                  How We Use Your Data
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Service Delivery</h3>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Process and fulfill your orders</li>
                      <li>Coordinate delivery services</li>
                      <li>Provide customer support</li>
                      <li>Send order updates and notifications</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Personalization</h3>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Customize your app experience</li>
                      <li>Recommend restaurants and items</li>
                      <li>Remember your preferences</li>
                      <li>Provide relevant promotions</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Business Operations</h3>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Improve our services and features</li>
                      <li>Conduct analytics and research</li>
                      <li>Prevent fraud and abuse</li>
                      <li>Comply with legal obligations</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Communication</h3>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Send promotional emails (with consent)</li>
                      <li>Provide customer service</li>
                      <li>Share important updates</li>
                      <li>Respond to your inquiries</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Data Sharing */}
          <section id="data-sharing">
            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-otw-gold" />
                  When We Share Your Data
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-6">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <span className="font-semibold text-yellow-400">Important Note</span>
                  </div>
                  <p className="text-gray-300">
                    We never sell your personal information to third parties. We only share data as described below.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Service Partners</h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Restaurants and stores to fulfill your orders</li>
                    <li>Delivery drivers to complete deliveries</li>
                    <li>Payment processors for secure transactions</li>
                    <li>Technology providers for app functionality</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Legal Requirements</h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>When required by law or legal process</li>
                    <li>To protect our rights and property</li>
                    <li>To ensure user safety and security</li>
                    <li>In connection with business transfers</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">With Your Consent</h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Marketing partners (only with explicit consent)</li>
                    <li>Social media integrations you choose to use</li>
                    <li>Third-party services you connect to your account</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Data Security */}
          <section id="data-security">
            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="w-6 h-6 text-otw-gold" />
                  Data Security
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-6">
                <p className="text-lg">
                  We implement industry-standard security measures to protect your personal information:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Technical Safeguards</h3>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>SSL/TLS encryption for data transmission</li>
                      <li>Encrypted data storage</li>
                      <li>Regular security audits and testing</li>
                      <li>Secure payment processing</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Operational Safeguards</h3>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Limited access to personal data</li>
                      <li>Employee training on data protection</li>
                      <li>Regular backup and recovery procedures</li>
                      <li>Incident response protocols</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-gray-300">
                    <strong className="text-blue-400">Data Retention:</strong> We retain your personal information only as long as necessary to provide our services and comply with legal obligations. You can request deletion of your account and data at any time.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Cookies & Tracking */}
          <section id="cookies">
            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="w-6 h-6 text-otw-gold" />
                  Cookies & Tracking Technologies
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-6">
                <p>
                  We use cookies and similar technologies to enhance your experience and analyze usage patterns.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Essential Cookies</h3>
                    <p className="text-sm">Required for basic app functionality, security, and user authentication.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Analytics Cookies</h3>
                    <p className="text-sm">Help us understand how users interact with our app to improve performance.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Marketing Cookies</h3>
                    <p className="text-sm">Used to deliver relevant advertisements and measure campaign effectiveness.</p>
                  </div>
                </div>

                <p className="text-sm">
                  You can manage your cookie preferences through your browser settings or our cookie consent banner.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Your Rights */}
          <section id="user-rights">
            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-6 h-6 text-otw-gold" />
                  Your Privacy Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-6">
                <p>
                  You have several rights regarding your personal information:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Access & Portability</h3>
                    <ul className="space-y-2 list-disc list-inside text-sm">
                      <li>Request a copy of your personal data</li>
                      <li>Download your data in a portable format</li>
                      <li>View your account information anytime</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Control & Correction</h3>
                    <ul className="space-y-2 list-disc list-inside text-sm">
                      <li>Update or correct your information</li>
                      <li>Delete your account and data</li>
                      <li>Opt-out of marketing communications</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Restriction & Objection</h3>
                    <ul className="space-y-2 list-disc list-inside text-sm">
                      <li>Restrict processing of your data</li>
                      <li>Object to certain data uses</li>
                      <li>Withdraw consent at any time</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Complaints</h3>
                    <ul className="space-y-2 list-disc list-inside text-sm">
                      <li>File complaints with data protection authorities</li>
                      <li>Contact our privacy team directly</li>
                      <li>Request privacy impact assessments</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Children's Privacy */}
          <section id="children">
            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-otw-gold" />
                  Children's Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
                </p>
                <p>
                  If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately so we can delete such information.
                </p>
                <p>
                  For users between 13-18 years old, we recommend parental guidance when using our services.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Contact Information */}
          <section id="contact">
            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mail className="w-6 h-6 text-otw-gold" />
                  Contact Us About Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-6">
                <p>
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-otw-gold" />
                    <div>
                      <p className="font-semibold text-white">Email</p>
                      <p className="text-sm">privacy@ezydelivery.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-otw-gold" />
                    <div>
                      <p className="font-semibold text-white">Phone</p>
                      <p className="text-sm">(260) 555-PRIVACY</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-otw-gold" />
                    <div>
                      <p className="font-semibold text-white">Address</p>
                      <p className="text-sm">123 Privacy Lane<br />Fort Wayne, IN 46802</p>
                    </div>
                  </div>
                </div>

                <div className="bg-otw-gold/10 border border-otw-gold/20 rounded-lg p-4">
                  <p className="text-sm">
                    <strong className="text-otw-gold">Response Time:</strong> We will respond to privacy-related inquiries within 30 days of receipt.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Policy Updates */}
          <section>
            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-otw-gold" />
                  Policy Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.
                </p>
                <p>
                  When we make significant changes, we will:
                </p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li>Notify you via email or app notification</li>
                  <li>Update the "Last Updated" date at the top of this policy</li>
                  <li>Provide a summary of key changes</li>
                  <li>Give you time to review before changes take effect</li>
                </ul>
                <p>
                  Your continued use of our services after policy updates constitutes acceptance of the revised terms.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 bg-gradient-to-r from-otw-gold/5 to-transparent">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Questions About Your <span className="text-otw-gold">Privacy</span>?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Our privacy team is here to help. Contact us anytime with questions or concerns about your data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold px-8 py-3 rounded-full hover:shadow-lg transition-all duration-300">
              <Mail className="w-5 h-5 mr-2" />
              Contact Privacy Team
            </Button>
            <Link href="/help">
              <Button variant="outline" className="border-2 border-otw-gold text-otw-gold hover:bg-otw-gold hover:text-black px-8 py-3 rounded-full transition-all duration-300">
                Visit Help Center
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
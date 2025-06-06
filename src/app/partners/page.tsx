import type { Metadata } from 'next';
import PartnerSignup from '../../components/partners/PartnerSignup';
import { Card } from '../../components/ui/card';
import { Building2, ShieldCheck, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Partner with OTW | The One-Stop Motion Platform',
  description:
    'Join OTW as a business partner and expand your reach in Fort Wayne.',
};

export const dynamic = 'force-dynamic';

const benefits = [
  {
    title: 'Expand Your Reach',
    description: 'Access our growing network of customers across Fort Wayne.',
    icon: TrendingUp,
  },
  {
    title: 'Secure Platform',
    description: 'Advanced security measures to protect your business data.',
    icon: ShieldCheck,
  },
  {
    title: 'Business Tools',
    description: 'Manage orders, inventory, and analytics all in one place.',
    icon: Building2,
  },
];

export default function PartnersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-otw-gold mb-4">
            Partner with OTW
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join Fort Wayne's premier motion platform and grow your business
            with our community of customers and delivery partners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card key={benefit.title} className="p-6 text-center">
                <div className="inline-flex p-3 rounded-full bg-otw-red/10 text-otw-red mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </Card>
            );
          })}
        </div>

        <div className="bg-gray-900 rounded-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-otw-gold mb-4">
                Get Started Today
              </h2>
              <p className="text-gray-300 mb-6">
                Fill out the form to begin your partnership with OTW. Our team
                will review your application and get back to you within 24
                hours.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-otw-gold" />
                  <span>No setup or hidden fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-otw-gold" />
                  <span>Flexible commission structure</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-otw-gold" />
                  <span>24/7 partner support</span>
                </div>
              </div>
            </div>
            <PartnerSignup />
          </div>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import VolunteerSignup from "../../components/volunteers/VolunteerSignup";
import VolunteerFeed from "../../components/volunteers/VolunteerFeed";
import { Card } from "../../components/ui/card";
import { Heart, Award, Gift } from "lucide-react";

export const metadata: Metadata = {
  title: "Volunteer with OTW | The One-Stop Motion Platform",
  description:
    "Join our community of volunteers and make a difference in Fort Wayne.",
};

const perks = [
  {
    title: "Service Discounts",
    description: "Earn discounts on OTW services based on volunteer hours.",
    icon: Gift,
  },
  {
    title: "Recognition",
    description: "Get featured in our Hall of Hustle and earn special badges.",
    icon: Award,
  },
  {
    title: "Community Impact",
    description: "Make a real difference in the Fort Wayne community.",
    icon: Heart,
  },
];

export default function VolunteersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-otw-gold mb-4">
            Join Our Volunteer Community
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Help us make Fort Wayne a better place. Join our network of
            dedicated volunteers and earn rewards while making a difference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {perks.map((perk) => {
            const Icon = perk.icon;
            return (
              <Card key={perk.title} className="p-6 text-center">
                <div className="inline-flex p-3 rounded-full bg-otw-red/10 text-otw-red mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{perk.title}</h3>
                <p className="text-gray-400">{perk.description}</p>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="bg-gray-900 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-otw-gold mb-6">
              Become a Volunteer
            </h2>
            <VolunteerSignup />
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-otw-gold mb-4">
                Volunteer Impact
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-otw-red">1,234</p>
                  <p className="text-sm text-gray-400">Hours Contributed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-otw-red">56</p>
                  <p className="text-sm text-gray-400">Active Volunteers</p>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-otw-gold">
                Volunteer Stories
              </h2>
              <VolunteerFeed />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

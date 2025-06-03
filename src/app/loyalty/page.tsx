"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRewards } from "../../lib/context/RewardsContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaCrown,
  FaGift,
  FaUtensils,
  FaPercent,
  FaStar,
  FaTruck,
  FaCalendarAlt,
  FaUserFriends,
  FaQrcode,
  FaArrowRight,
  FaCheck,
  FaDownload,
  FaApple,
  FaGooglePlay,
  FaGamepad,
  FaTimes,
} from "react-icons/fa";
import MembershipCard from "../../components/loyalty/MembershipCard";
import TierBenefitsTable from "../../components/loyalty/TierBenefitsTable";
import TestimonialCard from "../../components/loyalty/TestimonialCard";
import { testimonials } from "../../data/loyalty-data";

export default function LoyaltyPage() {
  const { user } = useAuth();
  const { points } = useRewards();
  const [activeTab, setActiveTab] = useState("overview");
  const [showMembershipCard, setShowMembershipCard] = useState(false);

  // Membership tiers with pricing and benefits
  const membershipTiers = [
    {
      name: "Bronze",
      color: "text-[#CD7F32]",
      bgColor: "bg-[#CD7F32]",
      borderColor: "border-[#CD7F32]",
      pointsRequired: 0,
      price: "Free",
      monthlyPrice: undefined,
      pointsPerDollar: 1,
      benefits: [
        "Earn 1 point per $1 spent",
        "Access to basic rewards",
        "Birthday reward",
        "Digital membership card",
        "Member-only promotions"
      ]
    },
    {
      name: "Silver",
      color: "text-gray-400",
      bgColor: "bg-gray-400",
      borderColor: "border-gray-400",
      pointsRequired: 500,
      price: "$9.99/month",
      monthlyPrice: "$9.99",
      pointsPerDollar: 1.5,
      benefits: [
        "Earn 1.5 points per $1 spent",
        "Priority pickup",
        "Exclusive menu items",
        "10% discount on all orders",
        "All Bronze benefits"
      ]
    },
    {
      name: "Gold",
      color: "text-gold-foil",
      bgColor: "bg-gold-foil",
      borderColor: "border-gold-foil",
      pointsRequired: 1000,
      price: "$19.99/month",
      monthlyPrice: "$19.99",
      pointsPerDollar: 2,
      benefits: [
        "Earn 2 points per $1 spent",
        "Free delivery on all orders",
        "VIP event invitations",
        "20% discount on all orders",
        "Priority customer support",
        "All Silver benefits"
      ]
    }
  ];

  // Determine user tier based on points
  const getUserTier = () => {
    if (points >= 1000)
      return { ...membershipTiers[2], next: null };
    if (points >= 500)
      return { ...membershipTiers[1], next: { name: "Gold", points: 1000 } };
    return { ...membershipTiers[0], next: { name: "Silver", points: 500 } };
  };

  const userTier = getUserTier();

  // Calculate progress percentage to next tier
  const getProgressPercentage = () => {
    if (!userTier.next) return 100;
    if (points < 500) return (points / 500) * 100;
    if (points < 1000) return ((points - 500) / 500) * 100;
    return 100;
  };

  const progressPercentage = getProgressPercentage();

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10"></div>
          <Image
            src="/assets/images/loyalty-hero.jpg"
            alt="OTW Loyalty Program Hero"
            fill
            className="object-contain object-center"
            priority
            sizes="100vw"
          />
        </div>
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="heading-xl mb-4 text-white gritty-shadow">
            OTW&apos;s Loyalty Program
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Join our exclusive loyalty program and unlock premium benefits,
            rewards, and experiences.
          </p>
          {!user && (
            <div className="mt-8">
              <Link href="/signup" className="btn-primary">
                Join Now
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Membership Status Section (for logged in users) */}
      {user && (
        <section className="py-12 bg-[#111111]">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] rounded-lg overflow-hidden shadow-lg border border-[#333333] p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome, {user.displayName || user.email}
                  </h2>
                  <div className="flex items-center mb-4">
                    <FaCrown className={`mr-2 ${userTier.color}`} />
                    <span className={`font-bold ${userTier.color}`}>
                      {userTier.name} Member
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">
                        {userTier.next
                          ? `Progress to ${userTier.next.name}`
                          : "Maximum Tier Reached"}
                      </span>
                      <span className="text-gray-300">
                        {points}/{userTier.next ? userTier.next.points : 1000}{" "}
                        points
                      </span>
                    </div>
                    <div className="w-full h-3 bg-[#333333] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gold-foil to-blood-red transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      className="btn-primary flex items-center gap-2"
                      onClick={() => setShowMembershipCard(true)}
                    >
                      <FaQrcode /> View Membership Card
                    </button>
                    <Link
                      href="/rewards"
                      className="btn-outline flex items-center gap-2"
                    >
                      <FaGift /> Rewards
                    </Link>
                  </div>
                </div>

                <div className="bg-[#0A0A0A] p-6 rounded-lg border border-[#333333] flex flex-col items-center">
                  <div className="text-5xl font-bold text-gold-foil mb-2">
                    {points}
                  </div>
                  <p className="text-gray-400 mb-4">Available Points</p>
                  <Link
                    href="/rewards"
                    className="text-gold-foil hover:underline flex items-center"
                  >
                    View Rewards <FaArrowRight className="ml-2" size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tabs Section */}
      <section className="py-8 bg-[#0A0A0A] sticky top-20 z-30 border-b border-[#333333]">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto pb-2 hide-scrollbar">
            <button
              className={`px-6 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "overview"
                  ? "text-gold-foil border-b-2 border-gold-foil"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Program Overview
            </button>
            <button
              className={`px-6 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "tiers"
                  ? "text-gold-foil border-b-2 border-gold-foil"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("tiers")}
            >
              Membership Tiers
            </button>
            <button
              className={`px-6 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "earn"
                  ? "text-gold-foil border-b-2 border-gold-foil"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("earn")}
            >
              Ways to Earn
            </button>
            <button
              className={`px-6 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "perks"
                  ? "text-gold-foil border-b-2 border-gold-foil"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("perks")}
            >
              Exclusive Perks
            </button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Program Overview Tab */}
          {activeTab === "overview" && (
            <div className="animate-fade-in">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">
                  About Our Loyalty Program
                </h2>
                <p className="text-gray-300 text-lg">
                  Broski&apos;s Kitchen Loyalty Program rewards our most valued
                  customers with exclusive perks, discounts, and experiences.
                  Earn points with every purchase and unlock premium benefits as
                  you progress through our membership tiers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#333333] text-center">
                  <div className="w-16 h-16 bg-gold-foil bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaGift className="text-gold-foil text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Earn Points</h3>
                  <p className="text-gray-400">
                    Earn points with every purchase at Broski&apos;s Kitchen,
                    through referrals, and by participating in special
                    promotions.
                  </p>
                </div>

                <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#333333] text-center">
                  <div className="w-16 h-16 bg-gold-foil bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCrown className="text-gold-foil text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Unlock Tiers</h3>
                  <p className="text-gray-400">
                    Progress through Bronze, Silver, and Gold tiers to unlock
                    increasingly valuable benefits and higher earning rates.
                  </p>
                </div>

                <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#333333] text-center">
                  <div className="w-16 h-16 bg-gold-foil bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaStar className="text-gold-foil text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Enjoy Rewards</h3>
                  <p className="text-gray-400">
                    Redeem your points for free menu items, exclusive
                    experiences, merchandise, and more.
                  </p>
                </div>
              </div>

              <div className="bg-[#1A1A1A] rounded-lg overflow-hidden shadow-lg border border-[#333333] mb-16">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-8 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold mb-4">
                      Download Our App
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Get the most out of your loyalty membership with our
                      mobile app. Track your points, view available rewards, and
                      access your digital membership card all in one place.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <a
                        href="#"
                        className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition-colors"
                      >
                        <FaApple size={24} />
                        <div>
                          <div className="text-xs">Download on the</div>
                          <div className="font-bold">App Store</div>
                        </div>
                      </a>
                      <a
                        href="#"
                        className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition-colors"
                      >
                        <FaGooglePlay size={24} />
                        <div>
                          <div className="text-xs">Get it on</div>
                          <div className="font-bold">Google Play</div>
                        </div>
                      </a>
                    </div>
                  </div>
                  <div className="relative h-64 md:h-auto">
                    <Image
                      src="/assets/logo/otw-logo-new.jpeg"
                      alt="Broski's Kitchen Mobile App"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-16">
                <h3 className="text-2xl font-bold mb-8 text-center">
                  What Our Members Say
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {testimonials.map((testimonial, index) => (
                    <TestimonialCard key={index} testimonial={testimonial} />
                  ))}
                </div>
              </div>

              {!user && (
                <div className="bg-gradient-to-r from-gold-foil to-blood-red p-1 rounded-lg">
                  <div className="bg-[#1A1A1A] rounded-lg p-8 text-center">
                    <h3 className="text-2xl font-bold mb-4">Ready to Join?</h3>
                    <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                      Sign up today and start earning points with your very
                      first purchase. Membership is completely free!
                    </p>
                    <Link href="/signup" className="btn-primary">
                      Join Now
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Membership Tiers Tab */}
          {activeTab === "tiers" && (
            <div className="animate-fade-in">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Membership Tiers</h2>
                <p className="text-gray-300 text-lg">
                  Our loyalty program features three membership tiers: Bronze,
                  Silver, and Gold. Each tier offers increasingly valuable
                  benefits and higher point earning rates.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {membershipTiers.map((tier, index) => (
                  <div
                    key={tier.name}
                    className={`bg-[#1A1A1A] rounded-lg overflow-hidden shadow-lg border ${
                      userTier.name === tier.name
                        ? tier.borderColor
                        : "border-[#333333]"
                    } ${userTier.name === tier.name ? 'ring-2 ring-opacity-50 ' + tier.borderColor.replace('border-', 'ring-') : ''}`}
                  >
                    <div className={`${tier.bgColor} bg-opacity-20 p-6 text-center relative`}>
                      {userTier.name === tier.name && (
                        <div className="absolute top-2 right-2 bg-emerald-green text-white text-xs px-2 py-1 rounded-full">
                          Current
                        </div>
                      )}
                      <div className={`w-16 h-16 ${tier.bgColor} bg-opacity-30 rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <FaCrown className={`${tier.color} text-2xl`} />
                      </div>
                      <h3 className={`text-2xl font-bold ${tier.color} mb-1`}>
                        {tier.name}
                      </h3>
                      <p className="text-gray-300 mb-2">{tier.pointsRequired}+ Points</p>
                      <div className={`text-xl font-bold ${tier.color}`}>
                        {tier.price}
                      </div>
                      {tier.monthlyPrice && (
                        <p className="text-sm text-gray-400 mt-1">
                          Save 20% with annual billing
                        </p>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="mb-4">
                        <div className={`text-sm font-semibold ${tier.color} mb-2`}>
                          Key Benefits:
                        </div>
                        <ul className="space-y-2 mb-6">
                          {tier.benefits.slice(0, 4).map((benefit, benefitIndex) => (
                            <li key={benefitIndex} className="flex items-start text-sm">
                              <FaCheck className={`${tier.color} mt-1 mr-2 flex-shrink-0`} size={12} />
                              <span>{benefit}</span>
                            </li>
                          ))}
                          {tier.benefits.length > 4 && (
                            <li className="text-xs text-gray-400">
                              +{tier.benefits.length - 4} more benefits
                            </li>
                          )}
                        </ul>
                      </div>
                      
                      {!user ? (
                        <Link href="/signup" className="btn-primary w-full text-sm">
                          Join Now
                        </Link>
                      ) : userTier.name === tier.name ? (
                        <div className={`${tier.bgColor} bg-opacity-20 ${tier.color} text-center py-3 rounded-md font-semibold`}>
                          Your Current Tier
                        </div>
                      ) : points >= tier.pointsRequired ? (
                        <div className="bg-emerald-green bg-opacity-20 text-emerald-green text-center py-3 rounded-md font-semibold">
                          Tier Available
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-center py-2 text-sm text-gray-400">
                            {tier.pointsRequired - points} more points to unlock
                          </div>
                          {tier.monthlyPrice && (
                            <button className={`w-full py-2 px-4 rounded-md border ${tier.borderColor} ${tier.color} hover:${tier.bgColor} hover:bg-opacity-10 transition-colors text-sm`}>
                              Upgrade Now
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-16">
                <h3 className="text-2xl font-bold mb-6">
                  Detailed Benefits Comparison
                </h3>
                <TierBenefitsTable membershipTiers={membershipTiers} />
              </div>

              <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#333333] mb-8">
                <h3 className="text-xl font-bold mb-4">Tier Qualification</h3>
                <p className="text-gray-300 mb-4">
                  Your membership tier is determined by the total number of
                  points you&apos;ve earned:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-[#CD7F32] rounded-full mr-2"></span>
                    <span>
                      <strong>Bronze:</strong> 0-499 points
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                    <span>
                      <strong>Silver:</strong> 500-999 points
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-gold-foil rounded-full mr-2"></span>
                    <span>
                      <strong>Gold:</strong> 1,000+ points
                    </span>
                  </li>
                </ul>
                <p className="text-gray-300">
                  Once you reach a tier, you&apos;ll maintain that status for
                  the remainder of the current calendar year and the following
                  year. To maintain your tier status after that, you&apos;ll
                  need to earn the required points again.
                </p>
              </div>

              <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#333333]">
                <h3 className="text-xl font-bold mb-4">Tier FAQs</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold mb-1">
                      How do I check my current tier status?
                    </h4>
                    <p className="text-gray-300">
                      Your current tier status is displayed on your profile page
                      and in the mobile app. You can also see it on your digital
                      membership card.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">When do tiers reset?</h4>
                    <p className="text-gray-300">
                      Tier qualifications are evaluated at the end of each
                      calendar year. You maintain your tier status for the
                      remainder of the current year and the following year.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">
                      Can I be downgraded to a lower tier?
                    </h4>
                    <p className="text-gray-300">
                      Yes, if you don&apos;t meet the point requirements to
                      maintain your current tier during the annual evaluation,
                      you&apos;ll be moved to the appropriate tier based on your
                      points.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ways to Earn Tab */}
          {activeTab === "earn" && (
            <div className="animate-fade-in">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Ways to Earn Points</h2>
                <p className="text-gray-300 text-lg">
                  There are many ways to earn points in our loyalty program.
                  Here are the primary methods to boost your point balance and
                  reach higher tiers faster.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#333333]">
                  <div className="flex items-start">
                    <div className="bg-gold-foil bg-opacity-20 p-3 rounded-full mr-4 flex-shrink-0">
                      <FaUtensils className="text-gold-foil text-xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Purchases</h3>
                      <p className="text-gray-300 mb-3">
                        Earn points on every purchase at Broski&apos;s Kitchen.
                        Point earning rates vary by tier:
                      </p>
                      <ul className="space-y-1 text-gray-300">
                        <li>• Bronze: 1 point per $1 spent</li>
                        <li>• Silver: 1.5 points per $1 spent</li>
                        <li>• Gold: 2 points per $1 spent</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#333333]">
                  <div className="flex items-start">
                    <div className="bg-gold-foil bg-opacity-20 p-3 rounded-full mr-4 flex-shrink-0">
                      <FaUserFriends className="text-gold-foil text-xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Referrals</h3>
                      <p className="text-gray-300 mb-3">
                        Earn 200 points for each friend you refer who signs up
                        and makes their first purchase.
                      </p>
                      <p className="text-gray-300">
                        Share your unique referral code with friends and family
                        to earn bonus points.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#333333]">
                  <div className="flex items-start">
                    <div className="bg-gold-foil bg-opacity-20 p-3 rounded-full mr-4 flex-shrink-0">
                      <FaCalendarAlt className="text-gold-foil text-xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Special Events</h3>
                      <p className="text-gray-300 mb-3">
                        Earn bonus points by attending special events, tastings,
                        and workshops at Broski&apos;s Kitchen.
                      </p>
                      <p className="text-gray-300">
                        Events often feature double or triple point promotions
                        for purchases made during the event.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#333333]">
                  <div className="flex items-start">
                    <div className="bg-gold-foil bg-opacity-20 p-3 rounded-full mr-4 flex-shrink-0">
                      <FaGamepad className="text-gold-foil text-xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        Games & Challenges
                      </h3>
                      <p className="text-gray-300 mb-3">
                        Complete challenges and play games in our mobile app to
                        earn bonus points.
                      </p>
                      <p className="text-gray-300">
                        Daily spin-to-win games, ordering challenges, and social
                        media tasks can all earn you extra points.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A1A] rounded-lg overflow-hidden shadow-lg border border-[#333333] mb-16">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative h-64 md:h-auto">
                    <Image
                      src="/assets/images/menu-3.jpg"
                      alt="Broski's Kitchen Bonus Points"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold mb-4">
                      Bonus Point Opportunities
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Throughout the year, we offer special promotions and
                      opportunities to earn bonus points:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <FaCheck className="text-gold-foil mt-1 mr-2 flex-shrink-0" />
                        <span>Double point days on select menu items</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-gold-foil mt-1 mr-2 flex-shrink-0" />
                        <span>
                          Birthday month bonus (earn 2x points during your
                          birthday month)
                        </span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-gold-foil mt-1 mr-2 flex-shrink-0" />
                        <span>Seasonal challenges with point multipliers</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-gold-foil mt-1 mr-2 flex-shrink-0" />
                        <span>Social media check-in bonuses</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#333333]">
                <h3 className="text-xl font-bold mb-4">Points FAQs</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold mb-1">Do points expire?</h4>
                    <p className="text-gray-300">
                      Points expire 12 months after they are earned if there is
                      no account activity. Keep your account active by making
                      purchases or redeeming rewards at least once every 12
                      months.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">
                      How long does it take for points to appear in my account?
                    </h4>
                    <p className="text-gray-300">
                      Points from purchases typically appear in your account
                      within 24 hours. Points from referrals and special
                      promotions may take up to 7 days to be credited.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">
                      Can I transfer points to another member?
                    </h4>
                    <p className="text-gray-300">
                      Currently, points cannot be transferred between members.
                      Each account&apos;s points can only be used by the account
                      holder.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Exclusive Perks Tab */}
          {activeTab === "perks" && (
            <div className="animate-fade-in">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">
                  Exclusive Member Perks
                </h2>
                <p className="text-gray-300 text-lg">
                  Beyond points and rewards, our loyalty program offers
                  exclusive perks and benefits that enhance your Broski&apos;s
                  Kitchen experience.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#333333]">
                  <div className="bg-gold-foil bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaPercent className="text-gold-foil text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">
                    Member-Only Discounts
                  </h3>
                  <p className="text-gray-300 text-center">
                    Exclusive discounts and offers available only to loyalty
                    program members.
                  </p>
                  <div className="mt-4 pt-4 border-t border-[#333333]">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <FaCheck className="text-gold-foil mt-1 mr-2 flex-shrink-0" />
                        <span>Weekly member specials</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-gold-foil mt-1 mr-2 flex-shrink-0" />
                        <span>Early access to promotions</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-gold-foil mt-1 mr-2 flex-shrink-0" />
                        <span>Birthday discount (15% off)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#333333]">
                  <div className="bg-gold-foil bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaTruck className="text-gold-foil text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">
                    Priority Service
                  </h3>
                  <p className="text-gray-300 text-center">
                    Skip the wait with priority service for loyalty program
                    members.
                  </p>
                  <div className="mt-4 pt-4 border-t border-[#333333]">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <FaCheck className="text-gold-foil mt-1 mr-2 flex-shrink-0" />
                        <span>Priority pickup (Silver+)</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-gold-foil mt-1 mr-2 flex-shrink-0" />
                        <span>Free delivery (Gold)</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-gold-foil mt-1 mr-2 flex-shrink-0" />
                        <span>Dedicated member support</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#333333]">
                  <div className="bg-gold-foil bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaStar className="text-gold-foil text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">
                    Exclusive Experiences
                  </h3>
                  <p className="text-gray-300 text-center">
                    Access to special events and experiences reserved for
                    members.
                  </p>
                  <div className="mt-4 pt-4 border-t border-[#333333]">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <FaCheck className="text-gold-foil mt-1 mr-2 flex-shrink-0" />
                        <span>VIP event invitations (Gold)</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-gold-foil mt-1 mr-2 flex-shrink-0" />
                        <span>Chef's table access (Gold)</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-gold-foil mt-1 mr-2 flex-shrink-0" />
                        <span>Cooking class priority (Silver+)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A1A] rounded-lg overflow-hidden shadow-lg border border-[#333333] mb-16">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-8 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold mb-4">
                      Exclusive Menu Access
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Silver and Gold members get exclusive access to special
                      menu items not available to the general public. These
                      items are created by our executive chef and feature
                      premium ingredients and innovative techniques.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <FaCheck className="text-gold-foil mt-1 mr-2 flex-shrink-0" />
                        <span>Secret menu items</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-gold-foil mt-1 mr-2 flex-shrink-0" />
                        <span>Early access to seasonal offerings</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-gold-foil mt-1 mr-2 flex-shrink-0" />
                        <span>Chef's special tasting opportunities</span>
                      </li>
                    </ul>
                  </div>
                  <div className="relative h-64 md:h-auto">
                    <Image
                      src="/assets/images/menu-1.jpg"
                      alt="Broski's Kitchen Exclusive Menu"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#333333]">
                <h3 className="text-xl font-bold mb-4">Partner Benefits</h3>
                <p className="text-gray-300 mb-6">
                  We&apos;ve partnered with select businesses to offer
                  additional perks to our loyalty members:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#111111] p-4 rounded-lg">
                    <h4 className="font-bold mb-2">Urban Winery</h4>
                    <p className="text-gray-300 mb-2">
                      Show your Broski&apos;s Kitchen membership card to receive
                      10% off wine purchases and complimentary tastings.
                    </p>
                    <p className="text-sm text-gray-400">
                      Available to all membership tiers
                    </p>
                  </div>
                  <div className="bg-[#111111] p-4 rounded-lg">
                    <h4 className="font-bold mb-2">Luxury Ride Share</h4>
                    <p className="text-gray-300 mb-2">
                      Gold members receive a 15% discount code for Luxury Ride
                      Share services to and from Broski&apos;s Kitchen
                      locations.
                    </p>
                    <p className="text-sm text-gray-400">Gold tier exclusive</p>
                  </div>
                  <div className="bg-[#111111] p-4 rounded-lg">
                    <h4 className="font-bold mb-2">Craft Brewery Tours</h4>
                    <p className="text-gray-300 mb-2">
                      Silver and Gold members receive discounted tickets to
                      local craft brewery tours.
                    </p>
                    <p className="text-sm text-gray-400">
                      Silver and Gold tiers
                    </p>
                  </div>
                  <div className="bg-[#111111] p-4 rounded-lg">
                    <h4 className="font-bold mb-2">Gourmet Food Festival</h4>
                    <p className="text-gray-300 mb-2">
                      All members receive early access to ticket sales for the
                      annual Gourmet Food Festival.
                    </p>
                    <p className="text-sm text-gray-400">
                      Available to all membership tiers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Terms & Conditions Section */}
      <section className="py-12 bg-[#111111]">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Program Terms & Conditions
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#333333]">
              <p className="text-gray-300 mb-4">
                Broski&apos;s Kitchen reserves the right to modify or terminate
                the loyalty program at any time. Membership benefits, point
                values, and redemption levels are subject to change without
                notice.
              </p>
              <p className="text-gray-300 mb-4">
                Points have no cash value and cannot be sold, transferred, or
                combined with other accounts. Points expire 12 months after they
                are earned if there is no account activity.
              </p>
              <p className="text-gray-300">
                For complete program terms and conditions, please visit our{" "}
                <Link href="/terms" className="text-gold-foil hover:underline">
                  Terms of Service
                </Link>{" "}
                page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Card Modal */}
      {showMembershipCard && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80">
          <div className="bg-[#1A1A1A] rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-[#333333] flex justify-between items-center">
              <h2 className="text-xl font-bold">Your Membership Card</h2>
              <button
                onClick={() => setShowMembershipCard(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <MembershipCard
                user={{
                  id: user.uid,
                  name: user.displayName || user.email || 'Member',
                  email: user.email || '',
                  role: 'user'
                }}
                points={points}
                tier={userTier.name}
              />
              <div className="mt-6 flex justify-center">
                <button className="btn-outline flex items-center gap-2">
                  <FaDownload /> Save to Device
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
      <section className="relative py-24 bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#2A1A0A] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/images/loyalty-bg.jpg')] bg-cover bg-center opacity-15"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gold-foil/5 via-transparent to-blood-red/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-gold-foil to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-gold-foil/30">
                <FaCrown className="text-4xl text-black" />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              Broski&apos;s Kitchen{" "}
              <span className="bg-gradient-to-r from-gold-foil via-yellow-400 to-gold-foil bg-clip-text text-transparent animate-pulse">
                Loyalty Program
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Earn points with every purchase, unlock exclusive rewards, and
              enjoy premium benefits as a valued member of our culinary community.
            </p>
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/signup" className="bg-gradient-to-r from-gold-foil to-yellow-400 text-black font-bold text-lg px-10 py-4 rounded-full hover:shadow-2xl hover:shadow-gold-foil/40 transition-all duration-300 transform hover:scale-105">
                  Join Now - It&apos;s Free!
                </Link>
                <Link href="#overview" className="border-2 border-gold-foil text-gold-foil font-semibold text-lg px-10 py-4 rounded-full hover:bg-gold-foil hover:text-black transition-all duration-300">
                  Learn More
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Membership Status Section (for logged in users) */}
      {user && (
        <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="bg-gradient-to-br from-gray-800/80 via-gray-900/90 to-black/80 backdrop-blur-sm rounded-3xl p-10 border border-gold-foil/20 shadow-2xl shadow-gold-foil/10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                  <div className="text-center lg:text-left flex-1">
                    <div className="mb-6">
                      <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gold-foil bg-clip-text text-transparent">
                        Welcome back, {user.displayName || user.email}!
                      </h2>
                      <div className="flex items-center gap-4 mb-6 justify-center lg:justify-start">
                        <div
                          className={`w-6 h-6 rounded-full shadow-lg ${
                            userTier.name === "Gold"
                              ? "bg-gradient-to-r from-gold-foil to-yellow-400 shadow-gold-foil/50"
                              : userTier.name === "Silver"
                              ? "bg-gradient-to-r from-gray-300 to-gray-500 shadow-gray-400/50"
                              : "bg-gradient-to-r from-amber-500 to-amber-700 shadow-amber-500/50"
                          }`}
                        ></div>
                        <span className="text-2xl font-bold text-white">
                          {userTier.name} Member
                        </span>
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          userTier.name === "Gold"
                            ? "bg-gold-foil/20 text-gold-foil border border-gold-foil/30"
                            : userTier.name === "Silver"
                            ? "bg-gray-400/20 text-gray-300 border border-gray-400/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}>
                          Elite Status
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-gold-foil/10 to-transparent rounded-2xl p-6 mb-8">
                      <p className="text-gray-300 mb-2 text-lg">
                        Available Points
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold bg-gradient-to-r from-gold-foil to-yellow-400 bg-clip-text text-transparent">
                          {points}
                        </span>
                        <span className="text-xl text-gray-400">pts</span>
                      </div>
                    </div>

                    {/* Progress to Next Tier */}
                    {userTier.next && (
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-semibold text-white">
                            Progress to {userTier.next.name}
                          </span>
                          <span className="text-lg text-gold-foil font-bold">
                            {points} / {userTier.next.points}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-gold-foil via-yellow-400 to-gold-foil h-4 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-gold-foil/30"
                            style={{
                              width: `${progressPercentage}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-400 mt-3">
                          Only {userTier.next.points - points} points away from {userTier.next.name} status!
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                      <button
                        className="bg-gradient-to-r from-gold-foil to-yellow-400 text-black font-bold px-8 py-3 rounded-full hover:shadow-2xl hover:shadow-gold-foil/40 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                        onClick={() => setShowMembershipCard(true)}
                      >
                        <FaQrcode /> View Membership Card
                      </button>
                      <Link
                        href="/rewards"
                        className="border-2 border-gold-foil text-gold-foil font-semibold px-8 py-3 rounded-full hover:bg-gold-foil hover:text-black transition-all duration-300 flex items-center gap-2"
                      >
                        <FaGift /> Rewards
                      </Link>
                    </div>
                  </div>

                  {/* Membership Card */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setShowMembershipCard(true)}
                      className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-gold-foil/20"
                    >
                      <div
                        className={`w-96 h-56 rounded-2xl p-8 text-white relative overflow-hidden ${
                          userTier.name === "Gold"
                            ? "bg-gradient-to-br from-yellow-400 via-gold-foil to-yellow-600"
                            : userTier.name === "Silver"
                            ? "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-600"
                            : "bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800"
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 rounded-2xl"></div>
                        <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full"></div>
                        <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/5 rounded-full"></div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold text-black">
                                Broski&apos;s Kitchen
                              </h3>
                              <p className="text-sm text-black/80 font-semibold">
                                {userTier.name} Member
                              </p>
                            </div>
                            <FaCrown className="text-3xl text-black drop-shadow-lg" />
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-black/70 font-semibold uppercase tracking-wider">Member Name</p>
                              <p className="font-bold text-xl text-black">{user.displayName || user.email}</p>
                            </div>
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-xs text-black/70 font-semibold uppercase tracking-wider">Points</p>
                                <p className="font-bold text-lg text-black">{points}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-black/70 font-semibold uppercase tracking-wider">Since</p>
                                <p className="font-bold text-sm text-black">2024</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                    <p className="text-center text-sm text-gray-400 mt-4 font-medium">
                      🎯 Click to view full membership card
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tabs Section */}
      <section className="py-12 bg-gradient-to-r from-black via-gray-900 to-black sticky top-20 z-30 border-b border-gold-foil/20 backdrop-blur-sm" id="overview">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-sm rounded-2xl p-3 border border-gold-foil/20 shadow-2xl shadow-gold-foil/10">
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  className={`px-8 py-4 font-bold text-lg whitespace-nowrap rounded-xl transition-all duration-500 flex items-center gap-3 ${
                    activeTab === "overview"
                      ? "bg-gradient-to-r from-gold-foil to-yellow-400 text-black shadow-2xl shadow-gold-foil/40 transform scale-105"
                      : "text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:shadow-lg hover:scale-102"
                  }`}
                  onClick={() => setActiveTab("overview")}
                >
                  <span className="text-xl">🏆</span>
                  Program Overview
                </button>
                <button
                  className={`px-8 py-4 font-bold text-lg whitespace-nowrap rounded-xl transition-all duration-500 flex items-center gap-3 ${
                    activeTab === "tiers"
                      ? "bg-gradient-to-r from-gold-foil to-yellow-400 text-black shadow-2xl shadow-gold-foil/40 transform scale-105"
                      : "text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:shadow-lg hover:scale-102"
                  }`}
                  onClick={() => setActiveTab("tiers")}
                >
                  <span className="text-xl">👑</span>
                  Membership Tiers
                </button>
                <button
                  className={`px-8 py-4 font-bold text-lg whitespace-nowrap rounded-xl transition-all duration-500 flex items-center gap-3 ${
                    activeTab === "earn"
                      ? "bg-gradient-to-r from-gold-foil to-yellow-400 text-black shadow-2xl shadow-gold-foil/40 transform scale-105"
                      : "text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:shadow-lg hover:scale-102"
                  }`}
                  onClick={() => setActiveTab("earn")}
                >
                  <span className="text-xl">💎</span>
                  Ways to Earn
                </button>
                <button
                  className={`px-8 py-4 font-bold text-lg whitespace-nowrap rounded-xl transition-all duration-500 flex items-center gap-3 ${
                    activeTab === "perks"
                      ? "bg-gradient-to-r from-gold-foil to-yellow-400 text-black shadow-2xl shadow-gold-foil/40 transform scale-105"
                      : "text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:shadow-lg hover:scale-102"
                  }`}
                  onClick={() => setActiveTab("perks")}
                >
                  <span className="text-xl">🎁</span>
                  Exclusive Perks
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="container mx-auto px-4">
          {/* Program Overview Tab */}
          {activeTab === "overview" && (
            <div className="animate-fade-in">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white via-gold-foil to-white bg-clip-text text-transparent">
                  About Our Loyalty Program
                </h2>
                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                  OTW&apos;s Loyalty Program rewards our most valued
                  customers with exclusive perks, discounts, and experiences.
                  Earn points with every purchase and unlock premium benefits as
                  you progress through our membership tiers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <div className="group bg-gradient-to-br from-gray-800/80 via-gray-900/90 to-black/80 backdrop-blur-sm rounded-2xl p-8 border border-gold-foil/20 text-center hover:border-gold-foil/40 transition-all duration-500 hover:shadow-2xl hover:shadow-gold-foil/20 hover:scale-105">
                  <div className="w-20 h-20 bg-gradient-to-r from-gold-foil/20 to-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-gold-foil/30 group-hover:to-yellow-400/30 transition-all duration-500 shadow-lg shadow-gold-foil/20">
                    <FaGift className="text-gold-foil text-3xl group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-gold-foil transition-colors duration-300">Earn Points</h3>
                  <p className="text-gray-400 text-lg leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    Earn points with every purchase at Broski&apos;s Kitchen,
                    through referrals, and by participating in special
                    promotions.
                  </p>
                </div>

                <div className="group bg-gradient-to-br from-gray-800/80 via-gray-900/90 to-black/80 backdrop-blur-sm rounded-2xl p-8 border border-gold-foil/20 text-center hover:border-gold-foil/40 transition-all duration-500 hover:shadow-2xl hover:shadow-gold-foil/20 hover:scale-105">
                  <div className="w-20 h-20 bg-gradient-to-r from-gold-foil/20 to-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-gold-foil/30 group-hover:to-yellow-400/30 transition-all duration-500 shadow-lg shadow-gold-foil/20">
                    <FaCrown className="text-gold-foil text-3xl group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-gold-foil transition-colors duration-300">Unlock Tiers</h3>
                  <p className="text-gray-400 text-lg leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    Progress through Bronze, Silver, and Gold tiers to unlock
                    increasingly valuable benefits and higher earning rates.
                  </p>
                </div>

                <div className="group bg-gradient-to-br from-gray-800/80 via-gray-900/90 to-black/80 backdrop-blur-sm rounded-2xl p-8 border border-gold-foil/20 text-center hover:border-gold-foil/40 transition-all duration-500 hover:shadow-2xl hover:shadow-gold-foil/20 hover:scale-105">
                  <div className="w-20 h-20 bg-gradient-to-r from-gold-foil/20 to-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-gold-foil/30 group-hover:to-yellow-400/30 transition-all duration-500 shadow-lg shadow-gold-foil/20">
                    <FaStar className="text-gold-foil text-3xl group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-gold-foil transition-colors duration-300">Enjoy Rewards</h3>
                  <p className="text-gray-400 text-lg leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    Redeem your points for free menu items, exclusive
                    experiences, merchandise, and more.
                  </p>
                </div>
              </div>

              {/* OTW App Download Section - Commented Out */}
              {/* <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-xl overflow-hidden shadow-2xl border border-gold-foil/30 mb-16 hover:shadow-gold-foil/20 transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-8 flex flex-col justify-center">
                    <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gold-foil to-yellow-400 bg-clip-text text-transparent">
                      Download Our App
                    </h3>
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                      Get the most out of your loyalty membership with our
                      mobile app. Track your points, view available rewards, and
                      access your digital membership card all in one place.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <a
                        href="#"
                        className="bg-gradient-to-r from-black to-gray-900 text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:from-gray-900 hover:to-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <FaApple size={28} />
                        <div>
                          <div className="text-xs text-gray-400">Download on the</div>
                          <div className="font-bold text-lg">App Store</div>
                        </div>
                      </a>
                      <a
                        href="#"
                        className="bg-gradient-to-r from-black to-gray-900 text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:from-gray-900 hover:to-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <FaGooglePlay size={28} />
                        <div>
                          <div className="text-xs text-gray-400">Get it on</div>
                          <div className="font-bold text-lg">Google Play</div>
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
              </div> */}

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
              <div className="max-w-3xl mx-auto text-center mb-12 bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-8 rounded-2xl border border-purple-500/30 shadow-2xl">
                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">💰 Ways to Earn Points</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Discover multiple exciting ways to earn points in our loyalty program.
                  Here are the primary methods to boost your point balance and
                  reach higher tiers faster! 🚀
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-xl p-8 border border-purple-500/30 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 hover:border-purple-400/50">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-gold-foil/30 to-yellow-500/30 p-4 rounded-full mr-6 flex-shrink-0 shadow-lg">
                      <FaUtensils className="text-gold-foil text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3 text-gold-foil">🍽️ Purchases</h3>
                      <p className="text-gray-300 mb-4 leading-relaxed">
                        Earn points on every purchase at Broski's Kitchen.
                        Point earning rates vary by tier:
                      </p>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-center"><span className="w-2 h-2 bg-bronze rounded-full mr-3"></span>Bronze: 1 point per $1 spent</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-silver rounded-full mr-3"></span>Silver: 1.5 points per $1 spent</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-gold-foil rounded-full mr-3"></span>Gold: 2 points per $1 spent</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-xl p-8 border border-blue-500/30 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 hover:border-blue-400/50">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-blue-500/30 to-cyan-500/30 p-4 rounded-full mr-6 flex-shrink-0 shadow-lg">
                      <FaUserFriends className="text-blue-400 text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3 text-blue-400">👥 Referrals</h3>
                      <p className="text-gray-300 mb-4 leading-relaxed">
                        Earn 200 points for each friend you refer who signs up
                        and makes their first purchase.
                      </p>
                      <p className="text-gray-300 leading-relaxed">
                        Share your unique referral code with friends and family
                        to earn bonus points! 🎁
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-xl p-8 border border-green-500/30 shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-105 hover:border-green-400/50">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-green-500/30 to-emerald-500/30 p-4 rounded-full mr-6 flex-shrink-0 shadow-lg">
                      <FaCalendarAlt className="text-green-400 text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3 text-green-400">🎉 Special Events</h3>
                      <p className="text-gray-300 mb-4 leading-relaxed">
                        Earn bonus points by attending special events, tastings,
                        and workshops at Broski's Kitchen.
                      </p>
                      <p className="text-gray-300 leading-relaxed">
                        Events often feature double or triple point promotions
                        for purchases made during the event! ✨
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-xl p-8 border border-orange-500/30 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 hover:scale-105 hover:border-orange-400/50">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-orange-500/30 to-red-500/30 p-4 rounded-full mr-6 flex-shrink-0 shadow-lg">
                      <FaGamepad className="text-orange-400 text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3 text-orange-400">🎮 Games & Challenges</h3>
                      {/* <p className="text-gray-300 mb-4 leading-relaxed">
                        Complete challenges and play games in our mobile app to
                        earn bonus points.
                      </p> */}
                      <p className="text-gray-300 leading-relaxed">
                        Daily spin-to-win games, ordering challenges, and social
                        media tasks can all earn you extra points! 🏆
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
              <div className="max-w-3xl mx-auto text-center mb-12 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 p-8 rounded-2xl border border-emerald-500/30 shadow-2xl">
                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  ✨ Exclusive Member Perks
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Beyond points and rewards, our loyalty program offers
                  exclusive perks and benefits that enhance your Broski's
                  Kitchen experience! 🎁
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-xl p-8 border border-purple-500/30 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 hover:border-purple-400/50">
                  <div className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <FaPercent className="text-purple-400 text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-center text-purple-400">
                    💰 Member-Only Discounts
                  </h3>
                  <p className="text-gray-300 text-center mb-6 leading-relaxed">
                    Exclusive discounts and offers available only to loyalty
                    program members.
                  </p>
                  <div className="mt-4 pt-4 border-t border-purple-500/30">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <FaCheck className="text-purple-400 mt-1 mr-3 flex-shrink-0" />
                        <span>Weekly member specials</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-purple-400 mt-1 mr-3 flex-shrink-0" />
                        <span>Early access to promotions</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-purple-400 mt-1 mr-3 flex-shrink-0" />
                        <span>Birthday discount (15% off)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-xl p-8 border border-blue-500/30 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 hover:border-blue-400/50">
                  <div className="bg-gradient-to-br from-blue-500/30 to-cyan-500/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <FaTruck className="text-blue-400 text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-center text-blue-400">
                    🚀 Priority Service
                  </h3>
                  <p className="text-gray-300 text-center mb-6 leading-relaxed">
                    Skip the wait with priority service for loyalty program
                    members.
                  </p>
                  <div className="mt-4 pt-4 border-t border-blue-500/30">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <FaCheck className="text-blue-400 mt-1 mr-3 flex-shrink-0" />
                        <span>Priority pickup (Silver+)</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-blue-400 mt-1 mr-3 flex-shrink-0" />
                        <span>Free delivery (Gold)</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-blue-400 mt-1 mr-3 flex-shrink-0" />
                        <span>Dedicated member support</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-xl p-8 border border-gold-foil/30 shadow-2xl hover:shadow-gold-foil/20 transition-all duration-300 hover:scale-105 hover:border-gold-foil/50">
                  <div className="bg-gradient-to-br from-gold-foil/30 to-yellow-500/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <FaStar className="text-gold-foil text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-center text-gold-foil">
                    🌟 Exclusive Experiences
                  </h3>
                  <p className="text-gray-300 text-center mb-6 leading-relaxed">
                    Access to special events and experiences reserved for
                    members.
                  </p>
                  <div className="mt-4 pt-4 border-t border-gold-foil/30">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <FaCheck className="text-gold-foil mt-1 mr-3 flex-shrink-0" />
                        <span>VIP event invitations (Gold)</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-gold-foil mt-1 mr-3 flex-shrink-0" />
                        <span>Chef's table access (Gold)</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-gold-foil mt-1 mr-3 flex-shrink-0" />
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

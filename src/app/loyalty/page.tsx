"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
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
// Dynamic testimonials loaded from API

export default function LoyaltyPage() {
  const { user } = useAuth();
  const { points } = useRewards();
  const [activeTab, setActiveTab] = useState("overview");
  const [showMembershipCard, setShowMembershipCard] = useState(false);
  const [membershipTiersData, setMembershipTiersData] = useState<any[]>([]);
  const [testimonialsData, setTestimonialsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch membership tiers and testimonials from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tiersResponse, testimonialsResponse] = await Promise.all([
          fetch('/api/loyalty?type=tiers'),
          fetch('/api/loyalty?type=testimonials')
        ]);
        
        const tiersData = await tiersResponse.json();
        const testimonialsData = await testimonialsResponse.json();
        
        if (tiersData.success) {
          setMembershipTiersData(tiersData.data);
        }
        if (testimonialsData.success) {
          setTestimonialsData(testimonialsData.data);
        }
      } catch (error) {
        console.error('Error fetching loyalty data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-otw-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading loyalty program...</p>
        </div>
      </div>
    );
  }

  // Use dynamic membership tiers data
  const membershipTiers = membershipTiersData.length > 0 ? membershipTiersData : [];

  // Determine user tier based on points
  const getUserTier = () => {
    if (membershipTiers.length === 0) return null;
    
    // Sort tiers by points required (ascending)
    const sortedTiers = [...membershipTiers].sort((a, b) => a.pointsRequired - b.pointsRequired);
    
    // Find the highest tier the user qualifies for
    let currentTier = sortedTiers[0];
    let nextTier = null;
    
    for (let i = 0; i < sortedTiers.length; i++) {
      if (points >= sortedTiers[i].pointsRequired) {
        currentTier = sortedTiers[i];
        nextTier = i < sortedTiers.length - 1 ? sortedTiers[i + 1] : null;
      } else {
        break;
      }
    }
    
    return { 
      ...currentTier, 
      next: nextTier ? { name: nextTier.name, points: nextTier.pointsRequired } : null 
    };
  };

  const userTier = getUserTier();

  // Calculate progress percentage to next tier
  const getProgressPercentage = () => {
    if (!userTier || !userTier.next) return 100;
    const currentPoints = userTier.pointsRequired;
    const nextPoints = userTier.next.points;
    const progress = ((points - currentPoints) / (nextPoints - currentPoints)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const progressPercentage = getProgressPercentage();

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-otw-gold/10 via-transparent to-otw-red/5"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-otw-gold to-otw-red rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FaCrown className="text-3xl text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
              ON THE WAY {" "}
              <span className="bg-gradient-to-r from-otw-gold via-otw-red to-otw-gold bg-clip-text text-transparent">
                Loyalty Program
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Earn points with every purchase, unlock exclusive rewards, and
              enjoy premium benefits as a valued member of our culinary community.
            </p>
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/signup" className="bg-gradient-to-r from-otw-gold to-otw-red text-white font-bold text-lg px-8 py-3 rounded-full hover:shadow-lg hover:shadow-otw-gold/30 transition-all duration-300 transform hover:scale-105">
                  Join Now - It&apos;s Free!
                </Link>
                <Link href="#overview" className="border-2 border-otw-gold text-otw-gold font-semibold text-lg px-8 py-3 rounded-full hover:bg-otw-gold hover:text-white transition-all duration-300">
                  Learn More
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Membership Status Section (for logged in users) */}
      {user && userTier && (
        <section className="py-12 md:py-16 bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="bg-gradient-to-br from-gray-800/90 via-gray-900/95 to-black/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-otw-gold/30 shadow-xl">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="text-center lg:text-left flex-1">
                    <div className="mb-6">
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-white">
                        Welcome back, {user.displayName || user.email}!
                      </h2>
                      <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start flex-wrap">
                        <div
                          className={`w-5 h-5 rounded-full ${
                            userTier?.name === "Gold"
                              ? "bg-gradient-to-r from-otw-gold to-otw-gold-600"
                              : userTier?.name === "Silver"
                              ? "bg-gradient-to-r from-otw-red-400 to-otw-red-500"
                              : "bg-gradient-to-r from-otw-gold-400 to-otw-gold-500"
                          }`}
                        ></div>
                        <span className="text-xl font-bold text-white">
                          {userTier?.name} Member
                        </span>
                        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          userTier?.name === "Gold"
                            ? "bg-otw-gold/20 text-otw-gold border border-otw-gold/30"
                            : userTier?.name === "Silver"
                            ? "bg-otw-red-400/20 text-otw-red-400 border border-otw-red-400/30"
                            : "bg-otw-gold-400/20 text-otw-gold-400 border border-otw-gold-400/30"
                        }`}>
                          Elite Status
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-otw-gold/10 to-transparent rounded-xl p-4 mb-6">
                      <p className="text-gray-300 mb-2 text-base">
                        Available Points
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-otw-gold to-otw-gold-600 bg-clip-text text-transparent">
                          {points}
                        </span>
                        <span className="text-lg text-gray-400">pts</span>
                      </div>
                    </div>

                    {/* Progress to Next Tier */}
                    {userTier?.next && (
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-base font-semibold text-white">
                            Progress to {userTier.next.name}
                          </span>
                          <span className="text-base text-otw-gold font-bold">
                            {points} / {userTier.next.points}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-otw-gold via-otw-red-400 to-otw-gold-600 h-3 rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${progressPercentage}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">
                          Only {userTier.next.points - points} points away from {userTier.next.name} status!
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <button
                        className="bg-gradient-to-r from-otw-gold to-otw-gold-600 text-white font-bold px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-otw-gold/30 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-sm"
                        onClick={() => setShowMembershipCard(true)}
                      >
                        <FaQrcode /> View Card
                      </button>
                      <Link
                        href="/rewards"
                        className="border-2 border-otw-gold text-otw-gold font-semibold px-6 py-2.5 rounded-full hover:bg-otw-gold hover:text-white transition-all duration-300 flex items-center gap-2 text-sm"
                      >
                        <FaGift /> Rewards
                      </Link>
                    </div>
                  </div>

                  {/* Membership Card */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setShowMembershipCard(true)}
                      className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <div
                        className={`w-80 h-48 rounded-xl p-6 text-white relative overflow-hidden ${
                          userTier?.name === "Gold"
                            ? "bg-gradient-to-br from-otw-gold via-otw-gold-500 to-otw-gold-600"
                            : userTier?.name === "Silver"
                            ? "bg-gradient-to-br from-otw-red-400 via-otw-red-500 to-otw-red-600"
                            : "bg-gradient-to-br from-otw-gold-400 via-otw-gold-500 to-otw-gold-600"
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 rounded-xl"></div>
                        <div className="absolute top-3 right-3 w-12 h-12 bg-white/10 rounded-full"></div>
                        <div className="absolute bottom-3 left-3 w-8 h-8 bg-white/5 rounded-full"></div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-bold text-black">
                                ON THE WAY
                              </h3>
                              <p className="text-sm text-black/80 font-semibold">
                                {userTier?.name} Member
                              </p>
                            </div>
                            <FaCrown className="text-2xl text-black drop-shadow-lg" />
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-black/70 font-semibold uppercase tracking-wider">Member Name</p>
                              <p className="font-bold text-base text-black truncate">{user.displayName || user.email}</p>
                            </div>
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-xs text-black/70 font-semibold uppercase tracking-wider">Points</p>
                                <p className="font-bold text-base text-black">{points}</p>
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
                    <p className="text-center text-xs text-gray-400 mt-3">
                      Click to view full membership card
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tabs Section */}
      <section className="py-8 bg-gradient-to-r from-black via-gray-900 to-black sticky top-20 z-30 border-b border-otw-gold/20 backdrop-blur-sm" id="overview">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-gray-900/90 via-black/95 to-gray-900/90 backdrop-blur-sm rounded-xl p-2 border border-otw-gold/30 shadow-lg">
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  className={`px-4 py-3 font-semibold text-base whitespace-nowrap rounded-lg transition-all duration-300 flex items-center gap-2 ${
                    activeTab === "overview"
                      ? "bg-gradient-to-r from-otw-gold to-otw-gold-600 text-white shadow-lg shadow-otw-gold/30 transform scale-105"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/60 hover:shadow-md"
                  }`}
                  onClick={() => setActiveTab("overview")}
                >
                  <span className="text-lg">🏆</span>
                  <span className="hidden sm:inline">Program Overview</span>
                  <span className="sm:hidden">Overview</span>
                </button>
                <button
                  className={`px-4 py-3 font-semibold text-base whitespace-nowrap rounded-lg transition-all duration-300 flex items-center gap-2 ${
                    activeTab === "tiers"
                      ? "bg-gradient-to-r from-otw-red-400 to-otw-red-500 text-white shadow-lg shadow-otw-red-400/30 transform scale-105"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/60 hover:shadow-md"
                  }`}
                  onClick={() => setActiveTab("tiers")}
                >
                  <span className="text-lg">👑</span>
                  <span className="hidden sm:inline">Membership Tiers</span>
                  <span className="sm:hidden">Tiers</span>
                </button>
                <button
                  className={`px-4 py-3 font-semibold text-base whitespace-nowrap rounded-lg transition-all duration-300 flex items-center gap-2 ${
                    activeTab === "earn"
                      ? "bg-gradient-to-r from-otw-gold-400 to-otw-gold-500 text-white shadow-lg shadow-otw-gold-400/30 transform scale-105"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/60 hover:shadow-md"
                  }`}
                  onClick={() => setActiveTab("earn")}
                >
                  <span className="text-lg">💎</span>
                  <span className="hidden sm:inline">Ways to Earn</span>
                  <span className="sm:hidden">Earn</span>
                </button>
                <button
                  className={`px-4 py-3 font-semibold text-base whitespace-nowrap rounded-lg transition-all duration-300 flex items-center gap-2 ${
                    activeTab === "perks"
                      ? "bg-gradient-to-r from-otw-gold-400 to-otw-gold-500 text-white shadow-lg shadow-otw-gold-400/30 transform scale-105"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/60 hover:shadow-md"
                  }`}
                  onClick={() => setActiveTab("perks")}
                >
                  <span className="text-lg">🎁</span>
                  <span className="hidden sm:inline">Exclusive Perks</span>
                  <span className="sm:hidden">Perks</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="container mx-auto px-6">
          {/* Program Overview Tab */}
          {activeTab === "overview" && (
            <div className="animate-fade-in">
              <div className="max-w-5xl mx-auto text-center mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
                  About Our Loyalty Program
                </h2>
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                  ON THE WAY&apos;s Loyalty Program rewards our most valued
                  customers with exclusive perks, discounts, and experiences.
                  Earn points with every purchase and unlock premium benefits as
                  you progress through our membership tiers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
                <div className="group bg-gradient-to-br from-gray-800/90 via-gray-900/95 to-black/90 backdrop-blur-sm rounded-xl p-6 border border-otw-gold/30 text-center hover:border-otw-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-otw-gold/20">
                  <div className="w-16 h-16 bg-gradient-to-r from-otw-gold/20 to-otw-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-otw-gold/30 group-hover:to-otw-gold-500/30 transition-all duration-300">
                    <FaGift className="text-otw-gold text-2xl group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-otw-gold transition-colors duration-300">Earn Points</h3>
                  <p className="text-gray-400 text-base leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    Earn points with every purchase at ON THE WAY,
                    through referrals, and by participating in special
                    promotions.
                  </p>
                </div>

                <div className="group bg-gradient-to-br from-gray-800/90 via-gray-900/95 to-black/90 backdrop-blur-sm rounded-xl p-6 border border-otw-red-400/30 text-center hover:border-otw-red-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-otw-red-400/20">
                  <div className="w-16 h-16 bg-gradient-to-r from-otw-red-400/20 to-otw-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-otw-red-400/30 group-hover:to-otw-red-500/30 transition-all duration-300">
                    <FaCrown className="text-otw-red-400 text-2xl group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-otw-red-400 transition-colors duration-300">Unlock Tiers</h3>
                  <p className="text-gray-400 text-base leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    Progress through Bronze, Silver, and Gold tiers to unlock
                    increasingly valuable benefits and higher earning rates.
                  </p>
                </div>

                <div className="group bg-gradient-to-br from-gray-800/90 via-gray-900/95 to-black/90 backdrop-blur-sm rounded-xl p-6 border border-otw-gold-400/30 text-center hover:border-otw-gold-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-otw-gold-400/20">
                  <div className="w-16 h-16 bg-gradient-to-r from-otw-gold-400/20 to-otw-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-otw-gold-400/30 group-hover:to-otw-gold-500/30 transition-all duration-300">
                    <FaStar className="text-otw-gold-400 text-2xl group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-otw-gold-400 transition-colors duration-300">Enjoy Rewards</h3>
                  <p className="text-gray-400 text-base leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
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
                  {testimonialsData.map((testimonial, index) => (
                    <TestimonialCard key={testimonial.id || index} testimonial={testimonial} />
                  ))}
                </div>
              </div>

              {!user && (
                <div className="bg-gradient-to-r from-otw-gold to-otw-red-500 p-1 rounded-lg">
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
              <div className="max-w-4xl mx-auto text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Membership Tiers</h2>
                <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                  Our loyalty program features three membership tiers: Bronze,
                  Silver, and Gold. Each tier offers increasingly valuable
                  benefits and higher point earning rates.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {membershipTiers.map((tier, index) => (
                  <div
                    key={tier.name}
                    className={`bg-[#1A1A1A] rounded-lg overflow-hidden shadow-lg border ${
                      userTier?.name === tier.name
                        ? tier.borderColor
                        : "border-[#333333]"
                    } ${userTier?.name === tier.name ? 'ring-2 ring-opacity-50 ' + tier.borderColor.replace('border-', 'ring-') : ''}`}
                  >
                    <div className={`${tier.bgColor} bg-opacity-20 p-6 text-center relative`}>
                      {userTier?.name === tier.name && (
                        <div className="absolute top-2 right-2 bg-otw-gold text-white text-xs px-2 py-1 rounded-full">
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
                      ) : userTier?.name === tier.name ? (
                        <div className={`${tier.bgColor} bg-opacity-20 ${tier.color} text-center py-3 rounded-md font-semibold`}>
                          Your Current Tier
                        </div>
                      ) : points >= tier.pointsRequired ? (
                        <div className="bg-otw-gold bg-opacity-20 text-otw-gold text-center py-3 rounded-md font-semibold">
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

              <div className="mb-12">
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">
                  Detailed Benefits Comparison
                </h3>
                <TierBenefitsTable membershipTiers={membershipTiers} />
              </div>

              <div className="bg-gray-900/80 rounded-xl p-6 border border-otw-gold/30 mb-8">
                <h3 className="text-lg md:text-xl font-bold mb-4 text-white">Tier Qualification</h3>
                <p className="text-gray-300 mb-4 text-sm md:text-base leading-relaxed">
                  Your membership tier is determined by the total number of
                  points you&apos;ve earned:
                </p>
                <ul className="space-y-3 mb-4">
                  <li className="flex items-center text-sm md:text-base">
                    <span className="w-4 h-4 bg-otw-gold-400 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-gray-300">
                      <strong className="text-white">Bronze:</strong> 0-499 points
                    </span>
                  </li>
                  <li className="flex items-center text-sm md:text-base">
                    <span className="w-4 h-4 bg-otw-red-400 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-gray-300">
                      <strong className="text-white">Silver:</strong> 500-999 points
                    </span>
                  </li>
                  <li className="flex items-center text-sm md:text-base">
                    <span className="w-4 h-4 bg-otw-gold rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-gray-300">
                      <strong className="text-white">Gold:</strong> 1,000+ points
                    </span>
                  </li>
                </ul>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-xl p-10 border border-otw-gold/30 shadow-2xl hover:shadow-otw-gold/20 transition-all duration-300 hover:scale-105 hover:border-otw-gold/50">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-otw-gold/30 to-otw-gold-500/30 p-5 rounded-full mr-8 flex-shrink-0 shadow-lg">
                      <FaUtensils className="text-otw-gold text-3xl" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold mb-4 text-otw-gold">🍽️ Purchases</h3>
                      <p className="text-gray-200 mb-5 leading-relaxed text-lg">
                        Earn points on every purchase at Broski's Kitchen.
                        Point earning rates vary by tier:
                      </p>
                      <ul className="space-y-3 text-gray-200">
                        <li className="flex items-center text-base"><span className="w-3 h-3 bg-otw-gold-400 rounded-full mr-4"></span>Bronze: 1 point per $1 spent</li>
                        <li className="flex items-center text-base"><span className="w-3 h-3 bg-otw-red-400 rounded-full mr-4"></span>Silver: 1.5 points per $1 spent</li>
                        <li className="flex items-center text-base"><span className="w-3 h-3 bg-otw-gold rounded-full mr-4"></span>Gold: 2 points per $1 spent</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-xl p-10 border border-blue-500/30 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 hover:border-blue-400/50">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-blue-500/30 to-cyan-500/30 p-5 rounded-full mr-8 flex-shrink-0 shadow-lg">
                      <FaUserFriends className="text-blue-400 text-3xl" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold mb-4 text-blue-400">👥 Referrals</h3>
                      <p className="text-gray-200 mb-5 leading-relaxed text-lg">
                        Earn 200 points for each friend you refer who signs up
                        and makes their first purchase.
                      </p>
                      <p className="text-gray-300 leading-relaxed text-base">
                        Share your unique referral code with friends and family
                        to earn bonus points! 🎁
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-xl p-10 border border-green-500/30 shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-105 hover:border-green-400/50">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-green-500/30 to-otw-gold/30 p-5 rounded-full mr-8 flex-shrink-0 shadow-lg">
                      <FaCalendarAlt className="text-green-400 text-3xl" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold mb-4 text-green-400">🎉 Special Events</h3>
                      <p className="text-gray-200 mb-5 leading-relaxed text-lg">
                        Earn bonus points by attending special events, tastings,
                        and workshops at Broski's Kitchen.
                      </p>
                      <p className="text-gray-300 leading-relaxed text-base">
                        Events often feature double or triple point promotions
                        for purchases made during the event! ✨
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-xl p-10 border border-orange-500/30 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 hover:scale-105 hover:border-orange-400/50">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-orange-500/30 to-red-500/30 p-5 rounded-full mr-8 flex-shrink-0 shadow-lg">
                      <FaGamepad className="text-orange-400 text-3xl" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold mb-4 text-orange-400">🎮 Games & Challenges</h3>
                      {/* <p className="text-gray-200 mb-5 leading-relaxed text-lg">
                        Complete challenges and play games in our mobile app to
                        earn bonus points.
                      </p> */}
                      <p className="text-gray-200 leading-relaxed text-lg">
                        Daily spin-to-win games, ordering challenges, and social
                        media tasks can all earn you extra points! 🏆
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A1A] rounded-lg overflow-hidden shadow-lg border border-[#444444] mb-20">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative h-64 md:h-auto">
                    <Image
                      src="/assets/images/menu-3.jpg"
                      alt="Broski's Kitchen Bonus Points"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-10 flex flex-col justify-center">
                    <h3 className="text-3xl font-bold mb-6 text-otw-gold">
                      Bonus Point Opportunities
                    </h3>
                    <p className="text-gray-200 mb-6 text-lg leading-relaxed">
                      Throughout the year, we offer special promotions and
                      opportunities to earn bonus points:
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <FaCheck className="text-otw-gold mt-1.5 mr-4 flex-shrink-0 text-lg" />
                        <span className="text-gray-200 text-base">Double point days on select menu items</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-otw-gold mt-1.5 mr-4 flex-shrink-0 text-lg" />
                        <span className="text-gray-200 text-base">
                          Birthday month bonus (earn 2x points during your
                          birthday month)
                        </span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-otw-gold mt-1.5 mr-4 flex-shrink-0 text-lg" />
                        <span className="text-gray-200 text-base">Seasonal challenges with point multipliers</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-otw-gold mt-1.5 mr-4 flex-shrink-0 text-lg" />
                        <span className="text-gray-200 text-base">Social media check-in bonuses</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A1A] rounded-lg p-10 border border-[#444444]">
                <h3 className="text-3xl font-bold mb-8 text-center text-otw-gold">Points FAQs</h3>
                <div className="space-y-8">
                  <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#333333]">
                    <h4 className="text-xl font-bold mb-3 text-otw-gold-400">Do points expire?</h4>
                    <p className="text-gray-200 text-base leading-relaxed">
                      Points expire 12 months after they are earned if there is
                      no account activity. Keep your account active by making
                      purchases or redeeming rewards at least once every 12
                      months.
                    </p>
                  </div>
                  <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#333333]">
                    <h4 className="text-xl font-bold mb-3 text-otw-gold-400">
                      How long does it take for points to appear in my account?
                    </h4>
                    <p className="text-gray-200 text-base leading-relaxed">
                      Points from purchases typically appear in your account
                      within 24 hours. Points from referrals and special
                      promotions may take up to 7 days to be credited.
                    </p>
                  </div>
                  <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#333333]">
                    <h4 className="text-xl font-bold mb-3 text-otw-gold-400">
                      Can I transfer points to another member?
                    </h4>
                    <p className="text-gray-200 text-base leading-relaxed">
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
              <div className="max-w-3xl mx-auto text-center mb-12 bg-gradient-to-r from-otw-gold/20 to-otw-red/20 p-8 rounded-2xl border border-otw-gold/30 shadow-2xl">
                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-otw-gold to-otw-red bg-clip-text text-transparent">
                  ✨ Exclusive Member Perks
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Beyond points and rewards, our loyalty program offers
                  exclusive perks and benefits that enhance your Broski's
                  Kitchen experience! 🎁
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-xl p-10 border border-purple-500/30 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 hover:border-purple-400/50">
                  <div className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <FaPercent className="text-purple-400 text-4xl" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-center text-purple-400">
                    💰 Member-Only Discounts
                  </h3>
                  <p className="text-gray-200 text-center mb-8 leading-relaxed text-lg">
                    Exclusive discounts and offers available only to loyalty
                    program members.
                  </p>
                  <div className="mt-6 pt-6 border-t border-purple-500/30">
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <FaCheck className="text-otw-gold mt-1.5 mr-4 flex-shrink-0 text-lg" />
                        <span className="text-gray-200 text-base">Weekly member specials</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-otw-gold mt-1.5 mr-4 flex-shrink-0 text-lg" />
                        <span className="text-gray-200 text-base">Early access to promotions</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-otw-gold mt-1.5 mr-4 flex-shrink-0 text-lg" />
                        <span className="text-gray-200 text-base">Birthday discount (15% off)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-xl p-10 border border-blue-500/30 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 hover:border-blue-400/50">
                  <div className="bg-gradient-to-br from-blue-500/30 to-cyan-500/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <FaTruck className="text-blue-400 text-4xl" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-center text-blue-400">
                    🚀 Priority Service
                  </h3>
                  <p className="text-gray-200 text-center mb-8 leading-relaxed text-lg">
                    Skip the wait with priority service for loyalty program
                    members.
                  </p>
                  <div className="mt-6 pt-6 border-t border-blue-500/30">
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <FaCheck className="text-otw-red mt-1.5 mr-4 flex-shrink-0 text-lg" />
                        <span className="text-gray-200 text-base">Priority pickup (Silver+)</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-otw-red mt-1.5 mr-4 flex-shrink-0 text-lg" />
                        <span className="text-gray-200 text-base">Free delivery (Gold)</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-otw-red mt-1.5 mr-4 flex-shrink-0 text-lg" />
                        <span className="text-gray-200 text-base">Dedicated member support</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-xl p-10 border border-otw-red/30 shadow-2xl hover:shadow-otw-red/20 transition-all duration-300 hover:scale-105 hover:border-otw-red/50">
                  <div className="bg-gradient-to-br from-otw-red/30 to-otw-red-500/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <FaStar className="text-otw-red text-4xl" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-center text-otw-red">
                    🌟 Exclusive Experiences
                  </h3>
                  <p className="text-gray-200 text-center mb-8 leading-relaxed text-lg">
                    Access to special events and experiences reserved for
                    members.
                  </p>
                  <div className="mt-6 pt-6 border-t border-otw-red/30">
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <FaCheck className="text-otw-red mt-1.5 mr-4 flex-shrink-0 text-lg" />
                        <span className="text-gray-200 text-base">VIP event invitations (Gold)</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-otw-red mt-1.5 mr-4 flex-shrink-0 text-lg" />
                        <span className="text-gray-200 text-base">Chef's table access (Gold)</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-otw-red mt-1.5 mr-4 flex-shrink-0 text-lg" />
                        <span className="text-gray-200 text-base">Cooking class priority (Silver+)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A1A] rounded-lg overflow-hidden shadow-lg border border-[#333333] mb-20">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-10 flex flex-col justify-center">
                    <h3 className="text-3xl font-bold mb-6 text-otw-gold">
                      Exclusive Menu Access
                    </h3>
                    <p className="text-gray-200 mb-8 leading-relaxed text-lg">
                      Silver and Gold members get exclusive access to special
                      menu items not available to the general public. These
                      items are created by our executive chef and feature
                      premium ingredients and innovative techniques.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <FaCheck className="text-otw-gold mt-1.5 mr-4 flex-shrink-0 text-lg" />
                        <span className="text-gray-200 text-base">Secret menu items</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-otw-gold mt-1.5 mr-4 flex-shrink-0 text-lg" />
                        <span className="text-gray-200 text-base">Early access to seasonal offerings</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-otw-gold mt-1.5 mr-4 flex-shrink-0 text-lg" />
                        <span className="text-gray-200 text-base">Chef's special tasting opportunities</span>
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

              <div className="bg-[#1A1A1A] rounded-lg p-8 border border-[#333333]">
                <h3 className="text-2xl font-bold mb-6 text-otw-gold">Partner Benefits</h3>
                <p className="text-gray-200 mb-8 leading-relaxed text-lg">
                  We&apos;ve partnered with select businesses to offer
                  additional perks to our loyalty members:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-[#111111] p-6 rounded-lg border border-[#333333] hover:border-otw-gold/30 transition-colors">
                    <h4 className="font-bold mb-3 text-lg text-otw-gold">Urban Winery</h4>
                    <p className="text-gray-200 mb-3 leading-relaxed">
                      Show your Broski&apos;s Kitchen membership card to receive
                      10% off wine purchases and complimentary tastings.
                    </p>
                    <p className="text-sm text-gray-400 font-medium">
                      Available to all membership tiers
                    </p>
                  </div>
                  <div className="bg-[#111111] p-6 rounded-lg border border-[#333333] hover:border-otw-red/30 transition-colors">
                    <h4 className="font-bold mb-3 text-lg text-otw-red">Luxury Ride Share</h4>
                    <p className="text-gray-200 mb-3 leading-relaxed">
                      Gold members receive a 15% discount code for Luxury Ride
                      Share services to and from Broski&apos;s Kitchen
                      locations.
                    </p>
                    <p className="text-sm text-gray-400 font-medium">Gold tier exclusive</p>
                  </div>
                  <div className="bg-[#111111] p-6 rounded-lg border border-[#333333] hover:border-otw-gold/30 transition-colors">
                    <h4 className="font-bold mb-3 text-lg text-otw-gold">Craft Brewery Tours</h4>
                    <p className="text-gray-200 mb-3 leading-relaxed">
                      Silver and Gold members receive discounted tickets to
                      local craft brewery tours.
                    </p>
                    <p className="text-sm text-gray-400 font-medium">
                      Silver and Gold tiers
                    </p>
                  </div>
                  <div className="bg-[#111111] p-6 rounded-lg border border-[#333333] hover:border-otw-red/30 transition-colors">
                    <h4 className="font-bold mb-3 text-lg text-otw-red">Gourmet Food Festival</h4>
                    <p className="text-gray-200 mb-3 leading-relaxed">
                      All members receive early access to ticket sales for the
                      annual Gourmet Food Festival.
                    </p>
                    <p className="text-sm text-gray-400 font-medium">
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
      <section className="py-16 bg-[#111111]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-100">
            Program Terms & Conditions
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#1A1A1A] rounded-lg p-8 border border-[#333333] shadow-lg">
              <p className="text-gray-200 mb-6 leading-relaxed text-lg">
                Broski&apos;s Kitchen reserves the right to modify or terminate
                the loyalty program at any time. Membership benefits, point
                values, and redemption levels are subject to change without
                notice.
              </p>
              <p className="text-gray-200 mb-6 leading-relaxed text-lg">
                Points have no cash value and cannot be sold, transferred, or
                combined with other accounts. Points expire 12 months after they
                are earned if there is no account activity.
              </p>
              <p className="text-gray-200 leading-relaxed text-lg">
                For complete program terms and conditions, please visit our{" "}
                <Link href="/terms" className="text-otw-gold hover:underline font-medium">
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
          <div className="bg-[#1A1A1A] rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-fade-in border border-[#333333]">
            <div className="p-8 border-b border-[#333333] flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-100">Your Membership Card</h2>
              <button
                onClick={() => setShowMembershipCard(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-[#333333]"
                aria-label="Close"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <div className="p-8">
              <MembershipCard
                user={{
                  id: user.uid,
                  name: user.displayName || user.email || 'Member',
                  email: user.email || '',
                  role: 'user'
                }}
                points={points}
                tier={userTier?.name || 'Bronze'}
              />
              <div className="mt-8 flex justify-center">
                <button className="btn-outline flex items-center gap-3 px-6 py-3 text-lg">
                  <FaDownload className="text-lg" /> Save to Device
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

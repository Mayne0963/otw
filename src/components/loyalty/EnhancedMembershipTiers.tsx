'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Star, 
  Crown, 
  Diamond, 
  Gift, 
  Truck, 
  Clock, 
  Percent, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Trophy,
  Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase-config';
import { toast } from '../ui/use-toast';
import { motion } from 'framer-motion';

interface MembershipTier {
  id: string;
  name: string;
  level: number;
  color: string;
  icon: React.ReactNode;
  pointsRequired: number;
  benefits: string[];
  perks: {
    deliveryDiscount: number;
    freeDeliveryThreshold: number;
    prioritySupport: boolean;
    exclusiveDeals: boolean;
    birthdayBonus: number;
    referralBonus: number;
  };
  description: string;
  popular?: boolean;
}

interface UserMembership {
  currentTier: string;
  points: number;
  totalSpent: number;
  ordersCount: number;
  memberSince: string;
  nextTierProgress: number;
  nextTierPointsNeeded: number;
}

const membershipTiers: MembershipTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    level: 1,
    color: 'from-amber-600 to-amber-800',
    icon: <Star className="w-6 h-6" />,
    pointsRequired: 0,
    benefits: [
      'Earn 1 point per $1 spent',
      'Basic customer support',
      'Order tracking',
      'Mobile app access'
    ],
    perks: {
      deliveryDiscount: 0,
      freeDeliveryThreshold: 50,
      prioritySupport: false,
      exclusiveDeals: false,
      birthdayBonus: 50,
      referralBonus: 25
    },
    description: 'Start your journey with OTW and enjoy basic benefits'
  },
  {
    id: 'silver',
    name: 'Silver',
    level: 2,
    color: 'from-gray-400 to-gray-600',
    icon: <Trophy className="w-6 h-6" />,
    pointsRequired: 500,
    benefits: [
      'Earn 1.25 points per $1 spent',
      '5% delivery discount',
      'Priority customer support',
      'Early access to new features',
      'Monthly exclusive deals'
    ],
    perks: {
      deliveryDiscount: 5,
      freeDeliveryThreshold: 40,
      prioritySupport: true,
      exclusiveDeals: true,
      birthdayBonus: 100,
      referralBonus: 50
    },
    description: 'Unlock better rewards and priority support',
    popular: true
  },
  {
    id: 'gold',
    name: 'Gold',
    level: 3,
    color: 'from-yellow-400 to-yellow-600',
    icon: <Crown className="w-6 h-6" />,
    pointsRequired: 1500,
    benefits: [
      'Earn 1.5 points per $1 spent',
      '10% delivery discount',
      'Free delivery on orders $30+',
      'VIP customer support',
      'Exclusive gold member deals',
      'Birthday month special offers'
    ],
    perks: {
      deliveryDiscount: 10,
      freeDeliveryThreshold: 30,
      prioritySupport: true,
      exclusiveDeals: true,
      birthdayBonus: 200,
      referralBonus: 75
    },
    description: 'Premium benefits with significant savings'
  },
  {
    id: 'platinum',
    name: 'Platinum',
    level: 4,
    color: 'from-purple-400 to-purple-600',
    icon: <Diamond className="w-6 h-6" />,
    pointsRequired: 3000,
    benefits: [
      'Earn 2 points per $1 spent',
      '15% delivery discount',
      'Free delivery on all orders',
      'Dedicated account manager',
      'Exclusive platinum events',
      'First access to new services',
      'Concierge service'
    ],
    perks: {
      deliveryDiscount: 15,
      freeDeliveryThreshold: 0,
      prioritySupport: true,
      exclusiveDeals: true,
      birthdayBonus: 500,
      referralBonus: 100
    },
    description: 'Ultimate luxury experience with maximum benefits'
  }
];

export default function EnhancedMembershipTiers() {
  const { user } = useAuth();
  const [userMembership, setUserMembership] = useState<UserMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserMembership = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const currentTier = userData.tier || 'bronze';
          const points = userData.rewardPoints || 0;
          
          // Calculate next tier progress
          const currentTierData = membershipTiers.find(t => t.id === currentTier);
          const nextTierData = membershipTiers.find(t => t.level === (currentTierData?.level || 0) + 1);
          
          let nextTierProgress = 100;
          let nextTierPointsNeeded = 0;
          
          if (nextTierData) {
            const pointsInCurrentTier = points - (currentTierData?.pointsRequired || 0);
            const pointsNeededForNext = nextTierData.pointsRequired - (currentTierData?.pointsRequired || 0);
            nextTierProgress = Math.min(100, (pointsInCurrentTier / pointsNeededForNext) * 100);
            nextTierPointsNeeded = Math.max(0, nextTierData.pointsRequired - points);
          }

          setUserMembership({
            currentTier,
            points,
            totalSpent: userData.totalSpent || 0,
            ordersCount: userData.ordersCount || 0,
            memberSince: userData.memberSince || new Date().toISOString(),
            nextTierProgress,
            nextTierPointsNeeded
          });
        }
      } catch (error) {
        console.error('Error fetching user membership:', error);
        toast({
          title: 'Error',
          description: 'Failed to load membership data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserMembership();
  }, [user]);

  const handleUpgradeTier = async (tierId: string) => {
    if (!user?.uid || !userMembership) return;

    const targetTier = membershipTiers.find(t => t.id === tierId);
    if (!targetTier) return;

    if (userMembership.points < targetTier.pointsRequired) {
      toast({
        title: 'Insufficient Points',
        description: `You need ${targetTier.pointsRequired - userMembership.points} more points to upgrade to ${targetTier.name}`,
        variant: 'destructive'
      });
      return;
    }

    setUpgrading(tierId);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        tier: tierId,
        updatedAt: new Date().toISOString()
      });

      // Log the tier upgrade
      await addDoc(collection(db, 'membershipHistory'), {
        userId: user.uid,
        action: 'tier_upgrade',
        fromTier: userMembership.currentTier,
        toTier: tierId,
        pointsUsed: targetTier.pointsRequired,
        timestamp: new Date().toISOString()
      });

      setUserMembership(prev => prev ? {
        ...prev,
        currentTier: tierId
      } : null);

      toast({
        title: 'Congratulations!',
        description: `You've been upgraded to ${targetTier.name} tier!`,
      });
    } catch (error) {
      console.error('Error upgrading tier:', error);
      toast({
        title: 'Error',
        description: 'Failed to upgrade tier',
        variant: 'destructive'
      });
    } finally {
      setUpgrading(null);
    }
  };

  const getCurrentTierData = () => {
    if (!userMembership) return membershipTiers[0];
    return membershipTiers.find(t => t.id === userMembership.currentTier) || membershipTiers[0];
  };

  const getNextTierData = () => {
    const currentTier = getCurrentTierData();
    return membershipTiers.find(t => t.level === currentTier.level + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-otw-gold"></div>
      </div>
    );
  }

  const currentTier = getCurrentTierData();
  const nextTier = getNextTierData();

  return (
    <div className="space-y-8">
      {/* Current Membership Status */}
      {userMembership && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
        >
          <Card className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-otw-gold/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${currentTier.color} flex items-center justify-center text-white`}>
                    {currentTier.icon}
                  </div>
                  <div>
                    <CardTitle className="text-white text-2xl flex items-center gap-2">
                      {currentTier.name} Member
                      <Sparkles className="w-5 h-5 text-otw-gold" />
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Member since {new Date(userMembership.memberSince).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-otw-gold">
                    {userMembership.points.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm">Reward Points</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-gray-400 text-sm">Total Orders</div>
                  <div className="text-white text-xl font-semibold">{userMembership.ordersCount}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-gray-400 text-sm">Total Spent</div>
                  <div className="text-white text-xl font-semibold">${userMembership.totalSpent.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-gray-400 text-sm">Delivery Discount</div>
                  <div className="text-otw-gold text-xl font-semibold">{currentTier.perks.deliveryDiscount}%</div>
                </div>
              </div>

              {nextTier && (
                <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-medium">Progress to {nextTier.name}</div>
                    <div className="text-otw-gold text-sm">
                      {userMembership.nextTierPointsNeeded} points needed
                    </div>
                  </div>
                  <Progress 
                    value={userMembership.nextTierProgress} 
                    className="h-2 bg-gray-700"
                  />
                  <div className="text-gray-400 text-xs mt-1">
                    {userMembership.nextTierProgress.toFixed(1)}% complete
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Membership Tiers */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Membership Tiers</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Unlock exclusive benefits and rewards as you level up your membership. 
            Earn points with every order and enjoy premium perks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {membershipTiers.map((tier, index) => {
            const isCurrentTier = userMembership?.currentTier === tier.id;
            const canUpgrade = userMembership && userMembership.points >= tier.pointsRequired && !isCurrentTier;
            const isLocked = userMembership && userMembership.points < tier.pointsRequired && !isCurrentTier;
            
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Card 
                  className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                    isCurrentTier 
                      ? 'border-otw-gold bg-gradient-to-b from-otw-gold/10 to-transparent' 
                      : canUpgrade
                      ? 'border-green-500/50 bg-gray-800/50 hover:border-green-500'
                      : 'border-gray-700 bg-gray-800/30'
                  } ${selectedTier === tier.id ? 'ring-2 ring-otw-gold' : ''}`}
                  onClick={() => setSelectedTier(selectedTier === tier.id ? null : tier.id)}
                >
                  {tier.popular && (
                    <div className="absolute top-0 right-0 bg-otw-gold text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                      POPULAR
                    </div>
                  )}
                  
                  {isCurrentTier && (
                    <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                      CURRENT
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${tier.color} flex items-center justify-center text-white mb-4`}>
                      {tier.icon}
                    </div>
                    <CardTitle className="text-white text-xl">{tier.name}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {tier.description}
                    </CardDescription>
                    <div className="mt-4">
                      <div className="text-2xl font-bold text-otw-gold">
                        {tier.pointsRequired === 0 ? 'Free' : `${tier.pointsRequired.toLocaleString()} pts`}
                      </div>
                      <div className="text-gray-400 text-sm">Required points</div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Key Benefits */}
                    <div className="space-y-2">
                      <h4 className="text-white font-medium text-sm">Key Benefits:</h4>
                      <div className="space-y-1">
                        {tier.benefits.slice(0, 3).map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                            <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                            {benefit}
                          </div>
                        ))}
                        {tier.benefits.length > 3 && (
                          <div className="text-xs text-gray-400">
                            +{tier.benefits.length - 3} more benefits
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Perks Highlights */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-700/30 rounded p-2 text-center">
                        <Truck className="w-4 h-4 text-otw-gold mx-auto mb-1" />
                        <div className="text-white font-medium">{tier.perks.deliveryDiscount}%</div>
                        <div className="text-gray-400">Delivery</div>
                      </div>
                      <div className="bg-gray-700/30 rounded p-2 text-center">
                        <Gift className="w-4 h-4 text-otw-gold mx-auto mb-1" />
                        <div className="text-white font-medium">{tier.perks.birthdayBonus}</div>
                        <div className="text-gray-400">Birthday</div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                      {isCurrentTier ? (
                        <Button disabled className="w-full bg-green-600 text-white">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Current Tier
                        </Button>
                      ) : canUpgrade ? (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpgradeTier(tier.id);
                          }}
                          disabled={upgrading === tier.id}
                          className="w-full bg-otw-gold text-black hover:bg-otw-gold/90"
                        >
                          {upgrading === tier.id ? (
                            'Upgrading...'
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              Upgrade Now
                            </>
                          )}
                        </Button>
                      ) : isLocked ? (
                        <Button disabled variant="outline" className="w-full">
                          <span className="text-gray-400">
                            {tier.pointsRequired - (userMembership?.points || 0)} more points
                          </span>
                        </Button>
                      ) : (
                        <Button disabled variant="outline" className="w-full">
                          Sign in to join
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Benefits (Expanded) */}
                {selectedTier === tier.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">All {tier.name} Benefits</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {tier.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                              {benefit}
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <h4 className="text-white font-medium">Delivery Perks</h4>
                            <div className="text-gray-300">
                              • {tier.perks.deliveryDiscount}% delivery discount
                            </div>
                            <div className="text-gray-300">
                              • Free delivery on ${tier.perks.freeDeliveryThreshold}+ orders
                              {tier.perks.freeDeliveryThreshold === 0 && ' (All orders)'}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-white font-medium">Bonus Rewards</h4>
                            <div className="text-gray-300">
                              • {tier.perks.birthdayBonus} birthday bonus points
                            </div>
                            <div className="text-gray-300">
                              • {tier.perks.referralBonus} referral bonus points
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Membership Benefits Overview */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-xl">How Membership Works</CardTitle>
          <CardDescription className="text-gray-400">
            Earn points with every order and unlock exclusive benefits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-otw-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-otw-gold" />
              </div>
              <h3 className="text-white font-medium mb-2">Earn Points</h3>
              <p className="text-gray-400 text-sm">
                Get 1-2 points for every dollar spent, depending on your tier level
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-otw-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-otw-gold" />
              </div>
              <h3 className="text-white font-medium mb-2">Level Up</h3>
              <p className="text-gray-400 text-sm">
                Reach point thresholds to automatically upgrade to higher tiers
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-otw-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6 text-otw-gold" />
              </div>
              <h3 className="text-white font-medium mb-2">Enjoy Benefits</h3>
              <p className="text-gray-400 text-sm">
                Access exclusive discounts, free delivery, and premium support
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
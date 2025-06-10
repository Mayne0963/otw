'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Crown, Shield, Star, Check, Sparkles, Zap, Loader2, Gift, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const tiers = [
  {
    id: 'bronze',
    name: 'Bronze',
    icon: Star,
    color: 'text-orange-400',
    bgGradient: 'from-orange-500/20 to-orange-600/10',
    borderColor: 'border-orange-400/30',
    perks: [
      'Priority support during peak hours',
      '5% off all services',
      'Access to community events',
      'Basic task rewards (50-100 pts)',
      'Monthly newsletter with tips',
      'Standard delivery options',
    ],
    price: 9.99,
    popular: false,
    savings: '$5-15/month',
    features: {
      support: 'Email support',
      delivery: 'Standard',
      rewards: 'Basic',
    },
  },
  {
    id: 'silver',
    name: 'Silver',
    icon: Shield,
    color: 'text-gray-300',
    bgGradient: 'from-gray-400/20 to-gray-500/10',
    borderColor: 'border-gray-400/30',
    perks: [
      'All Bronze perks included',
      '15% off all services',
      'Free monthly service credit ($25)',
      'Exclusive rep selection',
      'Enhanced task rewards (100-200 pts)',
      'Priority queue placement',
      'Advanced order tracking',
    ],
    price: 19.99,
    popular: true,
    savings: '$25-50/month',
    features: {
      support: 'Priority email + chat',
      delivery: 'Express available',
      rewards: 'Enhanced',
    },
  },
  {
    id: 'gold',
    name: 'Gold',
    icon: Crown,
    color: 'text-otw-gold',
    bgGradient: 'from-otw-gold/20 to-yellow-500/10',
    borderColor: 'border-otw-gold/50',
    perks: [
      'All Silver perks included',
      '25% off all services',
      'Priority emergency service (24/7)',
      'Monthly rewards bonus (500 pts)',
      'VIP community status & events',
      'Premium task rewards (200-500 pts)',
      'Dedicated account manager',
      'Free premium delivery',
    ],
    price: 29.99,
    popular: false,
    savings: '$50-100/month',
    features: {
      support: '24/7 phone + dedicated manager',
      delivery: 'Premium + same-day',
      rewards: 'Premium',
    },
  },
];

export default function TierPerks() {
  const { user } = useAuth();
  const [currentTier, setCurrentTier] = useState('bronze');
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState({
    totalSavings: 0,
    ordersThisMonth: 0,
    pointsEarned: 0,
  });

  // Load user tier and stats
  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      if (!user) {
        throw new Error('Please sign in to view your tier information.');
      }

      // Get Firebase ID token with timeout
      const tokenPromise = user.getIdToken(true);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const idToken = await Promise.race([tokenPromise, timeoutPromise]);
      
      // API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('/api/user/tier', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          // User tier not found - set default bronze tier
          setCurrentTier('bronze');
          setUserStats({
            totalSavings: 0,
            ordersThisMonth: 0,
            pointsEarned: 0,
          });
          return;
        }
        throw new Error(`Failed to load tier data: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate response data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }
      
      setCurrentTier(data.currentTier || 'bronze');
      setUserStats({
        totalSavings: data.totalSavings || 0,
        ordersThisMonth: data.ordersThisMonth || 0,
        pointsEarned: data.pointsEarned || 0,
      });
      
    } catch (err) {
      console.error('Error loading user tier data:', err);
      
      if (err.name === 'AbortError') {
        setError('Request timeout. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load tier information');
      }
      
      // Set default state on error
      setCurrentTier('bronze');
      setUserStats({
        totalSavings: 0,
        ordersThisMonth: 0,
        pointsEarned: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  const handleUpgrade = useCallback(async (tierId: string) => {
    if (!user) {
      setError('Please sign in to upgrade your tier.');
      return;
    }

    try {
      setIsUpgrading(tierId);
      setError(null);
      
      // Get Firebase ID token
      const idToken = await user.getIdToken(true);
      
      // API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('/api/user/tier/upgrade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetTier: tierId }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upgrade failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Update tier with smooth transition
      setCurrentTier(tierId);
      setShowSuccess(true);
      
      // Reload user data to reflect changes
      setTimeout(() => {
        loadUserData();
        setShowSuccess(false);
      }, 2000);
      
    } catch (err) {
      console.error('Upgrade error:', err);
      
      if (err.name === 'AbortError') {
        setError('Request timeout. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to upgrade tier');
      }
    } finally {
      setIsUpgrading(null);
    }
  }, [user, loadUserData]);

  const getCurrentTier = () => {
    return tiers.find(tier => tier.id === currentTier) || tiers[0];
  };

  const getCurrentTierName = () => {
    return getCurrentTier().name;
  };

  const getNextTier = () => {
    const currentIndex = tiers.findIndex(tier => tier.id === currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-otw-gold" />
        <p className="text-gray-400">Loading your tier information...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Error Loading Tier Information</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <Button
          onClick={loadUserData}
          className="bg-otw-gold text-black hover:bg-yellow-500"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const currentTierData = getCurrentTier();
  const nextTier = getNextTier();

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right duration-300">
          <Check className="w-5 h-5" />
          <span>Tier upgraded successfully!</span>
        </div>
      )}

      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">${userStats.totalSavings}</div>
              <div className="text-sm text-gray-400">Total Savings</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{userStats.ordersThisMonth}</div>
              <div className="text-sm text-gray-400">Orders This Month</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-otw-gold/20 rounded-full flex items-center justify-center">
               <Star className="w-5 h-5 text-otw-gold" />
             </div>
            <div>
              <div className="text-xl font-bold text-white">{userStats.pointsEarned.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Points Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Tier Status */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              currentTierData.id === 'bronze' && "bg-orange-500/20",
              currentTierData.id === 'silver' && "bg-gray-400/20",
              currentTierData.id === 'gold' && "bg-yellow-500/20"
            )}>
              <Crown className={cn(
                "w-8 h-8",
                currentTierData.id === 'bronze' && "text-orange-400",
                currentTierData.id === 'silver' && "text-gray-300",
                currentTierData.id === 'gold' && "text-otw-gold"
              )} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {currentTierData.name} Member
              </h3>
              <p className="text-gray-400">Enjoying exclusive member benefits</p>
              {nextTier && (
                <p className="text-sm text-otw-gold mt-1">
                  Next: {nextTier.name} (${nextTier.price}/month)
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-otw-gold">
              ${currentTierData.price}<span className="text-lg text-gray-400">/mo</span>
            </div>
            <div className="text-sm text-gray-400">Current Plan</div>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Sparkles className="w-6 h-6 text-otw-gold animate-pulse" />
          <h2 className="text-3xl font-bold text-otw-gold">
            {nextTier ? `Upgrade to ${nextTier.name}` : 'Premium Membership Tiers'}
          </h2>
          <Sparkles className="w-6 h-6 text-otw-gold animate-pulse" />
        </div>
        <p className="text-gray-400 text-lg">
          {nextTier 
            ? `Unlock ${nextTier.name} benefits and save even more` 
            : 'You\'re at the highest tier! Enjoy all premium benefits'
          }
        </p>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const isCurrentTier = tier.id === currentTier;
          const isUpgradingThis = isUpgrading === tier.id;
          const canUpgrade = !isCurrentTier && tiers.findIndex(t => t.id === currentTier) < tiers.findIndex(t => t.id === tier.id);
          const isDowngrade = !isCurrentTier && tiers.findIndex(t => t.id === currentTier) > tiers.findIndex(t => t.id === tier.id);
          
          return (
            <div
              key={tier.id}
              className={cn(
                "relative bg-gray-800/50 rounded-lg p-6 border transition-all duration-300",
                isCurrentTier && "border-otw-gold bg-otw-gold/10 ring-2 ring-otw-gold/20",
                !isCurrentTier && "border-gray-700 hover:border-otw-gold/50 hover:scale-105",
                canUpgrade && "hover:shadow-lg hover:shadow-otw-gold/20"
              )}
            >
              {isCurrentTier && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-otw-gold text-black px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    ✨ Current Tier
                  </span>
                </div>
              )}
              
              {tier.id === 'gold' && !isCurrentTier && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    POPULAR
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300",
                  tier.id === 'bronze' && "bg-amber-600/20",
                  tier.id === 'silver' && "bg-gray-400/20",
                  tier.id === 'gold' && "bg-yellow-500/20"
                )}>
                  <tier.icon className={cn(
                    "w-8 h-8",
                    tier.id === 'bronze' && "text-amber-600",
                    tier.id === 'silver' && "text-gray-400",
                    tier.id === 'gold' && "text-yellow-500"
                  )} />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="text-3xl font-bold text-otw-gold mb-2">
                  ${tier.price}<span className="text-lg text-gray-400">/month</span>
                </div>
                <p className="text-gray-400 mb-4">{tier.savings}</p>
                
                {/* Estimated Savings */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
                  <div className="text-green-400 font-semibold">Est. Monthly Savings</div>
                  <div className="text-2xl font-bold text-green-300">{tier.savings}</div>
                </div>
                
                <div className="space-y-2 mb-6 text-left">
                  {tier.perks.map((perk, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{perk}</span>
                    </div>
                  ))}
                </div>
                
                {canUpgrade && (
                  <Button 
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={isUpgradingThis}
                    className={cn(
                      "w-full font-semibold transition-all duration-300 transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800",
                      tier.id === 'gold' && "bg-gradient-to-r from-yellow-600 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-400 focus:ring-yellow-500 shadow-lg shadow-yellow-500/25",
                      tier.id === 'silver' && "bg-gradient-to-r from-gray-600 to-gray-500 text-white hover:from-gray-500 hover:to-gray-400 focus:ring-gray-500 shadow-lg shadow-gray-500/25",
                      tier.id === 'bronze' && "bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400 focus:ring-amber-500 shadow-lg shadow-amber-500/25",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    )}
                    aria-label={`Upgrade to ${tier.name} tier for $${tier.price} per month`}
                  >
                    {isUpgradingThis ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>Upgrade to {tier.name}</span>
                      </div>
                    )}
                  </Button>
                )}
                
                {isCurrentTier && (
                  <div className="flex items-center justify-center space-x-2 text-otw-gold bg-otw-gold/10 rounded-lg py-3">
                    <Crown className="w-5 h-5" />
                    <span className="font-semibold">Your Current Plan</span>
                  </div>
                )}
                
                {isDowngrade && (
                  <div className="text-gray-500 text-sm py-3">
                    Lower tier than current
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Special Offer Card */}
      {nextTier && (
        <div className="mt-12">
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 animate-pulse" />
            <div className="relative z-10">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Gift className="w-8 h-8 text-purple-400 animate-bounce" />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Limited Time Offer!
                </h3>
                <Gift className="w-8 h-8 text-pink-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
              </div>
              <p className="text-gray-300 text-lg mb-2">
                Upgrade to <span className="text-otw-gold font-semibold">{nextTier.name}</span> and get
              </p>
              <div className="text-3xl font-bold text-green-400 mb-4">
                50% OFF
              </div>
              <p className="text-gray-400 mb-6">
                your first month! Save ${Math.floor(nextTier.price * 0.5)} and unlock all premium benefits.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={() => handleUpgrade(nextTier.id)}
                  disabled={isUpgrading === nextTier.id}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-8 py-3 text-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  {isUpgrading === nextTier.id ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Claim Offer & Upgrade'
                  )}
                </Button>
                <div className="text-sm text-gray-400">
                  ⏰ Offer expires in 24 hours
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* No upgrade available message */}
      {!nextTier && (
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-otw-gold/20 to-yellow-500/20 border border-otw-gold/30 rounded-lg p-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Crown className="w-8 h-8 text-otw-gold" />
              <h3 className="text-2xl font-bold text-otw-gold">You're at the Top!</h3>
              <Crown className="w-8 h-8 text-otw-gold" />
            </div>
            <p className="text-gray-300 text-lg mb-4">
              Congratulations! You're enjoying our highest tier with all premium benefits.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Check className="w-4 h-4 text-green-400" />
                <span>Maximum savings</span>
              </div>
              <div className="flex items-center space-x-1">
                <Check className="w-4 h-4 text-green-400" />
                <span>All features unlocked</span>
              </div>
              <div className="flex items-center space-x-1">
                <Check className="w-4 h-4 text-green-400" />
                <span>Priority support</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

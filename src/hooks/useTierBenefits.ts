import { useState, useEffect } from 'react';
import { useFirestore } from './useFirestore';
import { TierMembership } from '../types/firestore';

export interface TierBenefit {
  id: string;
  name: string;
  description: string;
  tiers: ('silver' | 'gold' | 'platinum')[];
  usageLimit?: number;
  resetPeriod?: 'daily' | 'weekly' | 'monthly';
}

export interface TierUsage {
  id: string;
  userId: string;
  benefitId: string;
  usageCount: number;
  lastReset: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TIER_BENEFITS: TierBenefit[] = [
  {
    id: 'free-delivery',
    name: 'Free Delivery',
    description: 'Free delivery on all orders',
    tiers: ['silver', 'gold', 'platinum'],
    usageLimit: 5,
    resetPeriod: 'monthly',
  },
  {
    id: 'priority-support',
    name: 'Priority Support',
    description: '24/7 priority customer support',
    tiers: ['gold', 'platinum'],
  },
  {
    id: 'exclusive-events',
    name: 'Exclusive Events',
    description: 'Access to exclusive community events',
    tiers: ['platinum'],
    usageLimit: 2,
    resetPeriod: 'monthly',
  },
  {
    id: 'discount-10',
    name: '10% Discount',
    description: '10% off all orders',
    tiers: ['silver', 'gold', 'platinum'],
    usageLimit: 10,
    resetPeriod: 'monthly',
  },
  {
    id: 'discount-20',
    name: '20% Discount',
    description: '20% off all orders',
    tiers: ['gold', 'platinum'],
    usageLimit: 5,
    resetPeriod: 'monthly',
  },
];

export function useTierBenefits(userId: string, tier: 'free' | 'silver' | 'gold' | 'platinum') {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [usage, setUsage] = useState<Record<string, TierUsage>>({});
  
  const { getDocuments, setDocument, subscribeToCollection } = useFirestore<TierUsage>('tierUsage');

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToCollection((data) => {
      const usageMap = data.reduce((acc, usage) => {
        acc[usage.benefitId] = usage;
        return acc;
      }, {} as Record<string, TierUsage>);
      setUsage(usageMap);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const getAvailableBenefits = () => {
    return TIER_BENEFITS.filter(benefit => 
      benefit.tiers.includes(tier as 'silver' | 'gold' | 'platinum')
    );
  };

  const checkBenefitAvailability = (benefitId: string) => {
    const benefit = TIER_BENEFITS.find(b => b.id === benefitId);
    if (!benefit) return false;

    const currentUsage = usage[benefitId];
    if (!benefit.usageLimit) return true;

    if (!currentUsage) return true;

    const now = new Date();
    const lastReset = new Date(currentUsage.lastReset);
    let shouldReset = false;

    switch (benefit.resetPeriod) {
      case 'daily':
        shouldReset = now.getDate() !== lastReset.getDate();
        break;
      case 'weekly':
        shouldReset = now.getWeek() !== lastReset.getWeek();
        break;
      case 'monthly':
        shouldReset = now.getMonth() !== lastReset.getMonth();
        break;
    }

    if (shouldReset) {
      return true;
    }

    return currentUsage.usageCount < benefit.usageLimit;
  };

  const useBenefit = async (benefitId: string) => {
    try {
      const benefit = TIER_BENEFITS.find(b => b.id === benefitId);
      if (!benefit) throw new Error('Benefit not found');

      if (!checkBenefitAvailability(benefitId)) {
        throw new Error('Benefit usage limit reached');
      }

      const currentUsage = usage[benefitId];
      const now = new Date();

      if (!currentUsage) {
        // Create new usage record
        await setDocument(`${userId}_${benefitId}`, {
          id: `${userId}_${benefitId}`,
          userId,
          benefitId,
          usageCount: 1,
          lastReset: now,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        // Update existing usage record
        const shouldReset = checkBenefitAvailability(benefitId);
        await setDocument(`${userId}_${benefitId}`, {
          usageCount: shouldReset ? 1 : currentUsage.usageCount + 1,
          lastReset: shouldReset ? now : currentUsage.lastReset,
          updatedAt: now,
        });
      }

      return true;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    loading,
    error,
    getAvailableBenefits,
    checkBenefitAvailability,
    useBenefit,
  };
} 
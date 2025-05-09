import { useState, useEffect } from 'react';
import { useFirestore } from './useFirestore';
import { TierMembership } from '../types/firestore';
import { getStripe } from '../lib/stripe';

export function useTierMembership(userId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [membership, setMembership] = useState<TierMembership | null>(null);
  
  const { getDocument, setDocument, subscribeToDocument } = useFirestore<TierMembership>('tierMemberships');

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToDocument(userId, (data) => {
      setMembership(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const createCheckoutSession = async (tier: 'silver' | 'gold' | 'platinum') => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          tier,
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await getStripe();
      
      if (!stripe) throw new Error('Stripe failed to initialize');
      
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const cancelSubscription = async () => {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      });

      if (!response.ok) throw new Error('Failed to cancel subscription');
      
      await setDocument(userId, {
        status: 'canceled',
        endDate: new Date(),
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    loading,
    error,
    membership,
    createCheckoutSession,
    cancelSubscription,
  };
} 
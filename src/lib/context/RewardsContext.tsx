'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Reward, RewardHistory } from '../../types';

interface RewardsContextType {
  points: number;
  tier: string;
  rewards: Reward[];
  history: RewardHistory[];
  addPoints: (amount: number) => void;
  redeemReward: (reward: Reward) => boolean;
  spinWheel: () => number;
}

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

export const useRewards = () => {
  const context = useContext(RewardsContext);
  if (context === undefined) {
    throw new Error('useRewards must be used within a RewardsProvider');
  }
  return context;
};

interface RewardsProviderProps {
  children: React.ReactNode;
}

export const RewardsProvider: React.FC<RewardsProviderProps> = ({
  children,
}) => {
  const [points, setPoints] = useState(0);
  const [tier, setTier] = useState('Bronze');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [history, setHistory] = useState<RewardHistory[]>([]);

  // Load rewards data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPoints = localStorage.getItem('rewardsPoints');
      const savedTier = localStorage.getItem('rewardsTier');
      const savedHistory = localStorage.getItem('rewardsHistory');

      if (savedPoints) {setPoints(Number.parseInt(savedPoints, 10));}
      if (savedTier) {setTier(savedTier);}
      if (savedHistory) {setHistory(JSON.parse(savedHistory));}

      // Fetch rewards from API
      const fetchRewards = async () => {
        try {
          const response = await fetch('/api/rewards');
          if (response.ok) {
            const data = await response.json();
            setRewards(data.data || []);
          } else {
            console.error('Failed to fetch rewards');
          }
        } catch (error) {
          console.error('Error fetching rewards:', error);
        }
      };

      fetchRewards();
    }
  }, []);

  // Update localStorage when state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rewardsPoints', points.toString());
      localStorage.setItem('rewardsTier', tier);
      localStorage.setItem('rewardsHistory', JSON.stringify(history));
    }
  }, [points, tier, history]);

  // Update tier based on points
  useEffect(() => {
    if (points >= 1000) {
      setTier('Gold');
    } else if (points >= 500) {
      setTier('Silver');
    } else {
      setTier('Bronze');
    }
  }, [points]);

  const addPoints = (amount: number) => {
    setPoints((prevPoints) => prevPoints + amount);

    // Add to history
    const newHistoryItem: RewardHistory = {
      id: `history-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'earned',
      points: amount,
      description: `Earned ${amount} points`,
    };

    setHistory((prevHistory) => [newHistoryItem, ...prevHistory]);
  };

  const redeemReward = (reward: Reward): boolean => {
    if (points >= reward.points) {
      setPoints((prevPoints) => prevPoints - reward.points);

      // Add to history
      const newHistoryItem: RewardHistory = {
        id: `history-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'redeemed',
        points: -reward.points,
        description: `Redeemed ${reward.name}`,
        reward: reward,
      };

      setHistory((prevHistory) => [newHistoryItem, ...prevHistory]);
      return true;
    }
    return false;
  };

  const spinWheel = (): number => {
    // Generate a random number of points between 10 and 100
    const randomPoints = Math.floor(Math.random() * 91) + 10;
    addPoints(randomPoints);
    return randomPoints;
  };

  return (
    <RewardsContext.Provider
      value={{
        points,
        tier,
        rewards,
        history,
        addPoints,
        redeemReward,
        spinWheel,
      }}
    >
      {children}
    </RewardsContext.Provider>
  );
};

import { useState, useEffect } from 'react';
import { useFirestore } from './useFirestore';
import { Volunteer } from '../types/firestore';
import { orderBy } from 'firebase/firestore';

export function useVolunteer(userId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);

  const { getDocument, setDocument, subscribeToDocument, getDocuments } =
    useFirestore<Volunteer>('volunteers');

  useEffect(() => {
    if (!userId) {return;}

    const unsubscribe = subscribeToDocument(userId, (data) => {
      setVolunteer(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, subscribeToDocument]);

  const logHours = async (activity: {
    type: string;
    hours: number;
    description: string;
  }) => {
    try {
      const currentVolunteer = await getDocument(userId);
      const newActivity = {
        id: Date.now().toString(),
        ...activity,
        date: new Date(),
      };

      if (!currentVolunteer) {
        // Create new volunteer record
        await setDocument(userId, {
          userId,
          hours: activity.hours,
          activities: [newActivity],
          badges: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        // Update existing volunteer record
        const updatedActivities = [...currentVolunteer.activities, newActivity];
        const totalHours = updatedActivities.reduce(
          (sum, act) => sum + act.hours,
          0,
        );

        // Check for badge achievements
        const newBadges = checkBadgeAchievements(
          totalHours,
          currentVolunteer.badges,
        );

        await setDocument(userId, {
          hours: totalHours,
          activities: updatedActivities,
          badges: newBadges,
          updatedAt: new Date(),
        });
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const getLeaderboard = async () => {
    try {
      // Use the getDocuments function with proper constraints
      return await getDocuments([orderBy('hours', 'desc')]);
    } catch (err) {
      setError(err as Error);
      return [];
    }
  };

  const checkBadgeAchievements = (
    totalHours: number,
    currentBadges: string[],
  ) => {
    const newBadges = [...currentBadges];

    // Define badge thresholds
    const badgeThresholds = {
      bronze: 10,
      silver: 50,
      gold: 100,
      platinum: 250,
      diamond: 500,
    };

    // Check for new badges
    Object.entries(badgeThresholds).forEach(([badge, threshold]) => {
      if (totalHours >= threshold && !currentBadges.includes(badge)) {
        newBadges.push(badge);
      }
    });

    return newBadges;
  };

  return {
    loading,
    error,
    volunteer,
    logHours,
    getLeaderboard,
  };
}

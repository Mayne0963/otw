"use client"

import React, { useEffect, useState } from 'react' // Added React import
import { Card } from '../ui/card'
import { Button } from '../ui/button'
// import { Progress } from '../ui/progress' // Removed unused Progress import
import { Badge } from '../ui/badge'
import Confetti from 'react-confetti'

interface PrizeHistoryItem {
  prize: string
  date: string | Date
}

interface UserProfileData {
  rewardPoints: number;
  // Add other user properties if available from API
}

interface RewardsData {
  spinsRemaining: number;
  prizeHistory: PrizeHistoryItem[];
  lastSpinTime: string | null; // Assuming it can be a string date or null
}

interface ProfileResponse {
  user: UserProfileData;
  rewards: RewardsData;
  // Add other profile properties if available from API
}

interface SpinResultData {
  prize?: {
    name: string;
    type: string;
  };
  error?: string;
  wait?: number;
  // Add other spin result properties if available from API
}

// These interfaces are defined but not used in this component
// They are kept here for documentation purposes but commented out to avoid linting warnings
/*
interface Reward {
  id: string;
  name: string;
  pointsRequired: number;
  description: string;
}

interface Redemption {
  id: string;
  rewardId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}
*/

export default function RewardsDashboard() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null) // Typed profile
  const [loading, setLoading] = useState(true)
  const [spinning, setSpinning] = useState(false)
  const [spinResult, setSpinResult] = useState<SpinResultData | null>(null) // Typed spinResult
  const [showConfetti, setShowConfetti] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // const [availableRewards, setAvailableRewards] = React.useState<Reward[]>([]); // Commented out if unused
  // const [redemptionHistory, setRedemptionHistory] = React.useState<Redemption[]>([]); // Commented out if unused

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      try {
        // Assume Firebase Auth client SDK is available
        const token = await (window as any).firebase?.auth().currentUser?.getIdToken()
        const res = await fetch('/api/user-profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data: ProfileResponse = await res.json() // Typed data
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        setProfile(null); // Set profile to null on error
      } finally {
        setLoading(false)
      }
    }
    void fetchProfile() // Added void to handle no-floating-promises
  }, [spinResult]) // Consider if spinResult should trigger a full profile reload

  const handleSpin = async () => {
    setSpinning(true)
    setError(null)
    setSpinResult(null)
    try {
      const token = await (window as any).firebase?.auth().currentUser?.getIdToken()
      const res = await fetch('/api/redeem-spin', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data: SpinResultData = await res.json() // Typed data
      if (data.error) {
        setError(data.error === 'Cooldown' ? `Please wait ${Math.ceil((data.wait || 0) / 60)} min before your next spin.` : data.error)
      } else {
        setSpinResult(data)
        if (data.prize && data.prize.type !== 'none') {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 4000)
        }
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSpinning(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading rewards...</div>
  if (!profile || !profile.user || !profile.rewards) return <div className="text-center py-12 text-red-500">Could not load profile data.</div> // Added null check for profile.user and profile.rewards

  const { rewards, user } = profile
  const spinsRemaining = rewards?.spinsRemaining || 0
  const prizeHistory: PrizeHistoryItem[] = rewards?.prizeHistory || []
  const lastSpinTime = rewards?.lastSpinTime ? new Date(rewards.lastSpinTime) : null

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {showConfetti && typeof window !== 'undefined' && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />}
      <Card className="p-6 flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-2">Rewards Dashboard</h2>
        <div className="flex items-center gap-4">
          <Badge variant="success">Points: {user.rewardPoints}</Badge>
          <Badge variant={spinsRemaining > 0 ? 'default' : 'destructive'}>
            Spins Remaining: {spinsRemaining}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <Button
            onClick={handleSpin}
            disabled={spinning || spinsRemaining < 1}
            className="bg-otw-gold-600 hover:bg-otw-gold-700 text-otw-black-950 font-bold px-6 py-2"
          >
            {spinning ? 'Spinning...' : 'Spin the Wheel!'}
          </Button>
          {error && <span className="text-red-500 text-sm">{error}</span>}
        </div>
        {spinResult && (
          <div className="mt-4 text-center">
            <h3 className="text-xl font-bold mb-2">{spinResult.prize?.name || 'No Prize'}</h3>
            <p className="text-gray-400">{spinResult.prize?.type === 'none' ? 'Better luck next time!' : 'Congratulations!'}</p>
          </div>
        )}
        {lastSpinTime && (
          <div className="text-xs text-gray-400 mt-2">Last spin: {lastSpinTime.toLocaleString()}</div>
        )}
      </Card>
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Prize History</h3>
        {prizeHistory.length === 0 ? (
          <div className="text-gray-500">No spins yet.</div>
        ) : (
          <ul className="space-y-2">
            {prizeHistory.slice().reverse().map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="font-medium text-otw-gold-600">{item.prize}</span>
                <span className="text-xs text-gray-400">{new Date(item.date).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
} 

// Removed unused functions and state related to handleRedemption, fetchUserData, etc.
// If they are needed, they should be properly typed and integrated.
// For example, if firebase is used directly:
// import firebase from 'firebase/app'; // Or your specific firebase setup
// import 'firebase/firestore';

// Example of how firebase might be typed if used directly (adjust based on your setup)
/*
interface FirebaseApp {
  auth: () => firebase.auth.Auth;
  firestore: () => firebase.firestore.Firestore;
  // Add other firebase services you use
}

// If you have a global firebase instance or context:
// const firebaseApp = (window as any).firebase as FirebaseApp;
*/
"use client"

import { useEffect, useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import Confetti from 'react-confetti'

interface PrizeHistoryItem {
  prize: string
  date: string | Date
}

export default function RewardsDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [spinning, setSpinning] = useState(false)
  const [spinResult, setSpinResult] = useState<any>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      // Assume Firebase Auth client SDK is available
      const token = await (window as any).firebase?.auth().currentUser?.getIdToken()
      const res = await fetch('/api/user-profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setProfile(data)
      setLoading(false)
    }
    fetchProfile()
  }, [spinResult])

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
      const data = await res.json()
      if (data.error) {
        setError(data.error === 'Cooldown' ? `Please wait ${Math.ceil(data.wait / 60)} min before your next spin.` : data.error)
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
  if (!profile) return <div className="text-center py-12 text-red-500">Could not load profile.</div>

  const { rewards, user } = profile
  const spinsRemaining = rewards?.spinsRemaining || 0
  const prizeHistory: PrizeHistoryItem[] = rewards?.prizeHistory || []
  const lastSpinTime = rewards?.lastSpinTime ? new Date(rewards.lastSpinTime) : null

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />}
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
            <h3 className="text-xl font-bold mb-2">{spinResult.prize?.name}</h3>
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
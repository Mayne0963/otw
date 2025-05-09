"use client"

import { useEffect, useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import AvatarUpload from './AvatarUpload'

export default function UserProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      const token = await (window as any).firebase?.auth().currentUser?.getIdToken()
      const res = await fetch('/api/user-profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setProfile(data)
      setName(data.user?.name || '')
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const token = await (window as any).firebase?.auth().currentUser?.getIdToken()
      const res = await fetch('/api/user-profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to update name')
      setProfile((p: any) => ({ ...p, user: { ...p.user, name } }))
      setEditing(false)
      setSaving(false)
    } catch (e: any) {
      setError(e.message)
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading profile...</div>
  if (!profile) return <div className="text-center py-12 text-red-500">Could not load profile.</div>

  const { user, orders } = profile
  // Example badges
  const badges = [
    user.role === 'admin' && { label: 'Admin', color: 'destructive' },
    user.rewardPoints > 100 && { label: 'VIP', color: 'success' },
    orders.length > 0 && { label: 'First Order', color: 'default' },
  ].filter(Boolean)

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="p-6 flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-2">Profile</h2>
        <div className="flex items-center gap-4 mb-2">
          <AvatarUpload user={user} onUpload={url => setProfile((p: any) => ({ ...p, user: { ...p.user, photoURL: url } }))} />
          <div className="flex flex-col gap-2">
            {badges.map((b: any, i: number) => (
              <Badge key={i} variant={b.color}>{b.label}</Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Name</label>
          {editing ? (
            <div className="flex gap-2">
              <Input value={name} onChange={e => setName(e.target.value)} />
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>{user.name}</span>
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>Edit</Button>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Email</label>
          <span>{user.email}</span>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Role</label>
          <span>{user.role}</span>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Reward Points</label>
          <span>{user.rewardPoints}</span>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </Card>
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Order History</h3>
        {orders.length === 0 ? (
          <div className="text-gray-500">No orders yet.</div>
        ) : (
          <ul className="space-y-2">
            {orders.map((order: any, i: number) => (
              <li key={i} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-otw-black-800 pb-2">
                <span className="font-medium text-otw-gold-600">Order #{order.stripeId?.slice(-6) || i + 1}</span>
                <span className="text-xs text-gray-400">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : new Date(order.createdAt).toLocaleString()}</span>
                <span className="text-sm">${order.total?.toFixed(2)}</span>
                <span className="text-xs capitalize">{order.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
} 
'use client';

import React, { useEffect, useState } from 'react'; // Added React import
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import AvatarUpload from './AvatarUpload';

// Define interfaces for better type safety
interface User {
  uid: string;
  name: string;
  email: string;
  role: string;
  rewardPoints: number;
  photoURL?: string;
}

interface Order {
  stripeId?: string;
  createdAt: string | { toDate: () => Date }; // Can be a string or a Firebase Timestamp-like object
  total?: number;
  status: string;
}

interface ProfileData {
  user: User;
  orders: Order[];
}

// These interfaces are defined but not used in this component
// They are kept here for documentation purposes but commented out to avoid linting warnings
/*
interface ApiError {
  message: string;
}

// This interface seems to be for a global FirebaseApp object, which is not ideal.
// If Firebase is used, it should ideally be imported and typed correctly.
// For now, we'll keep it if (window as any).firebase is used, but add specific services.
interface FirebaseApp {
  auth: () => {
    currentUser?: {
      getIdToken: () => Promise<string>;
      uid: string;
    };
  };
  // Add other Firebase services if used, e.g., firestore, storage
}
*/

export default function UserProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [firebase] = useState<FirebaseApp>(() => ({} as FirebaseApp)); // Unused, (window as any).firebase is used instead
  // const [user, setUser] = useState<User | null>(null); // This seems to be a duplicate or misplaced state

  useEffect(() => {
    async function fetchProfileData() {
      setLoading(true);
      setError(null);
      try {
        const firebaseAuth = (window as any).firebase?.auth();
        if (!firebaseAuth || !firebaseAuth.currentUser) {
          throw new Error('Firebase user not available.');
        }
        const token = await firebaseAuth.currentUser.getIdToken();
        const res = await fetch('/api/user-profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.error || `Failed to fetch profile: ${res.statusText}`,
          );
        }
        const data: ProfileData = await res.json();
        setProfile(data);
        setName(data.user?.name || '');
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : 'An unknown error occurred while fetching profile.',
        );
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    void fetchProfileData(); // Handle no-floating-promises
  }, []);

  const handleSave = async () => {
    if (!profile) {return;}
    setSaving(true);
    setError(null);
    try {
      const firebaseAuth = (window as any).firebase?.auth();
      if (!firebaseAuth || !firebaseAuth.currentUser) {
        throw new Error('Firebase user not available.');
      }
      const token = await firebaseAuth.currentUser.getIdToken();
      const res = await fetch('/api/user-profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json(); // Assuming API returns { success: boolean, error?: string, user?: User }
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update name');
      }
      // Assuming the API returns the updated user object or we update it locally
      setProfile((prevProfile) =>
        prevProfile
          ? {
              ...prevProfile,
              user: { ...prevProfile.user, name },
            }
          : null,
      );
      setEditing(false);
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : 'An unknown error occurred while saving.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    {return <div className="text-center py-12">Loading profile...</div>;}
  if (error)
    {return <div className="text-center py-12 text-red-500">Error: {error}</div>;}
  if (!profile)
    {return (
      <div className="text-center py-12 text-red-500">
        Could not load profile.
      </div>
    );}

  const { user, orders } = profile;

  interface BadgeInfo {
    label: string;
    color:
      | 'destructive'
      | 'default'
      | 'secondary'
      | 'outline'
      | null
      | undefined;
  }

  const badges: BadgeInfo[] = [
    user.role === 'admin' && { label: 'Admin', color: 'destructive' },
    user.rewardPoints > 100 && { label: 'VIP', color: 'secondary' },
    orders && orders.length > 0 && { label: 'First Order', color: 'default' },
  ].filter(Boolean) as BadgeInfo[];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="p-6 flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-2">Profile</h2>
        <div className="flex items-center gap-4 mb-2">
          <AvatarUpload
            user={user}
            onUpload={(url) =>
              setProfile((p) =>
                p ? { ...p, user: { ...p.user, photoURL: url } } : null,
              )
            }
          />
          <div className="flex flex-col gap-2">
            {badges.map((b, i) => (
              <Badge key={i} variant={b.color}>
                {b.label}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="nameInput" className="font-semibold">
            Name
          </label>
          {editing ? (
            <div className="flex gap-2">
              <Input
                id="nameInput"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button
                onClick={async () => await handleSave()}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>{user.name}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="emailDisplay" className="font-semibold">
            Email
          </label>
          <span id="emailDisplay">{user.email}</span>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="roleDisplay" className="font-semibold">
            Role
          </label>
          <span id="roleDisplay">{user.role}</span>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="rewardPointsDisplay" className="font-semibold">
            Reward Points
          </label>
          <span id="rewardPointsDisplay">{user.rewardPoints}</span>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Order History</h3>
        {!orders || orders.length === 0 ? (
          <div className="text-gray-500">No orders yet.</div>
        ) : (
          <ul className="space-y-2">
            {orders.map((order, i) => (
              <li
                key={order.stripeId || i}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-otw-black-800 pb-2"
              >
                <span className="font-medium text-otw-gold-600">
                  Order #{order.stripeId?.slice(-6) || i + 1}
                </span>
                <span className="text-xs text-gray-400">
                  {(() => {
                  try {
                    let dateObj: Date;
                    
                    // Handle Firestore Timestamp objects
                    if (order.createdAt && typeof order.createdAt === 'object' && typeof order.createdAt.toDate === 'function') {
                      dateObj = order.createdAt.toDate();
                    }
                    // Handle Firebase Timestamp-like objects with seconds property
                    else if (order.createdAt && typeof order.createdAt === 'object' && order.createdAt.seconds) {
                      dateObj = new Date(order.createdAt.seconds * 1000);
                    }
                    // Handle Date objects
                    else if (order.createdAt instanceof Date) {
                      dateObj = order.createdAt;
                    }
                    // Handle string dates
                    else if (typeof order.createdAt === 'string') {
                      dateObj = new Date(order.createdAt);
                    }
                    // Handle numeric timestamps
                    else if (typeof order.createdAt === 'number') {
                      dateObj = new Date(order.createdAt);
                    }
                    else {
                      return 'N/A';
                    }
                    
                    // Validate the resulting date
                    if (isNaN(dateObj.getTime())) {
                      return 'Invalid Date';
                    }
                    
                    return dateObj.toLocaleString();
                  } catch (error) {
                    console.warn('Date formatting error:', error, 'for date:', order.createdAt);
                    return 'N/A';
                  }
                })()}
                </span>
                <span className="text-sm">
                  ${order.total?.toFixed(2) || '0.00'}
                </span>
                <span className="text-xs capitalize">{order.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// Removed unused interfaces like ApiResponse at the bottom, as they are defined locally or not used.
// Removed misplaced useState and handleUploadPhoto function as they seem to belong to AvatarUpload or are unused.

'use client';

import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import MenuAdmin from './MenuAdmin';

const TABS = [
  { key: 'menu', label: 'Menu' },
  { key: 'orders', label: 'Orders' },
  { key: 'rewards', label: 'Rewards' },
  { key: 'users', label: 'Users' },
  { key: 'analytics', label: 'Analytics' },
];

export default function AdminDashboard() {
  const [, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('menu');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const token = await (window as any).firebase
        ?.auth()
        .currentUser?.getIdToken();
      const res = await fetch('/api/user-profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.user?.role !== 'admin') {
        setError('Access denied: Admins only');
      } else {
        setProfile(data);
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  if (loading)
    {return <div className="text-center py-12">Loading admin dashboard...</div>;}
  if (error)
    {return <div className="text-center py-12 text-red-500">{error}</div>;}

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card className="p-6 flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
        <div className="flex gap-2 mb-4">
          {TABS.map((t) => (
            <Button
              key={t.key}
              variant={tab === t.key ? 'default' : 'outline'}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </Button>
          ))}
        </div>
        <div className="mt-4">
          {tab === 'menu' && <MenuAdmin />}
          {tab === 'orders' && <div>Order Management (coming soon)</div>}
          {tab === 'rewards' && <div>Rewards Management (coming soon)</div>}
          {tab === 'users' && <div>User Management (coming soon)</div>}
          {tab === 'analytics' && <div>Analytics Overview (coming soon)</div>}
        </div>
      </Card>
    </div>
  );
}

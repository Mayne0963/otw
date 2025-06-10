'use client';

export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { User, CreditCard, MapPin, Bell, Shield, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase-config';
import type { UserProfile } from '../../types';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  default: boolean;
}

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiry: string;
  default: boolean;
}

interface UserData {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  memberSince: string;
  tier: string;
  rewardPoints: number;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('account');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Fetch user profile data from Firebase with timeout and error handling
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchUserData = async () => {
      if (!user?.uid) {
        if (isMounted) setLoading(false);
        return;
      }

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 15000); // 15 second timeout

      try {
        // Fetch user profile from Firestore with timeout
        const userDocRef = doc(db, 'users', user.uid);
        const userDocPromise = getDoc(userDocRef);
        
        // Race between the fetch and timeout
        const userDoc = await Promise.race([
          userDocPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
          )
        ]) as any;

        let profileData: Partial<UserProfile> = {};
        if (userDoc?.exists()) {
          profileData = userDoc.data() as UserProfile;
        }

        // Fetch user addresses with error handling
        let addresses: Address[] = [];
        try {
          const addressesQuery = query(
            collection(db, 'addresses'),
            where('userId', '==', user.uid),
          );
          const addressesSnapshot = await Promise.race([
            getDocs(addressesQuery),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Addresses fetch timeout')), 8000)
            )
          ]) as any;
          
          addresses = addressesSnapshot?.docs?.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
          })) || [];
        } catch (addressError) {
          console.warn('Failed to fetch addresses:', addressError);
          addresses = [];
        }

        // Fetch user payment methods with error handling
        let paymentMethods: PaymentMethod[] = [];
        try {
          const paymentMethodsQuery = query(
            collection(db, 'paymentMethods'),
            where('userId', '==', user.uid),
          );
          const paymentMethodsSnapshot = await Promise.race([
            getDocs(paymentMethodsQuery),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Payment methods fetch timeout')), 8000)
            )
          ]) as any;
          
          paymentMethods = paymentMethodsSnapshot?.docs?.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
          })) || [];
        } catch (paymentError) {
          console.warn('Failed to fetch payment methods:', paymentError);
          paymentMethods = [];
        }

        // Calculate member since date
        const memberSince = profileData.createdAt
          ? new Date(profileData.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
            })
          : 'Recently';

        // Determine tier based on reward points
        const points = profileData.rewardPoints || 0;
        let tier = 'Bronze';
        if (points >= 1000) {tier = 'Gold';}
        else if (points >= 500) {tier = 'Silver';}

        if (isMounted) {
          setUserData({
            name: user.displayName || profileData.displayName || 'User',
            email: user.email || profileData.email || '',
            phone: profileData.phone || '',
            avatar: user.photoURL || profileData.photoURL || '',
            memberSince,
            tier,
            rewardPoints: points,
            addresses,
            paymentMethods,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        
        // Fallback to basic user data from auth
        if (isMounted && user) {
          setUserData({
            name: user.displayName || 'User',
            email: user.email || '',
            phone: '',
            avatar: user.photoURL || '',
            memberSince: 'Recently',
            tier: 'Bronze',
            rewardPoints: 0,
            addresses: [],
            paymentMethods: [],
          });
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) setLoading(false);
      }
    };

    fetchUserData();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="min-h-screen pb-20 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-otw-gold mx-auto mb-4"></div>
          <p className="text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="min-h-screen pb-20 pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Please sign in to view your profile.</p>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage
                      src={userData.avatar || '/assets/users/default-avatar.jpg'}
                      alt={userData.name}
                    />
                    <AvatarFallback>
                      {userData.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle>{userData.name}</CardTitle>
                  <CardDescription>
                    Member since {userData.memberSince}
                  </CardDescription>
                  <Badge className="mt-2 bg-otw-gold text-black">
                    {userData.tier} Member
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <nav className="flex flex-col space-y-1">
                  <Button
                    variant={activeTab === 'account' ? 'default' : 'ghost'}
                    className="justify-start"
                    onClick={() => setActiveTab('account')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </Button>
                  <Button
                    variant={activeTab === 'addresses' ? 'default' : 'ghost'}
                    className="justify-start"
                    onClick={() => setActiveTab('addresses')}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Addresses
                  </Button>
                  <Button
                    variant={activeTab === 'payment' ? 'default' : 'ghost'}
                    className="justify-start"
                    onClick={() => setActiveTab('payment')}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment Methods
                  </Button>
                  <Button
                    variant={
                      activeTab === 'notifications' ? 'default' : 'ghost'
                    }
                    className="justify-start"
                    onClick={() => setActiveTab('notifications')}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </Button>
                  <Button
                    variant={activeTab === 'security' ? 'default' : 'ghost'}
                    className="justify-start"
                    onClick={() => setActiveTab('security')}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Security
                  </Button>
                </nav>
              </CardContent>
              <CardFooter>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardFooter>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Tier Membership</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span>Current Tier:</span>
                  <Badge className="bg-otw-gold text-black">{userData.tier}</Badge>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span>Reward Points:</span>
                  <span className="font-semibold">{userData.rewardPoints}</span>
                </div>
                <Link href="/tier">
                  <Button variant="outline" className="w-full">
                    Manage Membership
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Account Tab */}
            {activeTab === 'account' && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          defaultValue={userData.name}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue={userData.email}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          defaultValue={userData.phone || ''}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input id="dob" type="date" className="mt-1" />
                      </div>
                    </div>

                    <div>
                      <Button>Save Changes</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <Card>
                <CardHeader>
                  <CardTitle>Saved Addresses</CardTitle>
                  <CardDescription>
                    Manage your delivery addresses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {userData.addresses.map((address) => (
                      <div
                        key={address.id}
                        className="bg-gray-900 p-4 rounded-lg border border-gray-800"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{address.name}</h3>
                            <p className="text-sm text-gray-400">
                              {address.street}
                              <br />
                              {address.city}, {address.state} {address.zip}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm">
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      Add New Address
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment options</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {userData.paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="bg-gray-900 p-4 rounded-lg border border-gray-800"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-bold">
                                {method.type} •••• {method.last4}
                              </h3>
                              {method.default && (
                                <Badge className="ml-2 bg-otw-gold text-black">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-400 mt-1">
                              Expires {method.expiry}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {!method.default && (
                              <Button variant="outline" size="sm">
                                Set as Default
                              </Button>
                            )}
                            {!method.default && (
                              <Button variant="destructive" size="sm">
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button>Add New Payment Method</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how we contact you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">Order Updates</h3>
                        <p className="text-gray-400">
                          Receive updates about your orders
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="order-email"
                            className="rounded border-gray-600 text-otw-gold focus:ring-otw-gold"
                            defaultChecked
                          />
                          <Label htmlFor="order-email">Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="order-sms"
                            className="rounded border-gray-600 text-otw-gold focus:ring-otw-gold"
                            defaultChecked
                          />
                          <Label htmlFor="order-sms">SMS</Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">Promotions</h3>
                        <p className="text-gray-400">
                          Receive special offers and promotions
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="promo-email"
                            className="rounded border-gray-600 text-otw-gold focus:ring-otw-gold"
                            defaultChecked
                          />
                          <Label htmlFor="promo-email">Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="promo-sms"
                            className="rounded border-gray-600 text-otw-gold focus:ring-otw-gold"
                          />
                          <Label htmlFor="promo-sms">SMS</Label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Button>Save Changes</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

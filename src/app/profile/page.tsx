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
import { User, CreditCard, MapPin, Bell, Shield, LogOut, Phone, Info, Home, Building, Briefcase } from 'lucide-react';
import AvatarUpload from '../../components/profile/AvatarUpload';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase-config';
import type { UserProfile } from '../../types';

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  nickname?: string;
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  deliveryInstructions?: string;
  accessCode?: string;
  businessHours?: {
    start: string;
    end: string;
    days: string[];
  };
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal' | 'apple_pay' | 'google_pay';
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  holderName: string;
  isDefault: boolean;
  isVerified: boolean;
  nickname?: string;
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  stripePaymentMethodId?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
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
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        const timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn('Data fetch timeout, using fallback');
            setUserData({
              name: user.displayName || 'User',
              email: user.email || '',
              avatar: user.photoURL || '',
              memberSince: 'Recently',
              tier: 'Bronze',
              rewardPoints: 0,
              addresses: [],
              paymentMethods: []
            });
            setAddresses([]);
            setPaymentMethods([]);
            setLoading(false);
          }
        }, 10000);

        // Fetch user profile
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        // Fetch addresses
        const addressesQuery = query(
          collection(db, 'addresses'),
          where('userId', '==', user.uid)
        );
        const addressesSnapshot = await getDocs(addressesQuery);
        const addressesData = addressesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Address[];

        // Fetch payment methods
        const paymentMethodsQuery = query(
          collection(db, 'paymentMethods'),
          where('userId', '==', user.uid)
        );
        const paymentMethodsSnapshot = await getDocs(paymentMethodsQuery);
        const paymentMethodsData = paymentMethodsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PaymentMethod[];

        if (userDoc.exists() && isMounted) {
          const profileData = userDoc.data() as UserProfile;
          
          // Calculate member since date
          const memberSince = profileData.createdAt 
            ? new Date(profileData.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })
            : 'Recently';

          // Calculate tier based on reward points
          const rewardPoints = profileData.rewardPoints || 0;
          let tier = 'Bronze';
          if (rewardPoints >= 1000) tier = 'Gold';
          else if (rewardPoints >= 500) tier = 'Silver';

          const userData = {
            name: profileData.name || user.displayName || 'User',
            email: profileData.email || user.email || '',
            phone: profileData.phone,
            avatar: profileData.photoURL || user.photoURL || '',
            memberSince,
            tier,
            rewardPoints,
            addresses: addressesData,
            paymentMethods: paymentMethodsData
          };

          setUserData(userData);
          setAddresses(addressesData);
          setPaymentMethods(paymentMethodsData);
        } else if (isMounted) {
          // Fallback for new users
          const fallbackData = {
            name: user.displayName || 'User',
            email: user.email || '',
            avatar: user.photoURL || '',
            memberSince: 'Recently',
            tier: 'Bronze',
            rewardPoints: 0,
            addresses: addressesData,
            paymentMethods: paymentMethodsData
          };
          setUserData(fallbackData);
          setAddresses(addressesData);
          setPaymentMethods(paymentMethodsData);
        }

        clearTimeout(timeoutId);
        if (isMounted) setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        const timeoutId = setTimeout(() => {
          if (isMounted) {
            setUserData({
              name: user.displayName || 'User',
              email: user.email || '',
              avatar: user.photoURL || '',
              memberSince: 'Recently',
              tier: 'Bronze',
              rewardPoints: 0,
              addresses: [],
              paymentMethods: []
            });
            setAddresses([]);
            setPaymentMethods([]);
            setLoading(false);
          }
        }, 1000);
        
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
                  <AvatarUpload
                    user={{
                      uid: user.uid,
                      name: userData.name,
                      photoURL: userData.avatar
                    }}
                    onUpload={(url) => {
                      setUserData(prev => prev ? { ...prev, avatar: url } : null);
                    }}
                  />
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
                    variant={activeTab === 'notifications' ? 'default' : 'ghost'}
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
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'account' && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Manage your personal information and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={userData.name}
                        className="mt-1"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userData.email}
                        className="mt-1"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={userData.phone || ''}
                        className="mt-1"
                        placeholder="Add phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tier">Membership Tier</Label>
                      <div className="mt-1">
                        <Badge className="bg-otw-gold text-black">
                          {userData.tier} Member
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Reward Points</Label>
                    <div className="mt-1 text-2xl font-bold text-otw-gold">
                      {userData.rewardPoints.toLocaleString()} points
                    </div>
                  </div>

                  <div>
                    <Button>Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'addresses' && (
              <Card>
                <CardHeader>
                  <CardTitle>Saved Addresses</CardTitle>
                  <CardDescription>
                    Manage your delivery addresses for faster checkout.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {addresses.length > 0 ? (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{address.recipientName}</h3>
                              {address.isDefault && (
                                <Badge variant="secondary">Default</Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              {address.type === 'home' && <Home className="h-4 w-4" />}
                              {address.type === 'work' && <Building className="h-4 w-4" />}
                              {address.type === 'other' && <Briefcase className="h-4 w-4" />}
                              <span className="text-sm text-gray-600 capitalize">{address.type}</span>
                            </div>
                          </div>
                          {address.nickname && (
                            <p className="text-sm text-gray-600 mb-1">{address.nickname}</p>
                          )}
                          <p className="text-sm">{address.addressLine1}</p>
                          {address.addressLine2 && (
                            <p className="text-sm">{address.addressLine2}</p>
                          )}
                          <p className="text-sm">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-sm">{address.country}</p>
                          {address.phoneNumber && (
                            <div className="flex items-center mt-2 text-sm text-gray-600">
                              <Phone className="h-3 w-3 mr-1" />
                              {address.phoneNumber}
                            </div>
                          )}
                          {address.deliveryInstructions && (
                            <div className="flex items-start mt-2 text-sm text-gray-600">
                              <Info className="h-3 w-3 mr-1 mt-0.5" />
                              {address.deliveryInstructions}
                            </div>
                          )}
                          <div className="flex space-x-2 mt-3">
                            <Button size="sm" variant="outline">Edit</Button>
                            <Button size="sm" variant="outline">Delete</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">No addresses saved yet</p>
                      <Button>Add New Address</Button>
                    </div>
                  )}
                  {addresses.length > 0 && (
                    <div className="mt-6">
                      <Button>Add New Address</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'payment' && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your saved payment methods for quick and secure checkout.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {paymentMethods.length > 0 ? (
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <CreditCard className="h-5 w-5" />
                              <span className="font-medium capitalize">
                                {method.brand} •••• {method.last4}
                              </span>
                              {method.isDefault && (
                                <Badge variant="secondary">Default</Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {method.isVerified ? (
                                <Badge className="bg-green-100 text-green-800">Verified</Badge>
                              ) : (
                                <Badge variant="outline">Unverified</Badge>
                              )}
                            </div>
                          </div>
                          {method.nickname && (
                            <p className="text-sm text-gray-600 mb-1">{method.nickname}</p>
                          )}
                          <p className="text-sm text-gray-600">{method.holderName}</p>
                          {method.expiryMonth && method.expiryYear && (
                            <p className="text-sm text-gray-600">
                              Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                            </p>
                          )}
                          {method.billingAddress && (
                            <p className="text-sm text-gray-600">
                              {method.billingAddress.city}, {method.billingAddress.state}
                            </p>
                          )}
                          <div className="flex space-x-2 mt-3">
                            <Button size="sm" variant="outline">Set as Default</Button>
                            <Button size="sm" variant="outline">Edit</Button>
                            <Button size="sm" variant="outline">Delete</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">No payment methods saved yet</p>
                      <Button>Add New Payment Method</Button>
                    </div>
                  )}
                  {paymentMethods.length > 0 && (
                    <div className="mt-6">
                      <Button>Add New Payment Method</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to receive updates and notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Order Updates</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="order-email"
                          className="rounded border-gray-600 text-otw-gold focus:ring-otw-gold"
                          defaultChecked
                        />
                        <Label htmlFor="order-email">Email notifications for order updates</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="order-sms"
                          className="rounded border-gray-600 text-otw-gold focus:ring-otw-gold"
                        />
                        <Label htmlFor="order-sms">SMS notifications for order updates</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Marketing</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="promo-email"
                          className="rounded border-gray-600 text-otw-gold focus:ring-otw-gold"
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
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

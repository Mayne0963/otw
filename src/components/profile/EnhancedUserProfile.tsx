'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { 
  User, 
  CreditCard, 
  MapPin, 
  Bell, 
  Shield, 
  LogOut, 
  Edit, 
  Save, 
  X, 
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  Star
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc, collection, addDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase-config';
import { toast } from '../ui/use-toast';

interface UserData {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  memberSince: string;
  tier: string;
  rewardPoints: number;
  preferences: {
    notifications: boolean;
    marketing: boolean;
    sms: boolean;
    email: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
  };
}

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiry?: string;
  isDefault: boolean;
  nickname?: string;
}

export default function EnhancedUserProfile() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const [addressForm, setAddressForm] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    type: 'home' as 'home' | 'work' | 'other',
    isDefault: false
  });

  const [paymentForm, setPaymentForm] = useState({
    type: 'card' as 'card' | 'paypal' | 'apple_pay' | 'google_pay',
    nickname: '',
    isDefault: false
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    notifications: true,
    marketing: false,
    sms: true,
    email: true,
    orderUpdates: true,
    promotions: false,
    newsletter: false
  });

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData(data);
          setProfileForm({
            name: data.name || '',
            phone: data.phone || '',
            email: data.email || ''
          });
          setNotificationPrefs(data.preferences || notificationPrefs);
        }

        // Fetch addresses
        const addressQuery = query(
          collection(db, 'addresses'),
          where('userId', '==', user.uid)
        );
        const addressSnapshot = await getDocs(addressQuery);
        const addressList = addressSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Address[];
        setAddresses(addressList);

        // Fetch payment methods
        const paymentQuery = query(
          collection(db, 'paymentMethods'),
          where('userId', '==', user.uid)
        );
        const paymentSnapshot = await getDocs(paymentQuery);
        const paymentList = paymentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PaymentMethod[];
        setPaymentMethods(paymentList);

      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: profileForm.name,
        phone: profileForm.phone,
        updatedAt: new Date().toISOString()
      });

      setUserData(prev => prev ? {
        ...prev,
        name: profileForm.name,
        phone: profileForm.phone
      } : null);

      setEditingProfile(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Save notification preferences
  const handleSaveNotifications = async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        preferences: notificationPrefs,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: 'Success',
        description: 'Notification preferences updated'
      });
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to update preferences',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Add new address
  const handleAddAddress = async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      const newAddress = {
        ...addressForm,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'addresses'), newAddress);
      setAddresses(prev => [...prev, { id: docRef.id, ...newAddress }]);
      setShowAddAddress(false);
      setAddressForm({
        name: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'US',
        type: 'home',
        isDefault: false
      });

      toast({
        title: 'Success',
        description: 'Address added successfully'
      });
    } catch (error) {
      console.error('Error adding address:', error);
      toast({
        title: 'Error',
        description: 'Failed to add address',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId: string) => {
    try {
      await deleteDoc(doc(db, 'addresses', addressId));
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      toast({
        title: 'Success',
        description: 'Address deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete address',
        variant: 'destructive'
      });
    }
  };

  // Add payment method
  const handleAddPayment = async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      const newPayment = {
        ...paymentForm,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'paymentMethods'), newPayment);
      setPaymentMethods(prev => [...prev, { id: docRef.id, ...newPayment }]);
      setShowAddPayment(false);
      setPaymentForm({
        type: 'card',
        nickname: '',
        isDefault: false
      });

      toast({
        title: 'Success',
        description: 'Payment method added successfully'
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: 'Error',
        description: 'Failed to add payment method',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete payment method
  const handleDeletePayment = async (paymentId: string) => {
    try {
      await deleteDoc(doc(db, 'paymentMethods', paymentId));
      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentId));
      toast({
        title: 'Success',
        description: 'Payment method deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete payment method',
        variant: 'destructive'
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast({
        title: 'Success',
        description: 'Signed out successfully'
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-otw-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={userData?.avatar} />
                  <AvatarFallback className="bg-otw-gold text-black text-xl">
                    {userData?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-white">{userData?.name || 'User'}</CardTitle>
                <CardDescription className="text-gray-400">
                  {userData?.email}
                </CardDescription>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-otw-gold text-black">
                    <Star className="w-3 h-3 mr-1" />
                    {userData?.tier || 'Bronze'}
                  </Badge>
                  <Badge variant="outline" className="border-otw-gold text-otw-gold">
                    {userData?.rewardPoints || 0} pts
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={activeTab === 'account' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('account')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Account
                </Button>
                <Button
                  variant={activeTab === 'addresses' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('addresses')}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Addresses
                </Button>
                <Button
                  variant={activeTab === 'payments' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('payments')}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payment Methods
                </Button>
                <Button
                  variant={activeTab === 'notifications' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </Button>
                <Button
                  variant={activeTab === 'security' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('security')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </Button>
                <Separator className="my-4" />
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Account Tab */}
            {activeTab === 'account' && (
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Account Information</CardTitle>
                      <CardDescription className="text-gray-400">
                        Manage your personal information
                      </CardDescription>
                    </div>
                    {!editingProfile ? (
                      <Button
                        variant="outline"
                        onClick={() => setEditingProfile(true)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingProfile(false);
                            setProfileForm({
                              name: userData?.name || '',
                              phone: userData?.phone || '',
                              email: userData?.email || ''
                            });
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={saving}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">Full Name</Label>
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!editingProfile}
                        className="bg-gray-700/50 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        disabled
                        className="bg-gray-700/30 border-gray-600 text-gray-400"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!editingProfile}
                        className="bg-gray-700/50 border-gray-600 text-white"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Member Since</Label>
                      <div className="flex items-center gap-2 p-3 bg-gray-700/30 rounded-lg border border-gray-600">
                        <Calendar className="w-4 h-4 text-otw-gold" />
                        <span className="text-white">
                          {userData?.memberSince ? new Date(userData.memberSince).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Address Book</CardTitle>
                      <CardDescription className="text-gray-400">
                        Manage your delivery addresses
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setShowAddAddress(true)}
                      className="bg-otw-gold text-black hover:bg-otw-gold/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Address
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No addresses saved yet</p>
                      <Button
                        onClick={() => setShowAddAddress(true)}
                        className="mt-4 bg-otw-gold text-black hover:bg-otw-gold/90"
                      >
                        Add Your First Address
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className="p-4 bg-gray-700/30 rounded-lg border border-gray-600"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-white font-medium">{address.name}</h3>
                                <Badge
                                  variant={address.type === 'home' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {address.type}
                                </Badge>
                                {address.isDefault && (
                                  <Badge variant="outline" className="text-xs border-otw-gold text-otw-gold">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-300 text-sm">
                                {address.street}<br />
                                {address.city}, {address.state} {address.zip}<br />
                                {address.country}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingAddress(address.id)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteAddress(address.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Address Form */}
                  {showAddAddress && (
                    <div className="mt-6 p-4 bg-gray-700/20 rounded-lg border border-gray-600">
                      <h3 className="text-white font-medium mb-4">Add New Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="addressName" className="text-white">Address Name</Label>
                          <Input
                            id="addressName"
                            value={addressForm.name}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Home, Work, etc."
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="addressType" className="text-white">Type</Label>
                          <Select
                            value={addressForm.type}
                            onValueChange={(value: 'home' | 'work' | 'other') => 
                              setAddressForm(prev => ({ ...prev, type: value }))
                            }
                          >
                            <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="home">Home</SelectItem>
                              <SelectItem value="work">Work</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label htmlFor="street" className="text-white">Street Address</Label>
                          <Input
                            id="street"
                            value={addressForm.street}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                            placeholder="123 Main St"
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-white">City</Label>
                          <Input
                            id="city"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="Fort Wayne"
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-white">State</Label>
                          <Input
                            id="state"
                            value={addressForm.state}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                            placeholder="IN"
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zip" className="text-white">ZIP Code</Label>
                          <Input
                            id="zip"
                            value={addressForm.zip}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, zip: e.target.value }))}
                            placeholder="46802"
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country" className="text-white">Country</Label>
                          <Select
                            value={addressForm.country}
                            onValueChange={(value) => setAddressForm(prev => ({ ...prev, country: value }))}
                          >
                            <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="CA">Canada</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-4">
                        <Switch
                          id="defaultAddress"
                          checked={addressForm.isDefault}
                          onCheckedChange={(checked) => setAddressForm(prev => ({ ...prev, isDefault: checked }))}
                        />
                        <Label htmlFor="defaultAddress" className="text-white">Set as default address</Label>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAddAddress(false);
                            setAddressForm({
                              name: '',
                              street: '',
                              city: '',
                              state: '',
                              zip: '',
                              country: 'US',
                              type: 'home',
                              isDefault: false
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddAddress}
                          disabled={saving || !addressForm.name || !addressForm.street || !addressForm.city}
                          className="bg-otw-gold text-black hover:bg-otw-gold/90"
                        >
                          {saving ? 'Adding...' : 'Add Address'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payments' && (
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Payment Methods</CardTitle>
                      <CardDescription className="text-gray-400">
                        Manage your payment options
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setShowAddPayment(true)}
                      className="bg-otw-gold text-black hover:bg-otw-gold/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Payment
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No payment methods saved yet</p>
                      <Button
                        onClick={() => setShowAddPayment(true)}
                        className="mt-4 bg-otw-gold text-black hover:bg-otw-gold/90"
                      >
                        Add Your First Payment Method
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paymentMethods.map((payment) => (
                        <div
                          key={payment.id}
                          className="p-4 bg-gray-700/30 rounded-lg border border-gray-600"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-otw-gold/20 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-otw-gold" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-white font-medium">
                                    {payment.nickname || `${payment.type} ${payment.last4 ? `****${payment.last4}` : ''}`}
                                  </h3>
                                  {payment.isDefault && (
                                    <Badge variant="outline" className="text-xs border-otw-gold text-otw-gold">
                                      Default
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-gray-400 text-sm capitalize">
                                  {payment.type.replace('_', ' ')}
                                  {payment.expiry && ` • Expires ${payment.expiry}`}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePayment(payment.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Payment Form */}
                  {showAddPayment && (
                    <div className="mt-6 p-4 bg-gray-700/20 rounded-lg border border-gray-600">
                      <h3 className="text-white font-medium mb-4">Add New Payment Method</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="paymentType" className="text-white">Payment Type</Label>
                          <Select
                            value={paymentForm.type}
                            onValueChange={(value: 'card' | 'paypal' | 'apple_pay' | 'google_pay') => 
                              setPaymentForm(prev => ({ ...prev, type: value }))
                            }
                          >
                            <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="card">Credit/Debit Card</SelectItem>
                              <SelectItem value="paypal">PayPal</SelectItem>
                              <SelectItem value="apple_pay">Apple Pay</SelectItem>
                              <SelectItem value="google_pay">Google Pay</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paymentNickname" className="text-white">Nickname (Optional)</Label>
                          <Input
                            id="paymentNickname"
                            value={paymentForm.nickname}
                            onChange={(e) => setPaymentForm(prev => ({ ...prev, nickname: e.target.value }))}
                            placeholder="Personal Card, Work Card, etc."
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-4">
                        <Switch
                          id="defaultPayment"
                          checked={paymentForm.isDefault}
                          onCheckedChange={(checked) => setPaymentForm(prev => ({ ...prev, isDefault: checked }))}
                        />
                        <Label htmlFor="defaultPayment" className="text-white">Set as default payment method</Label>
                      </div>
                      <Alert className="mt-4 border-blue-500/50 bg-blue-500/10">
                        <AlertCircle className="h-4 w-4 text-blue-400" />
                        <AlertDescription className="text-blue-300">
                          Payment details will be securely processed through Stripe when you make a purchase.
                        </AlertDescription>
                      </Alert>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAddPayment(false);
                            setPaymentForm({
                              type: 'card',
                              nickname: '',
                              isDefault: false
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddPayment}
                          disabled={saving}
                          className="bg-otw-gold text-black hover:bg-otw-gold/90"
                        >
                          {saving ? 'Adding...' : 'Add Payment Method'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Notification Preferences</CardTitle>
                      <CardDescription className="text-gray-400">
                        Choose how you want to be notified
                      </CardDescription>
                    </div>
                    <Button
                      onClick={handleSaveNotifications}
                      disabled={saving}
                      className="bg-otw-gold text-black hover:bg-otw-gold/90"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Push Notifications</h3>
                        <p className="text-gray-400 text-sm">Receive notifications in your browser</p>
                      </div>
                      <Switch
                        checked={notificationPrefs.notifications}
                        onCheckedChange={(checked) => 
                          setNotificationPrefs(prev => ({ ...prev, notifications: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Email Notifications</h3>
                        <p className="text-gray-400 text-sm">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={notificationPrefs.email}
                        onCheckedChange={(checked) => 
                          setNotificationPrefs(prev => ({ ...prev, email: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">SMS Notifications</h3>
                        <p className="text-gray-400 text-sm">Receive notifications via text message</p>
                      </div>
                      <Switch
                        checked={notificationPrefs.sms}
                        onCheckedChange={(checked) => 
                          setNotificationPrefs(prev => ({ ...prev, sms: checked }))
                        }
                      />
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Order Updates</h3>
                        <p className="text-gray-400 text-sm">Get notified about order status changes</p>
                      </div>
                      <Switch
                        checked={notificationPrefs.orderUpdates}
                        onCheckedChange={(checked) => 
                          setNotificationPrefs(prev => ({ ...prev, orderUpdates: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Promotions & Deals</h3>
                        <p className="text-gray-400 text-sm">Receive special offers and discounts</p>
                      </div>
                      <Switch
                        checked={notificationPrefs.promotions}
                        onCheckedChange={(checked) => 
                          setNotificationPrefs(prev => ({ ...prev, promotions: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Marketing Communications</h3>
                        <p className="text-gray-400 text-sm">Receive marketing emails and updates</p>
                      </div>
                      <Switch
                        checked={notificationPrefs.marketing}
                        onCheckedChange={(checked) => 
                          setNotificationPrefs(prev => ({ ...prev, marketing: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Newsletter</h3>
                        <p className="text-gray-400 text-sm">Receive our weekly newsletter</p>
                      </div>
                      <Switch
                        checked={notificationPrefs.newsletter}
                        onCheckedChange={(checked) => 
                          setNotificationPrefs(prev => ({ ...prev, newsletter: checked }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Security Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert className="border-yellow-500/50 bg-yellow-500/10">
                    <Shield className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-yellow-300">
                      Security settings are managed through Firebase Authentication. 
                      Use your account provider's security settings to update your password and enable two-factor authentication.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                      <h3 className="text-white font-medium mb-2">Account Security</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Two-Factor Authentication</span>
                          <Badge variant="outline" className="border-green-500 text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Enabled
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Email Verification</span>
                          <Badge variant="outline" className="border-green-500 text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Phone Verification</span>
                          <Badge variant="outline" className="border-gray-500 text-gray-400">
                            Not Verified
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                      <h3 className="text-white font-medium mb-2">Recent Activity</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-300">
                          <span>Last login</span>
                          <span>Today at 2:30 PM</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>Password changed</span>
                          <span>30 days ago</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>Profile updated</span>
                          <span>Just now</span>
                        </div>
                      </div>
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
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Home, 
  Building, 
  Star, 
  Navigation, 
  Phone, 
  User, 
  Clock, 
  AlertTriangle, 
  Info, 
  Search, 
  Locate, 
  Save, 
  RotateCcw, 
  ExternalLink,
  Map,
  Target,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, updateDoc, collection, addDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase-config';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/use-toast';
import { cn } from '../../lib/utils';

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
}

interface NewAddressForm {
  type: 'home' | 'work' | 'other';
  nickname: string;
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  deliveryInstructions: string;
  accessCode: string;
  businessHours: {
    enabled: boolean;
    start: string;
    end: string;
    days: string[];
  };
}

const addressTypeIcons = {
  home: <Home className="w-5 h-5" />,
  work: <Building className="w-5 h-5" />,
  other: <MapPin className="w-5 h-5" />
};

const addressTypeColors = {
  home: 'text-blue-400',
  work: 'text-green-400',
  other: 'text-purple-400'
};

const weekDays = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' }
];

const defaultForm: NewAddressForm = {
  type: 'home',
  nickname: '',
  recipientName: '',
  phoneNumber: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
  isDefault: false,
  deliveryInstructions: '',
  accessCode: '',
  businessHours: {
    enabled: false,
    start: '09:00',
    end: '17:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  }
};

export default function EnhancedAddressBook() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NewAddressForm>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Load addresses from Firebase
  const loadAddresses = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'addresses'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      
      const userAddresses: Address[] = [];
      querySnapshot.forEach((doc) => {
        userAddresses.push({ id: doc.id, ...doc.data() } as Address);
      });
      
      // Sort by default first, then by creation date
      userAddresses.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setAddresses(userAddresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load addresses',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!form.recipientName.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }
    
    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,14}$/.test(form.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phoneNumber = 'Invalid phone number';
    }
    
    if (!form.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required';
    }
    
    if (!form.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!form.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!form.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const searchAddresses = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      // This would integrate with Google Places API
      // For now, we'll simulate the search
      const mockResults = [
        {
          place_id: '1',
          formatted_address: `${query}, New York, NY 10001, USA`,
          address_components: [
            { long_name: query, types: ['street_number', 'route'] },
            { long_name: 'New York', types: ['locality'] },
            { long_name: 'NY', types: ['administrative_area_level_1'] },
            { long_name: '10001', types: ['postal_code'] },
            { long_name: 'USA', types: ['country'] }
          ],
          geometry: {
            location: { lat: 40.7128, lng: -74.0060 }
          }
        }
      ];
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Error searching addresses:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectSearchResult = (result: any) => {
    const components = result.address_components;
    const getComponent = (types: string[]) => {
      const component = components.find((comp: any) => 
        comp.types.some((type: string) => types.includes(type))
      );
      return component?.long_name || '';
    };
    
    setForm(prev => ({
      ...prev,
      addressLine1: `${getComponent(['street_number'])} ${getComponent(['route'])}`.trim(),
      city: getComponent(['locality']),
      state: getComponent(['administrative_area_level_1']),
      postalCode: getComponent(['postal_code']),
      country: getComponent(['country']) === 'United States' ? 'US' : getComponent(['country'])
    }));
    
    setSearchQuery('');
    setSearchResults([]);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Error',
        description: 'Geolocation is not supported by this browser',
        variant: 'destructive'
      });
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // This would use Google Geocoding API to reverse geocode
          // For now, we'll simulate the response
          const mockAddress = {
            formatted_address: '123 Current St, Your City, YS 12345, USA',
            address_components: [
              { long_name: '123 Current St', types: ['street_number', 'route'] },
              { long_name: 'Your City', types: ['locality'] },
              { long_name: 'YS', types: ['administrative_area_level_1'] },
              { long_name: '12345', types: ['postal_code'] },
              { long_name: 'USA', types: ['country'] }
            ]
          };
          
          selectSearchResult(mockAddress);
          
          toast({
            title: 'Success',
            description: 'Current location detected and filled'
          });
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          toast({
            title: 'Error',
            description: 'Failed to get address from location',
            variant: 'destructive'
          });
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        toast({
          title: 'Error',
          description: 'Failed to get current location',
          variant: 'destructive'
        });
      }
    );
  };

  const addAddress = async () => {
    if (!user || !validateForm()) return;
    
    setSaving(true);
    try {
      const newAddress: Omit<Address, 'id'> = {
        type: form.type,
        nickname: form.nickname || undefined,
        recipientName: form.recipientName,
        phoneNumber: form.phoneNumber,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2 || undefined,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
        isDefault: form.isDefault || addresses.length === 0,
        deliveryInstructions: form.deliveryInstructions || undefined,
        accessCode: form.accessCode || undefined,
        businessHours: form.businessHours.enabled ? {
          start: form.businessHours.start,
          end: form.businessHours.end,
          days: form.businessHours.days
        } : undefined,
        verified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // If this is set as default, update other addresses
      if (newAddress.isDefault) {
        for (const address of addresses) {
          if (address.isDefault) {
            await updateDoc(doc(db, 'addresses', address.id), {
              isDefault: false,
              updatedAt: new Date().toISOString()
            });
          }
        }
      }
      
      const docRef = await addDoc(collection(db, 'addresses'), {
        ...newAddress,
        userId: user.uid
      });
      
      setAddresses(prev => [{ id: docRef.id, ...newAddress }, ...prev]);
      setShowAddForm(false);
      setForm(defaultForm);
      setErrors({});
      
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

  const deleteAddress = async (id: string) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, 'addresses', id));
      setAddresses(prev => prev.filter(address => address.id !== id));
      
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

  const setDefaultAddress = async (id: string) => {
    if (!user) return;
    
    try {
      // Update all addresses to not be default
      for (const address of addresses) {
        await updateDoc(doc(db, 'addresses', address.id), {
          isDefault: address.id === id,
          updatedAt: new Date().toISOString()
        });
      }
      
      setAddresses(prev => 
        prev.map(address => ({
          ...address,
          isDefault: address.id === id
        }))
      );
      
      toast({
        title: 'Success',
        description: 'Default address updated'
      });
    } catch (error) {
      console.error('Error updating default address:', error);
      toast({
        title: 'Error',
        description: 'Failed to update default address',
        variant: 'destructive'
      });
    }
  };

  const updateFormField = (field: string, value: any) => {
    if (field.startsWith('businessHours.')) {
      const businessField = field.split('.')[1];
      setForm(prev => ({
        ...prev,
        businessHours: {
          ...prev.businessHours,
          [businessField]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatAddress = (address: Address): string => {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.postalCode}`
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-otw-gold"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MapPin className="w-6 h-6 text-otw-gold" />
            Address Book
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your delivery addresses and preferences
          </p>
        </div>
        
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-otw-gold text-black hover:bg-otw-gold/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Address
        </Button>
      </div>

      {/* Addresses List */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-8 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">No Addresses</h3>
              <p className="text-gray-400 mb-4">
                Add your first delivery address to get started
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-otw-gold text-black hover:bg-otw-gold/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card key={address.id} className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={cn(
                      "p-3 rounded-lg bg-gray-700",
                      addressTypeColors[address.type]
                    )}>
                      {addressTypeIcons[address.type]}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-medium">
                          {address.nickname || `${address.type.charAt(0).toUpperCase() + address.type.slice(1)} Address`}
                        </h3>
                        
                        {address.isDefault && (
                          <Badge className="bg-otw-gold text-black">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                        
                        {address.verified ? (
                          <Badge variant="secondary" className="bg-green-900/30 text-green-400">
                            <Check className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-900/30 text-yellow-400">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-gray-300">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{address.recipientName}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{address.phoneNumber}</span>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <span>{formatAddress(address)}</span>
                        </div>
                        
                        {address.deliveryInstructions && (
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-gray-400 mt-0.5" />
                            <span className="text-sm">{address.deliveryInstructions}</span>
                          </div>
                        )}
                        
                        {address.businessHours && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {address.businessHours.start} - {address.businessHours.end} 
                              ({address.businessHours.days.join(', ')})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDefaultAddress(address.id)}
                        className="border-gray-600 text-white hover:bg-gray-700"
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Set Default
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Open in maps
                        const query = encodeURIComponent(formatAddress(address));
                        window.open(`https://maps.google.com/maps?q=${query}`, '_blank');
                      }}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      <Map className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(address.id)}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAddress(address.id)}
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                      disabled={address.isDefault && addresses.length > 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Address Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Add New Address</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {/* Address Search */}
                  <div>
                    <Label className="text-white text-sm font-medium mb-3 block">Search Address</Label>
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            searchAddresses(e.target.value);
                          }}
                          placeholder="Search for an address..."
                          className="bg-gray-700/50 border-gray-600 text-white pl-10 pr-20"
                        />
                        <Button
                          type="button"
                          onClick={getCurrentLocation}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 px-2 bg-otw-gold text-black hover:bg-otw-gold/90"
                          size="sm"
                        >
                          <Target className="w-4 h-4 mr-1" />
                          Current
                        </Button>
                      </div>
                      
                      {searchLoading && (
                        <div className="text-center py-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-otw-gold mx-auto"></div>
                        </div>
                      )}
                      
                      {searchResults.length > 0 && (
                        <div className="bg-gray-700/30 rounded-lg border border-gray-600 max-h-40 overflow-y-auto">
                          {searchResults.map((result, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectSearchResult(result)}
                              className="w-full text-left p-3 hover:bg-gray-600/30 border-b border-gray-600 last:border-b-0 text-white"
                            >
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{result.formatted_address}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Address Type */}
                  <div>
                    <Label className="text-white text-sm font-medium mb-3 block">Address Type</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
                        { value: 'work', label: 'Work', icon: <Building className="w-5 h-5" /> },
                        { value: 'other', label: 'Other', icon: <MapPin className="w-5 h-5" /> }
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => updateFormField('type', type.value)}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2",
                            form.type === type.value
                              ? "border-otw-gold bg-otw-gold/10 text-otw-gold"
                              : "border-gray-600 text-gray-400 hover:border-gray-500"
                          )}
                        >
                          {type.icon}
                          <span className="text-sm font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white text-sm font-medium mb-2 block">Recipient Name</Label>
                      <Input
                        value={form.recipientName}
                        onChange={(e) => updateFormField('recipientName', e.target.value)}
                        placeholder="John Doe"
                        className="bg-gray-700/50 border-gray-600 text-white"
                      />
                      {errors.recipientName && (
                        <p className="text-red-400 text-sm mt-1">{errors.recipientName}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-white text-sm font-medium mb-2 block">Phone Number</Label>
                      <Input
                        value={form.phoneNumber}
                        onChange={(e) => updateFormField('phoneNumber', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="bg-gray-700/50 border-gray-600 text-white"
                      />
                      {errors.phoneNumber && (
                        <p className="text-red-400 text-sm mt-1">{errors.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Address Details */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white text-sm font-medium mb-2 block">Address Line 1</Label>
                      <Input
                        value={form.addressLine1}
                        onChange={(e) => updateFormField('addressLine1', e.target.value)}
                        placeholder="123 Main Street"
                        className="bg-gray-700/50 border-gray-600 text-white"
                      />
                      {errors.addressLine1 && (
                        <p className="text-red-400 text-sm mt-1">{errors.addressLine1}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-white text-sm font-medium mb-2 block">Address Line 2 (Optional)</Label>
                      <Input
                        value={form.addressLine2}
                        onChange={(e) => updateFormField('addressLine2', e.target.value)}
                        placeholder="Apt 4B, Suite 100, etc."
                        className="bg-gray-700/50 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-white text-sm font-medium mb-2 block">City</Label>
                        <Input
                          value={form.city}
                          onChange={(e) => updateFormField('city', e.target.value)}
                          placeholder="New York"
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                        {errors.city && (
                          <p className="text-red-400 text-sm mt-1">{errors.city}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-white text-sm font-medium mb-2 block">State</Label>
                        <Input
                          value={form.state}
                          onChange={(e) => updateFormField('state', e.target.value)}
                          placeholder="NY"
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                        {errors.state && (
                          <p className="text-red-400 text-sm mt-1">{errors.state}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-white text-sm font-medium mb-2 block">ZIP Code</Label>
                        <Input
                          value={form.postalCode}
                          onChange={(e) => updateFormField('postalCode', e.target.value)}
                          placeholder="10001"
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                        {errors.postalCode && (
                          <p className="text-red-400 text-sm mt-1">{errors.postalCode}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Information */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white text-sm font-medium mb-2 block">Nickname (Optional)</Label>
                      <Input
                        value={form.nickname}
                        onChange={(e) => updateFormField('nickname', e.target.value)}
                        placeholder="e.g., Mom's House, Office, etc."
                        className="bg-gray-700/50 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-white text-sm font-medium mb-2 block">Delivery Instructions (Optional)</Label>
                      <Textarea
                        value={form.deliveryInstructions}
                        onChange={(e) => updateFormField('deliveryInstructions', e.target.value)}
                        placeholder="Ring doorbell, leave at door, call when arriving, etc."
                        className="bg-gray-700/50 border-gray-600 text-white"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-white text-sm font-medium mb-2 block">Access Code (Optional)</Label>
                      <Input
                        value={form.accessCode}
                        onChange={(e) => updateFormField('accessCode', e.target.value)}
                        placeholder="Building or gate access code"
                        className="bg-gray-700/50 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  
                  {/* Business Hours (for work addresses) */}
                  {form.type === 'work' && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <Label className="text-white font-medium">Business Hours</Label>
                          <p className="text-gray-400 text-sm">Set delivery hours for this work address</p>
                        </div>
                        <Switch
                          checked={form.businessHours.enabled}
                          onCheckedChange={(checked) => updateFormField('businessHours.enabled', checked)}
                        />
                      </div>
                      
                      {form.businessHours.enabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-white text-sm font-medium mb-2 block">Start Time</Label>
                              <Select 
                                value={form.businessHours.start} 
                                onValueChange={(value) => updateFormField('businessHours.start', value)}
                              >
                                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 24 }, (_, i) => {
                                    const hour = i.toString().padStart(2, '0');
                                    return (
                                      <SelectItem key={hour} value={`${hour}:00`}>
                                        {hour}:00
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label className="text-white text-sm font-medium mb-2 block">End Time</Label>
                              <Select 
                                value={form.businessHours.end} 
                                onValueChange={(value) => updateFormField('businessHours.end', value)}
                              >
                                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 24 }, (_, i) => {
                                    const hour = i.toString().padStart(2, '0');
                                    return (
                                      <SelectItem key={hour} value={`${hour}:00`}>
                                        {hour}:00
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-white text-sm font-medium mb-2 block">Available Days</Label>
                            <div className="flex flex-wrap gap-2">
                              {weekDays.map((day) => (
                                <button
                                  key={day.value}
                                  type="button"
                                  onClick={() => {
                                    const currentDays = form.businessHours.days;
                                    const newDays = currentDays.includes(day.value)
                                      ? currentDays.filter(d => d !== day.value)
                                      : [...currentDays, day.value];
                                    updateFormField('businessHours.days', newDays);
                                  }}
                                  className={cn(
                                    "px-3 py-2 rounded-lg border transition-colors",
                                    form.businessHours.days.includes(day.value)
                                      ? "border-otw-gold bg-otw-gold/10 text-otw-gold"
                                      : "border-gray-600 text-gray-400 hover:border-gray-500"
                                  )}
                                >
                                  {day.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                  
                  {/* Set as Default */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white font-medium">Set as Default</Label>
                      <p className="text-gray-400 text-sm">Use this address as your primary delivery location</p>
                    </div>
                    <Switch
                      checked={form.isDefault}
                      onCheckedChange={(checked) => updateFormField('isDefault', checked)}
                    />
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-600">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={addAddress}
                      disabled={saving}
                      className="bg-otw-gold text-black hover:bg-otw-gold/90"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Add Address
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
"use client";

import type { Metadata } from "next";
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { 
  MapPin, 
  Calculator, 
  Clock, 
  DollarSign, 
  Route, 
  AlertCircle,
  CheckCircle,
  Truck,
  Zap,
  Timer
} from 'lucide-react';
import AddressSearch from '../../../components/maps/AddressSearch';
import MapSearch from '../../../components/maps/MapSearch';
import { feeCalculator, formatCurrency, formatDistance, formatDuration, type DeliveryEstimate } from '../../../lib/services/fee-calculator';

export default function AddressSearchDemo() {
  const [selectedOrigin, setSelectedOrigin] = useState<{
    formatted_address: string;
    lat: number;
    lng: number;
    place_id?: string;
  } | null>(null);
  
  const [selectedDestination, setSelectedDestination] = useState<{
    formatted_address: string;
    lat: number;
    lng: number;
    place_id?: string;
  } | null>(null);
  
  const [deliveryEstimate, setDeliveryEstimate] = useState<DeliveryEstimate | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priority, setPriority] = useState<'standard' | 'express' | 'rush'>('standard');
  const [orderTotal, setOrderTotal] = useState<number>(25.99);
  
  // Manual address inputs
  const [manualOrigin, setManualOrigin] = useState('');
  const [manualDestination, setManualDestination] = useState('');

  const handleAddressSelect = (address: {
    formatted_address: string;
    lat: number;
    lng: number;
    place_id?: string;
  }) => {
    setSelectedOrigin(address);
  };

  const handleDistanceCalculated = (data: {
    distance: number;
    duration: number;
    fee: number;
  }) => {
    console.log('Distance calculated:', data);
  };

  const calculateManualRoute = async () => {
    if (!manualOrigin || !manualDestination) {
      setError('Please enter both origin and destination addresses');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const estimate = await feeCalculator.calculateDeliveryFee(
        manualOrigin,
        manualDestination,
        priority,
        orderTotal
      );
      setDeliveryEstimate(estimate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate delivery fee');
    } finally {
      setIsCalculating(false);
    }
  };

  const clearCalculation = () => {
    setDeliveryEstimate(null);
    setError(null);
    setManualOrigin('');
    setManualDestination('');
    setSelectedOrigin(null);
    setSelectedDestination(null);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'rush':
        return <Zap className="h-4 w-4" />;
      case 'express':
        return <Timer className="h-4 w-4" />;
      default:
        return <Truck className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'rush':
        return 'bg-red-100 text-red-800';
      case 'express':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Address Search & Fee Calculator Demo</h1>
        <p className="text-gray-600">
          Test the enhanced address search functionality with autocomplete and distance-based fee calculation
        </p>
      </div>

      <Tabs defaultValue="interactive" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="interactive">Interactive Map</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="simple">Simple Map</TabsTrigger>
        </TabsList>

        <TabsContent value="interactive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Interactive Address Search with Route Calculation
              </CardTitle>
              <CardDescription>
                Use the map below to search for addresses and automatically calculate delivery fees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddressSearch
                onAddressSelect={handleAddressSelect}
                onDistanceCalculated={handleDistanceCalculated}
                height="600px"
                showFeeCalculator={true}
                baseFee={5.99}
                perMileRate={1.5}
              />
            </CardContent>
          </Card>

          {selectedOrigin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Selected Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                    <div>
                      <p className="font-medium">{selectedOrigin.formatted_address}</p>
                      <p className="text-sm text-gray-500">
                        Coordinates: {selectedOrigin.lat.toFixed(6)}, {selectedOrigin.lng.toFixed(6)}
                      </p>
                      {selectedOrigin.place_id && (
                        <p className="text-xs text-gray-400">
                          Place ID: {selectedOrigin.place_id}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Manual Address Entry & Fee Calculation
              </CardTitle>
              <CardDescription>
                Enter addresses manually to calculate delivery fees and routes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Pickup Address</Label>
                  <Input
                    id="origin"
                    placeholder="Enter pickup address..."
                    value={manualOrigin}
                    onChange={(e) => setManualOrigin(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Delivery Address</Label>
                  <Input
                    id="destination"
                    placeholder="Enter delivery address..."
                    value={manualDestination}
                    onChange={(e) => setManualDestination(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Delivery Priority</Label>
                  <Select value={priority} onValueChange={(value: 'standard' | 'express' | 'rush') => setPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Standard (1x)
                        </div>
                      </SelectItem>
                      <SelectItem value="express">
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4" />
                          Express (1.5x)
                        </div>
                      </SelectItem>
                      <SelectItem value="rush">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Rush (2x)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderTotal">Order Total ($)</Label>
                  <Input
                    id="orderTotal"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="25.99"
                    value={orderTotal}
                    onChange={(e) => setOrderTotal(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={calculateManualRoute}
                  disabled={!manualOrigin || !manualDestination || isCalculating}
                  className="flex-1"
                >
                  {isCalculating ? (
                    <>
                      <Calculator className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Calculate Delivery Fee
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={clearCalculation}>
                  Clear
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {deliveryEstimate && (
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Route className="h-5 w-5" />
                      Delivery Estimate
                      <Badge className={`ml-auto ${getPriorityColor(priority)}`}>
                        {getPriorityIcon(priority)}
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatDistance(deliveryEstimate.distance.value)}
                        </div>
                        <div className="text-sm text-gray-500">Distance</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatDuration(deliveryEstimate.duration.value)}
                        </div>
                        <div className="text-sm text-gray-500">Travel Time</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {feeCalculator.getEstimatedDeliveryTime(deliveryEstimate.duration.value, priority)}
                        </div>
                        <div className="text-sm text-gray-500">Est. Delivery</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className={`text-2xl font-bold ${
                          deliveryEstimate.isFreeDelivery ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {deliveryEstimate.isFreeDelivery ? 'FREE' : formatCurrency(deliveryEstimate.totalFee)}
                        </div>
                        <div className="text-sm text-gray-500">Delivery Fee</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Fee Breakdown</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Base Fee:</span>
                          <span>{formatCurrency(deliveryEstimate.baseFee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Distance Fee:</span>
                          <span>{formatCurrency(deliveryEstimate.distanceFee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time Fee:</span>
                          <span>{formatCurrency(deliveryEstimate.timeFee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Priority Fee:</span>
                          <span>{formatCurrency(deliveryEstimate.priorityFee)}</span>
                        </div>
                      </div>
                      
                      {deliveryEstimate.isFreeDelivery && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            🎉 Free delivery! Your order total of {formatCurrency(orderTotal)} qualifies for free delivery.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simple" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Simple Map Search
              </CardTitle>
              <CardDescription>
                Basic map functionality with address search
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MapSearch
                onLocationSelect={(location) => {
                  console.log('Location selected:', location);
                  setSelectedOrigin({
                    formatted_address: location.address,
                    lat: location.lat,
                    lng: location.lng,
                  });
                }}
                height="400px"
                showSearchBar={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Features Demonstrated</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 mt-1 text-blue-600" />
              <div>
                <h4 className="font-semibold">Address Autocomplete</h4>
                <p className="text-sm text-gray-600">
                  Google Places API integration with real-time address suggestions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calculator className="h-5 w-5 mt-1 text-green-600" />
              <div>
                <h4 className="font-semibold">Fee Calculation</h4>
                <p className="text-sm text-gray-600">
                  Distance-based pricing with priority multipliers and free delivery thresholds
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Route className="h-5 w-5 mt-1 text-purple-600" />
              <div>
                <h4 className="font-semibold">Route Visualization</h4>
                <p className="text-sm text-gray-600">
                  Interactive maps with route display and turn-by-turn directions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 mt-1 text-orange-600" />
              <div>
                <h4 className="font-semibold">Time Estimation</h4>
                <p className="text-sm text-gray-600">
                  Accurate delivery time estimates based on traffic and preparation time
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 mt-1 text-red-600" />
              <div>
                <h4 className="font-semibold">Dynamic Pricing</h4>
                <p className="text-sm text-gray-600">
                  Configurable pricing models with minimum/maximum fee constraints
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 mt-1 text-teal-600" />
              <div>
                <h4 className="font-semibold">Address Validation</h4>
                <p className="text-sm text-gray-600">
                  Ensure accurate addresses with geocoding and validation
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
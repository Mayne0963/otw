'use client';

export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import React, { useState } from 'react';
import { useExternalAPIs } from '../../../hooks/useExternalAPIs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Badge } from '../../../components/ui/badge';
import { Loader2, MapPin, Star, DollarSign, Package, Store } from 'lucide-react';

export default function ExternalAPIsDemo() {
  const {
    loading,
    error,
    searchRestaurants,
    searchProducts,
    searchYelpBusinesses,
    searchKrogerProducts,
    searchBestBuyProducts,
  } = useExternalAPIs();

  // Restaurant search state
  const [restaurantResults, setRestaurantResults] = useState<any>(null);
  const [restaurantQuery, setRestaurantQuery] = useState('pizza');
  const [location, setLocation] = useState('New York, NY');

  // Product search state
  const [productResults, setProductResults] = useState<any>(null);
  const [productQuery, setProductQuery] = useState('organic milk');

  // Individual API results
  const [yelpResults, setYelpResults] = useState<any>(null);
  const [krogerResults, setKrogerResults] = useState<any>(null);
  const [bestbuyResults, setBestbuyResults] = useState<any>(null);

  const handleRestaurantSearch = async () => {
    const results = await searchRestaurants({
      location,
      term: restaurantQuery,
      limit: 10,
    });
    setRestaurantResults(results);
  };

  const handleProductSearch = async () => {
    const results = await searchProducts({
      query: productQuery,
      limit: 10,
    });
    setProductResults(results);
  };

  const handleYelpSearch = async () => {
    const results = await searchYelpBusinesses({
      term: restaurantQuery,
      location,
      limit: 10,
    });
    setYelpResults(results);
  };

  const handleKrogerSearch = async () => {
    const results = await searchKrogerProducts({
      q: productQuery,
      limit: 10,
    });
    setKrogerResults(results);
  };

  const handleBestBuySearch = async () => {
    const results = await searchBestBuyProducts({
      q: productQuery,
      pageSize: 10,
    });
    setBestbuyResults(results);
  };

  const renderRestaurantCard = (restaurant: any, source: string) => {
    const getName = () => {
      if (source === 'yelp') return restaurant.name;
      if (source === 'zomato') return restaurant.name;
      if (source === 'documenu') return restaurant.restaurant_name;
      return 'Unknown';
    };

    const getRating = () => {
      if (source === 'yelp') return restaurant.rating;
      if (source === 'zomato') return restaurant.user_rating?.aggregate_rating;
      return null;
    };

    const getPrice = () => {
      if (source === 'yelp') return restaurant.price;
      if (source === 'zomato') return '$'.repeat(restaurant.price_range || 1);
      if (source === 'documenu') return restaurant.price_range;
      return null;
    };

    const getAddress = () => {
      if (source === 'yelp') return restaurant.location?.display_address?.join(', ');
      if (source === 'zomato') return restaurant.location?.address;
      return null;
    };

    return (
      <Card key={`${source}-${restaurant.id || restaurant.restaurant_id}`} className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{getName()}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{source}</Badge>
                {getAddress() && (
                  <span className="flex items-center gap-1 text-sm">
                    <MapPin className="w-3 h-3" />
                    {getAddress()}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1">
              {getRating() && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{getRating()}</span>
                </div>
              )}
              {getPrice() && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">{getPrice()}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        {source === 'yelp' && restaurant.categories && (
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {restaurant.categories.map((cat: any, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {cat.title}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  const renderProductCard = (product: any, source: string) => {
    const getName = () => {
      if (source === 'kroger') return product.description;
      if (source === 'bestbuy') return product.name;
      return 'Unknown';
    };

    const getPrice = () => {
      if (source === 'kroger') return product.items?.[0]?.price?.regular;
      if (source === 'bestbuy') return product.salePrice || product.regularPrice;
      return null;
    };

    const getBrand = () => {
      if (source === 'kroger') return product.brand;
      if (source === 'bestbuy') return product.manufacturer;
      return null;
    };

    return (
      <Card key={`${source}-${product.productId || product.sku}`} className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg">{getName()}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{source}</Badge>
                {getBrand() && (
                  <span className="text-sm text-muted-foreground">{getBrand()}</span>
                )}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1">
              {getPrice() && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-lg font-bold">${getPrice()}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {source === 'kroger' && (
              <div className="flex items-center gap-1">
                <Store className="w-4 h-4" />
                <span>Kroger</span>
              </div>
            )}
            {source === 'bestbuy' && (
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                <span>Best Buy</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">External APIs Integration Demo</h1>
        <p className="text-muted-foreground">
          Test the integration with Documenu, Zomato, Yelp, Kroger, and Best Buy APIs
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="unified" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unified">Unified Search</TabsTrigger>
          <TabsTrigger value="restaurants">Restaurant APIs</TabsTrigger>
          <TabsTrigger value="products">Product APIs</TabsTrigger>
        </TabsList>

        <TabsContent value="unified" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Restaurant Search */}
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Search</CardTitle>
                <CardDescription>
                  Search across Documenu, Zomato, and Yelp simultaneously
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurant-query">Search Term</Label>
                  <Input
                    id="restaurant-query"
                    value={restaurantQuery}
                    onChange={(e) => setRestaurantQuery(e.target.value)}
                    placeholder="e.g., pizza, sushi, burgers"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., New York, NY"
                  />
                </div>
                <Button 
                  onClick={handleRestaurantSearch} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    'Search Restaurants'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Product Search */}
            <Card>
              <CardHeader>
                <CardTitle>Product Search</CardTitle>
                <CardDescription>
                  Search across Kroger and Best Buy simultaneously
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product-query">Search Term</Label>
                  <Input
                    id="product-query"
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    placeholder="e.g., organic milk, laptop, headphones"
                  />
                </div>
                <Button 
                  onClick={handleProductSearch} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    'Search Products'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {restaurantResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Results</CardTitle>
                  <CardDescription>
                    Found {(restaurantResults.documenu?.length || 0) + 
                           (restaurantResults.zomato?.length || 0) + 
                           (restaurantResults.yelp?.length || 0)} restaurants
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  {restaurantResults.yelp?.map((restaurant: any) => 
                    renderRestaurantCard(restaurant, 'yelp')
                  )}
                  {restaurantResults.zomato?.map((restaurant: any) => 
                    renderRestaurantCard(restaurant, 'zomato')
                  )}
                  {restaurantResults.documenu?.map((restaurant: any) => 
                    renderRestaurantCard(restaurant, 'documenu')
                  )}
                  {restaurantResults.errors?.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm font-medium text-yellow-800">Errors:</p>
                      {restaurantResults.errors.map((error: string, idx: number) => (
                        <p key={idx} className="text-sm text-yellow-700">{error}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {productResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Results</CardTitle>
                  <CardDescription>
                    Found {(productResults.kroger?.length || 0) + 
                           (productResults.bestbuy?.length || 0)} products
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  {productResults.kroger?.map((product: any) => 
                    renderProductCard(product, 'kroger')
                  )}
                  {productResults.bestbuy?.map((product: any) => 
                    renderProductCard(product, 'bestbuy')
                  )}
                  {productResults.errors?.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm font-medium text-yellow-800">Errors:</p>
                      {productResults.errors.map((error: string, idx: number) => (
                        <p key={idx} className="text-sm text-yellow-700">{error}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="restaurants" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={handleYelpSearch} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Search Yelp
            </Button>
            <Button onClick={() => {}} disabled={true}>
              Search Zomato (Configure API)
            </Button>
            <Button onClick={() => {}} disabled={true}>
              Search Documenu (Configure API)
            </Button>
          </div>

          {yelpResults && (
            <Card>
              <CardHeader>
                <CardTitle>Yelp Results</CardTitle>
                <CardDescription>
                  Found {yelpResults.businesses?.length || 0} businesses
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                {yelpResults.businesses?.map((business: any) => 
                  renderRestaurantCard(business, 'yelp')
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={handleKrogerSearch} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Search Kroger
            </Button>
            <Button onClick={handleBestBuySearch} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Search Best Buy
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {krogerResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Kroger Results</CardTitle>
                  <CardDescription>
                    Found {krogerResults.data?.length || 0} products
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  {krogerResults.data?.map((product: any) => 
                    renderProductCard(product, 'kroger')
                  )}
                </CardContent>
              </Card>
            )}

            {bestbuyResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Best Buy Results</CardTitle>
                  <CardDescription>
                    Found {bestbuyResults.products?.length || 0} products
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  {bestbuyResults.products?.map((product: any) => 
                    renderProductCard(product, 'bestbuy')
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
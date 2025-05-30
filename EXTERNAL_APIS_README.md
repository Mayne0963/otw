# External APIs Integration

This project integrates with multiple external APIs to provide comprehensive restaurant, menu, and product data. The following APIs are supported:

- **Documenu** - Restaurant menus and information
- **Zomato** (via RapidAPI) - Restaurant search and details
- **Yelp Fusion** - Local business search and reviews
- **Kroger Public API** - Store inventory and product prices
- **Best Buy Developer API** - Product catalog and store availability

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Documenu API
DOCUMENU_API_KEY=your_documenu_api_key_here

# Zomato API (via RapidAPI)
ZOMATO_API_KEY=your_rapidapi_key_here

# Yelp Fusion API
YELP_API_KEY=your_yelp_api_key_here

# Kroger API
KROGER_CLIENT_ID=your_kroger_client_id_here
KROGER_CLIENT_SECRET=your_kroger_client_secret_here

# Best Buy API
BESTBUY_API_KEY=your_bestbuy_api_key_here
```

### 2. API Key Setup Instructions

#### Documenu API
1. Visit [Documenu API](https://documenu.com/docs)
2. Sign up for an account
3. Get your API key from the dashboard
4. Add it to your environment variables as `DOCUMENU_API_KEY`

#### Zomato API (via RapidAPI)
1. Visit [RapidAPI Zomato](https://rapidapi.com/apidojo/api/zomato)
2. Subscribe to the Zomato API
3. Get your RapidAPI key
4. Add it to your environment variables as `ZOMATO_API_KEY`

#### Yelp Fusion API
1. Visit [Yelp Developers](https://www.yelp.com/developers)
2. Create an app in the Yelp Developer Console
3. Get your API key
4. Add it to your environment variables as `YELP_API_KEY`

#### Kroger API
1. Visit [Kroger Developer Portal](https://developer.kroger.com/)
2. Register and create an application
3. Get your Client ID and Client Secret
4. Add them to your environment variables as `KROGER_CLIENT_ID` and `KROGER_CLIENT_SECRET`

#### Best Buy API
1. Visit [Best Buy Developer Portal](https://developer.bestbuy.com/)
2. Register for an API key
3. Get your API key
4. Add it to your environment variables as `BESTBUY_API_KEY`

## Usage

### Using the React Hook

```typescript
import { useExternalAPIs } from '@/hooks/useExternalAPIs';

function MyComponent() {
  const { 
    loading, 
    error, 
    searchRestaurants, 
    searchProducts 
  } = useExternalAPIs();

  const handleRestaurantSearch = async () => {
    const results = await searchRestaurants({
      latitude: 40.7128,
      longitude: -74.0060,
      term: 'pizza',
      radius: 5000,
      limit: 20
    });
    
    if (results) {
      console.log('Documenu results:', results.documenu);
      console.log('Zomato results:', results.zomato);
      console.log('Yelp results:', results.yelp);
      console.log('Errors:', results.errors);
    }
  };

  const handleProductSearch = async () => {
    const results = await searchProducts({
      query: 'organic milk',
      limit: 10
    });
    
    if (results) {
      console.log('Kroger results:', results.kroger);
      console.log('Best Buy results:', results.bestbuy);
      console.log('Errors:', results.errors);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={handleRestaurantSearch}>Search Restaurants</button>
      <button onClick={handleProductSearch}>Search Products</button>
    </div>
  );
}
```

### Direct API Calls

#### Unified Search (Recommended)

```bash
# Search restaurants across all APIs
GET /api/external/unified-search?type=restaurants&latitude=40.7128&longitude=-74.0060&term=pizza&radius=5000&limit=20

# Search products across Kroger and Best Buy
GET /api/external/unified-search?type=products&query=organic%20milk&limit=10
```

#### Individual API Endpoints

**Documenu:**
```bash
# Search restaurants
GET /api/external/documenu?action=search&lat=40.7128&lon=-74.0060&key_phrase=pizza&fullmenu=true

# Get restaurant menu
GET /api/external/documenu?action=menu&restaurantId=123456
```

**Zomato:**
```bash
# Search restaurants
GET /api/external/zomato?action=search&lat=40.7128&lon=-74.0060&q=pizza&count=20

# Get restaurant details
GET /api/external/zomato?action=details&restaurantId=123456
```

**Yelp:**
```bash
# Search businesses
GET /api/external/yelp?action=search&latitude=40.7128&longitude=-74.0060&term=pizza&radius=5000&limit=20

# Get business details
GET /api/external/yelp?action=details&businessId=business-id

# Get business reviews
GET /api/external/yelp?action=reviews&businessId=business-id
```

**Kroger:**
```bash
# Search products
GET /api/external/kroger?action=products&q=organic%20milk&limit=20

# Get store locations
GET /api/external/kroger?action=locations&zipCode=10001&radius=10&limit=5
```

**Best Buy:**
```bash
# Search products
GET /api/external/bestbuy?action=products&q=laptop&pageSize=20

# Get product details
GET /api/external/bestbuy?action=product&sku=123456

# Get stores
GET /api/external/bestbuy?action=stores&area=10001&pageSize=10

# Check product availability
GET /api/external/bestbuy?action=availability&sku=123456&storeId=789
```

## API Response Formats

All API endpoints return responses in the following format:

```typescript
{
  success: boolean;
  data?: T; // The actual response data
  error?: string; // Error message if success is false
}
```

### Unified Search Response

**Restaurant Search:**
```typescript
{
  success: true,
  data: {
    documenu: DocumenuRestaurant[],
    zomato: ZomatoRestaurant[],
    yelp: YelpBusiness[],
    errors: string[] // Any API-specific errors
  }
}
```

**Product Search:**
```typescript
{
  success: true,
  data: {
    kroger: KrogerProduct[],
    bestbuy: BestBuyProduct[],
    errors: string[] // Any API-specific errors
  }
}
```

## Error Handling

The integration includes comprehensive error handling:

1. **Missing API Keys**: APIs with missing keys will be skipped in unified search
2. **Rate Limiting**: Each API has its own rate limits - handle accordingly
3. **Network Errors**: All network errors are caught and returned in the response
4. **Invalid Parameters**: Parameter validation is performed before API calls

## Rate Limits and Quotas

- **Documenu**: Check your plan limits
- **Zomato**: 1000 calls/day (free tier)
- **Yelp**: 5000 calls/day (free tier)
- **Kroger**: Rate limits apply based on your application
- **Best Buy**: 5 requests/second, 50,000 requests/day

## Best Practices

1. **Use Unified Search**: For most use cases, use the unified search endpoints
2. **Cache Results**: Implement caching to reduce API calls
3. **Handle Errors Gracefully**: Always check for errors in responses
4. **Respect Rate Limits**: Implement proper rate limiting in your application
5. **Monitor Usage**: Keep track of your API usage to avoid quota exhaustion

## Troubleshooting

### Common Issues

1. **"API key not configured" error**: Ensure all required environment variables are set
2. **CORS errors**: These APIs are called from the backend, not frontend
3. **Rate limit exceeded**: Implement caching and rate limiting
4. **Invalid coordinates**: Ensure latitude/longitude are valid numbers
5. **Empty results**: Check if the search parameters are too restrictive

### Debug Mode

Enable debug logging by setting `NODE_ENV=development`. API errors will be logged to the console.

## Contributing

When adding new external APIs:

1. Add the service class to `src/lib/services/external-apis.ts`
2. Create API route handlers in `src/app/api/external/[service]/route.ts`
3. Update the React hook in `src/hooks/useExternalAPIs.ts`
4. Add environment variables to `src/lib/env.ts`
5. Update this README with setup instructions

## Support

For issues with specific APIs, refer to their official documentation:
- [Documenu Docs](https://documenu.com/docs)
- [Zomato API Docs](https://developers.zomato.com/documentation)
- [Yelp Fusion Docs](https://www.yelp.com/developers/documentation/v3)
- [Kroger API Docs](https://developer.kroger.com/reference)
- [Best Buy API Docs](https://developer.bestbuy.com/documentation)
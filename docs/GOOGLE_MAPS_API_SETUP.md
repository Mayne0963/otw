# Google Maps API Setup for Address Search Component

This guide explains how to properly configure Google Maps API keys for the Address Search component in the OTW application.

## Overview

The Address Search component uses Google Maps Places API to provide autocomplete functionality for location inputs. The implementation is built around a centralized `GoogleMapsContext` that manages API loading, error handling, and service initialization.

## Required API Keys

You need to configure the following Google Maps API key in your environment:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Client-side API key for Places API

## Step 1: Obtain Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API** (optional, for enhanced functionality)

4. Create credentials:
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

## Step 2: Configure API Key Restrictions (Recommended)

For security, restrict your API key:

### Application Restrictions
- **HTTP referrers (web sites)**: Add your domain(s)
  - `localhost:3000/*` (for development)
  - `yourdomain.com/*` (for production)

### API Restrictions
- Restrict key to specific APIs:
  - Maps JavaScript API
  - Places API
  - Geocoding API

## Step 3: Environment Configuration

### Development Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your API key:
   ```env
   # Google Maps Configuration
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-actual-google-maps-api-key"
   ```

### Production Setup

For production deployment, set the environment variable in your hosting platform:

- **Vercel**: Add in Project Settings > Environment Variables
- **Netlify**: Add in Site Settings > Environment Variables
- **AWS/Docker**: Set in your deployment configuration

## Step 4: Verify Implementation

The Address Search component is already integrated with the Google Maps context. Here's how it works:

### Context Provider

The `GoogleMapsProvider` wraps your application and manages:
- API key validation
- Google Maps API loading
- Error handling
- Service initialization

```tsx
// Already implemented in your app
<GoogleMapsProvider>
  <YourApp />
</GoogleMapsProvider>
```

### Address Search Component

The `AddressSearch` component automatically:
- Checks if Google Maps is loaded
- Displays loading states
- Shows error messages for API issues
- Provides autocomplete functionality

```tsx
// Usage example
<AddressSearch
  placeholder="Enter pickup location"
  onPlaceSelect={(place) => console.log(place)}
  theme="default"
  size="md"
/>
```

## Error Handling

The implementation includes comprehensive error handling:

### Common Error Messages

1. **"Google Maps API key is not configured"**
   - Solution: Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in your environment

2. **"Invalid Google Maps API key format"**
   - Solution: Ensure your API key is at least 30 characters long

3. **"Google Maps API request denied"**
   - Solution: Check API key restrictions and enable required APIs

4. **"Google Maps API quota exceeded"**
   - Solution: Check your usage limits in Google Cloud Console

### Debug Mode

To debug API issues, check the browser console for detailed error messages. The context provides specific error descriptions for common problems.

## Testing the Implementation

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to a page with address search (e.g., `/booking` or `/rides`)

3. Verify the autocomplete works by typing in an address field

4. Check the browser console for any error messages

## API Usage Optimization

### Best Practices

1. **Use API key restrictions** to prevent unauthorized usage
2. **Monitor usage** in Google Cloud Console
3. **Implement caching** for repeated requests (already handled by the context)
4. **Use session tokens** for autocomplete requests (implemented in the component)

### Cost Management

- Places Autocomplete: $2.83 per 1,000 requests
- Places Details: $3.00 per 1,000 requests
- Set up billing alerts in Google Cloud Console

## Troubleshooting

### Component Not Loading

1. Check if `GoogleMapsProvider` wraps your app
2. Verify API key is set correctly
3. Check browser console for errors
4. Ensure required APIs are enabled

### Autocomplete Not Working

1. Verify Places API is enabled
2. Check API key restrictions
3. Test with a simple address like "New York"
4. Check network tab for failed requests

### Performance Issues

1. The context implements singleton pattern to avoid multiple API loads
2. Services are initialized once and reused
3. Consider implementing request debouncing for heavy usage

## Security Considerations

1. **Never expose server-side API keys** in client code
2. **Use HTTP referrer restrictions** for client-side keys
3. **Monitor usage regularly** for unusual activity
4. **Rotate keys periodically** as a security best practice

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your Google Cloud Console settings
3. Test with a fresh API key
4. Review the component implementation in `/src/components/AddressSearch.tsx`

For additional help, refer to the [Google Maps Platform documentation](https://developers.google.com/maps/documentation).
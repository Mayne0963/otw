# Google Maps API Setup Guide

This guide will help you set up Google Maps API keys for the OTW application's address search functionality.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. A GCP project with billing enabled
3. Access to the Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" and then "New Project"
3. Enter a project name (e.g., "OTW-Maps")
4. Click "Create"

## Step 2: Enable Required APIs

Navigate to the [APIs & Services > Library](https://console.cloud.google.com/apis/library) and enable the following APIs:

### Required APIs:
- **Maps JavaScript API** - For displaying maps and map components
- **Places API** - For address autocomplete and place details
- **Geocoding API** - For converting addresses to coordinates

### Optional APIs (for advanced features):
- **Directions API** - For route planning
- **Distance Matrix API** - For calculating travel distances
- **Roads API** - For road-specific data

## Step 3: Create API Keys

1. Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "+ CREATE CREDENTIALS" > "API key"
3. Copy the generated API key
4. Click "RESTRICT KEY" to configure restrictions

## Step 4: Configure API Key Restrictions

### For Client-Side Key (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY):

1. **Application restrictions:**
   - Select "HTTP referrers (web sites)"
   - Add your domains:
     - `http://localhost:3000/*` (for development)
     - `https://yourdomain.com/*` (for production)
     - `https://*.vercel.app/*` (if using Vercel)

2. **API restrictions:**
   - Select "Restrict key"
   - Choose:
     - Maps JavaScript API
     - Places API
     - Geocoding API

### For Server-Side Key (GOOGLE_MAPS_SERVER_API_KEY):

1. **Application restrictions:**
   - Select "IP addresses"
   - Add your server IPs or leave unrestricted for development

2. **API restrictions:**
   - Select "Restrict key"
   - Choose:
     - Places API
     - Geocoding API
     - Directions API
     - Distance Matrix API

## Step 5: Update Environment Variables

Update your `.env.local` file with your API keys:

```env
# Google Maps Configuration
GOOGLE_MAPS_SERVER_API_KEY="your-server-side-api-key"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-client-side-api-key"
```

## Step 6: Test the Integration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the booking page or any page with address search
3. Verify that the autocomplete functionality works
4. Check the browser console for any API errors

## Common Issues and Solutions

### Issue: "Google Maps API key is not configured"
**Solution:** Ensure `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in your `.env.local` file

### Issue: "REQUEST_DENIED" error
**Solution:** 
- Check that the required APIs are enabled
- Verify API key restrictions allow your domain
- Ensure billing is enabled on your GCP project

### Issue: "ApiTargetBlockedMapError"
**Solution:**
- Enable Maps JavaScript API
- Check API key restrictions
- Verify the key has proper permissions

### Issue: "OVER_QUERY_LIMIT"
**Solution:**
- Check your API usage in the GCP console
- Increase quotas or upgrade your billing plan
- Implement request caching to reduce API calls

## Security Best Practices

1. **Never commit API keys to version control**
   - Use environment variables
   - Add `.env.local` to `.gitignore`

2. **Use different keys for different environments**
   - Development keys with localhost restrictions
   - Production keys with domain restrictions

3. **Regularly rotate API keys**
   - Create new keys periodically
   - Delete unused keys

4. **Monitor API usage**
   - Set up billing alerts
   - Monitor usage in GCP console
   - Implement rate limiting

5. **Restrict API keys properly**
   - Use HTTP referrer restrictions for client-side keys
   - Use IP restrictions for server-side keys
   - Only enable required APIs

## Monitoring and Maintenance

### Monitor API Usage:
1. Go to [APIs & Services > Dashboard](https://console.cloud.google.com/apis/dashboard)
2. Check daily usage and quotas
3. Set up billing alerts

### Update Restrictions:
- Add new domains when deploying to new environments
- Update IP restrictions when server infrastructure changes
- Review and remove unused restrictions

## Cost Optimization

1. **Enable only required APIs**
2. **Use autocomplete session tokens** for Places API
3. **Implement client-side caching** for repeated requests
4. **Use appropriate place data fields** to minimize costs
5. **Set up billing alerts** to monitor spending

## Support

If you encounter issues:
1. Check the [Google Maps Platform documentation](https://developers.google.com/maps/documentation)
2. Review the [Places API documentation](https://developers.google.com/maps/documentation/places/web-service)
3. Check the browser console for detailed error messages
4. Verify API key configuration in the GCP console

## Environment Variables Reference

```env
# Required for client-side Google Maps integration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-client-side-api-key"

# Required for server-side Google Maps operations
GOOGLE_MAPS_SERVER_API_KEY="your-server-side-api-key"

# Optional: Custom configuration
NEXT_PUBLIC_GOOGLE_MAPS_REGION="US"
NEXT_PUBLIC_GOOGLE_MAPS_LANGUAGE="en"
```

Remember to replace the placeholder values with your actual API keys from the Google Cloud Console.
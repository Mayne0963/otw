# API Keys Setup Guide

This guide will help you configure the required API keys for Firebase, Stripe, and Google Maps integration.

## Required API Keys

### 1. Firebase Configuration

You'll need to create a Firebase project and obtain the following keys:

- `NEXT_PUBLIC_FIREBASE_API_KEY` - Your Firebase web API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain (usually `your-project.firebaseapp.com`)
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Your Firebase app ID
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` - Your Firebase analytics measurement ID (optional)
- `FIREBASE_SERVICE_ACCOUNT` - Your Firebase service account JSON (for server-side operations)

#### How to get Firebase keys:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Go to Project Settings > General
4. Scroll down to "Your apps" and click on the web app
5. Copy the config object values
6. For service account: Go to Project Settings > Service Accounts > Generate new private key

### 2. Stripe Configuration

You'll need to create a Stripe account and obtain:

- `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (starts with `pk_`)
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook endpoint secret

#### How to get Stripe keys:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers > API keys
3. Copy the Publishable key and Secret key
4. For webhooks: Go to Developers > Webhooks > Add endpoint

### 3. Google Maps Configuration

You'll need to enable Google Maps API and obtain:

- `GOOGLE_MAPS_SERVER_API_KEY` - Server-side Google Maps API key
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Client-side Google Maps API key

#### How to get Google Maps keys:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
4. Go to Credentials > Create Credentials > API Key
5. Create separate keys for server and client use
6. Restrict the keys appropriately:
   - Server key: Restrict by IP addresses
   - Client key: Restrict by HTTP referrers

## Environment Files

### Development (.env)
Copy `.env.example` to `.env` and fill in your development API keys.

### Production (.env.production)
Use this file for production environment variables. Make sure to use production keys and not test/development keys.

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use different keys for development and production**
3. **Restrict API keys by domain/IP when possible**
4. **Regularly rotate your API keys**
5. **Monitor API key usage in respective dashboards**
6. **Use environment variables, never hardcode keys**

## Vercel Deployment

When deploying to Vercel, add your environment variables in:
1. Vercel Dashboard > Your Project > Settings > Environment Variables
2. Add all the variables from your `.env.production` file
3. Make sure to set the correct environment (Production, Preview, Development)

## Testing Configuration

After setting up your API keys, you can test:

1. **Firebase**: Check if authentication and database operations work
2. **Stripe**: Test payment processing in test mode
3. **Google Maps**: Verify maps load and location services work

## Troubleshooting

### Common Issues:

1. **Firebase not initializing**: Check if all required environment variables are set
2. **Stripe payments failing**: Verify webhook endpoints and secret keys
3. **Maps not loading**: Check API key restrictions and enabled APIs
4. **CORS errors**: Ensure domain restrictions are properly configured

### Debug Steps:

1. Check browser console for error messages
2. Verify environment variables are loaded correctly
3. Test API keys individually in their respective dashboards
4. Check network tab for failed API requests

## Support

If you encounter issues:
1. Check the official documentation for each service
2. Verify your API quotas and billing settings
3. Ensure all required APIs are enabled
4. Contact support for the respective services if needed
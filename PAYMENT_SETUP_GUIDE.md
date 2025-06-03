# Payment System Setup Guide

## Overview
Your application already has a comprehensive payment system built with Stripe integration. This guide will help you complete the setup and test the payment functionality.

## Current Payment System Features

### ✅ Already Implemented
- **Stripe Integration**: Full Stripe SDK integration with both client and server-side components
- **Checkout Sessions**: API endpoint for creating Stripe checkout sessions
- **Webhook Handling**: Complete webhook system for payment confirmations
- **Loyalty Tiers**: Membership tier checkout functionality
- **Payment Components**: Checkout page with form validation
- **Order Management**: Order creation and tracking
- **Refund System**: Built-in refund functionality
- **Security**: Firebase authentication integration

### 🔧 Needs Configuration
- Valid Stripe API keys
- Webhook endpoint registration
- Product and pricing setup in Stripe dashboard

## Step-by-Step Setup

### 1. Stripe Account Setup

1. **Create/Access Stripe Account**
   - Go to [https://stripe.com](https://stripe.com)
   - Sign up or log into your existing account
   - Complete account verification if needed

2. **Get API Keys**
   - Navigate to Developers → API keys
   - Copy your **Publishable key** and **Secret key**
   - For testing, use the test keys (they start with `pk_test_` and `sk_test_`)

### 2. Update Environment Variables

Replace the current Stripe keys in your `.env` file:

```env
# Stripe Configuration - REPLACE WITH YOUR ACTUAL KEYS
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
```

### 3. Set Up Stripe Products and Prices

You can either:

**Option A: Use Stripe Dashboard**
1. Go to Products in your Stripe dashboard
2. Create products for your loyalty tiers:
   - Silver Membership
   - Gold Membership  
   - Platinum Membership
3. Set up pricing for each tier

**Option B: Use the MCP Stripe Tools (Automated)**
Run these commands to set up products programmatically:

```bash
# This will be handled automatically when you have valid API keys
```

### 4. Configure Webhooks

1. **In Stripe Dashboard**:
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

2. **Copy Webhook Secret**:
   - After creating the webhook, copy the signing secret
   - Update `STRIPE_WEBHOOK_SECRET` in your `.env` file

### 5. Test the Payment System

#### Test Cards (Stripe Test Mode)
```
# Successful payment
4242 4242 4242 4242

# Declined payment
4000 0000 0000 0002

# Requires authentication
4000 0025 0000 3155

# Use any future expiry date and any 3-digit CVC
```

#### Testing Flow
1. Start your development server: `npm run dev`
2. Navigate to the loyalty page: `/loyalty`
3. Try purchasing a membership tier
4. Use test card numbers above
5. Check webhook logs in Stripe dashboard

### 6. File Structure Overview

```
src/
├── app/
│   ├── api/
│   │   ├── create-checkout-session/route.ts  # Creates Stripe sessions
│   │   └── webhooks/stripe/route.ts          # Handles Stripe webhooks
│   ├── checkout/page.tsx                     # Checkout page UI
│   └── loyalty/page.tsx                      # Loyalty tiers page
├── lib/
│   └── stripe.ts                             # Stripe configuration
├── hooks/
│   └── useTierMembership.ts                  # Membership management
└── components/
    └── loyalty/                              # Loyalty components
```

### 7. Key API Endpoints

- `POST /api/create-checkout-session` - Creates Stripe checkout sessions
- `POST /api/webhooks/stripe` - Handles Stripe webhook events
- `POST /api/cancel-subscription` - Cancels user subscriptions

### 8. Security Features

- ✅ Firebase Authentication integration
- ✅ Webhook signature verification
- ✅ Server-side payment validation
- ✅ Secure API key handling
- ✅ CORS protection

### 9. Production Deployment

1. **Switch to Live Keys**:
   - Replace test keys with live keys in production environment
   - Update webhook URL to production domain

2. **Environment Variables**:
   ```env
   NODE_ENV="production"
   STRIPE_SECRET_KEY="sk_live_your_live_secret_key"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_live_publishable_key"
   ```

3. **SSL Certificate**: Ensure your domain has a valid SSL certificate

### 10. Monitoring and Analytics

- Monitor payments in Stripe Dashboard
- Set up Stripe alerts for failed payments
- Review webhook delivery logs
- Monitor application logs for payment errors

## Troubleshooting

### Common Issues

1. **"Failed to retrieve balance"**
   - Check if Stripe keys are valid
   - Ensure keys match the environment (test vs live)

2. **Webhook signature verification failed**
   - Verify webhook secret is correct
   - Check webhook URL is accessible

3. **Payment not completing**
   - Check webhook events are being received
   - Verify Firebase integration is working
   - Check browser console for errors

### Debug Commands

```bash
# Check if Stripe is configured correctly
npm run dev

# View webhook logs
# Check Stripe Dashboard → Developers → Webhooks → [Your webhook] → Attempts

# Test API endpoints
curl -X POST http://localhost:3000/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"items":[{"name":"Test","price":10,"quantity":1}]}'
```

## Next Steps

1. ✅ Update Stripe API keys with your actual credentials
2. ✅ Set up webhook endpoint in Stripe dashboard
3. ✅ Create products and pricing in Stripe
4. ✅ Test payment flow with test cards
5. ✅ Deploy to production with live keys

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Test Cards](https://stripe.com/docs/testing#cards)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)

Your payment system is already well-architected and ready for production use once you configure the Stripe credentials!
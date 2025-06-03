#!/usr/bin/env node

/**
 * Stripe Products Setup Script
 * 
 * This script creates the necessary products and prices in your Stripe account
 * for the loyalty membership tiers.
 * 
 * Usage: node scripts/setup-stripe-products.js
 * 
 * Make sure to set your STRIPE_SECRET_KEY environment variable first.
 */

const Stripe = require('stripe');
require('dotenv').config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is required');
  console.log('Please add your Stripe secret key to your .env file:');
  console.log('STRIPE_SECRET_KEY="sk_test_your_secret_key_here"');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Membership tier configurations
const membershipTiers = [
  {
    name: 'Silver Membership',
    description: 'Basic loyalty tier with standard benefits',
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    features: ['5% discount on orders', 'Priority customer support', 'Monthly newsletter']
  },
  {
    name: 'Gold Membership', 
    description: 'Premium loyalty tier with enhanced benefits',
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    features: ['10% discount on orders', 'Free shipping', 'Early access to new products', 'Quarterly exclusive events']
  },
  {
    name: 'Platinum Membership',
    description: 'Elite loyalty tier with maximum benefits',
    monthlyPrice: 39.99,
    yearlyPrice: 399.99,
    features: ['15% discount on orders', 'Free expedited shipping', 'Personal account manager', 'Exclusive product previews', 'VIP customer support']
  }
];

async function createProduct(tierConfig) {
  try {
    console.log(`Creating product: ${tierConfig.name}...`);
    
    // Create the product
    const product = await stripe.products.create({
      name: tierConfig.name,
      description: tierConfig.description,
      metadata: {
        tier: tierConfig.name.toLowerCase().replace(' membership', ''),
        features: tierConfig.features.join(', ')
      }
    });
    
    console.log(`✅ Product created: ${product.id}`);
    
    // Create monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(tierConfig.monthlyPrice * 100), // Convert to cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      nickname: `${tierConfig.name} - Monthly`
    });
    
    console.log(`✅ Monthly price created: ${monthlyPrice.id} ($${tierConfig.monthlyPrice}/month)`);
    
    // Create yearly price
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(tierConfig.yearlyPrice * 100), // Convert to cents
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      nickname: `${tierConfig.name} - Yearly`
    });
    
    console.log(`✅ Yearly price created: ${yearlyPrice.id} ($${tierConfig.yearlyPrice}/year)`);
    
    return {
      product,
      monthlyPrice,
      yearlyPrice
    };
    
  } catch (error) {
    console.error(`❌ Error creating ${tierConfig.name}:`, error.message);
    throw error;
  }
}

async function setupStripeProducts() {
  console.log('🚀 Setting up Stripe products for loyalty membership tiers...');
  console.log('');
  
  try {
    // Test the Stripe connection
    console.log('Testing Stripe connection...');
    const account = await stripe.accounts.retrieve();
    console.log(`✅ Connected to Stripe account: ${account.email || account.id}`);
    console.log('');
    
    const results = [];
    
    for (const tier of membershipTiers) {
      const result = await createProduct(tier);
      results.push(result);
      console.log('');
    }
    
    console.log('🎉 All products and prices created successfully!');
    console.log('');
    console.log('📋 Summary:');
    
    results.forEach((result, index) => {
      const tier = membershipTiers[index];
      console.log(`${tier.name}:`);
      console.log(`  Product ID: ${result.product.id}`);
      console.log(`  Monthly Price ID: ${result.monthlyPrice.id}`);
      console.log(`  Yearly Price ID: ${result.yearlyPrice.id}`);
      console.log('');
    });
    
    console.log('💡 Next steps:');
    console.log('1. Update your application code to use these product/price IDs');
    console.log('2. Set up webhooks in your Stripe dashboard');
    console.log('3. Test the payment flow with Stripe test cards');
    console.log('');
    console.log('🔗 Useful links:');
    console.log('- Stripe Dashboard: https://dashboard.stripe.com');
    console.log('- Test Cards: https://stripe.com/docs/testing#cards');
    console.log('- Webhooks: https://dashboard.stripe.com/webhooks');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('');
      console.log('🔑 Authentication failed. Please check:');
      console.log('1. Your STRIPE_SECRET_KEY is correct');
      console.log('2. The key matches your environment (test vs live)');
      console.log('3. Your Stripe account is active');
    }
    
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  setupStripeProducts();
}

module.exports = { setupStripeProducts, membershipTiers };
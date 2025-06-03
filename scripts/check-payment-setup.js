#!/usr/bin/env node

/**
 * Simple Payment Setup Checker
 * 
 * This script performs basic checks on the payment system configuration.
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
try {
  require('dotenv').config();
} catch (e) {
  console.log('⚠️  dotenv not available, using system environment variables');
}

console.log('🔍 Payment System Setup Check');
console.log('==============================\n');

// 1. Check environment variables
console.log('📋 Environment Variables:');
const envVars = {
  'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
  'STRIPE_WEBHOOK_SECRET': process.env.STRIPE_WEBHOOK_SECRET,
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
};

let envIssues = 0;
for (const [key, value] of Object.entries(envVars)) {
  if (value) {
    const masked = value.substring(0, 10) + '...';
    console.log(`✅ ${key}: ${masked}`);
  } else {
    console.log(`❌ ${key}: Not set`);
    envIssues++;
  }
}

// 2. Check key formats
console.log('\n🔑 Stripe Key Validation:');
if (process.env.STRIPE_SECRET_KEY) {
  if (process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    console.log('✅ Secret key: Test mode (recommended for development)');
  } else if (process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
    console.log('⚠️  Secret key: Live mode (use with caution)');
  } else {
    console.log('❌ Secret key: Invalid format');
    envIssues++;
  }
}

if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_')) {
    console.log('✅ Publishable key: Test mode');
  } else if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_live_')) {
    console.log('⚠️  Publishable key: Live mode');
  } else {
    console.log('❌ Publishable key: Invalid format');
    envIssues++;
  }
}

// 3. Check critical files
console.log('\n📁 Critical Files:');
const criticalFiles = [
  'src/lib/stripe.ts',
  'src/app/api/create-checkout-session/route.ts',
  'src/app/api/webhooks/stripe/route.ts',
  'src/app/checkout/page.tsx'
];

let fileIssues = 0;
criticalFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file}: Missing`);
    fileIssues++;
  }
});

// 4. Test Stripe connection (if possible)
console.log('\n🔌 Stripe Connection Test:');
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Simple test - this will either work or throw an error
    console.log('✅ Stripe SDK loaded successfully');
    console.log('   (Run a full test with actual API calls separately)');
  } catch (error) {
    console.log(`❌ Stripe SDK error: ${error.message}`);
  }
} else {
  console.log('❌ Cannot test - invalid or missing Stripe secret key');
}

// 5. Summary and recommendations
console.log('\n📊 Summary:');
console.log('============');

if (envIssues === 0 && fileIssues === 0) {
  console.log('🎉 Payment system appears to be properly configured!');
  console.log('\n✅ Next steps:');
  console.log('1. Run: node scripts/setup-stripe-products.js');
  console.log('2. Set up webhooks in Stripe dashboard');
  console.log('3. Test with: npm run dev');
} else {
  console.log('⚠️  Issues found that need attention:');
  
  if (envIssues > 0) {
    console.log(`\n🔧 Environment Issues (${envIssues}):`);
    console.log('- Update your .env file with valid Stripe API keys');
    console.log('- Get keys from: https://dashboard.stripe.com/apikeys');
  }
  
  if (fileIssues > 0) {
    console.log(`\n📁 File Issues (${fileIssues}):`);
    console.log('- Some payment system files are missing');
    console.log('- Check if files were moved or deleted');
  }
}

console.log('\n📚 Resources:');
console.log('- Setup Guide: ./PAYMENT_SETUP_GUIDE.md');
console.log('- Stripe Dashboard: https://dashboard.stripe.com');
console.log('- Test Cards: https://stripe.com/docs/testing#cards');
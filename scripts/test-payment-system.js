#!/usr/bin/env node

/**
 * Payment System Test Script
 * 
 * This script tests various components of the payment system to ensure
 * everything is configured correctly.
 * 
 * Usage: node scripts/test-payment-system.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvironmentVariables() {
  log('\n🔍 Checking Environment Variables...', 'blue');
  
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET', 
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_API_KEY'
  ];
  
  const results = [];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      log(`✅ ${varName}: Set (${value.substring(0, 10)}...)`, 'green');
      results.push({ name: varName, status: 'ok' });
    } else {
      log(`❌ ${varName}: Missing`, 'red');
      results.push({ name: varName, status: 'missing' });
    }
  });
  
  return results;
}

function checkFileStructure() {
  log('\n📁 Checking File Structure...', 'blue');
  
  const requiredFiles = [
    'src/lib/stripe.ts',
    'src/app/api/create-checkout-session/route.ts',
    'src/app/api/webhooks/stripe/route.ts',
    'src/app/checkout/page.tsx',
    'src/app/loyalty/page.tsx',
    'src/hooks/useTierMembership.ts'
  ];
  
  const results = [];
  
  requiredFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      log(`✅ ${filePath}: Found`, 'green');
      results.push({ file: filePath, status: 'found' });
    } else {
      log(`❌ ${filePath}: Missing`, 'red');
      results.push({ file: filePath, status: 'missing' });
    }
  });
  
  return results;
}

function checkPackageDependencies() {
  log('\n📦 Checking Package Dependencies...', 'blue');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    log('❌ package.json not found', 'red');
    return [];
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredPackages = [
    'stripe',
    '@stripe/stripe-js',
    'firebase',
    'firebase-admin',
    'next'
  ];
  
  const results = [];
  
  requiredPackages.forEach(pkg => {
    if (dependencies[pkg]) {
      log(`✅ ${pkg}: ${dependencies[pkg]}`, 'green');
      results.push({ package: pkg, version: dependencies[pkg], status: 'installed' });
    } else {
      log(`❌ ${pkg}: Not installed`, 'red');
      results.push({ package: pkg, status: 'missing' });
    }
  });
  
  return results;
}

async function testStripeConnection() {
  log('\n🔌 Testing Stripe Connection...', 'blue');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    log('❌ STRIPE_SECRET_KEY not set', 'red');
    return { status: 'failed', reason: 'No API key' };
  }
  
  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Test the connection by retrieving account info
    const account = await stripe.accounts.retrieve();
    log(`✅ Connected to Stripe account: ${account.email || account.id}`, 'green');
    log(`   Account type: ${account.type}`, 'green');
    log(`   Country: ${account.country}`, 'green');
    
    return { status: 'success', account };
    
  } catch (error) {
    log(`❌ Stripe connection failed: ${error.message}`, 'red');
    
    if (error.type === 'StripeAuthenticationError') {
      log('   💡 Check your STRIPE_SECRET_KEY is correct', 'yellow');
    }
    
    return { status: 'failed', error: error.message };
  }
}

function checkStripeKeyFormat() {
  log('\n🔑 Checking Stripe Key Formats...', 'blue');
  
  const results = [];
  
  // Check secret key format
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (secretKey) {
    if (secretKey.startsWith('sk_test_')) {
      log('✅ Secret key: Test mode format', 'green');
      results.push({ key: 'secret', mode: 'test', status: 'valid' });
    } else if (secretKey.startsWith('sk_live_')) {
      log('⚠️  Secret key: Live mode format', 'yellow');
      log('   Make sure you want to use live mode!', 'yellow');
      results.push({ key: 'secret', mode: 'live', status: 'valid' });
    } else {
      log('❌ Secret key: Invalid format', 'red');
      results.push({ key: 'secret', status: 'invalid' });
    }
  }
  
  // Check publishable key format
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (publishableKey) {
    if (publishableKey.startsWith('pk_test_')) {
      log('✅ Publishable key: Test mode format', 'green');
      results.push({ key: 'publishable', mode: 'test', status: 'valid' });
    } else if (publishableKey.startsWith('pk_live_')) {
      log('⚠️  Publishable key: Live mode format', 'yellow');
      results.push({ key: 'publishable', mode: 'live', status: 'valid' });
    } else {
      log('❌ Publishable key: Invalid format', 'red');
      results.push({ key: 'publishable', status: 'invalid' });
    }
  }
  
  // Check webhook secret format
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (webhookSecret) {
    if (webhookSecret.startsWith('whsec_')) {
      log('✅ Webhook secret: Valid format', 'green');
      results.push({ key: 'webhook', status: 'valid' });
    } else {
      log('❌ Webhook secret: Invalid format (should start with whsec_)', 'red');
      results.push({ key: 'webhook', status: 'invalid' });
    }
  }
  
  return results;
}

function generateReport(envResults, fileResults, depResults, stripeResults, keyResults) {
  log('\n📊 Test Report Summary', 'bold');
  log('========================', 'bold');
  
  const envMissing = envResults.filter(r => r.status === 'missing').length;
  const filesMissing = fileResults.filter(r => r.status === 'missing').length;
  const depsMissing = depResults.filter(r => r.status === 'missing').length;
  const keysInvalid = keyResults.filter(r => r.status === 'invalid').length;
  
  log(`Environment Variables: ${envResults.length - envMissing}/${envResults.length} configured`);
  log(`Required Files: ${fileResults.length - filesMissing}/${fileResults.length} found`);
  log(`Dependencies: ${depResults.length - depsMissing}/${depResults.length} installed`);
  log(`Stripe Connection: ${stripeResults.status === 'success' ? '✅ Working' : '❌ Failed'}`);
  log(`Stripe Keys: ${keyResults.length - keysInvalid}/${keyResults.length} valid format`);
  
  log('\n🎯 Next Steps:', 'blue');
  
  if (envMissing > 0) {
    log('1. Set missing environment variables in your .env file', 'yellow');
  }
  
  if (filesMissing > 0) {
    log('2. Ensure all required payment system files are present', 'yellow');
  }
  
  if (depsMissing > 0) {
    log('3. Install missing dependencies: npm install', 'yellow');
  }
  
  if (stripeResults.status !== 'success') {
    log('4. Fix Stripe connection issues', 'yellow');
  }
  
  if (keysInvalid > 0) {
    log('5. Update invalid Stripe API keys', 'yellow');
  }
  
  if (envMissing === 0 && filesMissing === 0 && depsMissing === 0 && 
      stripeResults.status === 'success' && keysInvalid === 0) {
    log('\n🎉 Payment system is ready to use!', 'green');
    log('You can now:', 'green');
    log('- Run the setup script: node scripts/setup-stripe-products.js', 'green');
    log('- Start your dev server: npm run dev', 'green');
    log('- Test payments on /loyalty page', 'green');
  }
}

async function runTests() {
  log('🧪 Payment System Test Suite', 'bold');
  log('============================', 'bold');
  
  const envResults = checkEnvironmentVariables();
  const fileResults = checkFileStructure();
  const depResults = checkPackageDependencies();
  const keyResults = checkStripeKeyFormat();
  const stripeResults = await testStripeConnection();
  
  generateReport(envResults, fileResults, depResults, stripeResults, keyResults);
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  checkEnvironmentVariables,
  checkFileStructure,
  checkPackageDependencies,
  testStripeConnection,
  checkStripeKeyFormat
};
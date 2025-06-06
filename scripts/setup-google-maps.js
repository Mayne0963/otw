#!/usr/bin/env node

/**
 * Google Maps API Setup Script
 * 
 * This script helps developers quickly configure Google Maps API keys
 * for the Address Search component.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ENV_FILE = path.join(process.cwd(), '.env.local');

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function validateApiKey(apiKey) {
  if (!apiKey || apiKey.length < 30) {
    return false;
  }
  if (apiKey.includes('your-google-maps') || apiKey === 'your-api-key-here') {
    return false;
  }
  return true;
}

function updateEnvFile(apiKey) {
  try {
    let envContent = '';
    
    if (fs.existsSync(ENV_FILE)) {
      envContent = fs.readFileSync(ENV_FILE, 'utf8');
    }

    // Update or add Google Maps API key
    const googleMapsKeyRegex = /NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="[^"]*"/;
    const serverKeyRegex = /GOOGLE_MAPS_SERVER_API_KEY="[^"]*"/;
    
    const newClientKey = `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="${apiKey}"`;
    const newServerKey = `GOOGLE_MAPS_SERVER_API_KEY="${apiKey}"`;

    if (googleMapsKeyRegex.test(envContent)) {
      envContent = envContent.replace(googleMapsKeyRegex, newClientKey);
    } else {
      envContent += `\n# Google Maps Configuration\n${newClientKey}\n`;
    }

    if (serverKeyRegex.test(envContent)) {
      envContent = envContent.replace(serverKeyRegex, newServerKey);
    } else {
      envContent += `${newServerKey}\n`;
    }

    fs.writeFileSync(ENV_FILE, envContent);
    return true;
  } catch (error) {
    console.error('Error updating .env.local file:', error.message);
    return false;
  }
}

async function main() {
  console.log('🗺️  Google Maps API Setup for Address Search Component\n');
  
  console.log('Before proceeding, make sure you have:');
  console.log('1. Created a Google Cloud Project');
  console.log('2. Enabled Maps JavaScript API and Places API');
  console.log('3. Created an API key with proper restrictions');
  console.log('\nFor detailed instructions, see: docs/GOOGLE_MAPS_API_SETUP.md\n');

  const proceed = await askQuestion('Do you want to continue? (y/N): ');
  
  if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
    console.log('Setup cancelled.');
    rl.close();
    return;
  }

  const apiKey = await askQuestion('\nEnter your Google Maps API key: ');
  
  if (!validateApiKey(apiKey)) {
    console.log('\n❌ Invalid API key format.');
    console.log('API keys should be at least 30 characters long.');
    console.log('Make sure you\'re using a real API key, not a placeholder.');
    rl.close();
    return;
  }

  console.log('\n🔍 Validating API key format... ✅');
  
  if (updateEnvFile(apiKey)) {
    console.log('\n✅ Successfully updated .env.local file!');
    console.log('\nNext steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Test the Address Search component on /booking or /rides pages');
    console.log('3. Check browser console for any API errors');
    console.log('\nIf you encounter issues, refer to docs/GOOGLE_MAPS_API_SETUP.md');
  } else {
    console.log('\n❌ Failed to update .env.local file.');
    console.log('Please manually add the following to your .env.local file:');
    console.log(`\nNEXT_PUBLIC_GOOGLE_MAPS_API_KEY="${apiKey}"`);
    console.log(`GOOGLE_MAPS_SERVER_API_KEY="${apiKey}"`);
  }

  rl.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { validateApiKey, updateEnvFile };
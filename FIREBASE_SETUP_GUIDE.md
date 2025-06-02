# Firebase Setup Guide

## Overview
This guide will help you fix the Firebase authentication error `auth/api-key-not-valid` by properly configuring your Firebase environment variables.

## Problem
The error `auth/api-key-not-valid` occurs when:
1. Firebase environment variables are missing or undefined
2. Environment variables contain placeholder values (like "your-firebase-api-key")
3. The API key is invalid or from a different Firebase project

## Solution

### Step 1: Get Your Firebase Configuration

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one if you don't have one)
3. Click on the gear icon ⚙️ and select "Project settings"
4. Scroll down to the "Your apps" section
5. If you don't have a web app, click "Add app" and select the web icon `</>`
6. Copy the configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXXXXXX"
};
```

### Step 2: Update Your Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Firebase configuration:

```env
# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyC..." # Your actual API key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"
```

### Step 3: Enable Authentication

1. In the Firebase Console, go to "Authentication" in the left sidebar
2. Click "Get started" if you haven't set it up yet
3. Go to the "Sign-in method" tab
4. Enable the sign-in providers you want to use (Email/Password, Google, etc.)

### Step 4: Configure Firestore (if using database features)

1. In the Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development (remember to secure it later)
4. Select a location for your database

### Step 5: Restart Your Development Server

```bash
npm run dev
```

## Verification

After updating your environment variables, you should see helpful error messages in the console if any variables are still missing or contain placeholder values.

## Security Notes

1. **Never commit `.env.local` to version control** - it's already in `.gitignore`
2. **Use different Firebase projects for development and production**
3. **Set up Firebase Security Rules** for production
4. **Restrict your API keys** in the Firebase Console under "Project settings" > "General" > "Web API Key"

## Troubleshooting

### Still getting `auth/api-key-not-valid`?

1. **Double-check your API key** - make sure it's copied correctly
2. **Verify the project** - ensure you're using the correct Firebase project
3. **Check browser console** - look for detailed error messages
4. **Clear browser cache** - sometimes cached configs cause issues
5. **Restart development server** - environment variables are loaded at startup

### Environment variables not loading?

1. **File name** - ensure it's `.env.local` (not `.env` or `.env.development`)
2. **File location** - must be in the project root directory
3. **Syntax** - no spaces around the `=` sign
4. **Quotes** - use double quotes for values with special characters

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Firebase Console](https://console.firebase.google.com/)
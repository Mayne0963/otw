# Firebase Admin Troubleshooting Guide

This guide helps resolve Firebase Admin initialization issues, particularly the "Failed to parse private key" error.

## Common Issues and Solutions

### 1. Private Key Format Issues

The most common cause of the "Failed to parse private key" error is incorrect formatting of the `FIREBASE_PRIVATE_KEY` environment variable.

#### Correct Format
Your private key should be in PEM format and look like this:
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----
```

#### Environment Variable Setup

**Option 1: Direct Copy (Recommended)**
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
```

**Option 2: Using Service Account JSON**
If you have the full service account JSON, you can extract the private key:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"
}
```

### 2. Environment Variables Checklist

Ensure all required Firebase environment variables are set:

```bash
# Required for Firebase Admin
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"

# Required for client-side Firebase
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef"
```

### 3. Getting Your Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon)
4. Navigate to "Service accounts" tab
5. Click "Generate new private key"
6. Download the JSON file
7. Extract the required values from the JSON

### 4. Common Formatting Mistakes

❌ **Wrong: Missing quotes around the entire key**
```bash
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----
```

❌ **Wrong: Using single quotes (prevents escape sequence processing)**
```bash
FIREBASE_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----'
```

❌ **Wrong: Missing escape sequences for newlines**
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----"
```

✅ **Correct: Double quotes with escaped newlines**
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
```

### 5. Testing Your Configuration

After updating your environment variables:

1. Restart your development server
2. Check the console for initialization messages:
   - ✅ "Firebase Admin initialized successfully"
   - ❌ "Firebase Admin initialization failed"

3. Test an API endpoint that uses Firebase Admin (like `/api/create-checkout-session`)

### 6. Debugging Steps

1. **Check Environment Variables**
   ```javascript
   console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
   console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
   console.log('FIREBASE_PRIVATE_KEY length:', process.env.FIREBASE_PRIVATE_KEY?.length);
   ```

2. **Verify Private Key Format**
   ```javascript
   const key = process.env.FIREBASE_PRIVATE_KEY;
   console.log('Starts with BEGIN:', key?.includes('-----BEGIN PRIVATE KEY-----'));
   console.log('Ends with END:', key?.includes('-----END PRIVATE KEY-----'));
   ```

3. **Check for Extra Characters**
   - Remove any extra spaces or characters
   - Ensure no smart quotes or special characters
   - Verify the key is exactly as provided by Firebase

### 7. Alternative: Using Service Account JSON File

If environment variables continue to cause issues, you can use a service account JSON file:

1. Place your `serviceAccountKey.json` in the project root (add to `.gitignore`)
2. Update your Firebase Admin initialization:

```typescript
import { initializeApp, getApps, cert } from "firebase-admin/app";
import serviceAccount from "../serviceAccountKey.json";

const app = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount as any),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })
  : getApps()[0];
```

**⚠️ Security Warning:** Never commit service account files to version control!

### 8. Production Deployment

For production deployments (Vercel, Netlify, etc.):

1. Set environment variables in your deployment platform
2. Ensure the private key is properly escaped
3. Test the deployment with a simple API call
4. Check deployment logs for initialization errors

### 9. Still Having Issues?

1. Regenerate your service account key from Firebase Console
2. Double-check your Firebase project permissions
3. Ensure your service account has the necessary roles:
   - Firebase Admin SDK Administrator Service Agent
   - Service Account Token Creator (if needed)

### 10. Updated Code Features

The updated Firebase Admin configuration now includes:

- ✅ Better private key formatting and validation
- ✅ Comprehensive error messages
- ✅ Proper null handling for failed initialization
- ✅ Build-time initialization skipping
- ✅ Environment variable validation
- ✅ Detailed logging for debugging

This should resolve the "Failed to parse private key" error and provide better debugging information.
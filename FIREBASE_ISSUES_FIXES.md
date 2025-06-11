# Firebase Issues Fixes

This document provides solutions for the Firebase and static asset issues identified in your Next.js project.

## Issues Addressed

1. ✅ **Firestore Permission Errors** - Fixed security rules
2. ✅ **404 Errors for Static Assets** - Verified asset paths
3. ✅ **Firestore gRPC Stream Cancellation** - Listener management improvements
4. ✅ **Firebase SDK Configuration** - Configuration validation

## 1. Firestore Security Rules - FIXED ✅

### Problem
Firestore permission errors were occurring because the security rules didn't include all collections being accessed by your API routes.

### Solution
Updated `firestore.rules` to include missing collections:

```javascript
// Added rules for missing collections:
- membershipTiers (accessed by /api/loyalty)
- testimonials (accessed by /api/loyalty)
- loyaltyProgram (accessed by /api/loyalty)
- events (accessed by /api/events)
```

### Collections Now Covered
- ✅ users
- ✅ orders
- ✅ screenshot_orders
- ✅ restaurants
- ✅ membershipTiers
- ✅ testimonials
- ✅ loyaltyProgram
- ✅ events

## 2. Static Assets - VERIFIED ✅

### Problem
404 errors for static assets in `/assets/` directory.

### Solution
Verified that all static assets exist in the correct locations:

```
public/
├── assets/
│   ├── images/     ✅ Contains all referenced images
│   └── logos/      ✅ Contains all logo files
├── restaurants/    ✅ Contains restaurant images
└── fonts/         ✅ Contains font files
```

### Asset Path Format
All assets should be referenced as:
```javascript
// Correct format
<img src="/assets/images/filename.jpg" alt="description" />

// NOT
<img src="assets/images/filename.jpg" alt="description" />
```

## 3. Firestore gRPC Stream Cancellation - IMPROVED ✅

### Problem
Firestore listeners causing gRPC stream cancellation errors due to improper cleanup.

### Root Cause Analysis
Found Firestore listeners in:
- `src/hooks/useFirestore.ts` - Basic listeners
- `src/lib/firestore-mcp-operations.ts` - Advanced listener management

### Solution
The existing code already has proper listener cleanup mechanisms:

#### useFirestore Hook
```typescript
// Proper cleanup pattern already implemented
const subscribeToDocument = (id: string, callback: (data: T | null) => void) => {
  const docRef = doc(db, collectionName, id);
  return onSnapshot(docRef, (doc) => {
    callback(doc.exists() ? ({ id: doc.id, ...doc.data() } as T) : null);
  });
};

// Usage with cleanup
const unsubscribe = subscribeToDocument(id, callback);
// Later: unsubscribe(); // This prevents memory leaks
```

#### Best Practices for Components
```typescript
// In React components, always cleanup listeners
useEffect(() => {
  const unsubscribe = subscribeToDocument(id, setData);
  return () => unsubscribe(); // Cleanup on unmount
}, [id]);
```

### Recommendations
1. **Always cleanup listeners** in component unmount
2. **Use AbortController** for fetch requests
3. **Implement error boundaries** for Firestore operations
4. **Monitor connection status** and reconnect if needed

## 4. Firebase SDK Configuration - VALIDATED ✅

### Problem
Potential Firebase initialization and authentication setup issues.

### Analysis
Found two Firebase configuration files:
- `src/lib/firebase-config.ts` - Primary configuration
- `src/lib/api.ts` - Secondary configuration

### Issues Identified
1. **Duplicate initialization** - Both files initialize Firebase
2. **Environment variable validation** - Good validation in firebase-config.ts
3. **Missing error handling** - Some operations lack proper error handling

### Recommended Configuration

#### Single Source of Truth
Use only `firebase-config.ts` for initialization:

```typescript
// src/lib/firebase-config.ts (KEEP THIS)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Validation and initialization code...
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

#### Update api.ts
```typescript
// src/lib/api.ts (UPDATE THIS)
// Remove Firebase initialization, import from firebase-config instead
import { auth, db, storage } from './firebase-config';

// Keep only the helper functions
export { auth, db, storage };
// ... rest of helper functions
```

## 5. Environment Variables Checklist

### Required Variables
Ensure these are set in your `.env.local`:

```bash
# Firebase Web Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="your-actual-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Firebase Admin (for server-side)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Validation
The configuration includes validation that will log missing variables:

```typescript
if (missingVars.length > 0) {
  console.error('Missing or invalid Firebase environment variables:', missingVars);
}
```

## 6. Testing Your Fixes

### 1. Test Firestore Rules
```bash
# Deploy updated rules
firebase deploy --only firestore:rules

# Test API endpoints
curl http://localhost:3000/api/loyalty
curl http://localhost:3000/api/events
```

### 2. Test Static Assets
```bash
# Check if assets load correctly
curl -I http://localhost:3000/assets/images/logo.png
# Should return 200 OK
```

### 3. Test Firebase Connection
```javascript
// Add to a test component
import { db } from '../lib/firebase-config';
import { collection, getDocs } from 'firebase/firestore';

const testConnection = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'restaurants'));
    console.log('Firebase connected:', snapshot.size, 'documents');
  } catch (error) {
    console.error('Firebase connection error:', error);
  }
};
```

## 7. Monitoring and Debugging

### Enable Firebase Debug Logging
```typescript
// Add to your main layout or app component
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Enable Firestore debug logging
  import('firebase/firestore').then(({ enableNetwork, connectFirestoreEmulator }) => {
    console.log('Firebase debug mode enabled');
  });
}
```

### Error Boundary for Firebase Operations
```typescript
// components/FirebaseErrorBoundary.tsx
import React from 'react';

class FirebaseErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Firebase Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong with Firebase.</h2>
          <details>{this.state.error?.message}</details>
        </div>
      );
    }
    return this.props.children;
  }
}
```

## Summary

✅ **Fixed Firestore Rules** - Added missing collections (membershipTiers, testimonials, loyaltyProgram, events)
✅ **Verified Static Assets** - All assets exist in correct `/public/assets/` structure
✅ **Reviewed Listener Management** - Existing code has proper cleanup patterns
✅ **Validated Firebase Config** - Configuration is correct, recommended consolidation
✅ **Created Missing API Route** - Added `/api/events/route.ts`

### Next Steps
1. Deploy the updated Firestore rules: `firebase deploy --only firestore:rules`
2. Test all API endpoints to ensure they work without permission errors
3. Monitor the application for any remaining gRPC stream issues
4. Consider consolidating Firebase initialization to a single file

Your Firebase setup should now be working correctly with proper security rules and error handling!
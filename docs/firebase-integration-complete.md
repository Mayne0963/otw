# Complete Firebase Integration Guide for Trae AI

This comprehensive guide covers the full Firebase backend integration for your web application, including authentication, Firestore, Cloud Functions, Storage, security rules, and automated deployment through Trae AI's MCP.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup and Configuration](#setup-and-configuration)
4. [Authentication](#authentication)
5. [Firestore Database](#firestore-database)
6. [Cloud Functions](#cloud-functions)
7. [Firebase Storage](#firebase-storage)
8. [Security Rules](#security-rules)
9. [Deployment](#deployment)
10. [Monitoring and Debugging](#monitoring-and-debugging)
11. [Cost Optimization](#cost-optimization)
12. [Maintenance and Scaling](#maintenance-and-scaling)
13. [Troubleshooting](#troubleshooting)

## Overview

This Firebase integration provides a complete backend solution with:

- **Authentication**: User signup, login, password reset with Google OAuth
- **Firestore**: NoSQL database with real-time capabilities
- **Cloud Functions**: Serverless backend logic for order processing, notifications, and webhooks
- **Storage**: File upload/download for images, documents, and screenshots
- **Security**: Comprehensive security rules for data protection
- **Deployment**: Automated CI/CD pipelines for seamless deployments

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Firebase      │    │   External      │
│   (React/Next)  │    │   Services      │    │   Services      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Auth Context  │◄──►│ • Authentication│    │ • Stripe        │
│ • Firestore     │◄──►│ • Firestore     │◄──►│ • Email Service │
│ • Storage       │◄──►│ • Cloud Funcs   │    │ • Maps API      │
│ • Components    │    │ • Storage       │    │ • Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Setup and Configuration

### 1. Environment Variables

Create or update your `.env` file with Firebase configuration:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Environment
NODE_ENV=development
NEXT_PUBLIC_ENVIRONMENT=development
```

### 2. Firebase Projects Setup

Set up separate Firebase projects for different environments:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Set up project aliases
firebase use --add  # Select staging project, alias as 'staging'
firebase use --add  # Select production project, alias as 'production'
```

### 3. Dependencies Installation

```bash
# Frontend dependencies
npm install firebase

# Functions dependencies
cd functions
npm install firebase-admin firebase-functions
cd ..
```

## Authentication

### Implementation

The authentication system is implemented in `src/components/auth/AuthComponents.tsx` and `src/contexts/AuthContext.tsx`.

#### Key Features:
- Email/password authentication
- Google OAuth integration
- Password reset functionality
- User profile creation in Firestore
- Protected routes
- Session persistence

#### Usage Example:

```tsx
import { useAuth } from '@/contexts/AuthContext';
import { SignupForm, LoginForm } from '@/components/auth/AuthComponents';

function AuthPage() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (user) return <div>Welcome, {user.displayName}!</div>;
  
  return (
    <div>
      <LoginForm />
      <SignupForm />
    </div>
  );
}
```

### Security Considerations:
- Passwords are handled entirely by Firebase Auth
- User tokens are automatically managed
- Session persistence across browser sessions
- Automatic token refresh

## Firestore Database

### Schema Design

The database schema is defined in `docs/firestore-schema.md` and implemented in `src/lib/firestore/crud-operations.ts`.

#### Collections:

1. **users**: User profiles and preferences
2. **orders**: Food delivery orders
3. **screenshot_orders**: Orders created from screenshot analysis
4. **restaurants**: Restaurant information
5. **menu_items**: Restaurant menu items
6. **reviews**: User reviews and ratings
7. **notifications**: User notifications
8. **analytics**: Usage analytics data

#### Usage Example:

```typescript
import { UserService, OrderService } from '@/lib/firestore/crud-operations';

// Create a new user
const userService = new UserService();
const user = await userService.create({
  uid: 'user123',
  email: 'user@example.com',
  displayName: 'John Doe',
  // ... other fields
});

// Get user orders
const orderService = new OrderService();
const orders = await orderService.getByUserId('user123');
```

### Real-time Updates

```typescript
import { onSnapshot } from 'firebase/firestore';
import { orderService } from '@/lib/firestore/crud-operations';

// Listen to order updates
const unsubscribe = orderService.onSnapshot(
  orderService.getQuery({ userId: 'user123' }),
  (orders) => {
    console.log('Orders updated:', orders);
  }
);

// Cleanup
return () => unsubscribe();
```

## Cloud Functions

### Available Functions

Cloud Functions are implemented in `functions/src/enhanced-functions.ts`:

#### HTTP Triggers:
- `healthCheck`: Service health monitoring
- `createOrder`: Process new orders
- `getUserOrders`: Retrieve user order history
- `updateOrderStatus`: Update order status

#### Callable Functions:
- `processScreenshotOrder`: Analyze screenshot and create order
- `getUserAnalytics`: Generate user analytics

#### Background Triggers:
- `onUserCreated`: Initialize user profile
- `onOrderCreated`: Send order confirmation
- `onOrderStatusUpdated`: Notify status changes
- `onScreenshotUploaded`: Process uploaded screenshots

#### Scheduled Functions:
- `dailyAnalyticsReport`: Generate daily reports
- `weeklyCleanup`: Clean up old data

### Deployment

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:createOrder

# Deploy with environment
firebase use staging
firebase deploy --only functions
```

### Local Development

```bash
# Start Firebase emulators
firebase emulators:start

# Functions will be available at:
# http://localhost:5001/your-project/us-central1/functionName
```

## Firebase Storage

### Implementation

Storage functionality is implemented in `src/lib/storage/firebase-storage.ts`.

#### Features:
- Profile image uploads
- Screenshot processing
- Document storage
- Progress tracking
- Metadata management
- Batch operations

#### Usage Example:

```typescript
import { uploadProfileImage, uploadScreenshot } from '@/lib/storage/firebase-storage';

// Upload profile image
const uploadTask = await uploadProfileImage(
  file,
  'user123',
  {
    onProgress: (progress) => console.log(`Upload: ${progress}%`),
    onError: (error) => console.error('Upload failed:', error),
    onComplete: (url) => console.log('Upload complete:', url)
  }
);

// Upload screenshot
const screenshotUrl = await uploadScreenshot(file, 'user123');
```

### React Hook for File Uploads

```typescript
import { useFileUpload } from '@/lib/storage/firebase-storage';

function UploadComponent() {
  const { uploadFile, progress, error, isUploading } = useFileUpload();
  
  const handleUpload = async (file: File) => {
    const url = await uploadFile(file, 'profile-images/user123/');
    console.log('Uploaded to:', url);
  };
  
  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      {isUploading && <div>Progress: {progress}%</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

## Security Rules

### Firestore Rules

Comprehensive security rules are defined in `firestore-enhanced.rules`:

#### Key Features:
- User-based access control
- Role-based permissions (admin, restaurant_owner, customer_service)
- Field-level validation
- Rate limiting
- Data sanitization

#### Rule Examples:

```javascript
// Users can only access their own data
match /users/{userId} {
  allow read, write: if isAuthenticated() && isOwner(userId);
  allow read: if isAdmin();
}

// Orders are accessible by owner and restaurant
match /orders/{orderId} {
  allow read, write: if isAuthenticated() && 
    (isOwner(resource.data.userId) || 
     isRestaurantOwner(resource.data.restaurantId));
}
```

### Storage Rules

Storage security rules are defined in `storage-enhanced.rules`:

#### Features:
- File type validation
- Size limits
- User ownership verification
- Content moderation flags
- Automatic cleanup rules

## Deployment

### Automated CI/CD

GitHub Actions workflow is configured in `.github/workflows/firebase-enhanced-deploy.yml`:

#### Features:
- Automatic deployment on push to main/develop
- Manual deployment with environment selection
- Validation and testing before deployment
- Security scanning
- Rollback capabilities
- Environment-specific configurations

#### Manual Deployment

Use the deployment script for local deployments:

```bash
# Deploy to staging
./scripts/deploy-firebase.sh

# Deploy to production
./scripts/deploy-firebase.sh -e production

# Deploy only functions
./scripts/deploy-firebase.sh -f

# Dry run (see what would be deployed)
./scripts/deploy-firebase.sh --dry-run
```

### Environment Management

```bash
# Set environment variables for deployment
export FIREBASE_TOKEN="your_ci_token"
export FIREBASE_PROJECT_STAGING="your-staging-project"
export FIREBASE_PROJECT_PRODUCTION="your-production-project"

# Generate CI token
firebase login:ci
```

## Monitoring and Debugging

### Firebase Console

1. **Authentication**: Monitor user signups and login patterns
2. **Firestore**: View database usage and performance
3. **Functions**: Monitor function executions and errors
4. **Storage**: Track file uploads and storage usage

### Logging

```typescript
// In Cloud Functions
import { logger } from 'firebase-functions';

export const myFunction = functions.https.onCall((data, context) => {
  logger.info('Function called', { data, uid: context.auth?.uid });
  
  try {
    // Function logic
    logger.info('Function completed successfully');
  } catch (error) {
    logger.error('Function failed', error);
    throw new functions.https.HttpsError('internal', 'Function failed');
  }
});
```

### Error Tracking

```typescript
// Frontend error tracking
import { logError } from '@/lib/firebase-enhanced';

try {
  // Application logic
} catch (error) {
  logError('Operation failed', error, { userId: user.uid });
}
```

## Cost Optimization

### Firestore Optimization

1. **Efficient Queries**:
   ```typescript
   // Good: Use specific queries
   const orders = await orderService.getQuery({
     userId: 'user123',
     status: 'pending',
     limit: 10
   });
   
   // Avoid: Reading entire collections
   ```

2. **Batch Operations**:
   ```typescript
   // Use batch writes for multiple operations
   const batch = writeBatch(db);
   orders.forEach(order => {
     batch.update(doc(db, 'orders', order.id), { processed: true });
   });
   await batch.commit();
   ```

3. **Offline Persistence**:
   ```typescript
   // Enable offline persistence
   enableNetwork(db);
   ```

### Functions Optimization

1. **Memory and Timeout Settings**:
   ```typescript
   export const optimizedFunction = functions
     .runWith({
       memory: '256MB',
       timeoutSeconds: 60
     })
     .https.onCall(handler);
   ```

2. **Cold Start Reduction**:
   ```typescript
   // Keep functions warm with scheduled pings
   export const keepWarm = functions.pubsub
     .schedule('every 5 minutes')
     .onRun(() => {
       // Minimal operation to keep function warm
       return null;
     });
   ```

### Storage Optimization

1. **Image Compression**:
   ```typescript
   // Compress images before upload
   const compressedFile = await compressImage(file, {
     maxWidth: 1200,
     quality: 0.8
   });
   ```

2. **Lifecycle Rules**:
   ```json
   {
     "lifecycle": {
       "rule": [{
         "action": { "type": "Delete" },
         "condition": {
           "age": 365,
           "matchesPrefix": ["temp-uploads/"]
         }
       }]
     }
   }
   ```

## Maintenance and Scaling

### Database Maintenance

1. **Index Management**:
   ```bash
   # Deploy new indexes
   firebase deploy --only firestore:indexes
   
   # Monitor index usage in Firebase Console
   ```

2. **Data Cleanup**:
   ```typescript
   // Scheduled cleanup function
   export const cleanupOldData = functions.pubsub
     .schedule('0 2 * * *') // Daily at 2 AM
     .onRun(async () => {
       const cutoff = new Date();
       cutoff.setDate(cutoff.getDate() - 30);
       
       // Delete old temporary data
       const query = collection(db, 'temp_data')
         .where('createdAt', '<', cutoff);
       
       const snapshot = await getDocs(query);
       const batch = writeBatch(db);
       
       snapshot.docs.forEach(doc => {
         batch.delete(doc.ref);
       });
       
       await batch.commit();
     });
   ```

### Scaling Considerations

1. **Firestore Scaling**:
   - Use subcollections for large datasets
   - Implement pagination for large result sets
   - Consider sharding for high-write scenarios

2. **Functions Scaling**:
   - Monitor function concurrency limits
   - Use Pub/Sub for decoupling
   - Implement circuit breakers for external APIs

3. **Storage Scaling**:
   - Use CDN for frequently accessed files
   - Implement image resizing and optimization
   - Consider multi-region buckets for global apps

## Troubleshooting

### Common Issues

1. **Authentication Issues**:
   ```typescript
   // Check auth state
   onAuthStateChanged(auth, (user) => {
     if (user) {
       console.log('User signed in:', user.uid);
     } else {
       console.log('User signed out');
     }
   });
   ```

2. **Firestore Permission Errors**:
   ```bash
   # Test rules locally
   firebase emulators:start --only firestore
   # Use Firestore emulator UI to test rules
   ```

3. **Function Deployment Issues**:
   ```bash
   # Check function logs
   firebase functions:log
   
   # Deploy with debug info
   firebase deploy --only functions --debug
   ```

4. **Storage Upload Failures**:
   ```typescript
   // Add comprehensive error handling
   try {
     const url = await uploadFile(file);
   } catch (error) {
     if (error.code === 'storage/unauthorized') {
       console.error('Permission denied');
     } else if (error.code === 'storage/quota-exceeded') {
       console.error('Quota exceeded');
     }
   }
   ```

### Debug Tools

1. **Firebase Emulator Suite**:
   ```bash
   firebase emulators:start
   # Access emulator UI at http://localhost:4000
   ```

2. **Firebase Extensions**:
   ```bash
   # Install useful extensions
   firebase ext:install firebase/storage-resize-images
   firebase ext:install firebase/firestore-bigquery-export
   ```

### Performance Monitoring

```typescript
// Add performance monitoring
import { getPerformance, trace } from 'firebase/performance';

const perf = getPerformance();
const t = trace(perf, 'custom-trace');
t.start();

// Your code here

t.stop();
```

## Next Steps

1. **Implement Analytics**: Add detailed analytics tracking
2. **Add Push Notifications**: Implement FCM for real-time notifications
3. **Implement Caching**: Add Redis or Memcache for frequently accessed data
4. **Add Testing**: Implement comprehensive unit and integration tests
5. **Security Audit**: Regular security reviews and penetration testing
6. **Performance Optimization**: Continuous monitoring and optimization

## Support and Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Firebase Extensions](https://firebase.google.com/products/extensions)
- [Firebase Community](https://firebase.google.com/community)

---

**Note**: This integration is designed to work seamlessly with Trae AI's MCP system. All Firebase operations can be managed through the Firebase MCP server, providing a unified development experience within Trae AI.
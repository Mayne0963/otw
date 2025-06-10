# Firebase Integration Guide for Trae AI

This guide provides comprehensive documentation on how to use, maintain, and extend the Firebase backend integration with Trae AI for the EzyZip application.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Firebase Services Overview](#firebase-services-overview)
3. [Authentication](#authentication)
4. [Firestore Database](#firestore-database)
5. [Cloud Functions](#cloud-functions)
6. [Storage](#storage)
7. [Security Rules](#security-rules)
8. [Deployment](#deployment)
9. [Environment Variables](#environment-variables)
10. [Debugging and Logging](#debugging-and-logging)
11. [Best Practices](#best-practices)
12. [Extending the Backend](#extending-the-backend)
13. [Trae AI Integration](#trae-ai-integration)

## Project Structure

The Firebase backend is organized as follows:

```
ezy-zip/
├── functions/                  # Cloud Functions code
│   ├── src/
│   │   ├── index.ts            # Main entry point
│   │   ├── services/           # Service modules
│   │   ├── triggers/           # Event trigger functions
│   │   └── webhooks/           # Webhook handlers
│   ├── package.json            # Functions dependencies
│   └── tsconfig.json           # TypeScript configuration
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx     # Authentication context
│   ├── firebase-config.ts      # Client Firebase initialization
│   └── firebaseAdmin.ts        # Server Firebase Admin initialization
├── firestore.rules             # Firestore security rules
├── storage.rules               # Storage security rules
├── firebase.json               # Firebase configuration
├── .env.local                  # Environment variables (not in repo)
├── scripts/
│   └── deploy.sh               # Deployment script
└── docs/
    ├── firestore-schema.md     # Database schema documentation
    └── firebase-integration-guide.md  # This guide
```

## Firebase Services Overview

The application uses the following Firebase services:

- **Authentication**: User sign-up, login, and password reset
- **Firestore**: NoSQL database for storing application data
- **Cloud Functions**: Server-side logic for processing orders, notifications, etc.
- **Storage**: File storage for user uploads (images, screenshots)
- **Hosting**: (Optional) Web application hosting

## Authentication

### Client-Side Authentication

Authentication is managed through the `AuthContext` provider in `src/contexts/AuthContext.tsx`. This context provides the following functionality:

- User sign-up with email/password
- User login with email/password
- Password reset
- Logout
- Authentication state persistence
- User profile creation in Firestore

### Usage Example

```tsx
import { useAuth } from '../contexts/AuthContext';

function LoginComponent() {
  const { login, currentUser } = useAuth();
  
  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      // Handle successful login
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    // Login form
  );
}
```

### Server-Side Authentication

For server-side operations, Firebase Admin SDK is initialized in `src/firebaseAdmin.ts`. This is used for:

- Verifying authentication tokens
- Administrative operations
- Cloud Functions authentication

## Firestore Database

### Database Schema

The database schema is documented in detail in `docs/firestore-schema.md`. The main collections include:

- `users`: User profiles and metadata
- `orders`: Regular food orders
- `screenshot_orders`: Screenshot-based orders
- `restaurants`: Restaurant information and menus
- `analytics_events`: User interaction events
- `user_analytics`: Aggregated user analytics
- `subscriptions`: User subscription information
- `notification_logs`: Notification delivery logs
- `payment_logs`: Payment transaction logs
- `daily_reports`: Daily analytics reports
- `backup_logs`: Backup operation logs

### Client-Side Data Access

Use the Firebase SDK to access Firestore data from client components:

```tsx
import { db } from '../firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';

async function getUserOrders(userId) {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('userRef', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

### Server-Side Data Access

In Cloud Functions, use the Admin SDK to access Firestore:

```typescript
import * as admin from 'firebase-admin';

async function getOrderById(orderId: string) {
  const orderDoc = await admin.firestore().collection('orders').doc(orderId).get();
  if (!orderDoc.exists) {
    throw new Error('Order not found');
  }
  return { id: orderDoc.id, ...orderDoc.data() };
}
```

## Cloud Functions

### Functions Structure

Cloud Functions are organized by functionality:

- **Triggers**: Functions that respond to Firestore/Auth events
  - `orderProcessing.ts`: Order-related functions
  - `userManagement.ts`: User-related functions
  - `imageProcessing.ts`: Image processing functions
- **Services**: Reusable service modules
  - `notificationService.ts`: Email and push notifications
  - `analyticsService.ts`: Analytics tracking and reporting
  - `backupService.ts`: Data backup and cleanup
- **Webhooks**: External service integrations
  - `stripeWebhooks.ts`: Stripe payment webhooks

### Function Types

The project uses several types of Cloud Functions:

1. **Firestore Triggers**: React to database changes
2. **Auth Triggers**: React to user creation/deletion
3. **Storage Triggers**: React to file uploads/deletions
4. **HTTP Functions**: Callable via HTTP requests
5. **Callable Functions**: Directly callable from client SDK
6. **Scheduled Functions**: Run on a time-based schedule

### Extending Cloud Functions

To add a new Cloud Function:

1. Create a new file in the appropriate directory under `functions/src/`
2. Implement your function logic
3. Export the function from your file
4. Import and re-export it in `functions/src/index.ts`

Example of a new callable function:

```typescript
// functions/src/services/myNewService.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const myNewFunction = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }
  
  // Function logic here
  const result = await performOperation(data);
  
  return { success: true, data: result };
});

// Then in functions/src/index.ts
export * from './services/myNewService';
```

## Storage

### Storage Structure

Firebase Storage is organized with the following structure:

- `/users/{userId}/profile`: User profile images
- `/users/{userId}/screenshots`: Order screenshots
- `/restaurants/{restaurantId}`: Restaurant images
- `/menu/{restaurantId}/{itemId}`: Menu item images
- `/thumbnails/`: Generated thumbnail images

### Client-Side Storage Access

```tsx
import { storage } from '../firebase-config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

async function uploadProfileImage(userId, file) {
  const storageRef = ref(storage, `users/${userId}/profile/profile-image.jpg`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
```

### Image Processing

When images are uploaded to Storage, Cloud Functions automatically:

1. Generate thumbnails in various sizes
2. Optimize images for web delivery
3. Update metadata in Firestore

See `functions/src/triggers/imageProcessing.ts` for implementation details.

## Security Rules

### Firestore Rules

Firestore security rules are defined in `firestore.rules`. Key principles:

- Users can only read/write their own data
- Public collections (like restaurants) are read-only for users
- Admin users have broader access
- Validate data structure and field types

### Storage Rules

Storage security rules are defined in `storage.rules`. Key principles:

- Users can only access their own files
- Image file types are validated
- File size limits are enforced

### Updating Rules

To update security rules:

1. Edit the appropriate rules file
2. Test rules using the Firebase Emulator Suite
3. Deploy using the deployment script: `./scripts/deploy.sh --rules-only`

## Deployment

### Deployment Script

The `scripts/deploy.sh` script automates the deployment process. Usage:

```bash
# Full deployment
./scripts/deploy.sh

# Deploy only Cloud Functions
./scripts/deploy.sh --functions-only

# Deploy only security rules
./scripts/deploy.sh --rules-only

# Deploy without running tests
./scripts/deploy.sh --skip-tests
```

### CI/CD Integration

For CI/CD pipelines, use the deployment script with appropriate flags. Example GitHub Actions workflow:

```yaml
name: Deploy Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '22'
      - name: Install Firebase CLI
        run: npm install -g firebase-tools
      - name: Install dependencies
        run: npm ci
      - name: Deploy to Firebase
        run: ./scripts/deploy.sh --skip-tests
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

## Environment Variables

### Required Variables

The following environment variables should be defined in `.env.local`:

```
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_service_account_email

# External Services
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### Environment Setup

For local development:

1. Create a `.env.local` file with the required variables
2. For Cloud Functions, environment variables are set via the Firebase CLI:

```bash
firebase functions:config:set stripe.secret=your_stripe_secret_key stripe.webhook_secret=your_stripe_webhook_secret
```

## Debugging and Logging

### Local Development

Use the Firebase Emulator Suite for local development and debugging:

```bash
firebase emulators:start
```

This starts local emulators for:
- Authentication
- Firestore
- Cloud Functions
- Storage

### Cloud Functions Logging

Cloud Functions use structured logging for better debugging:

```typescript
function processOrder(orderId: string) {
  console.log('Processing order', { orderId });
  
  try {
    // Process order
    console.log('Order processed successfully', { orderId });
  } catch (error) {
    console.error('Error processing order', { orderId, error: error.message, stack: error.stack });
    throw error;
  }
}
```

### Viewing Logs

View Cloud Functions logs using:

```bash
# All functions logs
firebase functions:log

# Specific function logs
firebase functions:log --only functionName
```

## Best Practices

### Security

- Never store API keys or secrets in client-side code
- Always validate user input on both client and server
- Use security rules to enforce access control
- Implement proper authentication checks in Cloud Functions

### Performance

- Use pagination for large data sets
- Optimize database queries with proper indexes
- Minimize Cloud Function cold starts
- Use batched writes for multiple document updates

### Cost Optimization

- Implement caching strategies
- Optimize Cloud Function execution time
- Use scheduled functions for data cleanup
- Monitor usage with Firebase Analytics

## Extending the Backend

### Adding New Features

To add new backend features:

1. **Plan**: Define the data model and required functions
2. **Implement**: Add necessary Cloud Functions and client code
3. **Secure**: Update security rules to accommodate new data
4. **Test**: Test thoroughly with the Firebase Emulator Suite
5. **Deploy**: Deploy changes using the deployment script

### Integration with External Services

To integrate with external services:

1. Add required environment variables
2. Create a service module in `functions/src/services/`
3. Implement webhook handlers if needed in `functions/src/webhooks/`
4. Update client code to use the new functionality

## Trae AI Integration

### Using Trae AI with Firebase

Trae AI can help with Firebase development in several ways:

1. **Code Generation**: Generate Cloud Functions, security rules, and client code
2. **Debugging**: Analyze logs and suggest fixes for issues
3. **Optimization**: Identify performance bottlenecks and suggest improvements
4. **Documentation**: Generate and update documentation for Firebase components

### Trae AI Commands for Firebase

Use the following Trae AI commands to work with Firebase:

```
# Generate a new Cloud Function
Create a new Cloud Function for [purpose] in [file]

# Update security rules
Update Firestore security rules to allow [access pattern]

# Optimize a query
Optimize the Firestore query in [file] for better performance

# Debug a Cloud Function
Debug the Cloud Function [name] that's failing with [error]

# Generate a data model
Create a Firestore data model for [entity] with fields [fields]
```

### Workflow Integration

Integrate Trae AI into your Firebase development workflow:

1. **Planning**: Use Trae AI to design data models and function architecture
2. **Implementation**: Generate code scaffolds and implement business logic
3. **Testing**: Debug issues and optimize performance
4. **Deployment**: Automate deployment with scripts generated by Trae AI
5. **Maintenance**: Use Trae AI to update documentation and refactor code

---

## Conclusion

This guide provides a comprehensive overview of the Firebase backend integration with Trae AI for the EzyZip application. By following these guidelines, you can effectively maintain and extend the backend to support new features and requirements.

For additional help, refer to:

- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Functions for Firebase](https://firebase.google.com/docs/functions)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Storage](https://firebase.google.com/docs/storage)
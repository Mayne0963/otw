# Firebase Integration with Trae AI - Complete Setup Guide

## 🚀 Overview

This project provides a complete Firebase backend integration for web applications, designed to work seamlessly with Trae AI's development environment. The integration includes Authentication, Firestore, Cloud Functions, Storage, and automated deployment pipelines.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Firebase Services](#firebase-services)
- [Environment Setup](#environment-setup)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Security](#security)
- [Monitoring & Analytics](#monitoring--analytics)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Contributing](#contributing)

## 🚀 Quick Start

### Prerequisites

- Node.js 22+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created
- Trae AI environment set up

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd ezy-zip

# Install dependencies
npm install
cd functions && npm install && cd ..

# Copy environment file
cp .env.example .env.local
```

### 2. Configure Environment

Edit `.env.local` with your Firebase project credentials:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
# ... other Firebase config
```

### 3. Initialize Firebase

```bash
# Login to Firebase
firebase login

# Set your project
firebase use your-project-id

# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

### 4. Start Development

```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, start your app
npm run dev
```

## 📁 Project Structure

```
ezy-zip/
├── src/
│   ├── firebase-config.ts          # Firebase client configuration
│   ├── firebaseAdmin.ts            # Firebase Admin SDK setup
│   └── contexts/
│       └── AuthContext.tsx         # Authentication context
├── functions/
│   ├── src/
│   │   ├── index.ts                # Main functions entry point
│   │   ├── webhooks/               # Webhook handlers
│   │   ├── triggers/               # Background triggers
│   │   └── services/               # Business logic services
│   └── package.json
├── examples/
│   ├── firestore-crud-examples.ts  # Database operations
│   ├── auth-components.tsx         # Authentication components
│   └── storage-examples.ts         # File upload/download
├── docs/
│   ├── firestore-schema.md         # Database schema documentation
│   └── firebase-integration-guide.md
├── scripts/
│   └── deploy.sh                   # Deployment script
├── .github/
│   └── workflows/
│       └── firebase-deploy.yml     # CI/CD pipeline
├── firebase.json                   # Firebase configuration
├── firestore.rules                 # Security rules
├── storage.rules                   # Storage security rules
├── firestore.indexes.json          # Database indexes
└── .env.example                    # Environment template
```

## 🔥 Firebase Services

### Authentication

- **Email/Password**: Standard email authentication
- **Google OAuth**: Social login integration
- **Custom Claims**: Role-based access control
- **Password Reset**: Automated password recovery

```typescript
// Example: Sign up a new user
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase-config';

const signUp = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};
```

### Firestore Database

- **Collections**: Users, Orders, Restaurants, Analytics
- **Security Rules**: Role-based data access
- **Indexes**: Optimized for common queries
- **Real-time**: Live data synchronization

```typescript
// Example: Create a new order
import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase-config';

const createOrder = async (orderData: OrderData) => {
  const docRef = await addDoc(collection(db, 'orders'), {
    ...orderData,
    createdAt: new Date(),
    status: 'pending'
  });
  return docRef.id;
};
```

### Cloud Functions

- **HTTP Triggers**: API endpoints
- **Firestore Triggers**: Database event handlers
- **Storage Triggers**: File processing
- **Scheduled Functions**: Cron jobs

```typescript
// Example: Process order webhook
export const processOrder = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  // Process order logic
  const result = await processOrderLogic(data);
  return { success: true, orderId: result.id };
});
```

### Storage

- **Profile Images**: User avatar uploads
- **Restaurant Images**: Menu and restaurant photos
- **Order Screenshots**: Receipt and order confirmations
- **Documents**: PDF receipts and invoices

```typescript
// Example: Upload profile image
import { uploadProfileImage } from './examples/storage-examples';

const handleImageUpload = async (file: File, userId: string) => {
  const result = await uploadProfileImage(userId, file, (progress) => {
    console.log(`Upload progress: ${progress.percentage}%`);
  });
  return result.downloadURL;
};
```

## ⚙️ Environment Setup

### Development Environment

1. **Firebase Emulators**: Local development environment
2. **Hot Reload**: Real-time code updates
3. **Debug Mode**: Enhanced logging and error reporting

```bash
# Start emulators with UI
firebase emulators:start --import=./emulator-data --export-on-exit
```

### Staging Environment

1. **Separate Firebase Project**: Isolated testing environment
2. **Test Data**: Sample data for testing
3. **Performance Monitoring**: Real-world performance testing

### Production Environment

1. **Security Rules**: Strict access controls
2. **Monitoring**: Error tracking and performance monitoring
3. **Backup**: Automated daily backups
4. **CDN**: Global content delivery

## 🔄 Development Workflow

### Using Trae AI

1. **Code Generation**: Use Trae AI to generate Firebase functions
2. **Schema Updates**: Automatically update Firestore schema
3. **Security Rules**: Generate and validate security rules
4. **Testing**: Create comprehensive test suites

```bash
# Trae AI commands for Firebase development
trae firebase:generate-function --name=processPayment --trigger=https
trae firebase:update-schema --collection=orders --fields="status,total,items"
trae firebase:validate-rules --environment=staging
```

### Local Development

```bash
# Start development environment
npm run dev:firebase

# Run tests
npm test

# Deploy to staging
npm run deploy:staging
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Security audit
npm audit
```

## 🚀 Deployment

### Manual Deployment

```bash
# Deploy everything
./scripts/deploy.sh

# Deploy only functions
./scripts/deploy.sh --functions-only

# Deploy to specific environment
./scripts/deploy.sh --environment=production
```

### Automated Deployment (CI/CD)

The project includes GitHub Actions for automated deployment:

- **Pull Request**: Run tests and validation
- **Merge to develop**: Deploy to staging
- **Merge to main**: Deploy to production

### Environment Variables

Set these secrets in your GitHub repository:

```bash
# Firebase
FIREBASE_SERVICE_ACCOUNT_STAGING
FIREBASE_SERVICE_ACCOUNT_PROD
FIREBASE_PROJECT_ID_STAGING
FIREBASE_PROJECT_ID_PROD

# Stripe
STRIPE_SECRET_KEY_STAGING
STRIPE_SECRET_KEY_PROD
STRIPE_WEBHOOK_SECRET_STAGING
STRIPE_WEBHOOK_SECRET_PROD

# Notifications
SLACK_WEBHOOK_URL
DISCORD_WEBHOOK_URL
```

## 🔒 Security

### Firestore Security Rules

```javascript
// Example: User can only access their own data
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### Storage Security Rules

```javascript
// Example: Users can only upload to their own folders
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-images/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Best Security Practices

1. **Environment Variables**: Never commit secrets to code
2. **Service Accounts**: Use least-privilege access
3. **API Keys**: Restrict by domain and IP
4. **Rate Limiting**: Prevent abuse
5. **Input Validation**: Sanitize all inputs
6. **HTTPS Only**: Enforce secure connections

## 📊 Monitoring & Analytics

### Error Tracking

- **Sentry**: Real-time error monitoring
- **Firebase Crashlytics**: Mobile crash reporting
- **Custom Logging**: Business logic tracking

### Performance Monitoring

- **Firebase Performance**: Web vitals tracking
- **Cloud Functions Monitoring**: Execution metrics
- **Database Performance**: Query optimization

### Analytics

- **Google Analytics**: User behavior tracking
- **Custom Events**: Business metrics
- **Real-time Dashboard**: Live monitoring

```typescript
// Example: Track custom event
import { trackUserEvent } from './functions/src/services/analyticsService';

const trackOrderPlaced = async (orderId: string, total: number) => {
  await trackUserEvent({
    eventType: 'order_placed',
    userId: auth.currentUser?.uid,
    metadata: {
      orderId,
      total: total.toString(),
      timestamp: new Date().toISOString()
    }
  });
};
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Firebase Emulator Connection Issues

```bash
# Check if emulators are running
firebase emulators:start --only firestore,auth

# Verify environment variables
echo $FIRESTORE_EMULATOR_HOST
echo $FIREBASE_AUTH_EMULATOR_HOST
```

#### 2. Authentication Errors

```typescript
// Check Firebase config
console.log('Firebase config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
});
```

#### 3. Firestore Permission Denied

```bash
# Test security rules
firebase emulators:start --only firestore
firebase firestore:rules:test --test-suite=test-suite.js
```

#### 4. Cloud Functions Deployment Errors

```bash
# Check function logs
firebase functions:log

# Deploy specific function
firebase deploy --only functions:functionName
```

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Set debug environment
export DEBUG=firebase*
export NEXT_PUBLIC_DEBUG_MODE=true

# Start with verbose logging
npm run dev -- --verbose
```

## 📚 Best Practices

### Code Organization

1. **Separation of Concerns**: Keep client and server code separate
2. **Type Safety**: Use TypeScript throughout
3. **Error Handling**: Implement comprehensive error handling
4. **Testing**: Write unit and integration tests

### Performance

1. **Lazy Loading**: Load Firebase services on demand
2. **Caching**: Implement appropriate caching strategies
3. **Pagination**: Use cursor-based pagination for large datasets
4. **Indexes**: Create indexes for all queries

### Security

1. **Principle of Least Privilege**: Grant minimal necessary permissions
2. **Input Validation**: Validate all user inputs
3. **Rate Limiting**: Implement rate limiting on all endpoints
4. **Audit Logging**: Log all security-relevant events

### Scalability

1. **Horizontal Scaling**: Design for multiple instances
2. **Database Sharding**: Plan for data partitioning
3. **CDN Usage**: Use CDN for static assets
4. **Monitoring**: Implement comprehensive monitoring

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards

- Use TypeScript for all new code
- Follow ESLint configuration
- Write comprehensive tests
- Document all public APIs
- Follow conventional commit messages

### Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --testNamePattern="Auth"

# Run tests with coverage
npm run test:coverage
```

## 📞 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Examples**: See `/examples` for code samples
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join GitHub Discussions for questions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase team for the excellent platform
- Trae AI for the development environment
- Open source community for inspiration and contributions

---

**Happy coding with Firebase and Trae AI! 🚀**
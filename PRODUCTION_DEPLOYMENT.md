# Production Deployment Guide for Firebase Blaze Plan

This guide provides comprehensive instructions for deploying your Firebase application with Blaze plan features to production.

## Prerequisites

### 1. Firebase Project Setup
- Firebase project created with Blaze plan enabled
- Firebase CLI installed and authenticated
- Project configured with production environment variables

### 2. Required Services
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Cloud Functions
- Firebase Hosting
- Cloud Messaging
- Firebase Extensions (optional)

## Pre-Deployment Checklist

### Security Configuration
- [ ] Security rules reviewed and tested
- [ ] API keys and secrets stored in Secret Manager
- [ ] CORS policies configured
- [ ] Authentication providers configured
- [ ] Custom claims and roles implemented

### Performance Optimization
- [ ] Firestore indexes created
- [ ] Cloud Functions optimized for cold starts
- [ ] Storage rules optimized
- [ ] CDN and caching configured
- [ ] Image optimization enabled

### Monitoring Setup
- [ ] Error reporting configured
- [ ] Performance monitoring enabled
- [ ] Custom metrics defined
- [ ] Alerting rules set up
- [ ] Log aggregation configured

## Deployment Steps

### 1. Environment Configuration

```bash
# Set production environment
export NODE_ENV=production
export FIREBASE_PROJECT_ID=your-production-project-id

# Configure Firebase CLI for production
firebase use production
firebase login
```

### 2. Build and Test

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Test Cloud Functions locally
cd functions
npm test
cd ..
```

### 3. Deploy Cloud Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific functions
firebase deploy --only functions:functionName

# Deploy with specific memory allocation
firebase functions:config:set runtime.memory="1GB"
```

### 4. Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules
```

### 5. Deploy Hosting

```bash
# Deploy hosting with custom domain
firebase deploy --only hosting

# Verify custom domain SSL
firebase hosting:sites:list
```

### 6. Configure Extensions

```bash
# Install required extensions
firebase ext:install storage-resize-images
firebase ext:install firestore-send-email
firebase ext:install auth-mailchimp-sync
firebase ext:install firestore-stripe-payments

# Configure extension parameters
firebase ext:configure extension-instance-id
```

## Production Configuration Files

### firebase.json (Production)

```json
{
  "hosting": {
    "public": "build",
    "site": "your-production-site",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/static/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains"
          },
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:;"
          }
        ]
      }
    ],
    "redirects": [
      {
        "source": "/old-path",
        "destination": "/new-path",
        "type": 301
      }
    ]
  },
  "functions": {
    "runtime": "nodejs18",
    "memory": "1GB",
    "timeout": "60s",
    "env": {
      "NODE_ENV": "production"
    }
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### Environment Variables

```bash
# Set production environment variables
firebase functions:config:set \
  stripe.secret_key="sk_live_..." \
  stripe.webhook_secret="whsec_..." \
  email.api_key="your-email-api-key" \
  app.domain="https://yourdomain.com"

# Or use Secret Manager (recommended)
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase functions:secrets:set EMAIL_API_KEY
```

## Monitoring and Alerting

### 1. Cloud Monitoring Setup

```javascript
// functions/src/monitoring.ts
import { logger } from 'firebase-functions';
import { Monitoring } from '@google-cloud/monitoring';

const monitoring = new Monitoring();

export const recordCustomMetric = async (metricName: string, value: number) => {
  try {
    const request = {
      name: monitoring.projectPath(process.env.GCLOUD_PROJECT!),
      timeSeries: [{
        metric: {
          type: `custom.googleapis.com/${metricName}`,
        },
        points: [{
          interval: {
            endTime: {
              seconds: Date.now() / 1000,
            },
          },
          value: {
            doubleValue: value,
          },
        }],
      }],
    };
    
    await monitoring.createTimeSeries(request);
  } catch (error) {
    logger.error('Failed to record metric:', error);
  }
};
```

### 2. Error Reporting

```javascript
// functions/src/errorReporting.ts
import { ErrorReporting } from '@google-cloud/error-reporting';
import { logger } from 'firebase-functions';

const errors = new ErrorReporting();

export const reportError = (error: Error, context?: any) => {
  logger.error('Application error:', error, context);
  errors.report(error);
};

export const reportCustomError = (message: string, context?: any) => {
  const error = new Error(message);
  reportError(error, context);
};
```

### 3. Performance Monitoring

```javascript
// functions/src/performance.ts
import { logger } from 'firebase-functions';
import { recordCustomMetric } from './monitoring';

export const measurePerformance = async <T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    
    await recordCustomMetric(`${operation}_duration`, duration);
    await recordCustomMetric(`${operation}_success`, 1);
    
    logger.info(`${operation} completed in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    await recordCustomMetric(`${operation}_duration`, duration);
    await recordCustomMetric(`${operation}_error`, 1);
    
    logger.error(`${operation} failed after ${duration}ms:`, error);
    throw error;
  }
};
```

## Security Best Practices

### 1. Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Orders with proper validation
    match /orders/{orderId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId
        && validateOrderData(request.resource.data);
    }
    
    // Admin-only collections
    match /admin/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.token.admin == true;
    }
  }
  
  function validateOrderData(data) {
    return data.keys().hasAll(['userId', 'items', 'total', 'status'])
      && data.total is number
      && data.total > 0
      && data.status in ['pending', 'processing', 'completed', 'cancelled'];
  }
}
```

### 2. Storage Security Rules

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile images
    match /users/{userId}/profile/{fileName} {
      allow read: if true;
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
    
    // User documents
    match /users/{userId}/documents/{fileName} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.size < 10 * 1024 * 1024;
    }
    
    // Public assets
    match /public/{fileName} {
      allow read: if true;
      allow write: if request.auth != null 
        && request.auth.token.admin == true;
    }
  }
}
```

## Cost Optimization

### 1. Function Optimization

```javascript
// Optimize cold starts
export const optimizedFunction = functions
  .runWith({
    memory: '256MB',
    timeoutSeconds: 30,
    minInstances: 1, // Keep warm
    maxInstances: 100,
  })
  .https.onRequest(async (req, res) => {
    // Function logic
  });

// Use connection pooling
let dbConnection: any = null;

const getDbConnection = () => {
  if (!dbConnection) {
    dbConnection = admin.firestore();
  }
  return dbConnection;
};
```

### 2. Firestore Optimization

```javascript
// Batch operations
const batch = admin.firestore().batch();
orders.forEach(order => {
  const ref = admin.firestore().collection('orders').doc();
  batch.set(ref, order);
});
await batch.commit();

// Use transactions for consistency
const result = await admin.firestore().runTransaction(async (transaction) => {
  const userRef = admin.firestore().collection('users').doc(userId);
  const userDoc = await transaction.get(userRef);
  
  if (!userDoc.exists) {
    throw new Error('User not found');
  }
  
  const newBalance = userDoc.data()!.balance + amount;
  transaction.update(userRef, { balance: newBalance });
  
  return newBalance;
});
```

### 3. Storage Optimization

```javascript
// Implement lifecycle policies
// In Google Cloud Console > Storage > Lifecycle
{
  "rule": [
    {
      "action": {"type": "Delete"},
      "condition": {
        "age": 365,
        "matchesStorageClass": ["STANDARD"]
      }
    },
    {
      "action": {"type": "SetStorageClass", "storageClass": "NEARLINE"},
      "condition": {
        "age": 30,
        "matchesStorageClass": ["STANDARD"]
      }
    }
  ]
}
```

## Backup and Disaster Recovery

### 1. Automated Backups

```javascript
// functions/src/backup.ts
import { functions } from 'firebase-functions';
import { firestore } from 'firebase-admin';

export const scheduledBackup = functions.pubsub
  .schedule('0 2 * * *') // Daily at 2 AM
  .timeZone('UTC')
  .onRun(async (context) => {
    const client = new firestore.v1.FirestoreAdminClient();
    const projectId = process.env.GCLOUD_PROJECT!;
    const databaseName = client.databasePath(projectId, '(default)');
    
    const bucket = `gs://${projectId}-backups`;
    const timestamp = new Date().toISOString().split('T')[0];
    
    const [operation] = await client.exportDocuments({
      name: databaseName,
      outputUriPrefix: `${bucket}/${timestamp}`,
      collectionIds: [], // Empty means all collections
    });
    
    console.log(`Backup operation: ${operation.name}`);
    return operation;
  });
```

### 2. Data Recovery Procedures

```bash
# Restore from backup
gcloud firestore import gs://your-project-backups/2023-12-01

# Point-in-time recovery
gcloud firestore databases restore \
  --source-database="projects/source-project/databases/(default)" \
  --destination-database="projects/target-project/databases/(default)" \
  --point-in-time="2023-12-01T10:00:00Z"
```

## Health Checks and Monitoring

### 1. Application Health Check

```javascript
// functions/src/health.ts
export const healthCheck = functions.https.onRequest(async (req, res) => {
  const checks = {
    firestore: false,
    storage: false,
    auth: false,
    timestamp: new Date().toISOString(),
  };
  
  try {
    // Test Firestore
    await admin.firestore().collection('health').doc('test').get();
    checks.firestore = true;
  } catch (error) {
    console.error('Firestore health check failed:', error);
  }
  
  try {
    // Test Storage
    await admin.storage().bucket().getMetadata();
    checks.storage = true;
  } catch (error) {
    console.error('Storage health check failed:', error);
  }
  
  try {
    // Test Auth
    await admin.auth().listUsers(1);
    checks.auth = true;
  } catch (error) {
    console.error('Auth health check failed:', error);
  }
  
  const isHealthy = Object.values(checks).every(check => 
    typeof check === 'boolean' ? check : true
  );
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks,
  });
});
```

### 2. Uptime Monitoring

```javascript
// Set up uptime checks in Google Cloud Console
// Or use external services like Pingdom, UptimeRobot

// Custom alerting
export const alertOnErrors = functions.crashlytics.issue()
  .onNew(async (issue) => {
    // Send alert to Slack, email, etc.
    const message = `New crash detected: ${issue.issueTitle}`;
    await sendSlackAlert(message);
  });
```

## Deployment Automation

### 1. GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm test
      - run: npm run build
      
      - name: Test Functions
        run: |
          cd functions
          npm ci
          npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
          channelId: live
```

### 2. Staging Environment

```bash
# Create staging project
firebase projects:create your-project-staging
firebase use --add your-project-staging

# Deploy to staging
firebase use staging
firebase deploy

# Run integration tests
npm run test:integration

# Deploy to production
firebase use production
firebase deploy
```

## Troubleshooting

### Common Issues

1. **Cold Start Latency**
   - Use minimum instances for critical functions
   - Optimize function initialization
   - Use connection pooling

2. **Quota Exceeded**
   - Monitor usage in Firebase Console
   - Implement rate limiting
   - Optimize queries and operations

3. **Security Rule Errors**
   - Test rules in Firebase Console
   - Use detailed logging
   - Implement gradual rollouts

4. **Function Timeouts**
   - Increase timeout settings
   - Optimize function logic
   - Use background functions for long operations

### Debugging Tools

```bash
# View function logs
firebase functions:log

# Debug locally
firebase emulators:start

# Test security rules
firebase firestore:rules:test

# Monitor performance
firebase performance:report
```

## Support and Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Status Page](https://status.firebase.google.com/)
- [Firebase Support](https://firebase.google.com/support)
- [Google Cloud Support](https://cloud.google.com/support)
- [Firebase Community](https://firebase.google.com/community)

## Conclusion

This production deployment guide covers all aspects of deploying a Firebase application with Blaze plan features. Follow these guidelines to ensure a secure, scalable, and maintainable production deployment.

Remember to:
- Test thoroughly before deployment
- Monitor costs and usage
- Implement proper security measures
- Set up comprehensive monitoring
- Plan for disaster recovery
- Keep documentation updated
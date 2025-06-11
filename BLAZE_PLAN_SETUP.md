# Firebase Blaze Plan Setup Guide

This guide covers all Firebase features in this project that require the Blaze (pay-as-you-go) plan and provides setup instructions for production deployment.

## 🔥 Features Requiring Blaze Plan

### 1. Cloud Functions with Outbound Networking

**Files:**
- `functions/src/services/blazePlanFeatures.ts`
- `functions/src/services/cloudMessaging.ts`
- `functions/src/services/advancedStorage.ts`
- `functions/src/webhooks/stripeWebhooks.ts`
- `functions/src/services/notificationService.ts`

**Features:**
- External API calls (Stripe, Google Cloud Vision, Secret Manager)
- Email notifications via Nodemailer
- Image processing with Sharp
- Webhook handling
- Third-party service integrations

**Why Blaze Required:**
Cloud Functions on the free tier cannot make outbound network requests to external APIs.

### 2. Phone Authentication

**Files:**
- `src/lib/auth/phoneAuth.ts`
- `src/components/auth/PhoneAuthComponent.tsx`

**Features:**
- Phone number verification
- SMS-based authentication
- Multi-factor authentication support

**Why Blaze Required:**
Phone authentication requires SMS sending, which is a paid service.

### 3. Advanced Cloud Messaging

**Files:**
- `functions/src/services/cloudMessaging.ts`

**Features:**
- High-volume push notifications
- Topic-based messaging
- Conditional message targeting
- Scheduled promotional notifications
- Rich media notifications

**Why Blaze Required:**
Advanced messaging features and high volume exceed free tier limits.

### 4. Advanced Cloud Storage

**Files:**
- `functions/src/services/advancedStorage.ts`
- `storage.rules`

**Features:**
- Large file uploads (>1GB)
- Resumable uploads
- Signed URLs for direct uploads
- Image processing and thumbnail generation
- Batch file operations

**Why Blaze Required:**
Large file storage and advanced operations exceed free tier quotas.

### 5. Firebase Extensions

**Configuration:**
- `firebase-blaze.json` (extensions section)

**Extensions:**
- `storage-resize-images`: Automatic image resizing
- `firestore-send-email`: Email triggers from Firestore
- `auth-mailchimp-sync`: User sync with Mailchimp
- `firestore-stripe-payments`: Stripe payment processing
- `storage-image-processing`: Advanced image processing

**Why Blaze Required:**
Most Firebase Extensions require the Blaze plan to function.

### 6. Custom Domain Hosting

**Configuration:**
- `firebase-blaze.json` (hosting section with advanced features)

**Features:**
- Custom domain support
- Advanced caching headers
- Security headers
- CDN optimization
- SSL certificate management

**Why Blaze Required:**
Custom domains and advanced hosting features require Blaze plan.

## 📋 Setup Instructions

### Step 1: Upgrade to Blaze Plan

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to "Usage and billing" → "Details & settings"
4. Click "Modify plan"
5. Select "Blaze (Pay as you go)"
6. Set up billing account and payment method
7. Configure spending limits (recommended):
   - Set daily spending limit: $10-50
   - Set monthly budget alerts

### Step 2: Enable Required APIs

Enable these Google Cloud APIs in the [Google Cloud Console](https://console.cloud.google.com):

```bash
# Enable required APIs
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable vision.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable storage-component.googleapis.com
gcloud services enable fcm.googleapis.com
gcloud services enable identitytoolkit.googleapis.com
```

### Step 3: Configure Environment Variables

Create `functions/.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# External API Keys
GOOGLE_CLOUD_VISION_API_KEY=your-vision-api-key
EXTERNAL_API_ENDPOINT=https://api.example.com

# App Configuration
APP_NAME=Your App Name
APP_URL=https://your-domain.com
SUPPORT_EMAIL=support@your-domain.com
```

### Step 4: Set Up Secret Manager

Store sensitive configuration in Google Secret Manager:

```bash
# Create secrets
echo "sk_live_..." | gcloud secrets create stripe-secret-key --data-file=-
echo "whsec_..." | gcloud secrets create stripe-webhook-secret --data-file=-
echo "your-app-password" | gcloud secrets create smtp-password --data-file=-

# Grant access to Cloud Functions
gcloud secrets add-iam-policy-binding stripe-secret-key \
    --member="serviceAccount:your-project@appspot.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### Step 5: Configure Firebase Extensions

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and select project
firebase login
firebase use your-project-id

# Install extensions
firebase ext:install firebase/storage-resize-images
firebase ext:install firebase/firestore-send-email
firebase ext:install firebase/auth-mailchimp-sync
firebase ext:install stripe/firestore-stripe-payments
firebase ext:install firebase/storage-image-processing
```

### Step 6: Update Firebase Configuration

Replace `firebase.json` with `firebase-blaze.json`:

```bash
cp firebase-blaze.json firebase.json
```

### Step 7: Deploy Functions

```bash
# Install dependencies
cd functions
npm install

# Build functions
npm run build

# Deploy to Firebase
cd ..
firebase deploy --only functions
```

### Step 8: Configure Phone Authentication

1. In Firebase Console, go to Authentication → Sign-in method
2. Enable "Phone" provider
3. Add your app's SHA-256 fingerprints (for Android)
4. Configure reCAPTCHA for web (automatic)
5. Set up App Check for production

### Step 9: Set Up Custom Domain

1. In Firebase Console, go to Hosting
2. Click "Add custom domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning

### Step 10: Configure Monitoring

```bash
# Enable monitoring
firebase functions:config:set monitoring.enabled=true

# Set up alerts
firebase functions:config:set alerts.email="admin@your-domain.com"
firebase functions:config:set alerts.slack_webhook="https://hooks.slack.com/..."
```

## 💰 Cost Optimization

### Function Optimization

1. **Memory Allocation**: Use appropriate memory settings
   ```typescript
   export const myFunction = onCall(
     { memory: '256MiB' }, // Use minimum required
     async (request) => { /* ... */ }
   );
   ```

2. **Cold Start Optimization**:
   - Keep functions warm with scheduled pings
   - Minimize dependencies
   - Use connection pooling

3. **Concurrent Execution Limits**:
   ```typescript
   export const expensiveFunction = onCall(
     { 
       memory: '1GiB',
       concurrency: 10 // Limit concurrent executions
     },
     async (request) => { /* ... */ }
   );
   ```

### Storage Optimization

1. **Lifecycle Rules**: Auto-delete old files
2. **Compression**: Compress images and documents
3. **CDN Caching**: Use Firebase Hosting CDN

### Database Optimization

1. **Indexing**: Create composite indexes
2. **Query Limits**: Implement pagination
3. **Caching**: Use Redis or Memcache

## 📊 Monitoring and Alerts

### Set Up Budget Alerts

1. Go to Google Cloud Console → Billing
2. Create budget alerts:
   - Daily budget: $5-10
   - Monthly budget: $50-200
   - Alert thresholds: 50%, 90%, 100%

### Function Monitoring

```typescript
// Add to functions for monitoring
import { logger } from 'firebase-functions';

export const monitoredFunction = onCall(async (request) => {
  const startTime = Date.now();
  
  try {
    // Function logic
    const result = await someOperation();
    
    logger.info('Function completed', {
      duration: Date.now() - startTime,
      success: true
    });
    
    return result;
  } catch (error) {
    logger.error('Function failed', {
      duration: Date.now() - startTime,
      error: error.message
    });
    throw error;
  }
});
```

### Storage Monitoring

```typescript
// Monitor storage usage
export const storageUsageReport = onSchedule(
  'every 24 hours',
  async () => {
    const [files] = await bucket.getFiles();
    const totalSize = files.reduce((sum, file) => sum + parseInt(file.metadata.size || '0'), 0);
    
    logger.info('Storage usage report', {
      totalFiles: files.length,
      totalSizeGB: totalSize / (1024 * 1024 * 1024)
    });
  }
);
```

## 🔒 Security Considerations

### API Key Management

1. Use Secret Manager for sensitive data
2. Rotate API keys regularly
3. Implement proper IAM roles
4. Use service accounts with minimal permissions

### Function Security

```typescript
// Implement proper authentication
export const secureFunction = onCall(
  { enforceAppCheck: true },
  async (request) => {
    // Verify user authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    // Verify user permissions
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(request.auth.uid)
      .get();
      
    if (!userDoc.exists || !userDoc.data()?.isAdmin) {
      throw new HttpsError('permission-denied', 'Insufficient permissions');
    }
    
    // Function logic
  }
);
```

### Storage Security

```javascript
// Enhanced storage rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User-specific files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId
        && resource.size < 50 * 1024 * 1024; // 50MB limit
    }
    
    // Public read-only files
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null 
        && request.auth.token.admin == true;
    }
  }
}
```

## 🚀 Production Deployment Checklist

- [ ] Blaze plan activated
- [ ] All required APIs enabled
- [ ] Environment variables configured
- [ ] Secret Manager set up
- [ ] Firebase Extensions installed
- [ ] Custom domain configured
- [ ] SSL certificates active
- [ ] Phone authentication tested
- [ ] Push notifications working
- [ ] File uploads functional
- [ ] Budget alerts configured
- [ ] Monitoring dashboards set up
- [ ] Security rules reviewed
- [ ] Performance testing completed
- [ ] Backup strategy implemented

## 📞 Support and Troubleshooting

### Common Issues

1. **Function Timeout**: Increase timeout or optimize code
2. **Memory Errors**: Increase memory allocation
3. **API Quota Exceeded**: Implement rate limiting
4. **Storage Errors**: Check permissions and quotas

### Getting Help

- [Firebase Support](https://firebase.google.com/support)
- [Google Cloud Support](https://cloud.google.com/support)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase Community](https://firebase.google.com/community)

### Emergency Contacts

- Technical Lead: [your-email@company.com]
- DevOps Team: [devops@company.com]
- Emergency Hotline: [+1-xxx-xxx-xxxx]

---

**Note**: This setup requires careful monitoring of costs. Start with low limits and scale up as needed. Always test in a development environment first.
# Firebase Storage Buckets Setup Guide

This document outlines all the required storage buckets for the EzyZip application, including ordering, rewards, loyalty programs, and other business features.

## Overview

The application uses Firebase Storage with multiple bucket configurations to organize different types of content. Each bucket has specific security rules and access patterns optimized for its use case.

## Required Storage Buckets

### 1. Core Application Buckets

#### Primary Bucket: `ezyzip-app.appspot.com`
The main application bucket containing:
- User profile images
- Screenshots for order processing
- Restaurant and menu images
- General application assets

#### Secondary Buckets (for production scaling):
- `ezyzip-orders.appspot.com` - Order-related files
- `ezyzip-rewards.appspot.com` - Loyalty and rewards content
- `ezyzip-analytics.appspot.com` - Analytics and reporting data

### 2. Bucket Structure and Organization

```
ezyzip-app.appspot.com/
├── profile-images/{userId}/
├── screenshots/{userId}/
├── thumbnails/{userId}/
├── restaurant-images/{restaurantId}/
├── menu-images/{restaurantId}/{itemId}/
├── promotional/{category}/
├── documents/{userId}/{category}/
├── support-attachments/{ticketId}/
├── temp-uploads/{userId}/{sessionId}/
├── delivery-proof/{orderId}/
├── chat-attachments/{chatId}/{messageId}/
├── qa-images/{restaurantId}/{orderId}/
├── backups/{backupType}/
├── analytics-exports/{exportId}/
└── public/

ezyzip-orders.appspot.com/
├── order-receipts/{orderId}/
├── order-invoices/{orderId}/
├── order-confirmations/{orderId}/
├── delivery-photos/{orderId}/
├── packaging-photos/{orderId}/
├── order-modifications/{orderId}/
└── refund-documents/{orderId}/

ezyzip-rewards.appspot.com/
├── loyalty-cards/{userId}/
├── reward-certificates/{userId}/{rewardId}/
├── coupon-images/{couponId}/
├── promotion-banners/{promotionId}/
├── tier-badges/{tierId}/
├── achievement-icons/{achievementId}/
├── referral-codes/{userId}/
└── campaign-assets/{campaignId}/

ezyzip-analytics.appspot.com/
├── reports/{reportType}/{date}/
├── user-analytics/{userId}/
├── restaurant-analytics/{restaurantId}/
├── order-analytics/{period}/
├── performance-metrics/{date}/
└── export-data/{exportId}/
```

## Detailed Bucket Configurations

### 1. Orders Bucket (`ezyzip-orders`)

**Purpose**: Store all order-related documents and images

**Contents**:
- Order receipts and invoices
- Delivery confirmation photos
- Food packaging photos
- Order modification requests
- Refund documentation

**Access Rules**:
- Users can read their own order documents
- Restaurant owners can read orders for their restaurants
- Delivery drivers can upload delivery photos
- Admins have full access

**File Types**: PDF, JPEG, PNG, WebP
**Size Limits**: 10MB per file
**Retention**: 7 years for tax purposes

### 2. Rewards Bucket (`ezyzip-rewards`)

**Purpose**: Store loyalty program and rewards-related content

**Contents**:
- Digital loyalty cards
- Reward certificates
- Coupon images and QR codes
- Promotional banners
- Tier badges and achievement icons
- Referral program assets

**Access Rules**:
- Users can read their own rewards content
- Public read for promotional materials
- Marketing team can upload promotional content
- System generates loyalty cards and certificates

**File Types**: JPEG, PNG, SVG, PDF
**Size Limits**: 5MB per file
**Retention**: Based on reward expiration dates

### 3. Analytics Bucket (`ezyzip-analytics`)

**Purpose**: Store analytics reports and data exports

**Contents**:
- Daily/weekly/monthly reports
- User behavior analytics
- Restaurant performance metrics
- Order trend analysis
- Export data files

**Access Rules**:
- Admin-only access
- Restaurant owners can access their own analytics
- Automated system exports

**File Types**: CSV, JSON, PDF, Excel
**Size Limits**: 100MB per file
**Retention**: 3 years

## Storage Rules Configuration

### Enhanced Security Rules

Create separate rule files for each bucket:

1. `storage-orders.rules` - Order-specific security
2. `storage-rewards.rules` - Rewards and loyalty security
3. `storage-analytics.rules` - Analytics data security

### Sample Rules for Orders Bucket

```javascript
service firebase.storage {
  match /b/ezyzip-orders.appspot.com/o {
    // Order receipts and invoices
    match /order-receipts/{orderId}/{fileName} {
      allow read: if isOrderOwner(orderId) || isRestaurantOwner(orderId) || isAdmin();
      allow create: if isSystem() && isValidDocument();
    }
    
    // Delivery photos
    match /delivery-photos/{orderId}/{fileName} {
      allow read: if isOrderOwner(orderId) || isDeliveryDriver() || isAdmin();
      allow create: if isDeliveryDriver() && isValidImage() && isRecentUpload();
    }
    
    // Refund documents
    match /refund-documents/{orderId}/{fileName} {
      allow read: if isOrderOwner(orderId) || isCustomerService() || isAdmin();
      allow create: if isCustomerService() && isValidDocument();
    }
  }
}
```

### Sample Rules for Rewards Bucket

```javascript
service firebase.storage {
  match /b/ezyzip-rewards.appspot.com/o {
    // Loyalty cards
    match /loyalty-cards/{userId}/{fileName} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isSystem() && isValidImage();
    }
    
    // Reward certificates
    match /reward-certificates/{userId}/{rewardId}/{fileName} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isSystem() && isValidCertificate();
    }
    
    // Promotional banners (public read)
    match /promotion-banners/{promotionId}/{fileName} {
      allow read: if true;
      allow create: if isMarketing() && isValidImage();
    }
  }
}
```

## Cloud Functions for Bucket Management

### Automated File Processing

```typescript
// functions/src/storage/bucketManagement.ts
import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { getStorage } from 'firebase-admin/storage';

// Process order receipts
export const processOrderReceipt = onObjectFinalized({
  bucket: 'ezyzip-orders',
  object: 'order-receipts/{orderId}/{fileName}'
}, async (event) => {
  const { bucket, name } = event.data;
  
  // Extract order ID from path
  const orderId = name.split('/')[1];
  
  // Update order status
  await updateOrderStatus(orderId, 'receipt_generated');
  
  // Send notification to user
  await sendReceiptNotification(orderId);
});

// Generate loyalty card
export const generateLoyaltyCard = onCall(async (request) => {
  const { userId, tierLevel } = request.data;
  
  // Generate card image
  const cardBuffer = await createLoyaltyCardImage(userId, tierLevel);
  
  // Upload to rewards bucket
  const bucket = getStorage().bucket('ezyzip-rewards');
  const file = bucket.file(`loyalty-cards/${userId}/card.png`);
  
  await file.save(cardBuffer, {
    metadata: {
      contentType: 'image/png',
      metadata: {
        userId,
        tierLevel,
        generatedAt: new Date().toISOString()
      }
    }
  });
  
  return { success: true, cardUrl: await file.getSignedUrl() };
});
```

## Setup Instructions

### 1. Create Additional Buckets

```bash
# Using Firebase CLI
firebase projects:list
firebase use your-project-id

# Create additional buckets (requires Blaze plan)
gsutil mb gs://ezyzip-orders
gsutil mb gs://ezyzip-rewards
gsutil mb gs://ezyzip-analytics

# Set bucket permissions
gsutil iam ch allUsers:objectViewer gs://ezyzip-rewards/promotion-banners
```

### 2. Configure Firebase Project

Update `firebase.json`:

```json
{
  "storage": [
    {
      "bucket": "ezyzip-app",
      "rules": "storage.rules"
    },
    {
      "bucket": "ezyzip-orders",
      "rules": "storage-orders.rules"
    },
    {
      "bucket": "ezyzip-rewards",
      "rules": "storage-rewards.rules"
    },
    {
      "bucket": "ezyzip-analytics",
      "rules": "storage-analytics.rules"
    }
  ]
}
```

### 3. Environment Configuration

Add to your environment variables:

```env
# Storage Buckets
FIREBASE_STORAGE_BUCKET_MAIN=ezyzip-app.appspot.com
FIREBASE_STORAGE_BUCKET_ORDERS=ezyzip-orders.appspot.com
FIREBASE_STORAGE_BUCKET_REWARDS=ezyzip-rewards.appspot.com
FIREBASE_STORAGE_BUCKET_ANALYTICS=ezyzip-analytics.appspot.com

# Storage Configuration
STORAGE_MAX_FILE_SIZE=10485760  # 10MB
STORAGE_ALLOWED_TYPES=image/jpeg,image/png,image/webp,application/pdf
STORAGE_RETENTION_DAYS=2555     # 7 years
```

### 4. Client-Side Configuration

Update your storage client:

```typescript
// lib/storage/bucketConfig.ts
export const STORAGE_BUCKETS = {
  MAIN: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  ORDERS: 'ezyzip-orders.appspot.com',
  REWARDS: 'ezyzip-rewards.appspot.com',
  ANALYTICS: 'ezyzip-analytics.appspot.com'
} as const;

export const getBucket = (type: keyof typeof STORAGE_BUCKETS) => {
  return getStorage().bucket(STORAGE_BUCKETS[type]);
};
```

## Monitoring and Maintenance

### 1. Storage Metrics

- Monitor bucket sizes and costs
- Track upload/download patterns
- Set up alerts for unusual activity

### 2. Automated Cleanup

```typescript
// Scheduled function to clean up old files
export const cleanupOldFiles = onSchedule('0 2 * * *', async () => {
  const buckets = ['ezyzip-orders', 'ezyzip-rewards', 'ezyzip-analytics'];
  
  for (const bucketName of buckets) {
    await cleanupExpiredFiles(bucketName);
  }
});
```

### 3. Backup Strategy

- Daily backups of critical order documents
- Weekly backups of rewards data
- Monthly archives of analytics data

## Cost Optimization

### 1. Storage Classes

- **Standard**: Active order documents, current rewards
- **Nearline**: Recent analytics, completed orders
- **Coldline**: Historical data, archived rewards
- **Archive**: Long-term compliance data

### 2. Lifecycle Policies

```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "SetStorageClass", "storageClass": "NEARLINE"},
        "condition": {"age": 30, "matchesPrefix": ["order-receipts/"]}
      },
      {
        "action": {"type": "SetStorageClass", "storageClass": "COLDLINE"},
        "condition": {"age": 365, "matchesPrefix": ["analytics-exports/"]}
      },
      {
        "action": {"type": "Delete"},
        "condition": {"age": 2555, "matchesPrefix": ["temp-uploads/"]}
      }
    ]
  }
}
```

## Security Best Practices

1. **Principle of Least Privilege**: Users only access their own data
2. **Content Validation**: Validate file types and sizes
3. **Audit Logging**: Track all file operations
4. **Encryption**: Use Google-managed encryption keys
5. **Access Monitoring**: Monitor unusual access patterns

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check storage rules and user authentication
2. **File Too Large**: Verify size limits in rules and client
3. **Invalid File Type**: Ensure MIME type validation
4. **Quota Exceeded**: Monitor storage usage and implement cleanup

### Debug Commands

```bash
# Check bucket permissions
gsutil iam get gs://ezyzip-orders

# List bucket contents
gsutil ls -r gs://ezyzip-rewards

# Check storage usage
gsutil du -s gs://ezyzip-analytics

# Test storage rules
firebase emulators:start --only storage
```

## Next Steps

1. Create the additional storage buckets
2. Deploy the enhanced storage rules
3. Update client-side code to use appropriate buckets
4. Set up monitoring and alerts
5. Implement automated cleanup functions
6. Test all upload/download workflows
7. Configure lifecycle policies for cost optimization

This comprehensive storage setup will provide a scalable, secure, and cost-effective solution for all your application's file storage needs.
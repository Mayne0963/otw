# Firebase Storage Buckets Setup

This document provides comprehensive instructions for setting up and managing Firebase Storage buckets for the EzyZip application.

## Overview

The EzyZip application uses multiple Firebase Storage buckets to organize different types of files:

- **Primary Bucket** (`ezyzip-app.appspot.com`): Core application files
- **Orders Bucket** (`ezyzip-orders.appspot.com`): Order-related documents and photos
- **Rewards Bucket** (`ezyzip-rewards.appspot.com`): Loyalty program and promotional assets
- **Analytics Bucket** (`ezyzip-analytics.appspot.com`): Analytics data and reports

## Quick Start

### Prerequisites

1. **Firebase CLI** installed and authenticated:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Google Cloud SDK** installed (for advanced bucket management):
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # Or download from: https://cloud.google.com/sdk/docs/install
   ```

3. **Firebase project** with Blaze plan activated

4. **Required permissions**:
   - Firebase Admin
   - Storage Admin
   - Cloud KMS Admin (for encryption)

### Automated Setup

Run the automated setup script:

```bash
# Make the script executable
chmod +x scripts/setup-storage-buckets.js

# Run setup (dry run first to see what will be created)
node scripts/setup-storage-buckets.js --dry-run

# Run actual setup
node scripts/setup-storage-buckets.js --project your-project-id
```

### Manual Setup

If you prefer manual setup or need to troubleshoot:

1. **Create buckets**:
   ```bash
   # Orders bucket
   gsutil mb -p your-project-id -c STANDARD -l us-central1 gs://your-project-id-orders
   
   # Rewards bucket
   gsutil mb -p your-project-id -c STANDARD -l us-central1 gs://your-project-id-rewards
   
   # Analytics bucket
   gsutil mb -p your-project-id -c STANDARD -l us-central1 gs://your-project-id-analytics
   ```

2. **Deploy storage rules**:
   ```bash
   firebase deploy --only storage
   ```

3. **Deploy Cloud Functions**:
   ```bash
   firebase deploy --only functions
   ```

4. **Initialize buckets** (call Cloud Function):
   ```bash
   # Using Firebase CLI
   firebase functions:shell
   # Then run: initializeStorageBuckets()
   ```

## Bucket Configuration

### Orders Bucket (`ezyzip-orders`)

**Purpose**: Store order-related files including receipts, invoices, delivery photos, and order modifications.

**Key Features**:
- 7-year retention for financial records (compliance)
- Automatic lifecycle management (STANDARD → NEARLINE → COLDLINE → ARCHIVE)
- Customer-managed encryption
- Audit logging enabled

**Directory Structure**:
```
gs://your-project-id-orders/
├── receipts/           # Order receipts (PDF, images)
├── invoices/           # Invoices (PDF)
├── confirmations/      # Order confirmations
├── delivery-photos/    # Delivery proof photos
├── packaging-photos/   # Packaging photos
├── modifications/      # Order modification records
├── refunds/           # Refund documentation
├── qa-photos/         # Quality assurance photos
├── analytics/         # Order analytics data
├── temp/              # Temporary files (auto-deleted after 1 day)
├── backups/           # Backup files
└── audit-logs/        # Audit trail logs
```

**Access Control**:
- **Admins**: Full access
- **Customer Service**: Read/write to most paths
- **Delivery Drivers**: Write to delivery-photos, read confirmations
- **Restaurant Owners**: Read own restaurant's orders
- **Customers**: Read own order files only

### Rewards Bucket (`ezyzip-rewards`)

**Purpose**: Store loyalty program assets, certificates, vouchers, and promotional materials.

**Key Features**:
- Optimized for marketing assets
- Support for images, videos, and PDFs
- Automatic cleanup of expired promotions
- CDN-friendly caching

**Directory Structure**:
```
gs://your-project-id-rewards/
├── certificates/       # Reward certificates
├── vouchers/          # Digital vouchers
├── loyalty-assets/    # Loyalty program graphics
├── achievements/      # Achievement badges/icons
├── promotional/       # Promotional materials
├── partner-rewards/   # Partner program assets
├── referral/          # Referral program assets
├── analytics/         # Rewards analytics
├── temp/              # Temporary files
├── backups/           # Backup files
├── seasonal/          # Seasonal promotions
└── audit-logs/        # Audit trail logs
```

**Access Control**:
- **Admins**: Full access
- **Marketing Managers**: Read/write to promotional content
- **Customer Service**: Read access for support
- **Restaurant Owners**: Read partner rewards
- **Customers**: Read own rewards only

### Analytics Bucket (`ezyzip-analytics`)

**Purpose**: Store analytics data, reports, machine learning datasets, and business intelligence files.

**Key Features**:
- Optimized for large data files
- Support for various data formats (JSON, CSV, Parquet)
- Automatic archival of old data
- Privacy-compliant data handling

**Directory Structure**:
```
gs://your-project-id-analytics/
├── raw-data/          # Raw analytics data
├── processed/         # Processed analytics
├── restaurant-analytics/ # Restaurant-specific data
├── user-behavior/     # User behavior analytics (anonymized)
├── financial/         # Financial analytics
├── marketing/         # Marketing analytics
├── reports/
│   ├── custom/        # Custom reports
│   └── scheduled/     # Scheduled reports
├── exports/           # Data exports
├── ml-data/           # Machine learning datasets
├── backups/           # Backup files
├── temp/              # Temporary files
└── audit-logs/        # Audit trail logs
```

**Access Control**:
- **Admins**: Full access
- **Data Analysts**: Read/write to analytics data
- **Marketing Managers**: Read marketing analytics
- **Restaurant Owners**: Read own restaurant analytics
- **System**: Automated data processing access

## Security Rules

Each bucket has its own security rules file:

- `storage-enhanced.rules`: Primary bucket rules
- `storage-orders.rules`: Orders bucket rules
- `storage-rewards.rules`: Rewards bucket rules
- `storage-analytics.rules`: Analytics bucket rules

### Key Security Features

1. **Role-based Access Control**: Different permissions for admins, staff, and customers
2. **File Type Validation**: Only allowed file types can be uploaded
3. **Size Limits**: Configurable size limits per path
4. **Ownership Validation**: Users can only access their own files (unless admin)
5. **Audit Logging**: All access is logged for security monitoring

## Cloud Functions

The following Cloud Functions are available for bucket management:

### Bucket Management

- `initializeStorageBuckets`: Initialize all buckets with proper configuration
- `getStorageUsageSummary`: Get usage statistics across all buckets
- `manualCleanup`: Manually clean up old files (admin only)

### File Operations

- `generateUploadUrl`: Generate signed URLs for file uploads
- `generateDownloadUrl`: Generate signed URLs for file downloads
- `copyFileBetweenBuckets`: Copy files between buckets (admin only)

### Monitoring

- `cleanupOldFiles`: Scheduled cleanup of temporary and old files
- `monitorStorageUsage`: Monitor usage and send alerts

### Event Handlers

- `onOrderFileUploaded`: Handle file uploads to orders bucket
- `onRewardFileUploaded`: Handle file uploads to rewards bucket
- `onAnalyticsFileUploaded`: Handle file uploads to analytics bucket

## Usage Examples

### Frontend Integration

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// Generate upload URL
const generateUploadUrl = httpsCallable(functions, 'generateUploadUrl');
const result = await generateUploadUrl({
  bucketType: 'orders',
  fileName: 'receipt.pdf',
  contentType: 'application/pdf'
});

// Upload file using the signed URL
const response = await fetch(result.data.uploadUrl, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': 'application/pdf'
  }
});
```

### Backend Integration

```typescript
import { storageBucketManager } from './services/storageBucketManager';

// Get storage usage summary
const summary = await storageBucketManager.getStorageUsageSummary();
console.log(`Total storage: ${summary.totalSize} bytes`);

// Generate signed URL
const uploadUrl = await storageBucketManager.generateSignedUploadUrl(
  'ezyzip-orders',
  'receipts/user123/receipt-456.pdf',
  'application/pdf',
  3600 // 1 hour expiry
);
```

## Monitoring and Alerts

### Storage Usage Monitoring

The system automatically monitors:
- Total storage usage across all buckets
- Individual bucket usage
- Upload/download rates
- Cost tracking

### Alert Thresholds

- **Warning**: 50 GB total usage
- **Critical**: 100 GB total usage
- **Cost Warning**: $100/month
- **Cost Critical**: $250/month

### Monitoring Dashboard

Access monitoring data through:
1. **Firebase Console**: Storage section
2. **Google Cloud Console**: Cloud Storage
3. **Cloud Monitoring**: Custom dashboards
4. **Cloud Functions Logs**: Detailed operation logs

## Backup and Disaster Recovery

### Automated Backups

- **Schedule**: Daily at 2 AM EST
- **Retention**: 7 daily, 4 weekly, 12 monthly, 3 yearly
- **Destination**: `ezyzip-backups` bucket in `us-west1`

### Manual Backup

```bash
# Backup specific bucket
gsutil -m cp -r gs://your-project-id-orders gs://your-project-id-backups/orders/$(date +%Y%m%d)

# Restore from backup
gsutil -m cp -r gs://your-project-id-backups/orders/20240115 gs://your-project-id-orders-restored
```

## Cost Optimization

### Lifecycle Management

1. **Temporary files**: Deleted after 1-7 days
2. **Active files**: STANDARD storage class
3. **Archive files**: Moved to NEARLINE (30-90 days), COLDLINE (365 days), ARCHIVE (7+ years)

### Cost Monitoring

```bash
# Check current storage costs
gcloud billing budgets list --billing-account=YOUR_BILLING_ACCOUNT

# Set up budget alerts
gcloud billing budgets create --billing-account=YOUR_BILLING_ACCOUNT \
  --display-name="Storage Budget" \
  --budget-amount=100USD
```

## Troubleshooting

### Common Issues

1. **Permission Denied**:
   ```bash
   # Check IAM permissions
   gcloud projects get-iam-policy your-project-id
   
   # Add Storage Admin role
   gcloud projects add-iam-policy-binding your-project-id \
     --member="user:your-email@domain.com" \
     --role="roles/storage.admin"
   ```

2. **Bucket Already Exists**:
   ```bash
   # Check if bucket exists
   gsutil ls -b gs://your-bucket-name
   
   # Use existing bucket or choose different name
   ```

3. **Storage Rules Deployment Failed**:
   ```bash
   # Validate rules syntax
   firebase deploy --only storage --dry-run
   
   # Deploy specific bucket rules
   firebase deploy --only storage:your-bucket-name
   ```

4. **Cloud Function Timeout**:
   ```bash
   # Check function logs
   firebase functions:log --only initializeStorageBuckets
   
   # Increase timeout in function configuration
   ```

### Debug Commands

```bash
# List all buckets
gsutil ls

# Check bucket configuration
gsutil ls -L -b gs://your-bucket-name

# Check storage usage
gsutil du -sh gs://your-bucket-name

# Test bucket access
gsutil ls gs://your-bucket-name/

# Check CORS configuration
gsutil cors get gs://your-bucket-name

# Check lifecycle configuration
gsutil lifecycle get gs://your-bucket-name
```

## Support

For additional support:

1. **Firebase Documentation**: https://firebase.google.com/docs/storage
2. **Google Cloud Storage Documentation**: https://cloud.google.com/storage/docs
3. **Firebase Support**: https://firebase.google.com/support
4. **Stack Overflow**: Tag questions with `firebase-storage`

## Next Steps

1. **Run the setup script** to create all buckets
2. **Deploy storage rules** and Cloud Functions
3. **Test file upload/download** functionality
4. **Set up monitoring** and alerts
5. **Configure backup** procedures
6. **Train team** on bucket usage and security practices

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: EzyZip Development Team
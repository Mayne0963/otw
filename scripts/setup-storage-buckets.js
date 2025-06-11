#!/usr/bin/env node

/**
 * Storage Buckets Setup Script
 * 
 * This script sets up all required Firebase Storage buckets for the EzyZip application:
 * - ezyzip-orders: Order-related files (receipts, invoices, delivery photos)
 * - ezyzip-rewards: Rewards and loyalty program assets
 * - ezyzip-analytics: Analytics data and reports
 * 
 * Usage:
 *   node scripts/setup-storage-buckets.js [--project PROJECT_ID] [--dry-run]
 * 
 * Options:
 *   --project PROJECT_ID  Firebase project ID (defaults to current project)
 *   --dry-run            Show what would be created without actually creating
 *   --help               Show this help message
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const BUCKET_CONFIGS = {
  orders: {
    name: 'ezyzip-orders',
    description: 'Order-related files including receipts, invoices, and delivery photos',
    location: 'us-central1',
    storageClass: 'STANDARD',
    rulesFile: 'storage-orders.rules',
    corsConfig: {
      origin: ['https://ezyzip.app', 'https://admin.ezyzip.app'],
      method: ['GET', 'POST', 'PUT', 'DELETE'],
      maxAgeSeconds: 3600
    },
    lifecycleRules: [
      {
        condition: { age: 90, matchesPrefix: 'temp/' },
        action: { type: 'Delete' }
      },
      {
        condition: { age: 365, matchesPrefix: 'receipts/' },
        action: { type: 'SetStorageClass', storageClass: 'COLDLINE' }
      }
    ]
  },
  rewards: {
    name: 'ezyzip-rewards',
    description: 'Rewards and loyalty program assets including certificates and vouchers',
    location: 'us-central1',
    storageClass: 'STANDARD',
    rulesFile: 'storage-rewards.rules',
    corsConfig: {
      origin: ['https://ezyzip.app', 'https://admin.ezyzip.app'],
      method: ['GET', 'POST', 'PUT'],
      maxAgeSeconds: 3600
    },
    lifecycleRules: [
      {
        condition: { age: 30, matchesPrefix: 'temp/' },
        action: { type: 'Delete' }
      },
      {
        condition: { age: 180, matchesPrefix: 'certificates/' },
        action: { type: 'SetStorageClass', storageClass: 'NEARLINE' }
      }
    ]
  },
  analytics: {
    name: 'ezyzip-analytics',
    description: 'Analytics data, reports, and machine learning datasets',
    location: 'us-central1',
    storageClass: 'STANDARD',
    rulesFile: 'storage-analytics.rules',
    corsConfig: {
      origin: ['https://admin.ezyzip.app'],
      method: ['GET', 'POST'],
      maxAgeSeconds: 7200
    },
    lifecycleRules: [
      {
        condition: { age: 7, matchesPrefix: 'temp/' },
        action: { type: 'Delete' }
      },
      {
        condition: { age: 90, matchesPrefix: 'raw-data/' },
        action: { type: 'SetStorageClass', storageClass: 'NEARLINE' }
      },
      {
        condition: { age: 365, matchesPrefix: 'processed/' },
        action: { type: 'SetStorageClass', storageClass: 'COLDLINE' }
      }
    ]
  }
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    projectId: null,
    dryRun: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--project':
        options.projectId = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
        options.help = true;
        break;
      default:
        console.error(`Unknown option: ${args[i]}`);
        process.exit(1);
    }
  }

  return options;
}

// Show help message
function showHelp() {
  console.log(`
Storage Buckets Setup Script

Usage:
  node scripts/setup-storage-buckets.js [options]

Options:
  --project PROJECT_ID  Firebase project ID (defaults to current project)
  --dry-run            Show what would be created without actually creating
  --help               Show this help message

Buckets to be created:
`);
  
  Object.entries(BUCKET_CONFIGS).forEach(([key, config]) => {
    console.log(`  • ${config.name}: ${config.description}`);
  });
  
  console.log('');
}

// Execute command with error handling
function execCommand(command, description, dryRun = false) {
  console.log(`\n${dryRun ? '[DRY RUN] ' : ''}${description}...`);
  
  if (dryRun) {
    console.log(`Command: ${command}`);
    return;
  }
  
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log('✅ Success');
    if (output.trim()) {
      console.log(output.trim());
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stdout) console.log('stdout:', error.stdout);
    if (error.stderr) console.log('stderr:', error.stderr);
    throw error;
  }
}

// Check if Firebase CLI is installed
function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    console.log('✅ Firebase CLI is installed');
  } catch (error) {
    console.error('❌ Firebase CLI is not installed. Please install it first:');
    console.error('npm install -g firebase-tools');
    process.exit(1);
  }
}

// Get current Firebase project
function getCurrentProject() {
  try {
    const output = execSync('firebase use', { encoding: 'utf8', stdio: 'pipe' });
    const match = output.match(/Active project: ([^\s]+)/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

// Check if bucket exists
function bucketExists(bucketName, projectId) {
  try {
    execSync(`gsutil ls -b gs://${bucketName}`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Create storage bucket
function createBucket(config, projectId, dryRun) {
  const bucketName = `${projectId}-${config.name.replace('ezyzip-', '')}`;
  
  console.log(`\n📦 Setting up bucket: ${bucketName}`);
  
  if (!dryRun && bucketExists(bucketName, projectId)) {
    console.log('ℹ️  Bucket already exists, skipping creation');
    return bucketName;
  }
  
  // Create bucket
  const createCommand = `gsutil mb -p ${projectId} -c ${config.storageClass} -l ${config.location} gs://${bucketName}`;
  execCommand(createCommand, `Creating bucket ${bucketName}`, dryRun);
  
  // Set bucket labels
  const labelsCommand = `gsutil label ch -l environment:production -l purpose:${config.name.replace('ezyzip-', '')} -l project:ezyzip gs://${bucketName}`;
  execCommand(labelsCommand, 'Setting bucket labels', dryRun);
  
  return bucketName;
}

// Configure bucket lifecycle
function configureBucketLifecycle(bucketName, lifecycleRules, dryRun) {
  if (!lifecycleRules || lifecycleRules.length === 0) return;
  
  const lifecycleConfig = {
    lifecycle: {
      rule: lifecycleRules
    }
  };
  
  const tempFile = path.join(__dirname, `lifecycle-${bucketName}.json`);
  
  if (!dryRun) {
    fs.writeFileSync(tempFile, JSON.stringify(lifecycleConfig, null, 2));
  }
  
  const command = `gsutil lifecycle set ${tempFile} gs://${bucketName}`;
  execCommand(command, `Configuring lifecycle rules for ${bucketName}`, dryRun);
  
  if (!dryRun && fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile);
  }
}

// Configure bucket CORS
function configureBucketCORS(bucketName, corsConfig, dryRun) {
  if (!corsConfig) return;
  
  const corsConfigArray = [{
    origin: corsConfig.origin,
    method: corsConfig.method,
    maxAgeSeconds: corsConfig.maxAgeSeconds
  }];
  
  const tempFile = path.join(__dirname, `cors-${bucketName}.json`);
  
  if (!dryRun) {
    fs.writeFileSync(tempFile, JSON.stringify(corsConfigArray, null, 2));
  }
  
  const command = `gsutil cors set ${tempFile} gs://${bucketName}`;
  execCommand(command, `Configuring CORS for ${bucketName}`, dryRun);
  
  if (!dryRun && fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile);
  }
}

// Deploy storage rules
function deployStorageRules(rulesFile, bucketName, dryRun) {
  const rulesPath = path.join(process.cwd(), rulesFile);
  
  if (!fs.existsSync(rulesPath)) {
    console.log(`⚠️  Rules file not found: ${rulesFile}`);
    return;
  }
  
  // Note: Firebase Storage rules are deployed per project, not per bucket
  // This is a placeholder for when Firebase supports per-bucket rules
  console.log(`ℹ️  Rules file ${rulesFile} exists and will be deployed with 'firebase deploy --only storage'`);
}

// Create initial directory structure
function createDirectoryStructure(bucketName, bucketType, dryRun) {
  const directories = {
    orders: [
      'receipts/',
      'invoices/',
      'confirmations/',
      'delivery-photos/',
      'packaging-photos/',
      'modifications/',
      'refunds/',
      'qa-photos/',
      'analytics/',
      'temp/',
      'backups/',
      'audit-logs/'
    ],
    rewards: [
      'certificates/',
      'vouchers/',
      'loyalty-assets/',
      'achievements/',
      'promotional/',
      'partner-rewards/',
      'referral/',
      'analytics/',
      'temp/',
      'backups/',
      'seasonal/',
      'audit-logs/'
    ],
    analytics: [
      'raw-data/',
      'processed/',
      'restaurant-analytics/',
      'user-behavior/',
      'financial/',
      'marketing/',
      'reports/custom/',
      'reports/scheduled/',
      'exports/',
      'ml-data/',
      'backups/',
      'temp/',
      'audit-logs/'
    ]
  };
  
  const dirs = directories[bucketType] || [];
  
  dirs.forEach(dir => {
    const command = `echo "Directory placeholder" | gsutil cp - gs://${bucketName}/${dir}.gitkeep`;
    execCommand(command, `Creating directory structure: ${dir}`, dryRun);
  });
}

// Main setup function
async function setupStorageBuckets(options) {
  console.log('🚀 Starting Firebase Storage Buckets Setup\n');
  
  // Check prerequisites
  checkFirebaseCLI();
  
  // Determine project ID
  const projectId = options.projectId || getCurrentProject();
  if (!projectId) {
    console.error('❌ No Firebase project specified. Use --project or run "firebase use" first.');
    process.exit(1);
  }
  
  console.log(`📋 Project ID: ${projectId}`);
  console.log(`🔧 Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`);
  
  if (options.dryRun) {
    console.log('\n⚠️  DRY RUN MODE: No actual changes will be made\n');
  }
  
  const createdBuckets = [];
  
  try {
    // Create and configure each bucket
    for (const [bucketType, config] of Object.entries(BUCKET_CONFIGS)) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Setting up ${bucketType.toUpperCase()} bucket`);
      console.log(`${'='.repeat(60)}`);
      
      // Create bucket
      const bucketName = createBucket(config, projectId, options.dryRun);
      createdBuckets.push({ name: bucketName, type: bucketType });
      
      // Configure lifecycle
      configureBucketLifecycle(bucketName, config.lifecycleRules, options.dryRun);
      
      // Configure CORS
      configureBucketCORS(bucketName, config.corsConfig, options.dryRun);
      
      // Deploy storage rules (informational)
      deployStorageRules(config.rulesFile, bucketName, options.dryRun);
      
      // Create directory structure
      createDirectoryStructure(bucketName, bucketType, options.dryRun);
      
      console.log(`✅ ${bucketType.toUpperCase()} bucket setup complete`);
    }
    
    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 SETUP SUMMARY');
    console.log(`${'='.repeat(60)}`);
    
    console.log(`\n✅ Successfully ${options.dryRun ? 'planned' : 'created'} ${createdBuckets.length} storage buckets:\n`);
    
    createdBuckets.forEach(bucket => {
      console.log(`  • ${bucket.name} (${bucket.type})`);
    });
    
    if (!options.dryRun) {
      console.log('\n📋 Next Steps:');
      console.log('1. Deploy storage rules: firebase deploy --only storage');
      console.log('2. Deploy Cloud Functions: firebase deploy --only functions');
      console.log('3. Initialize buckets: Call initializeStorageBuckets Cloud Function');
      console.log('4. Test file uploads and downloads');
      console.log('5. Monitor storage usage in Firebase Console');
    }
    
    console.log('\n🎉 Storage buckets setup completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    
    if (createdBuckets.length > 0 && !options.dryRun) {
      console.log('\n🧹 Cleaning up partially created buckets...');
      for (const bucket of createdBuckets) {
        try {
          execSync(`gsutil rm -r gs://${bucket.name}`, { stdio: 'pipe' });
          console.log(`✅ Cleaned up: ${bucket.name}`);
        } catch (cleanupError) {
          console.error(`❌ Failed to cleanup: ${bucket.name}`);
        }
      }
    }
    
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    process.exit(0);
  }
  
  setupStorageBuckets(options).catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { setupStorageBuckets, BUCKET_CONFIGS };
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

/**
 * Global setup for Jest tests
 * Starts Firebase emulators and prepares test environment
 */
export default async (): Promise<void> => {
  console.log('🚀 Starting Firebase emulators for testing...');
  
  try {
    // Check if Firebase CLI is installed
    await execAsync('firebase --version');
    console.log('✅ Firebase CLI found');
  } catch (error) {
    console.error('❌ Firebase CLI not found. Please install it with: npm install -g firebase-tools');
    process.exit(1);
  }
  
  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';
  process.env.FUNCTIONS_EMULATOR_HOST = 'localhost:5001';
  process.env.GCLOUD_PROJECT = 'test-project';
  process.env.FIREBASE_PROJECT_ID = 'test-project';
  
  // Create emulator data directory if it doesn't exist
  const emulatorDataDir = path.join(__dirname, '../../emulator-data');
  if (!fs.existsSync(emulatorDataDir)) {
    fs.mkdirSync(emulatorDataDir, { recursive: true });
  }
  
  // Create firebase.json if it doesn't exist
  const firebaseConfigPath = path.join(__dirname, '../../firebase.json');
  if (!fs.existsSync(firebaseConfigPath)) {
    const firebaseConfig = {
      emulators: {
        auth: {
          port: 9099
        },
        firestore: {
          port: 8080
        },
        storage: {
          port: 9199
        },
        functions: {
          port: 5001
        },
        ui: {
          enabled: false // Disable UI for testing
        },
        singleProjectMode: true
      },
      functions: {
        source: '.',
        runtime: 'nodejs18'
      }
    };
    
    fs.writeFileSync(firebaseConfigPath, JSON.stringify(firebaseConfig, null, 2));
    console.log('✅ Created firebase.json for testing');
  }
  
  try {
    // Start Firebase emulators
    console.log('🔧 Starting Firebase emulators...');
    
    // Use exec instead of spawn to run in background
    const emulatorProcess = exec(
      'firebase emulators:start --only auth,firestore,storage,functions --project test-project',
      {
        cwd: path.join(__dirname, '../..')
      }
    );
    
    // Store process ID for cleanup
    if (emulatorProcess.pid) {
      fs.writeFileSync(
        path.join(__dirname, '../../emulator.pid'),
        emulatorProcess.pid.toString()
      );
    }
    
    // Wait for emulators to start
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Emulators failed to start within 30 seconds'));
      }, 30000);
      
      const checkEmulators = async (): Promise<void> => {
        try {
          // Check if Firestore emulator is ready
          const response = await fetch('http://localhost:8080');
          if (response.ok) {
            clearTimeout(timeout);
            console.log('✅ Firebase emulators started successfully');
            resolve(undefined);
          } else {
            setTimeout(checkEmulators, 1000);
          }
        } catch (error) {
          setTimeout(checkEmulators, 1000);
        }
      };
      
      setTimeout(checkEmulators, 3000); // Wait 3 seconds before first check
    });
    
  } catch (error) {
    console.error('❌ Failed to start Firebase emulators:', error);
    process.exit(1);
  }
  
  console.log('🎯 Test environment ready!');
};

/**
 * Helper function to wait for a condition
 */
const waitFor = async (
  condition: () => Promise<boolean>,
  timeout: number = 30000,
  interval: number = 1000
): Promise<void> => {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    try {
      if (await condition()) {
        return;
      }
    } catch (error) {
      // Ignore errors and continue waiting
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
};

/**
 * Check if emulator is running
 */
const isEmulatorRunning = async (port: number): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:${port}`);
    return response.ok;
  } catch (error) {
    return false;
  }
};
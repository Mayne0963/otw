import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

/**
 * Global teardown for Jest tests
 * Stops Firebase emulators and cleans up test environment
 */
export default async (): Promise<void> => {
  console.log('🧹 Cleaning up test environment...');
  
  try {
    // Stop Firebase emulators
    await stopEmulators();
    
    // Clean up temporary files
    await cleanupTempFiles();
    
    // Clean up emulator data
    await cleanupEmulatorData();
    
    console.log('✅ Test environment cleaned up successfully');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    // Don't fail the tests due to cleanup errors
  }
};

/**
 * Stop Firebase emulators
 */
const stopEmulators = async (): Promise<void> => {
  console.log('🛑 Stopping Firebase emulators...');
  
  try {
    // Try to stop emulators gracefully
    await execAsync('firebase emulators:stop --project test-project', {
      cwd: path.join(__dirname, '../..')
    });
    console.log('✅ Emulators stopped gracefully');
  } catch (error) {
    console.log('⚠️ Graceful stop failed, trying force stop...');
    
    // Try to kill emulator processes by PID
    const pidFile = path.join(__dirname, '../../emulator.pid');
    if (fs.existsSync(pidFile)) {
      try {
        const pid = fs.readFileSync(pidFile, 'utf8').trim();
        if (pid) {
          await execAsync(`kill -9 ${pid}`);
          console.log(`✅ Killed emulator process ${pid}`);
        }
      } catch (killError) {
        console.log('⚠️ Failed to kill by PID, trying port-based cleanup...');
      }
    }
    
    // Force kill processes on emulator ports
    await forceKillEmulatorPorts();
  }
};

/**
 * Force kill processes running on emulator ports
 */
const forceKillEmulatorPorts = async (): Promise<void> => {
  const ports = [8080, 9099, 9199, 5001, 4000]; // Firestore, Auth, Storage, Functions, UI
  
  for (const port of ports) {
    try {
      // Find process using the port
      const { stdout } = await execAsync(`lsof -ti:${port}`);
      const pids = stdout.trim().split('\n').filter(pid => pid);
      
      for (const pid of pids) {
        try {
          await execAsync(`kill -9 ${pid}`);
          console.log(`✅ Killed process ${pid} on port ${port}`);
        } catch (killError) {
          console.log(`⚠️ Failed to kill process ${pid}`);
        }
      }
    } catch (error) {
      // No process found on this port, which is fine
    }
  }
};

/**
 * Clean up temporary files created during testing
 */
const cleanupTempFiles = async (): Promise<void> => {
  console.log('🗑️ Cleaning up temporary files...');
  
  const tempFiles = [
    path.join(__dirname, '../../emulator.pid'),
    path.join(__dirname, '../../firebase-debug.log'),
    path.join(__dirname, '../../firestore-debug.log'),
    path.join(__dirname, '../../ui-debug.log'),
    path.join(__dirname, '../../firebase.json') // Remove test firebase.json
  ];
  
  for (const file of tempFiles) {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`✅ Removed ${path.basename(file)}`);
      }
    } catch (error) {
      console.log(`⚠️ Failed to remove ${path.basename(file)}:`, error);
    }
  }
};

/**
 * Clean up emulator data directory
 */
const cleanupEmulatorData = async (): Promise<void> => {
  console.log('🗑️ Cleaning up emulator data...');
  
  const emulatorDataDir = path.join(__dirname, '../../emulator-data');
  
  if (fs.existsSync(emulatorDataDir)) {
    try {
      await removeDirectory(emulatorDataDir);
      console.log('✅ Removed emulator data directory');
    } catch (error) {
      console.log('⚠️ Failed to remove emulator data directory:', error);
    }
  }
};

/**
 * Recursively remove directory
 */
const removeDirectory = async (dirPath: string): Promise<void> => {
  if (!fs.existsSync(dirPath)) {
    return;
  }
  
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await removeDirectory(filePath);
    } else {
      fs.unlinkSync(filePath);
    }
  }
  
  fs.rmdirSync(dirPath);
};

/**
 * Wait for a condition with timeout
 */
const waitFor = async (
  condition: () => Promise<boolean>,
  timeout: number = 10000,
  interval: number = 500
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
 * Check if port is free
 */
const isPortFree = async (port: number): Promise<boolean> => {
  try {
    const { stdout } = await execAsync(`lsof -ti:${port}`);
    return !stdout.trim(); // Port is free if no output
  } catch (error) {
    return true; // Port is free if lsof fails
  }
};
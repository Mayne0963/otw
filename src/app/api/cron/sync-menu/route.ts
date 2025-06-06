import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, writeBatch } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

interface SyncConfig {
  restaurantId: string;
  source: 'documenu' | 'yelp' | 'zomato';
  enabled: boolean;
  lastSync?: string;
  syncInterval: number; // hours
  autoUpdate: boolean;
}

interface SyncResult {
  restaurantId: string;
  source: string;
  status: 'success' | 'error' | 'skipped';
  itemsAdded: number;
  itemsUpdated: number;
  itemsRemoved: number;
  error?: string;
  timestamp: string;
}

// Verify cron authorization
function verifyCronAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    throw new Error('Cron secret not configured');
  }

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    throw new Error('Unauthorized cron request');
  }
}

// GET - Get sync status and logs
export async function GET(req: NextRequest) {
  try {
    verifyCronAuth(req);

    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');
    const limit_param = searchParams.get('limit');
    const status = searchParams.get('status');

    // Get sync configurations
    const configQuery = collection(db, 'sync_configs');
    const configConstraints = [];

    if (restaurantId) {
      configConstraints.push(where('restaurantId', '==', restaurantId));
    }

    configConstraints.push(where('enabled', '==', true));

    const configQ = query(configQuery, ...configConstraints);
    const configSnapshot = await getDocs(configQ);

    const configs: any[] = [];
    configSnapshot.forEach((doc) => {
      configs.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Get recent sync logs
    const logQuery = collection(db, 'sync_logs');
    const logConstraints = [];

    if (restaurantId) {
      logConstraints.push(where('restaurantId', '==', restaurantId));
    }

    if (status) {
      logConstraints.push(where('status', '==', status));
    }

    logConstraints.push(orderBy('timestamp', 'desc'));
    logConstraints.push(limit(parseInt(limit_param || '50')));

    const logQ = query(logQuery, ...logConstraints);
    const logSnapshot = await getDocs(logQ);

    const logs: any[] = [];
    logSnapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        configs,
        logs,
        summary: {
          totalConfigs: configs.length,
          totalLogs: logs.length,
          lastSync: logs[0]?.timestamp || null,
        },
      },
    });

  } catch (error) {
    console.error('Sync status error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 },
    );
  }
}

// POST - Trigger manual sync or create sync job
export async function POST(req: NextRequest) {
  try {
    verifyCronAuth(req);

    const { action, restaurantId, source, force } = await req.json();

    if (action === 'sync') {
      // Trigger manual sync
      if (!restaurantId) {
        return NextResponse.json(
          { error: 'Restaurant ID required for manual sync' },
          { status: 400 },
        );
      }

      const result = await syncRestaurantMenu(restaurantId, source, force);

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    if (action === 'sync-all') {
      // Sync all enabled restaurants
      const results = await syncAllRestaurants(force);

      return NextResponse.json({
        success: true,
        data: {
          totalProcessed: results.length,
          successful: results.filter(r => r.status === 'success').length,
          failed: results.filter(r => r.status === 'error').length,
          skipped: results.filter(r => r.status === 'skipped').length,
          results,
        },
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'sync' or 'sync-all'" },
      { status: 400 },
    );

  } catch (error) {
    console.error('Manual sync error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to trigger sync' },
      { status: 500 },
    );
  }
}

// PUT - Update sync configuration
export async function PUT(req: NextRequest) {
  try {
    verifyCronAuth(req);

    const { searchParams } = new URL(req.url);
    const configId = searchParams.get('id');

    if (!configId) {
      return NextResponse.json(
        { error: 'Config ID required' },
        { status: 400 },
      );
    }

    const updates = await req.json();

    const configRef = doc(db, 'sync_configs', configId);
    const configDoc = await getDoc(configRef);

    if (!configDoc.exists()) {
      return NextResponse.json(
        { error: 'Sync config not found' },
        { status: 404 },
      );
    }

    await updateDoc(configRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    const updatedDoc = await getDoc(configRef);

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
      message: 'Sync config updated successfully',
    });

  } catch (error) {
    console.error('Sync config update error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to update sync config' },
      { status: 500 },
    );
  }
}

// DELETE - Remove sync configuration
export async function DELETE(req: NextRequest) {
  try {
    verifyCronAuth(req);

    const { searchParams } = new URL(req.url);
    const configId = searchParams.get('id');

    if (!configId) {
      return NextResponse.json(
        { error: 'Config ID required' },
        { status: 400 },
      );
    }

    const configRef = doc(db, 'sync_configs', configId);
    const configDoc = await getDoc(configRef);

    if (!configDoc.exists()) {
      return NextResponse.json(
        { error: 'Sync config not found' },
        { status: 404 },
      );
    }

    await deleteDoc(configRef);

    return NextResponse.json({
      success: true,
      message: 'Sync config deleted successfully',
    });

  } catch (error) {
    console.error('Sync config delete error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete sync config' },
      { status: 500 },
    );
  }
}

// Helper function to sync all restaurants
async function syncAllRestaurants(force = false): Promise<SyncResult[]> {
  const results: SyncResult[] = [];

  try {
    // Get all enabled sync configs
    const configQuery = query(
      collection(db, 'sync_configs'),
      where('enabled', '==', true),
    );

    const configSnapshot = await getDocs(configQuery);

    for (const configDoc of configSnapshot.docs) {
      const config = configDoc.data() as SyncConfig;

      try {
        const result = await syncRestaurantMenu(config.restaurantId, config.source, force);
        results.push(result);
      } catch (error) {
        results.push({
          restaurantId: config.restaurantId,
          source: config.source,
          status: 'error',
          itemsAdded: 0,
          itemsUpdated: 0,
          itemsRemoved: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
      }
    }

  } catch (error) {
    console.error('Sync all restaurants error:', error);
  }

  return results;
}

// Helper function to sync individual restaurant menu
async function syncRestaurantMenu(restaurantId: string, source?: string, force = false): Promise<SyncResult> {
  const timestamp = new Date().toISOString();

  try {
    // Get sync config
    const configQuery = query(
      collection(db, 'sync_configs'),
      where('restaurantId', '==', restaurantId),
      where('enabled', '==', true),
    );

    const configSnapshot = await getDocs(configQuery);

    if (configSnapshot.empty) {
      return {
        restaurantId,
        source: source || 'unknown',
        status: 'skipped',
        itemsAdded: 0,
        itemsUpdated: 0,
        itemsRemoved: 0,
        error: 'No enabled sync config found',
        timestamp,
      };
    }

    const config = configSnapshot.docs[0].data() as SyncConfig;
    const actualSource = source || config.source;

    // Check if sync is needed (unless forced)
    if (!force && config.lastSync) {
      const lastSyncTime = new Date(config.lastSync);
      const now = new Date();
      const hoursSinceLastSync = (now.getTime() - lastSyncTime.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastSync < config.syncInterval) {
        return {
          restaurantId,
          source: actualSource,
          status: 'skipped',
          itemsAdded: 0,
          itemsUpdated: 0,
          itemsRemoved: 0,
          error: `Sync not due yet. Last sync: ${config.lastSync}`,
          timestamp,
        };
      }
    }

    // Fetch external menu data
    const externalData = await fetchExternalMenuData(actualSource, restaurantId);

    if (!externalData || !externalData.success) {
      throw new Error(`Failed to fetch external data: ${externalData?.error || 'Unknown error'}`);
    }

    // Sync data to local database
    const syncStats = await syncMenuData(restaurantId, externalData.data, actualSource);

    // Update sync config
    await updateDoc(configSnapshot.docs[0].ref, {
      lastSync: timestamp,
      updatedAt: timestamp,
    });

    // Log sync result
    const result: SyncResult = {
      restaurantId,
      source: actualSource,
      status: 'success',
      ...syncStats,
      timestamp,
    };

    await addDoc(collection(db, 'sync_logs'), result);

    return result;

  } catch (error) {
    const result: SyncResult = {
      restaurantId,
      source: source || 'unknown',
      status: 'error',
      itemsAdded: 0,
      itemsUpdated: 0,
      itemsRemoved: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp,
    };

    // Log error
    await addDoc(collection(db, 'sync_logs'), result);

    return result;
  }
}

// Helper function to fetch external menu data
async function fetchExternalMenuData(source: string, restaurantId: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/fetch-menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source,
        restaurantId,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('External menu fetch error:', error);
    return null;
  }
}

// Helper function to sync menu data to local database
async function syncMenuData(restaurantId: string, externalItems: any[], source: string) {
  const batch = writeBatch(db);
  let itemsAdded = 0;
  let itemsUpdated = 0;
  let itemsRemoved = 0;

  try {
    // Get existing menu items for this restaurant
    const existingQuery = query(
      collection(db, 'menu_items'),
      where('restaurantId', '==', restaurantId),
      where('source', '==', source),
    );

    const existingSnapshot = await getDocs(existingQuery);
    const existingItems = new Map();

    existingSnapshot.forEach((doc) => {
      const data = doc.data();
      existingItems.set(data.externalId || doc.id, { id: doc.id, ...data });
    });

    // Process external items
    const processedIds = new Set();

    for (const externalItem of externalItems) {
      const externalId = externalItem.id || externalItem.menu_item_id;
      processedIds.add(externalId);

      const menuItem = {
        restaurantId,
        source,
        externalId,
        name: externalItem.name || externalItem.menu_item_name,
        description: externalItem.description || externalItem.menu_item_description,
        price: externalItem.price || 0,
        category: externalItem.category || externalItem.menu_item_category || 'Other',
        image: externalItem.image || externalItem.menu_item_image,
        available: externalItem.available !== false,
        updatedAt: new Date().toISOString(),
        syncedAt: new Date().toISOString(),
      };

      if (existingItems.has(externalId)) {
        // Update existing item
        const existing = existingItems.get(externalId);
        const itemRef = doc(db, 'menu_items', existing.id);
        batch.update(itemRef, menuItem);
        itemsUpdated++;
      } else {
        // Add new item
        const newItemRef = doc(collection(db, 'menu_items'));
        batch.set(newItemRef, {
          ...menuItem,
          createdAt: new Date().toISOString(),
        });
        itemsAdded++;
      }
    }

    // Remove items that are no longer in external source
    for (const [externalId, existing] of existingItems) {
      if (!processedIds.has(externalId)) {
        const itemRef = doc(db, 'menu_items', existing.id);
        batch.delete(itemRef);
        itemsRemoved++;
      }
    }

    // Commit batch
    await batch.commit();

    return { itemsAdded, itemsUpdated, itemsRemoved };

  } catch (error) {
    console.error('Menu sync error:', error);
    throw error;
  }
}

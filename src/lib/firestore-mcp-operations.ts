/**
 * Enhanced Firestore CRUD Operations with MCP Integration
 * 
 * This module provides comprehensive Firestore operations integrated with MCP
 * for automated database management, real-time synchronization, and analytics.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  onSnapshot,
  writeBatch,
  runTransaction,
  Timestamp,
  serverTimestamp,
  DocumentReference,
  QuerySnapshot,
  DocumentSnapshot,
  WhereFilterOp,
  OrderByDirection,
  Unsubscribe
} from 'firebase/firestore';
import { getFirebaseDB } from './firebase-mcp-integration';

// Types
interface QueryOptions {
  orderBy?: { field: string; direction?: OrderByDirection }[];
  where?: { field: string; operator: WhereFilterOp; value: any }[];
  limit?: number;
  startAfter?: any;
  endBefore?: any;
}

interface PaginationOptions {
  pageSize: number;
  lastDoc?: DocumentSnapshot;
  direction?: 'next' | 'previous';
}

interface BatchOperation {
  type: 'create' | 'update' | 'delete';
  collection: string;
  id?: string;
  data?: any;
}

interface MCPSyncOptions {
  autoSync: boolean;
  conflictResolution: 'client' | 'server' | 'manual';
  syncInterval?: number;
}

// Enhanced Firestore Operations Class
export class FirestoreMCPOperations {
  private db = getFirebaseDB();
  private listeners: Map<string, Unsubscribe> = new Map();
  private syncOptions: MCPSyncOptions = {
    autoSync: true,
    conflictResolution: 'server',
    syncInterval: 30000 // 30 seconds
  };

  constructor(syncOptions?: Partial<MCPSyncOptions>) {
    if (syncOptions) {
      this.syncOptions = { ...this.syncOptions, ...syncOptions };
    }
  }

  /**
   * Create a new document with MCP integration
   */
  async create<T extends Record<string, any>>(
    collectionName: string,
    data: T,
    customId?: string
  ): Promise<{ id: string; data: T & { createdAt: Timestamp; updatedAt: Timestamp } }> {
    try {
      const timestamp = serverTimestamp();
      const documentData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      let docRef: DocumentReference;
      
      if (customId) {
        docRef = doc(this.db, collectionName, customId);
        await updateDoc(docRef, documentData);
      } else {
        docRef = await addDoc(collection(this.db, collectionName), documentData);
      }

      // Log operation for MCP analytics
      await this.logOperation('create', collectionName, docRef.id, documentData);

      // Trigger MCP sync if enabled
      if (this.syncOptions.autoSync) {
        await this.triggerMCPSync(collectionName, 'create', docRef.id);
      }

      return {
        id: docRef.id,
        data: documentData as T & { createdAt: Timestamp; updatedAt: Timestamp }
      };
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Read a single document by ID
   */
  async read<T>(
    collectionName: string,
    documentId: string
  ): Promise<{ id: string; data: T } | null> {
    try {
      const docRef = doc(this.db, collectionName, documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          data: docSnap.data() as T
        };
      }

      return null;
    } catch (error) {
      console.error(`Error reading document ${documentId} from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Read multiple documents with advanced querying
   */
  async readMany<T>(
    collectionName: string,
    options?: QueryOptions
  ): Promise<{ id: string; data: T }[]> {
    try {
      let q = collection(this.db, collectionName);
      let queryRef: any = q;

      // Apply where clauses
      if (options?.where) {
        for (const whereClause of options.where) {
          queryRef = query(queryRef, where(whereClause.field, whereClause.operator, whereClause.value));
        }
      }

      // Apply order by
      if (options?.orderBy) {
        for (const orderClause of options.orderBy) {
          queryRef = query(queryRef, orderBy(orderClause.field, orderClause.direction || 'asc'));
        }
      }

      // Apply pagination
      if (options?.startAfter) {
        queryRef = query(queryRef, startAfter(options.startAfter));
      }
      if (options?.endBefore) {
        queryRef = query(queryRef, endBefore(options.endBefore));
      }
      if (options?.limit) {
        queryRef = query(queryRef, limit(options.limit));
      }

      const querySnapshot = await getDocs(queryRef);
      const results: { id: string; data: T }[] = [];

      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          data: doc.data() as T
        });
      });

      return results;
    } catch (error) {
      console.error(`Error reading documents from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Read documents with pagination
   */
  async readPaginated<T>(
    collectionName: string,
    paginationOptions: PaginationOptions,
    queryOptions?: QueryOptions
  ): Promise<{
    data: { id: string; data: T }[];
    hasNext: boolean;
    hasPrevious: boolean;
    lastDoc?: DocumentSnapshot;
    firstDoc?: DocumentSnapshot;
  }> {
    try {
      let q = collection(this.db, collectionName);
      let queryRef: any = q;

      // Apply query options
      if (queryOptions?.where) {
        for (const whereClause of queryOptions.where) {
          queryRef = query(queryRef, where(whereClause.field, whereClause.operator, whereClause.value));
        }
      }

      if (queryOptions?.orderBy) {
        for (const orderClause of queryOptions.orderBy) {
          queryRef = query(queryRef, orderBy(orderClause.field, orderClause.direction || 'asc'));
        }
      }

      // Apply pagination
      if (paginationOptions.lastDoc) {
        if (paginationOptions.direction === 'previous') {
          queryRef = query(queryRef, endBefore(paginationOptions.lastDoc));
        } else {
          queryRef = query(queryRef, startAfter(paginationOptions.lastDoc));
        }
      }

      queryRef = query(queryRef, limit(paginationOptions.pageSize + 1));

      const querySnapshot = await getDocs(queryRef);
      const docs = querySnapshot.docs;
      
      const hasNext = docs.length > paginationOptions.pageSize;
      const data = docs.slice(0, paginationOptions.pageSize).map(doc => ({
        id: doc.id,
        data: doc.data() as T
      }));

      return {
        data,
        hasNext,
        hasPrevious: !!paginationOptions.lastDoc,
        lastDoc: docs[docs.length - 2] || docs[docs.length - 1],
        firstDoc: docs[0]
      };
    } catch (error) {
      console.error(`Error reading paginated documents from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Update a document
   */
  async update<T extends Record<string, any>>(
    collectionName: string,
    documentId: string,
    data: Partial<T>
  ): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, documentId);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updateData);

      // Log operation for MCP analytics
      await this.logOperation('update', collectionName, documentId, updateData);

      // Trigger MCP sync if enabled
      if (this.syncOptions.autoSync) {
        await this.triggerMCPSync(collectionName, 'update', documentId);
      }
    } catch (error) {
      console.error(`Error updating document ${documentId} in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  async delete(
    collectionName: string,
    documentId: string
  ): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, documentId);
      await deleteDoc(docRef);

      // Log operation for MCP analytics
      await this.logOperation('delete', collectionName, documentId);

      // Trigger MCP sync if enabled
      if (this.syncOptions.autoSync) {
        await this.triggerMCPSync(collectionName, 'delete', documentId);
      }
    } catch (error) {
      console.error(`Error deleting document ${documentId} from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Batch operations for multiple documents
   */
  async batchOperations(operations: BatchOperation[]): Promise<void> {
    try {
      const batch = writeBatch(this.db);

      for (const operation of operations) {
        const docRef = operation.id 
          ? doc(this.db, operation.collection, operation.id)
          : doc(collection(this.db, operation.collection));

        switch (operation.type) {
          case 'create':
            batch.set(docRef, {
              ...operation.data,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            break;
          case 'update':
            batch.update(docRef, {
              ...operation.data,
              updatedAt: serverTimestamp()
            });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }
      }

      await batch.commit();

      // Log batch operation
      await this.logOperation('batch', 'multiple', 'batch', { operationsCount: operations.length });

      // Trigger MCP sync for all affected collections
      if (this.syncOptions.autoSync) {
        const collections = [...new Set(operations.map(op => op.collection))];
        for (const collectionName of collections) {
          await this.triggerMCPSync(collectionName, 'batch', 'multiple');
        }
      }
    } catch (error) {
      console.error('Error executing batch operations:', error);
      throw error;
    }
  }

  /**
   * Transaction operations
   */
  async transaction<T>(
    transactionFunction: (transaction: any) => Promise<T>
  ): Promise<T> {
    try {
      const result = await runTransaction(this.db, transactionFunction);
      
      // Log transaction
      await this.logOperation('transaction', 'multiple', 'transaction', { completed: true });
      
      return result;
    } catch (error) {
      console.error('Error executing transaction:', error);
      await this.logOperation('transaction', 'multiple', 'transaction', { completed: false, error: error.message });
      throw error;
    }
  }

  /**
   * Real-time listener for document changes
   */
  subscribeToDocument<T>(
    collectionName: string,
    documentId: string,
    callback: (data: { id: string; data: T } | null) => void,
    onError?: (error: Error) => void
  ): string {
    const listenerId = `${collectionName}_${documentId}_${Date.now()}`;
    
    try {
      const docRef = doc(this.db, collectionName, documentId);
      
      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            callback({
              id: docSnap.id,
              data: docSnap.data() as T
            });
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error(`Error in document listener for ${documentId}:`, error);
          onError?.(error);
        }
      );

      this.listeners.set(listenerId, unsubscribe);
      return listenerId;
    } catch (error) {
      console.error(`Error setting up document listener for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Real-time listener for collection changes
   */
  subscribeToCollection<T>(
    collectionName: string,
    callback: (data: { id: string; data: T }[]) => void,
    options?: QueryOptions,
    onError?: (error: Error) => void
  ): string {
    const listenerId = `${collectionName}_collection_${Date.now()}`;
    
    try {
      let q = collection(this.db, collectionName);
      let queryRef: any = q;

      // Apply query options
      if (options?.where) {
        for (const whereClause of options.where) {
          queryRef = query(queryRef, where(whereClause.field, whereClause.operator, whereClause.value));
        }
      }

      if (options?.orderBy) {
        for (const orderClause of options.orderBy) {
          queryRef = query(queryRef, orderBy(orderClause.field, orderClause.direction || 'asc'));
        }
      }

      if (options?.limit) {
        queryRef = query(queryRef, limit(options.limit));
      }

      const unsubscribe = onSnapshot(
        queryRef,
        (querySnapshot) => {
          const results: { id: string; data: T }[] = [];
          querySnapshot.forEach((doc) => {
            results.push({
              id: doc.id,
              data: doc.data() as T
            });
          });
          callback(results);
        },
        (error) => {
          console.error(`Error in collection listener for ${collectionName}:`, error);
          onError?.(error);
        }
      );

      this.listeners.set(listenerId, unsubscribe);
      return listenerId;
    } catch (error) {
      console.error(`Error setting up collection listener for ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from a real-time listener
   */
  unsubscribe(listenerId: string): void {
    const unsubscribe = this.listeners.get(listenerId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(listenerId);
    }
  }

  /**
   * Unsubscribe from all listeners
   */
  unsubscribeAll(): void {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
  }

  /**
   * Search documents with text matching
   */
  async searchDocuments<T>(
    collectionName: string,
    searchField: string,
    searchTerm: string,
    options?: QueryOptions
  ): Promise<{ id: string; data: T }[]> {
    try {
      // Firestore doesn't support full-text search natively
      // This is a simple prefix search implementation
      const searchTermLower = searchTerm.toLowerCase();
      const searchTermEnd = searchTermLower + '\uf8ff';

      const searchOptions: QueryOptions = {
        ...options,
        where: [
          ...(options?.where || []),
          { field: searchField, operator: '>=', value: searchTermLower },
          { field: searchField, operator: '<=', value: searchTermEnd }
        ]
      };

      return await this.readMany<T>(collectionName, searchOptions);
    } catch (error) {
      console.error(`Error searching documents in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(collectionName: string): Promise<{
    totalDocuments: number;
    lastUpdated: Timestamp | null;
    averageDocumentSize: number;
  }> {
    try {
      const docs = await this.readMany(collectionName);
      
      let lastUpdated: Timestamp | null = null;
      let totalSize = 0;

      docs.forEach((doc) => {
        const docData = doc.data as any;
        if (docData.updatedAt && (!lastUpdated || docData.updatedAt > lastUpdated)) {
          lastUpdated = docData.updatedAt;
        }
        totalSize += JSON.stringify(docData).length;
      });

      return {
        totalDocuments: docs.length,
        lastUpdated,
        averageDocumentSize: docs.length > 0 ? totalSize / docs.length : 0
      };
    } catch (error) {
      console.error(`Error getting collection stats for ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Log operation for MCP analytics
   */
  private async logOperation(
    operation: string,
    collection: string,
    documentId: string,
    data?: any
  ): Promise<void> {
    try {
      const logEntry = {
        operation,
        collection,
        documentId,
        timestamp: serverTimestamp(),
        data: data ? JSON.stringify(data).substring(0, 1000) : null, // Limit log size
        userId: 'system' // This should be replaced with actual user ID
      };

      // Store in operations log collection
      await addDoc(collection(this.db, 'operation_logs'), logEntry);
    } catch (error) {
      console.error('Error logging operation:', error);
      // Don't throw error for logging failures
    }
  }

  /**
   * Trigger MCP sync for external systems
   */
  private async triggerMCPSync(
    collectionName: string,
    operation: string,
    documentId: string
  ): Promise<void> {
    try {
      // This would integrate with MCP server for external sync
      // Implementation depends on specific MCP server capabilities
      console.log(`MCP Sync triggered: ${operation} on ${collectionName}/${documentId}`);
    } catch (error) {
      console.error('Error triggering MCP sync:', error);
      // Don't throw error for sync failures
    }
  }
}

// Export singleton instance
export const firestoreMCP = new FirestoreMCPOperations();

// Export convenience functions
export const createDocument = firestoreMCP.create.bind(firestoreMCP);
export const readDocument = firestoreMCP.read.bind(firestoreMCP);
export const readDocuments = firestoreMCP.readMany.bind(firestoreMCP);
export const updateDocument = firestoreMCP.update.bind(firestoreMCP);
export const deleteDocument = firestoreMCP.delete.bind(firestoreMCP);
export const batchOperations = firestoreMCP.batchOperations.bind(firestoreMCP);
export const runFirestoreTransaction = firestoreMCP.transaction.bind(firestoreMCP);
export const subscribeToDocument = firestoreMCP.subscribeToDocument.bind(firestoreMCP);
export const subscribeToCollection = firestoreMCP.subscribeToCollection.bind(firestoreMCP);
export const unsubscribeListener = firestoreMCP.unsubscribe.bind(firestoreMCP);
export const searchDocuments = firestoreMCP.searchDocuments.bind(firestoreMCP);
export const getCollectionStats = firestoreMCP.getCollectionStats.bind(firestoreMCP);

// Export types
export type { QueryOptions, PaginationOptions, BatchOperation, MCPSyncOptions };

// Default export
export default firestoreMCP;
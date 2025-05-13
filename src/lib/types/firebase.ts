/**
 * Type definitions for Firebase Auth and Firestore
 */

import { DecodedIdToken } from 'firebase-admin/auth';
import { DocumentData, DocumentReference } from 'firebase-admin/firestore';

/**
 * Extended DecodedIdToken with guaranteed uid property
 */
export interface AuthUser extends DecodedIdToken {
  uid: string;
}

/**
 * Menu item data structure
 */
export interface MenuItemData {
  name: string;
  description: string;
  price: number;
  type: "classic" | "infused";
  source: "broskis" | "partner";
  image?: string;
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Bulk operation result structure
 */
export interface BulkOperationResult {
  success: Array<{ id: string; data?: Record<string, unknown> }>;
  failed: Array<{ id: string; error: string }>;
}

/**
 * Verified item with document reference
 */
export interface VerifiedItem {
  docRef: DocumentReference<DocumentData>;
  docSnap: FirebaseFirestore.DocumentSnapshot<DocumentData>;
  id: string;
  validatedData?: Record<string, unknown>;
}
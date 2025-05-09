import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useFirestore<T extends DocumentData>(collectionName: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get a single document
  const getDocument = async (id: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  };

  // Get multiple documents with optional query constraints
  const getDocuments = async (constraints: QueryConstraint[] = []) => {
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (err) {
      setError(err as Error);
      return [];
    }
  };

  // Create or update a document
  const setDocument = async (id: string, data: Partial<T>) => {
    try {
      const docRef = doc(db, collectionName, id);
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date(),
      }, { merge: true });
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  };

  // Update a document
  const updateDocument = async (id: string, data: Partial<T>) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date(),
      });
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  };

  // Delete a document
  const deleteDocument = async (id: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  };

  // Subscribe to a document
  const subscribeToDocument = (id: string, callback: (data: T | null) => void) => {
    const docRef = doc(db, collectionName, id);
    return onSnapshot(docRef, (doc) => {
      callback(doc.exists() ? { id: doc.id, ...doc.data() } as T : null);
    });
  };

  // Subscribe to a collection
  const subscribeToCollection = (
    callback: (data: T[]) => void,
    constraints: QueryConstraint[] = []
  ) => {
    const q = query(collection(db, collectionName), ...constraints);
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      callback(data);
    });
  };

  return {
    loading,
    error,
    getDocument,
    getDocuments,
    setDocument,
    updateDocument,
    deleteDocument,
    subscribeToDocument,
    subscribeToCollection,
  };
} 
import type { StorageReference } from 'firebase/storage';
import type { CollectionReference, DocumentReference } from 'firebase/firestore';

interface FirebaseApp {
  storage: () => Storage;
  firestore: () => Firestore;
  currentUser?: { uid: string };
}

interface Storage {
  ref: (path?: string) => StorageReference;
}

interface Firestore {
  collection: (path: string) => CollectionReference;
  doc: (path: string) => DocumentReference;
}

"use client";

import React, { useState, useRef } from "react"; // Added React import
import { Button } from "../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

// Define a more specific type for the user prop
interface User {
  uid: string;
  name?: string; // Assuming name can be optional
  photoURL?: string; // Assuming photoURL can be optional
}

// Define types for Firebase services to avoid 'any'
// These are simplified; for a real app, import types from 'firebase/app', 'firebase/storage', 'firebase/firestore'
interface FirebaseStorageRef {
  child: (path: string) => FirebaseStorageRef;
  put: (file: File) => Promise<any>; // Replace 'any' with actual UploadTaskSnapshot if using firebase/storage types
  getDownloadURL: () => Promise<string>;
}

interface FirebaseStorage {
  ref: (path?: string) => FirebaseStorageRef;
}

interface FirebaseFirestoreDocRef {
  update: (data: Record<string, any>) => Promise<void>;
}

interface FirebaseFirestoreCollectionRef {
  doc: (documentPath: string) => FirebaseFirestoreDocRef;
}

interface FirebaseFirestore {
  collection: (collectionPath: string) => FirebaseFirestoreCollectionRef;
}

interface FirebaseApp {
  storage: () => FirebaseStorage;
  firestore: () => FirebaseFirestore;
}

// Helper to safely access the Firebase instance from window
const getFirebase = (): FirebaseApp | undefined => {
  return (window as any).firebase as FirebaseApp | undefined;
};

export default function AvatarUpload({
  user,
  onUpload,
}: {
  user: User;
  onUpload?: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const firebaseApp = getFirebase();
    if (!firebaseApp) {
      alert("Firebase is not available.");
      setUploading(false);
      return;
    }

    try {
      // Upload to Firebase Storage
      const storageRef = firebaseApp.storage().ref();
      const avatarRef = storageRef.child(`avatars/${user.uid}`);
      await avatarRef.put(file);
      const url = await avatarRef.getDownloadURL();

      // Update Firestore user profile
      await firebaseApp
        .firestore()
        .collection("users")
        .doc(user.uid)
        .update({ photoURL: url });

      if (onUpload) onUpload(url);
    } catch (err: unknown) {
      console.error("Failed to upload avatar:", err); // Log the error for debugging
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar className="w-24 h-24">
        <AvatarImage
          src={preview || user.photoURL}
          alt={user.name || "User Avatar"}
        />
        <AvatarFallback>{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
      </Avatar>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => {
          void handleFileChange(e);
        }} // Added void to handle promise for onChange
        disabled={uploading}
      />
      <Button
        size="sm"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Change Avatar"}
      </Button>
    </div>
  );
}

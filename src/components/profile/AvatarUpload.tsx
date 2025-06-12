'use client';

import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '../../lib/firebase-config';

interface User {
  uid: string;
  name?: string;
  photoURL?: string;
}

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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      // Create storage reference
      const storageRef = ref(storage, `profile-images/${user.uid}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update Firestore user profile
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        photoURL: downloadURL,
        updatedAt: new Date().toISOString()
      });

      if (onUpload) {
        onUpload(downloadURL);
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
       setUploading(false);
     }
   };

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar className="w-24 h-24">
        <AvatarImage
          src={preview || user.photoURL}
          alt={user.name || 'User Avatar'}
        />
        <AvatarFallback>{user.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
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
        {uploading ? 'Uploading...' : 'Change Avatar'}
      </Button>
    </div>
  );
}

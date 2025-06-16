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
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadId = useRef(`avatar-upload-${Math.random().toString(36).substr(2, 9)}`);
  const errorId = useRef(`avatar-error-${Math.random().toString(36).substr(2, 9)}`);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
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
      
      // Announce success to screen readers
      const successMessage = 'Avatar uploaded successfully';
      // Create a temporary element for screen reader announcement
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = successMessage;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      setError('Failed to upload avatar. Please try again.');
    } finally {
       setUploading(false);
     }
   };

  return (
    <div className="flex flex-col items-center gap-2" role="group" aria-labelledby={uploadId.current}>
      <div className="relative">
        <Avatar className="w-24 h-24">
          <AvatarImage
            src={preview || user.photoURL}
            alt={`${user.name || 'User'}'s profile picture`}
          />
          <AvatarFallback aria-label={`${user.name || 'User'} initials`}>
            {user.name?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        {uploading && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full"
            role="status"
            aria-live="polite"
            aria-label="Uploading avatar"
          >
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          </div>
        )}
      </div>
      
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        ref={fileInputRef}
        onChange={(e) => {
          void handleFileChange(e);
        }}
        disabled={uploading}
        aria-label="Select avatar image file"
        aria-describedby={error ? errorId.current : undefined}
      />
      
      <Button
        id={uploadId.current}
        size="sm"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        aria-describedby={error ? errorId.current : undefined}
        className="focus-ring"
      >
        {uploading ? (
          <>
            <span className="sr-only">Uploading avatar, please wait</span>
            <span aria-hidden="true">Uploading...</span>
          </>
        ) : (
          'Change Avatar'
        )}
      </Button>
      
      {error && (
        <p 
          id={errorId.current}
          className="text-sm text-red-600 mt-1"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      )}
      
      <p className="text-xs text-gray-500 text-center max-w-xs">
        Supported formats: JPG, PNG, GIF. Maximum size: 5MB.
      </p>
    </div>
  );
}

"use client"

import { useState, useRef } from 'react'
import { Button } from '../ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'

// You need to have Firebase client SDK initialized in your app
// and firebase.storage() available

export default function AvatarUpload({ user, onUpload }: { user: any, onUpload?: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      // Upload to Firebase Storage
      const storageRef = (window as any).firebase.storage().ref()
      const avatarRef = storageRef.child(`avatars/${user.uid}`)
      await avatarRef.put(file)
      const url = await avatarRef.getDownloadURL()
      // Update Firestore user profile
      await (window as any).firebase.firestore().collection('users').doc(user.uid).update({ photoURL: url })
      if (onUpload) onUpload(url)
    } catch (err) {
      alert('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar className="w-24 h-24">
        <AvatarImage src={preview || user.photoURL} alt={user.name} />
        <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
      </Avatar>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
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
  )
} 
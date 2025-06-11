import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-hot-toast';

interface UploadOptions {
  folder: string;
  fileName?: string;
  generateThumbnail?: boolean;
  maxFileSize?: number;
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
  onComplete?: (downloadUrl: string) => void;
  onError?: (error: Error) => void;
}

interface FileInfo {
  name: string;
  size: number;
  contentType: string;
  created: string;
  updated: string;
  downloadUrl: string;
  metadata?: Record<string, any>;
}

interface UploadResult {
  downloadUrl: string;
  filePath: string;
  thumbnails?: string[];
}

class AdvancedStorageClient {
  private storage = getStorage();
  private functions = getFunctions();
  private auth = getAuth();

  /**
   * Upload file with progress tracking and resumable uploads for large files
   */
  async uploadFile(
    file: File,
    options: UploadOptions
  ): Promise<UploadResult> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to upload files');
    }

    // Validate file
    this.validateFile(file, options);

    const fileName = options.fileName || this.generateFileName(file.name);
    const filePath = `${options.folder}/${user.uid}/${fileName}`;
    const storageRef = ref(this.storage, filePath);

    try {
      // For large files (>5MB), use resumable upload with signed URL
      if (file.size > 5 * 1024 * 1024) {
        return await this.uploadLargeFile(file, filePath, options);
      }

      // For smaller files, use direct upload
      return await this.uploadSmallFile(file, storageRef, filePath, options);
    } catch (error: any) {
      const errorMessage = this.getUploadErrorMessage(error.code);
      options.onError?.(new Error(errorMessage));
      throw new Error(errorMessage);
    }
  }

  /**
   * Upload large file using resumable upload
   */
  private async uploadLargeFile(
    file: File,
    filePath: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    // Get signed upload URL from Cloud Function
    const generateUploadUrl = httpsCallable(this.functions, 'generateUploadUrl');
    
    const { data } = await generateUploadUrl({
      filePath,
      options: {
        userId: this.auth.currentUser?.uid,
        folder: options.folder,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
        generateThumbnail: options.generateThumbnail,
      },
    });

    const { uploadUrl, type } = data as { uploadUrl: string; type: string };

    if (type === 'resumable') {
      return await this.performResumableUpload(file, uploadUrl, filePath, options);
    } else {
      return await this.performSignedUpload(file, uploadUrl, filePath, options);
    }
  }

  /**
   * Perform resumable upload for very large files
   */
  private async performResumableUpload(
    file: File,
    uploadUrl: string,
    filePath: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    const chunkSize = 256 * 1024; // 256KB chunks
    let uploadedBytes = 0;

    while (uploadedBytes < file.size) {
      const chunk = file.slice(uploadedBytes, uploadedBytes + chunkSize);
      const endByte = Math.min(uploadedBytes + chunkSize, file.size);

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Range': `bytes ${uploadedBytes}-${endByte - 1}/${file.size}`,
          'Content-Type': file.type,
        },
        body: chunk,
      });

      if (response.status === 308) {
        // Continue uploading
        uploadedBytes = endByte;
        const progress = (uploadedBytes / file.size) * 100;
        options.onProgress?.(progress);
      } else if (response.status === 200 || response.status === 201) {
        // Upload complete
        const downloadUrl = await getDownloadURL(ref(this.storage, filePath));
        const result: UploadResult = { downloadUrl, filePath };

        // Generate thumbnails if requested
        if (options.generateThumbnail && file.type.startsWith('image/')) {
          result.thumbnails = await this.generateThumbnails(filePath);
        }

        options.onComplete?.(downloadUrl);
        return result;
      } else {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
    }

    throw new Error('Upload failed unexpectedly');
  }

  /**
   * Perform signed URL upload
   */
  private async performSignedUpload(
    file: File,
    uploadUrl: string,
    filePath: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const downloadUrl = await getDownloadURL(ref(this.storage, filePath));
    const result: UploadResult = { downloadUrl, filePath };

    // Generate thumbnails if requested
    if (options.generateThumbnail && file.type.startsWith('image/')) {
      result.thumbnails = await this.generateThumbnails(filePath);
    }

    options.onComplete?.(downloadUrl);
    return result;
  }

  /**
   * Upload small file using Firebase SDK
   */
  private async uploadSmallFile(
    file: File,
    storageRef: any,
    filePath: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    const uploadTask = uploadBytesResumable(storageRef, file, {
      customMetadata: {
        userId: this.auth.currentUser?.uid || '',
        folder: options.folder,
        originalName: file.name,
      },
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          options.onProgress?.(progress);
        },
        (error) => {
          options.onError?.(error);
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            const result: UploadResult = { downloadUrl, filePath };

            // Generate thumbnails if requested
            if (options.generateThumbnail && file.type.startsWith('image/')) {
              result.thumbnails = await this.generateThumbnails(filePath);
            }

            options.onComplete?.(downloadUrl);
            resolve(result);
          } catch (error: any) {
            options.onError?.(error);
            reject(error);
          }
        }
      );
    });
  }

  /**
   * Generate thumbnails using Cloud Function
   */
  private async generateThumbnails(filePath: string): Promise<string[]> {
    try {
      const processImage = httpsCallable(this.functions, 'processUploadedImage');
      const { data } = await processImage({ filePath });
      return (data as { generatedPaths: string[] }).generatedPaths;
    } catch (error) {
      console.warn('Failed to generate thumbnails:', error);
      return [];
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(filePath: string): Promise<FileInfo> {
    try {
      const storageRef = ref(this.storage, filePath);
      const downloadUrl = await getDownloadURL(storageRef);
      
      // Get metadata from Cloud Function for more detailed info
      const getFileInfo = httpsCallable(this.functions, 'getFileInfo');
      const { data } = await getFileInfo({ filePath });
      
      return data as FileInfo;
    } catch (error: any) {
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  /**
   * Delete file and its variants
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, filePath);
      await deleteObject(storageRef);
      
      // Also delete thumbnails and variants
      const basePath = filePath.replace(/\.[^/.]+$/, '');
      const folderRef = ref(this.storage, basePath.substring(0, basePath.lastIndexOf('/')));
      
      const listResult = await listAll(folderRef);
      const deletePromises = listResult.items
        .filter(item => item.name.startsWith(basePath.split('/').pop() || ''))
        .map(item => deleteObject(item));
      
      await Promise.all(deletePromises);
      
      toast.success('File deleted successfully');
    } catch (error: any) {
      const errorMessage = `Failed to delete file: ${error.message}`;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * List user files in a folder
   */
  async listFiles(folder: string): Promise<FileInfo[]> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to list files');
    }

    try {
      const folderRef = ref(this.storage, `${folder}/${user.uid}`);
      const listResult = await listAll(folderRef);
      
      const fileInfoPromises = listResult.items.map(async (item) => {
        try {
          return await this.getFileInfo(item.fullPath);
        } catch (error) {
          // Return basic info if detailed info fails
          const downloadUrl = await getDownloadURL(item);
          return {
            name: item.name,
            size: 0,
            contentType: 'unknown',
            created: '',
            updated: '',
            downloadUrl,
          };
        }
      });
      
      return await Promise.all(fileInfoPromises);
    } catch (error: any) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File, options: UploadOptions): void {
    // Check file size
    const maxSize = options.maxFileSize || 100 * 1024 * 1024; // 100MB default
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
    }

    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }

    // Check file name
    if (file.name.length > 255) {
      throw new Error('File name is too long');
    }
  }

  /**
   * Generate unique file name
   */
  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
    
    return `${baseName}_${timestamp}_${randomString}.${extension}`;
  }

  /**
   * Get user-friendly error message
   */
  private getUploadErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'storage/unauthorized':
        return 'You do not have permission to upload files';
      case 'storage/canceled':
        return 'Upload was cancelled';
      case 'storage/quota-exceeded':
        return 'Storage quota exceeded';
      case 'storage/invalid-format':
        return 'Invalid file format';
      case 'storage/invalid-event-name':
        return 'Invalid upload event';
      case 'storage/invalid-url':
        return 'Invalid upload URL';
      case 'storage/invalid-argument':
        return 'Invalid upload argument';
      case 'storage/no-default-bucket':
        return 'No default storage bucket configured';
      case 'storage/cannot-slice-blob':
        return 'Cannot process file';
      case 'storage/server-file-wrong-size':
        return 'File size mismatch';
      default:
        return 'Upload failed. Please try again.';
    }
  }
}

export const advancedStorageClient = new AdvancedStorageClient();
export default advancedStorageClient;
export type { UploadOptions, FileInfo, UploadResult };
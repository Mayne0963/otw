import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { advancedStorageClient, UploadOptions, UploadResult, FileInfo } from '../lib/storage/advancedStorageClient';
import { useAuth } from '../contexts/AuthContext';

interface UseAdvancedStorageOptions {
  folder: string;
  autoLoad?: boolean;
  maxFileSize?: number;
  allowedTypes?: string[];
  generateThumbnail?: boolean;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFiles: UploadResult[];
}

interface StorageState {
  files: FileInfo[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const useAdvancedStorage = (options: UseAdvancedStorageOptions) => {
  const { user } = useAuth();
  const {
    folder,
    autoLoad = true,
    maxFileSize = 100 * 1024 * 1024, // 100MB
    allowedTypes = ['image/*', 'application/pdf', 'text/*'],
    generateThumbnail = true,
  } = options;

  // Upload state
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedFiles: [],
  });

  // Storage state
  const [storageState, setStorageState] = useState<StorageState>({
    files: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  // Load files from storage
  const loadFiles = useCallback(async () => {
    if (!user) {
      setStorageState(prev => ({
        ...prev,
        files: [],
        error: 'User not authenticated',
        isLoading: false,
      }));
      return;
    }

    setStorageState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const files = await advancedStorageClient.listFiles(folder);
      setStorageState({
        files,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load files';
      setStorageState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  }, [user, folder]);

  // Upload single file
  const uploadFile = useCallback(
    async (file: File, customOptions?: Partial<UploadOptions>): Promise<UploadResult | null> => {
      if (!user) {
        toast.error('Please sign in to upload files');
        return null;
      }

      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
      }));

      const uploadOptions: UploadOptions = {
        folder,
        maxFileSize,
        allowedTypes,
        generateThumbnail: generateThumbnail && file.type.startsWith('image/'),
        ...customOptions,
        onProgress: (progress) => {
          setUploadState(prev => ({ ...prev, progress }));
          customOptions?.onProgress?.(progress);
        },
        onComplete: (downloadUrl) => {
          customOptions?.onComplete?.(downloadUrl);
        },
        onError: (error) => {
          setUploadState(prev => ({
            ...prev,
            error: error.message,
            isUploading: false,
          }));
          customOptions?.onError?.(error);
        },
      };

      try {
        const result = await advancedStorageClient.uploadFile(file, uploadOptions);
        
        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          progress: 100,
          uploadedFiles: [...prev.uploadedFiles, result],
        }));

        // Refresh file list
        await loadFiles();
        
        toast.success('File uploaded successfully');
        return result;
      } catch (error: any) {
        const errorMessage = error.message || 'Upload failed';
        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          error: errorMessage,
        }));
        toast.error(errorMessage);
        return null;
      }
    },
    [user, folder, maxFileSize, allowedTypes, generateThumbnail, loadFiles]
  );

  // Upload multiple files
  const uploadFiles = useCallback(
    async (files: File[], customOptions?: Partial<UploadOptions>): Promise<UploadResult[]> => {
      if (!user) {
        toast.error('Please sign in to upload files');
        return [];
      }

      if (files.length === 0) {
        return [];
      }

      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
      }));

      const results: UploadResult[] = [];
      let completedUploads = 0;

      try {
        const uploadPromises = files.map(async (file, index) => {
          const uploadOptions: UploadOptions = {
            folder,
            maxFileSize,
            allowedTypes,
            generateThumbnail: generateThumbnail && file.type.startsWith('image/'),
            ...customOptions,
            onProgress: (progress) => {
              const totalProgress = ((completedUploads * 100) + progress) / files.length;
              setUploadState(prev => ({ ...prev, progress: totalProgress }));
            },
            onComplete: (downloadUrl) => {
              completedUploads++;
              customOptions?.onComplete?.(downloadUrl);
            },
            onError: (error) => {
              customOptions?.onError?.(error);
            },
          };

          const result = await advancedStorageClient.uploadFile(file, uploadOptions);
          results.push(result);
          return result;
        });

        await Promise.all(uploadPromises);

        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          progress: 100,
          uploadedFiles: [...prev.uploadedFiles, ...results],
        }));

        // Refresh file list
        await loadFiles();
        
        toast.success(`Successfully uploaded ${results.length} file(s)`);
        return results;
      } catch (error: any) {
        const errorMessage = error.message || 'Upload failed';
        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          error: errorMessage,
        }));
        toast.error(errorMessage);
        return results; // Return partial results
      }
    },
    [user, folder, maxFileSize, allowedTypes, generateThumbnail, loadFiles]
  );

  // Delete file
  const deleteFile = useCallback(
    async (filePath: string): Promise<boolean> => {
      if (!user) {
        toast.error('Please sign in to delete files');
        return false;
      }

      try {
        await advancedStorageClient.deleteFile(filePath);
        
        // Remove from local state
        setStorageState(prev => ({
          ...prev,
          files: prev.files.filter(file => !filePath.includes(file.name)),
        }));
        
        // Refresh file list to ensure consistency
        await loadFiles();
        
        return true;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to delete file';
        toast.error(errorMessage);
        return false;
      }
    },
    [user, loadFiles]
  );

  // Get file info
  const getFileInfo = useCallback(
    async (filePath: string): Promise<FileInfo | null> => {
      try {
        return await advancedStorageClient.getFileInfo(filePath);
      } catch (error: any) {
        toast.error('Failed to get file information');
        return null;
      }
    },
    []
  );

  // Clear upload state
  const clearUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedFiles: [],
    });
  }, []);

  // Refresh files
  const refreshFiles = useCallback(() => {
    return loadFiles();
  }, [loadFiles]);

  // Filter files by type
  const getFilesByType = useCallback(
    (type: string) => {
      return storageState.files.filter(file => 
        file.contentType.startsWith(type)
      );
    },
    [storageState.files]
  );

  // Get images only
  const getImages = useCallback(() => {
    return getFilesByType('image/');
  }, [getFilesByType]);

  // Get documents only
  const getDocuments = useCallback(() => {
    return storageState.files.filter(file => 
      file.contentType.includes('pdf') ||
      file.contentType.includes('document') ||
      file.contentType.includes('text')
    );
  }, [storageState.files]);

  // Calculate total storage used
  const getTotalStorageUsed = useCallback(() => {
    return storageState.files.reduce((total, file) => total + file.size, 0);
  }, [storageState.files]);

  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Auto-load files when user changes or component mounts
  useEffect(() => {
    if (autoLoad && user) {
      loadFiles();
    }
  }, [autoLoad, user, loadFiles]);

  return {
    // Upload state
    isUploading: uploadState.isUploading,
    uploadProgress: uploadState.progress,
    uploadError: uploadState.error,
    uploadedFiles: uploadState.uploadedFiles,
    
    // Storage state
    files: storageState.files,
    isLoadingFiles: storageState.isLoading,
    filesError: storageState.error,
    lastUpdated: storageState.lastUpdated,
    
    // Actions
    uploadFile,
    uploadFiles,
    deleteFile,
    getFileInfo,
    loadFiles,
    refreshFiles,
    clearUploadState,
    
    // Utilities
    getFilesByType,
    getImages,
    getDocuments,
    getTotalStorageUsed,
    formatFileSize,
    
    // Computed values
    totalFiles: storageState.files.length,
    totalStorageUsed: getTotalStorageUsed(),
    hasFiles: storageState.files.length > 0,
    canUpload: !!user && !uploadState.isUploading,
  };
};

export default useAdvancedStorage;
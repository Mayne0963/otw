import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { advancedStorageClient, UploadOptions, UploadResult } from '../../lib/storage/advancedStorageClient';
import { useAuth } from '../../contexts/AuthContext';

interface AdvancedFileUploadProps {
  folder: string;
  allowedTypes?: string[];
  maxFileSize?: number;
  generateThumbnail?: boolean;
  multiple?: boolean;
  onUploadComplete?: (results: UploadResult[]) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  result?: UploadResult;
  error?: string;
}

const AdvancedFileUpload: React.FC<AdvancedFileUploadProps> = ({
  folder,
  allowedTypes = ['image/*', 'application/pdf', 'text/*'],
  maxFileSize = 100 * 1024 * 1024, // 100MB
  generateThumbnail = true,
  multiple = true,
  onUploadComplete,
  onUploadError,
  className = '',
}) => {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!user) {
        toast.error('Please sign in to upload files');
        return;
      }

      if (acceptedFiles.length === 0) {
        toast.error('No valid files selected');
        return;
      }

      setIsUploading(true);
      const newUploads: UploadProgress[] = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: 'uploading',
      }));

      setUploads(newUploads);

      const uploadPromises = acceptedFiles.map(async (file, index) => {
        const options: UploadOptions = {
          folder,
          generateThumbnail: generateThumbnail && file.type.startsWith('image/'),
          maxFileSize,
          allowedTypes,
          onProgress: (progress) => {
            setUploads((prev) =>
              prev.map((upload, i) =>
                i === index ? { ...upload, progress } : upload
              )
            );
          },
          onComplete: (downloadUrl) => {
            setUploads((prev) =>
              prev.map((upload, i) =>
                i === index
                  ? {
                      ...upload,
                      status: 'completed',
                      progress: 100,
                      result: { downloadUrl, filePath: `${folder}/${user.uid}/${file.name}` },
                    }
                  : upload
              )
            );
          },
          onError: (error) => {
            setUploads((prev) =>
              prev.map((upload, i) =>
                i === index
                  ? {
                      ...upload,
                      status: 'error',
                      error: error.message,
                    }
                  : upload
              )
            );
            onUploadError?.(error);
          },
        };

        try {
          const result = await advancedStorageClient.uploadFile(file, options);
          return result;
        } catch (error: any) {
          console.error('Upload failed:', error);
          throw error;
        }
      });

      try {
        const results = await Promise.allSettled(uploadPromises);
        const successfulResults = results
          .filter((result): result is PromiseFulfilledResult<UploadResult> => 
            result.status === 'fulfilled'
          )
          .map((result) => result.value);

        if (successfulResults.length > 0) {
          onUploadComplete?.(successfulResults);
          toast.success(`Successfully uploaded ${successfulResults.length} file(s)`);
        }

        const failedCount = results.length - successfulResults.length;
        if (failedCount > 0) {
          toast.error(`Failed to upload ${failedCount} file(s)`);
        }
      } catch (error: any) {
        toast.error('Upload failed: ' + error.message);
      } finally {
        setIsUploading(false);
      }
    },
    [user, folder, generateThumbnail, maxFileSize, allowedTypes, onUploadComplete, onUploadError]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    multiple,
    disabled: isUploading,
  });

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onDrop(files);
    }
  };

  const clearUploads = () => {
    setUploads([]);
  };

  const retryFailedUploads = () => {
    const failedFiles = uploads
      .filter((upload) => upload.status === 'error')
      .map((upload) => upload.file);
    
    if (failedFiles.length > 0) {
      onDrop(failedFiles);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'uploading':
        return (
          <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      case 'completed':
        return (
          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive && !isDragReject ? 'border-blue-400 bg-blue-50' : ''}
          ${isDragReject ? 'border-red-400 bg-red-50' : ''}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
          ${!isDragActive && !isDragReject ? 'border-gray-300' : ''}
        `}
      >
        <input {...getInputProps()} />
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={allowedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          {isDragActive ? (
            <p className="text-blue-600">
              {isDragReject ? 'Some files are not supported' : 'Drop files here...'}
            </p>
          ) : (
            <div>
              <p className="text-gray-600">
                Drag and drop files here, or{' '}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  browse
                </button>
              </p>
              <p className="text-sm text-gray-500">
                Max file size: {formatFileSize(maxFileSize)}
              </p>
              <p className="text-sm text-gray-500">
                Supported types: {allowedTypes.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Upload Progress ({uploads.filter(u => u.status === 'completed').length}/{uploads.length})
            </h3>
            <div className="space-x-2">
              {uploads.some(u => u.status === 'error') && (
                <button
                  onClick={retryFailedUploads}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  disabled={isUploading}
                >
                  Retry Failed
                </button>
              )}
              <button
                onClick={clearUploads}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                disabled={isUploading}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {uploads.map((upload, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(upload.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {upload.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(upload.file.size)}
                      </p>
                    </div>
                  </div>
                  
                  {upload.status === 'completed' && upload.result && (
                    <a
                      href={upload.result.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                    >
                      View
                    </a>
                  )}
                </div>

                {upload.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}

                {upload.status === 'error' && upload.error && (
                  <p className="text-sm text-red-600 mt-1">{upload.error}</p>
                )}

                {upload.status === 'completed' && upload.result?.thumbnails && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">
                      Thumbnails generated: {upload.result.thumbnails.length}
                    </p>
                    <div className="flex space-x-2">
                      {upload.result.thumbnails.slice(0, 3).map((thumbnail, i) => (
                        <img
                          key={i}
                          src={thumbnail}
                          alt={`Thumbnail ${i + 1}`}
                          className="w-8 h-8 object-cover rounded border"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFileUpload;
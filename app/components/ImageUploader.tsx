"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { logger } from "../../utils/logger";
import { UploadProgress, UploadService } from "../services/uploadService";

interface ImageUploaderProps {
  onUpload: (url: string, publicId: string) => void;
  folder?: string;
  className?: string;
  children?: React.ReactNode;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
  imageUrl?: string; // Optional image URL for preview
}

export default function ImageUploader({
  onUpload,
  folder = "general",
  className = "",
  children,
  accept = "image/*",
  maxSize = 5, // 5MB default
  disabled = false,
  imageUrl,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (!file.type.startsWith("image/")) {
        return "Please select a valid image file";
      }

      // Check file size
      const maxSizeBytes = maxSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return `File size must be less than ${maxSize}MB`;
      }

      return null;
    },
    [maxSize]
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null);
      setUploadProgress(null);

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsUploading(true);

      try {
        logger.business(
          `Starting image upload: ${file.name}`,
          "ImageUploader",
          {
            fileName: file.name,
            fileSize: file.size,
            folder,
          }
        );

        const result = await UploadService.uploadFile(
          file,
          folder,
          (progress) => {
            setUploadProgress(progress);
            logger.debug(
              `Upload progress: ${progress.percentage}%`,
              "ImageUploader",
              {
                loaded: progress.loaded,
                total: progress.total,
                percentage: progress.percentage,
              }
            );
          }
        );

        logger.business(
          `Image upload completed: ${result.url}`,
          "ImageUploader",
          {
            url: result.url,
            publicId: result.publicId,
          }
        );

        onUpload(result.url, result.publicId);
        setUploadProgress(null);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        logger.error(
          "Image upload failed",
          "ImageUploader",
          {
            fileName: file.name,
            folder,
          },
          error as Error
        );

        setError(errorMessage);
        setUploadProgress(null);
      } finally {
        setIsUploading(false);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [folder, onUpload, validateFile]
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (disabled || isUploading) return;

      const files = Array.from(event.dataTransfer.files);
      const imageFile = files.find((file) => file.type.startsWith("image/"));

      if (imageFile) {
        handleFileSelect(imageFile);
      } else {
        setError("Please drop a valid image file");
      }
    },
    [disabled, isUploading, handleFileSelect]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    []
  );

  const triggerFileSelect = useCallback(() => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled, isUploading]);

  return (
    <div
      className={`relative overflow-hidden ${className} w-[300px] h-[300px]`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Image Preview Overlay */}
      {imageUrl && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-70 rounded-lg transition-all duration-300 hover:bg-opacity-80 w-[300px] h-[300px]">
          <div className="relative flex items-center justify-center p-4">
            <Image
              src={imageUrl}
              alt="Image preview"
              className="object-contain rounded-md shadow-lg transition-transform duration-300 hover:scale-105"
              width={300}
              height={300}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpload("", ""); // Clear the image by calling onUpload with empty strings
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-md"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div
        onClick={triggerFileSelect}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${
            disabled || isUploading
              ? "border-gray-300 bg-gray-50 cursor-not-allowed"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }
          ${error ? "border-red-300 bg-red-50" : ""}
        `}
      >
        {children || (
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div className="text-sm text-gray-600">
              {isUploading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    Click to upload
                  </span>
                  {" or drag and drop"}
                </>
              )}
            </div>
            <div className="text-xs text-gray-500">
              PNG, JPG, GIF up to {maxSize}MB
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && uploadProgress && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2">
                <svg
                  className="w-16 h-16 text-blue-600 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
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
              </div>
              <div className="text-sm font-medium text-gray-900">
                Uploading... {uploadProgress.percentage}%
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2 mx-auto mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </div>
      )}
    </div>
  );
}

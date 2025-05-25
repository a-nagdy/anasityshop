import Image from "next/image";
import { useRef, useState } from "react";
import { uploadFileToCloudinary } from "../utils/clientFileUpload";

type ImageUploaderProps = {
  imageUrl: string;
  onImageChange: (url: string) => void;
  onFileUpload?: (file: File) => void;
  preview?: boolean;
  previewSize?: "small" | "medium" | "large";
  label?: string;
  placeholder?: string;
  className?: string;
};

const ImageUploader = ({
  imageUrl,
  onImageChange,
  onFileUpload,
  preview = true,
  previewSize = "medium",
  label = "Image",
  className = "",
}: ImageUploaderProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image preview sizes
  const previewSizes = {
    small: "h-20 w-20",
    medium: "h-32 w-32",
    large: "h-64 w-full",
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a temporary preview URL for the selected image
    const previewUrl = URL.createObjectURL(file);
    onImageChange(previewUrl); // Set temporary preview

    // If onFileUpload callback is provided, call it with the file
    if (onFileUpload) {
      onFileUpload(file);
    } else {
      // Otherwise, upload to Cloudinary
      await uploadImageToCloudinary(file);
    }

    // Close dropdown after selection
    setIsDropdownOpen(false);
  };


  const uploadImageToCloudinary = async (file: File) => {
    let progressInterval: NodeJS.Timeout | undefined;
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Start progress animation
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          return prev < 90 ? prev + 10 : prev;
        });
      }, 300);

      // Actually upload the file to Cloudinary
      const result = await uploadFileToCloudinary(file, 'categories');
      
      // Update with the real Cloudinary URL
      if (result && result.url) {
        onImageChange(result.url);
      }

      // Complete the progress bar
      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

      return result;
    } catch (error) {
      console.error('Error uploading image:', error);
      if (progressInterval) clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Failed to upload image. Please try again.');
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      {/* Preview Container */}
      {preview && (
        <div
          className={`relative ${previewSizes[previewSize]} border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700 flex items-center justify-center mb-2`}
        >
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt="Preview"
                fill
                className="object-contain"
              />
              <button
                type="button"
                onClick={() => onImageChange("")}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </>
          ) : (
            <div className="text-center p-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                No image selected
              </p>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
              <p className="mb-2">Uploading... {uploadProgress}%</p>
              <div className="w-3/4 bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dropdown Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow transition-colors"
        >
          <span>Add Image</span>
          <svg
            className={`w-4 h-4 ml-2 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
            {/* Upload from PC Option */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
            >
              <svg
                className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Upload from device
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
      
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;

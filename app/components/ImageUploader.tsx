import Image from "next/image";
import { useRef, useState } from "react";

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
  placeholder = "Enter image URL",
  className = "",
}: ImageUploaderProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [urlInput, setUrlInput] = useState(imageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image preview sizes
  const previewSizes = {
    small: "h-20 w-20",
    medium: "h-32 w-32",
    large: "h-64 w-full",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview URL for the selected image
    const previewUrl = URL.createObjectURL(file);
    onImageChange(previewUrl);

    // If onFileUpload callback is provided, call it with the file
    if (onFileUpload) {
      onFileUpload(file);
    } else {
      // Otherwise, simulate upload
      simulateImageUpload(file);
    }

    // Close dropdown after selection
    setIsDropdownOpen(false);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onImageChange(urlInput.trim());
      setIsDropdownOpen(false);
    }
  };

  const simulateImageUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress updates
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
            // Log the file name to use the parameter and avoid linting error
            console.log(`Upload simulated for: ${file.name}`);
          }, 500);
        }
        return newProgress;
      });
    }, 300);
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

            {/* URL Input Option */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleUrlSubmit} className="flex">
                <input
                  type="text"
                  value={urlInput}
                  onChange={handleUrlChange}
                  placeholder={placeholder}
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-r-md"
                >
                  Add
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;

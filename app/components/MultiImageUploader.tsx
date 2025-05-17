import Image from "next/image";
import { useRef, useState } from "react";

type MultiImageUploaderProps = {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onFileUpload?: (file: File) => void;
  label?: string;
  placeholder?: string;
  maxImages?: number;
  className?: string;
};

const MultiImageUploader = ({
  images,
  onImagesChange,
  onFileUpload,
  label = "Images",
  placeholder = "Enter image URL",
  maxImages = 10,
  className = "",
}: MultiImageUploaderProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Create preview URLs for all selected images
    Array.from(files).forEach((file) => {
      if (images.length >= maxImages) return;

      const imageUrl = URL.createObjectURL(file);

      // If onFileUpload callback is provided, call it with the file
      if (onFileUpload) {
        onFileUpload(file);
      } else {
        // Otherwise, simulate upload
        simulateImageUpload(file, (uploadedUrl) => {
          onImagesChange([...images, uploadedUrl || imageUrl]);
        });
      }
    });

    // Close dropdown after selection
    setIsDropdownOpen(false);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim() && images.length < maxImages) {
      onImagesChange([...images, urlInput.trim()]);
      setUrlInput("");
      setIsDropdownOpen(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const simulateImageUpload = (
    file: File,
    callback: (url?: string) => void
  ) => {
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
            // In a real implementation, this would be the URL returned by your server
            callback(`https://example.com/uploads/${file.name}`);
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

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
        {images.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="relative h-24 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700"
          >
            <Image
              src={image}
              alt={`Image ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
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
          </div>
        ))}

        {/* Add more images button - only shown if below max images */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => setIsDropdownOpen(true)}
            className="h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Add image
            </span>
          </button>
        )}
      </div>

      {/* Upload Progress Indicator */}
      {isUploading && (
        <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md">
          <p className="mb-1 text-sm text-blue-700 dark:text-blue-300">
            Uploading... {uploadProgress}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

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
            multiple
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
  );
};

export default MultiImageUploader;

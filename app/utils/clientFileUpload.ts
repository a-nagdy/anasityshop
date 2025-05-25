import axios from 'axios';

/**
 * Upload a file to the server, which will then upload it to Cloudinary
 * @param file The file to upload
 * @param folder The folder to upload to in Cloudinary
 * @returns The upload result with URL and public ID
 */
export const uploadFileToCloudinary = async (file: File, folder: string = 'general') => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    // Upload to our API endpoint
    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        // You can use this to track upload progress if needed
        console.log(`Upload progress: ${Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))}%`);
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

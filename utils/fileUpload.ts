import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadResult {
    url: string;
    publicId: string;
}

interface FileBuffer {
    buffer: Buffer;
    mimetype: string;
}

// Upload file to Cloudinary
export const uploadFile = async (file: FileBuffer, folder: string): Promise<UploadResult> => {
    try {
        if (!file) {
            throw new Error('No file provided');
        }

        // Convert to base64 for Cloudinary upload from buffer
        const base64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${base64}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: folder,
            resource_type: 'auto',
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
        };
    } catch (error: unknown) {
        console.error('File upload error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
        throw new Error(`File upload failed: ${errorMessage}`);
    }
};

// Delete file from Cloudinary
export const deleteFile = async (url: string, publicId?: string): Promise<void> => {
    try {
        if (!url) {
            return;
        }

        // If public_id is provided, use it directly
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
            return;
        }

        // Extract public_id from URL if not provided
        const urlParts = url.split('/');
        const fileNameWithExt = urlParts[urlParts.length - 1];
        const fileName = fileNameWithExt.split('.')[0];
        const folderPath = urlParts[urlParts.length - 2];
        const possiblePublicId = `${folderPath}/${fileName}`;

        await cloudinary.uploader.destroy(possiblePublicId);
    } catch (error: unknown) {
        console.error('File deletion error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown deletion error';
        throw new Error(`File deletion failed: ${errorMessage}`);
    }
}; 
import { NextRequest, NextResponse } from 'next/server';
import { rateLimiters } from '../../../middleware/rateLimiting';
import { ApiResponseHelper } from '../../../utils/apiResponse';
import connectToDatabase from '../../../utils/db';
import { Validator } from '../../../utils/validation';
import { uploadFile } from '../../../utils/fileUpload';

// File validation constants
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_FILE_SIZE = 1024; // 1KB

function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: `File size too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  if (file.size < MIN_FILE_SIZE) {
    return { isValid: false, error: 'File size too small. Minimum size is 1KB' };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { isValid: false, error: `File type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}` };
  }

  // Check file name
  if (!file.name || file.name.length > 255) {
    return { isValid: false, error: 'Invalid file name' };
  }

  return { isValid: true };
}

export async function POST(req: NextRequest) {
  return rateLimiters.upload(req, async (req) => {
    try {
      await connectToDatabase();

      const formData = await req.formData();
      const file = formData.get('file') as File;
      const folder = formData.get('folder') as string || 'general';
      const sanitizedFolder = Validator.sanitizeInput(folder) as string || 'general';

      console.log('Upload request received:', {
        hasFile: !!file,
        fileName: file?.name,
        fileSize: file?.size,
        fileType: file?.type,
        folder
      });

      if (!file) {
        return NextResponse.json(
          ApiResponseHelper.validationError({ file: 'No file provided' }),
          { status: 400 }
        );
      }

      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        return NextResponse.json(
          ApiResponseHelper.validationError({ file: validation.error || '' }),
          { status: 400 }
        );
      }

      // Validate folder parameter - allow nested folders
      const allowedFolderPrefixes = ['products', 'categories', 'banners', 'avatars', 'general', 'homepage'];
      const folderPrefix = sanitizedFolder.split('/')[0];
      if (!allowedFolderPrefixes.includes(folderPrefix)) {
        return NextResponse.json(
          ApiResponseHelper.validationError({ folder: `Invalid folder specified. Allowed prefixes: ${allowedFolderPrefixes.join(', ')}` }),
          { status: 400 }
        );
      }

      // Convert File to FileBuffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileBuffer = {
        buffer,
        mimetype: file.type,
        name: file.name,
      };

      console.log('Uploading to Cloudinary:', {
        folder,
        bufferSize: buffer.length,
        mimetype: fileBuffer.mimetype
      });

      // Upload to Cloudinary
      const uploadResult = await uploadFile(fileBuffer, sanitizedFolder);

      console.log('Upload successful:', {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      });

      return NextResponse.json(
        ApiResponseHelper.success(uploadResult, 'File uploaded successfully'),
        { status: 200 }
      );
    } catch (error: unknown) {
      console.error('Upload error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });

      return NextResponse.json(
        ApiResponseHelper.serverError(
          error instanceof Error ? error.message : 'File upload failed'
        ),
        { status: 500 }
      );
    }
  });
}

import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../utils/db';
import { uploadFile } from '../../../utils/fileUpload';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'general';

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
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

    // Upload to Cloudinary
    const uploadResult = await uploadFile(fileBuffer, folder);

    return NextResponse.json(uploadResult, { status: 200 });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred during upload' },
      { status: 500 }
    );
  }
}

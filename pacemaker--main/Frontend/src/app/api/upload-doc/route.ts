import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save directory: Frontend/public/uploads
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure uploads directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // already exists
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeFilename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const filePath = join(uploadDir, safeFilename);

    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, filename: safeFilename });
  } catch (err: any) {
    console.error('File upload error:', err);
    return NextResponse.json({ error: err.message || 'File upload failed' }, { status: 500 });
  }
}

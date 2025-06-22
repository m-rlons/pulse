import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

export async function POST(req: NextRequest) {
  try {
    // Ensure the upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filePath = join(UPLOAD_DIR, file.name);

    await writeFile(filePath, buffer);

    console.log(`File uploaded to: ${filePath}`);
    return NextResponse.json({ success: true, filename: file.name });

  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: `Upload failed: ${errorMessage}` }, { status: 500 });
  }
} 
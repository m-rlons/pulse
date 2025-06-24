import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

const UPLOADS_ROOT_DIR = join(process.cwd(), 'uploads');

type FileData = {
  name: string;
  size: number;
  lastModified: Date;
};

export async function GET(req: NextRequest) {
  try {
    const personaId = req.nextUrl.searchParams.get('personaId');

    if (!personaId) {
        return NextResponse.json({ success: false, error: 'No persona ID provided.' }, { status: 400 });
    }

    const personaUploadDir = join(UPLOADS_ROOT_DIR, personaId);

    const filenames = await readdir(personaUploadDir);
    const files: FileData[] = [];

    for (const filename of filenames) {
      // Skip system files like .DS_Store
      if (filename.startsWith('.')) {
        continue;
      }
      
      const filePath = join(personaUploadDir, filename);
      const stats = await stat(filePath);
      files.push({
        name: filename,
        size: stats.size,
        lastModified: stats.mtime,
      });
    }

    // Sort files by most recently modified
    files.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

    return NextResponse.json({ success: true, files });

  } catch (error) {
    // If the directory doesn't exist, return an empty array.
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        return NextResponse.json({ success: true, files: [] });
    }
    
    console.error('Failed to list files:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: `Failed to list files: ${errorMessage}` }, { status: 500 });
  }
} 
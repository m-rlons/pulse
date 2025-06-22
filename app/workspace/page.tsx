'use client';

import React from 'react';
import FileBrowser from '@/components/workspace/FileBrowser';
import FileUpload from '@/components/workspace/FileUpload';

export default function WorkspacePage() {
  return (
    <div className="h-full w-full">
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gray-50">
        <div className="w-full max-w-4xl">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Workspace</h1>
            <p className="text-lg text-gray-600 mt-2">
              Manage your documents and collaborate with your AI persona.
            </p>
          </header>

          <div className="space-y-8">
            <FileUpload />
            <FileBrowser />
          </div>
        </div>
      </main>
    </div>
  );
} 
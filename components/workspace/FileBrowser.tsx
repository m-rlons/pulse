'use client';

import React, { useEffect, useState } from 'react';

type Document = {
  name: string;
  size: number; // size in bytes
  lastModified: string; // ISO date string
};

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function FileBrowser() {
  const [files, setFiles] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFiles() {
      try {
        const response = await fetch('/api/files');
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch files.');
        }
        setFiles(data.files);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFiles();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Your Documents</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm font-light">
          <thead className="border-b font-medium dark:border-neutral-500">
            <tr>
              <th scope="col" className="px-6 py-4">Name</th>
              <th scope="col" className="px-6 py-4">Size</th>
              <th scope="col" className="px-6 py-4">Last Modified</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
                <tr>
                    <td colSpan={3} className="text-center p-6">
                        <div className="animate-pulse">Loading documents...</div>
                    </td>
                </tr>
            ) : error ? (
                <tr>
                    <td colSpan={3} className="text-center p-6 text-red-500">
                        {error}
                    </td>
                </tr>
            ) : files.length === 0 ? (
                <tr>
                    <td colSpan={3} className="text-center p-6 text-gray-500">
                        You haven't uploaded any documents yet.
                    </td>
                </tr>
            ) : (
                files.map((file) => (
                    <tr key={file.name} className="border-b transition duration-300 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-600">
                        <td className="whitespace-nowrap px-6 py-4 font-medium">{file.name}</td>
                        <td className="whitespace-nowrap px-6 py-4">{formatBytes(file.size)}</td>
                        <td className="whitespace-nowrap px-6 py-4">{formatDate(file.lastModified)}</td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
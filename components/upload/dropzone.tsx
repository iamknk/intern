'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { useDocumentStore } from '@/lib/store/document-store';

export function Dropzone() {
  const [error, setError] = useState<string | null>(null);
  const addDocument = useDocumentStore((state) => state.addDocument);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        setError('Please upload only PDF files');
        return;
      }

      if (acceptedFiles.length === 0) {
        setError('No files selected');
        return;
      }

      acceptedFiles.forEach((file) => {
        addDocument(file);
      });
    },
    [addDocument]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          flex flex-col items-center justify-center
          min-h-[250px] p-8 rounded-lg border-2 border-dashed
          transition-colors cursor-pointer
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}
        `}
      >
        <input {...getInputProps()} />
        
        <Upload className="w-10 h-10 text-gray-400 mb-4" />
        
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
          {isDragActive ? 'Drop files here' : 'Drag & drop PDF files'}
        </p>
        
        <p className="text-sm text-gray-500">or click to select</p>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}


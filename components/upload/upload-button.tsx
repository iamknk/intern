'use client';

import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocumentStore } from '@/lib/store/document-store';

export function UploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addDocument = useDocumentStore((state) => state.addDocument);
  const activeDatasetId = useDocumentStore((state) => state.activeDatasetId);
  const createDataset = useDocumentStore((state) => state.createDataset);
  const updateDocumentStatus = useDocumentStore((state) => state.updateDocumentStatus);
  const setDocumentData = useDocumentStore((state) => state.setDocumentData);

  const processFile = async (file: File, documentId: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const uploadResult = await uploadResponse.json();
      updateDocumentStatus(documentId, 'processing');

      const extractResponse = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: uploadResult.documentId,
          filename: file.name,
        }),
      });

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.error || 'Extraction failed');
      }

      const extractResult = await extractResponse.json();
      setDocumentData(documentId, extractResult.extractedData, extractResult.qualityScore);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Processing failed';
      updateDocumentStatus(documentId, 'failed', errorMessage);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Ensure there is an active dataset; create a default one if none selected
    if (!activeDatasetId) {
      createDataset('Untitled');
    }

    // Process files without blocking the UI
    Array.from(files).forEach((file) => {
      if (file.type === 'application/pdf') {
        const documentId = addDocument(file);
        // Start processing in background (non-blocking)
        processFile(file, documentId);
      }
    });

    // Reset input immediately
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        Upload More
      </Button>
    </>
  );
}


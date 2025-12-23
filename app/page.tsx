'use client';

import { Dropzone } from "@/components/upload/dropzone";
import { DocumentsTable } from "@/components/documents/documents-table";
import { UploadButton } from "@/components/upload/upload-button";
import DatasetSelector from "@/components/datasets/dataset-selector";
import { useDocumentStore } from "@/lib/store/document-store";

export default function Home() {

  const hasDocuments = useDocumentStore((state) => state.documents.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                Geni AI Agent
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Upload your PDF documents lease agreements to get excel sheets with the data
              </p>
            </div>
            {hasDocuments && (
              <div className="flex items-center gap-3">
                <DatasetSelector />
                <UploadButton />
              </div>
            )}
          </div>

          {!hasDocuments ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <Dropzone />
            </div>
            ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <DocumentsTable />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

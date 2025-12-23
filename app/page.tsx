'use client';

import { Dropzone } from "@/components/upload/dropzone";
import { UploadQueue } from "@/components/upload/upload-queue";
import { UploadButton } from "@/components/upload/upload-button";
import { useDocumentStore } from "@/lib/store/document-store";

export default function Home() {
  const documents = useDocumentStore((state) => state.documents);
  const hasDocuments = documents.length > 0;

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
            {hasDocuments && <UploadButton />}
          </div>

          {!hasDocuments ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <Dropzone />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <UploadQueue />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

"use client";

import { Dropzone } from "@/components/upload/dropzone";
import { DocumentsTable } from "@/components/documents/documents-table";
import { UploadButton } from "@/components/upload/upload-button";
import DatasetSidebar from "@/components/datasets/dataset-sidebar";
import { DatasetDataTable } from "@/components/datasets/dataset-data-table";
import { useDocumentStore } from "@/lib/store/document-store";

export default function Home() {
  const hasDocuments = useDocumentStore((state) => state.documents.length > 0);
  const activeDatasetId = useDocumentStore((state) => state.activeDatasetId);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      <DatasetSidebar />

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header - only shows when viewing All Documents */}
          {!activeDatasetId && (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Geni AI Agent
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload your PDF documents lease agreements to get excel sheets
                  with the data
                </p>
              </div>
              {hasDocuments && <UploadButton />}
            </div>
          )}

          {!hasDocuments ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <Dropzone />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Documents Table - only shows when viewing All Documents */}
              {!activeDatasetId && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <DocumentsTable />
                </div>
              )}

              {/* Dataset Extracted Data Table - only shows when a dataset is selected */}
              {activeDatasetId && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <DatasetDataTable />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

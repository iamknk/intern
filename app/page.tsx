"use client";

import { useState, useEffect } from "react";
import { Dropzone } from "@/components/upload/dropzone";
import { DocumentsTable } from "@/components/documents/documents-table";
import { UploadButton } from "@/components/upload/upload-button";
import DatasetSidebar from "@/components/datasets/dataset-sidebar";
import { DatasetDataTable } from "@/components/datasets/dataset-data-table";
import { useDocumentStore } from "@/lib/store/document-store";
import { Menu, X, Loader2 } from "lucide-react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const hasDocuments = useDocumentStore((state) => state.documents.length > 0);
  const activeDatasetId = useDocumentStore((state) => state.activeDatasetId);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-950">
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between p-4 bg-gray-900 text-white">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-800 transition-hover touch-target"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Geni AI Agent</h1>
        <div className="w-10" />
      </div>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-72 sm:w-80 transform transition-transform duration-300 ease-out
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:w-64 lg:flex-shrink-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-hover z-10"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
        <DatasetSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-1 min-h-fit min-w-0 overflow-hidden">
        <div className="responsive-padding pt-4 sm:p-6 lg:pt-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 xl:max-w-none xl:px-8 2xl:px-12">
          {!activeDatasetId && !isLoading && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-page-title text-gray-900 dark:text-white hidden lg:block">
                  Geni AI Agent
                </h1>
                <p className="text-metadata">
                  Upload your lease agreements to get excel sheets with the data
                </p>
              </div>
              {hasDocuments && <UploadButton />}
            </div>
          )}

          {isLoading && !activeDatasetId ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  Loading...
                </p>
              </div>
            </div>
          ) : !hasDocuments ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 sm:p-6 lg:p-8">
              <Dropzone />
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {!activeDatasetId && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 sm:p-6">
                  <DocumentsTable />
                </div>
              )}

              {activeDatasetId && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 sm:p-6">
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

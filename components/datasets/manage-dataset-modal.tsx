"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDocumentStore } from "@/lib/store/document-store";
import { X, Plus, Check, Search } from "lucide-react";
import CreateDatasetModal from "@/components/datasets/create-dataset-modal";
import type { Dataset } from "@/lib/types";

interface ManageDatasetModalProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
}

export default function ManageDatasetModal({
  open,
  onClose,
  documentId,
}: ManageDatasetModalProps) {
  const datasets = useDocumentStore((s) => s.datasets);
  const documents = useDocumentStore((s) => s.documents);
  const addDocumentToDataset = useDocumentStore((s) => s.addDocumentToDataset);
  const removeDocumentFromDataset = useDocumentStore(
    (s) => s.removeDocumentFromDataset
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const document = documents.find((d) => d.id === documentId);
  const docDatasetIds = document?.datasetIds ?? [];

  if (!open) return null;

  const handleToggleDataset = (datasetId: string, isSelected: boolean) => {
    if (isSelected) {
      removeDocumentFromDataset(datasetId, documentId);
    } else {
      addDocumentToDataset(datasetId, documentId);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative w-[400px] max-h-[80vh] bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Manage Datasets</h3>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search datasets..."
                className="w-full pl-8 pr-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {datasets.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No datasets yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setCreateModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create your first dataset
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {datasets
                  .filter((d) =>
                    d.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((dataset: Dataset) => {
                    const isSelected = docDatasetIds.includes(dataset.id);
                    return (
                      <button
                        key={dataset.id}
                        onClick={() =>
                          handleToggleDataset(dataset.id, isSelected)
                        }
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-4 h-4 rounded-full shrink-0"
                            style={{ background: dataset.color ?? "#60a5fa" }}
                          />
                          <div className="text-left">
                            <p className="font-medium text-sm">
                              {dataset.name}
                            </p>
                            {dataset.description && (
                              <p className="text-xs text-gray-500 truncate max-w-[250px]">
                                {dataset.description}
                              </p>
                            )}
                          </div>
                        </div>
                        {isSelected ? (
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-blue-600" />
                            <X className="w-4 h-4 text-red-500 hover:text-red-600" />
                          </div>
                        ) : (
                          <Plus className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-4 border-t bg-gray-50 dark:bg-gray-800/50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Create New Dataset
            </Button>
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      </div>

      <CreateDatasetModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </>
  );
}

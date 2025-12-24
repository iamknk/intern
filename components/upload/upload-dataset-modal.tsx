"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useDocumentStore } from "@/lib/store/document-store";
import {
  X,
  FileText,
  Plus,
  Check,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CreateDatasetModal from "@/components/datasets/create-dataset-modal";
import type { Dataset } from "@/lib/types";

interface FileWithDatasets {
  file: File;
  datasetIds: string[];
}

interface UploadDatasetModalProps {
  open: boolean;
  onClose: () => void;
  files: File[];
  onConfirm: (filesWithDatasets: FileWithDatasets[]) => void;
}

export default function UploadDatasetModal({
  open,
  onClose,
  files,
  onConfirm,
}: UploadDatasetModalProps) {
  const datasets = useDocumentStore((s) => s.datasets);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize each file with empty dataset array
  const [fileAssignments, setFileAssignments] = useState<FileWithDatasets[]>(
    files.map((file) => ({ file, datasetIds: [] }))
  );

  // Update when files prop changes
  useEffect(() => {
    setFileAssignments(files.map((file) => ({ file, datasetIds: [] })));
    setCurrentIndex(0);
    setSearchQuery("");
  }, [files]);

  if (!open || files.length === 0) return null;

  const currentFile = fileAssignments[currentIndex];
  const isLastFile = currentIndex === files.length - 1;
  const isFirstFile = currentIndex === 0;

  const filteredDatasets = datasets.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDatasetToggle = (datasetId: string) => {
    setFileAssignments((prev) =>
      prev.map((item, idx) => {
        if (idx !== currentIndex) return item;
        const isSelected = item.datasetIds.includes(datasetId);
        return {
          ...item,
          datasetIds: isSelected
            ? item.datasetIds.filter((id) => id !== datasetId)
            : [...item.datasetIds, datasetId],
        };
      })
    );
  };

  const handleClearAll = () => {
    setFileAssignments((prev) =>
      prev.map((item, idx) =>
        idx === currentIndex ? { ...item, datasetIds: [] } : item
      )
    );
  };

  const handleNext = () => {
    if (isLastFile) {
      // Finish - upload all
      onConfirm(fileAssignments);
      onClose();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSearchQuery("");
    }
  };

  const handlePrevious = () => {
    if (!isFirstFile) {
      setCurrentIndex((prev) => prev - 1);
      setSearchQuery("");
    }
  };

  const handleSkipAll = () => {
    onConfirm(fileAssignments);
    onClose();
  };

  const selectedCount = currentFile?.datasetIds.length ?? 0;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative w-full max-w-[480px] max-h-[85vh] bg-white dark:bg-gray-900 rounded-lg shadow-modal overflow-hidden flex flex-col animate-modal-in">
          {/* Header with Document Info */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">
                Document {currentIndex + 1} of {files.length}
              </span>
              <button
                onClick={onClose}
                className="p-2 -mr-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-hover touch-target"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Name */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <FileText className="w-8 h-8 text-red-500 shrink-0" />
              <div className="min-w-0 flex-1">
                <p
                  className="font-medium text-sm truncate"
                  title={currentFile?.file.name}
                >
                  {currentFile?.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {((currentFile?.file.size ?? 0) / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          </div>

          {/* Dataset Selection */}
          <div className="flex-1 overflow-hidden flex flex-col p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Select datasets</h3>
              {selectedCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-hover"
                >
                  Clear all ({selectedCount})
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search datasets..."
                className="w-full pl-9 pr-3 py-2.5 h-11 sm:h-10 text-sm border rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-hover"
              />
            </div>

            {/* Dataset List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {/* Datasets */}
              {filteredDatasets.map((dataset: Dataset) => {
                const isSelected = currentFile?.datasetIds.includes(dataset.id);
                return (
                  <button
                    key={dataset.id}
                    onClick={() => handleDatasetToggle(dataset.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-hover touch-target ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ background: dataset.color ?? "#60a5fa" }}
                      />
                      <div className="text-left min-w-0">
                        <p className="text-sm font-medium truncate">
                          {dataset.name}
                        </p>
                        {dataset.description && (
                          <p className="text-xs text-gray-500 truncate">
                            {dataset.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-500 scale-110"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}

              {filteredDatasets.length === 0 && searchQuery && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No datasets found matching "{searchQuery}"
                </p>
              )}

              {/* Create New */}
              <button
                onClick={() => setCreateModalOpen(true)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-hover touch-target"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Create new dataset</span>
              </button>
            </div>
          </div>

          {/* Footer Navigation - Responsive */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 p-4 border-t bg-gray-50 dark:bg-gray-800/50">
            <div>
              {files.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipAll}
                  className="w-full sm:w-auto h-10 sm:h-9 touch-target"
                >
                  Skip all & Upload
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isFirstFile && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex-1 sm:flex-none h-10 sm:h-9 touch-target"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 sm:flex-none h-10 sm:h-9 touch-target"
              >
                {isLastFile ? (
                  <>
                    <span className="hidden sm:inline">
                      Upload {files.length}{" "}
                      {files.length === 1 ? "Document" : "Documents"}
                    </span>
                    <span className="sm:hidden">Upload ({files.length})</span>
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Dataset Modal */}
      <CreateDatasetModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </>
  );
}

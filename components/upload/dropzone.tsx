"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { useDocumentStore } from "@/lib/store/document-store";
import UploadDatasetModal from "./upload-dataset-modal";

interface FileWithDatasets {
  file: File;
  datasetIds: string[];
}

export function Dropzone() {
  const [error, setError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showDatasetModal, setShowDatasetModal] = useState(false);

  const addDocumentWithDatasets = useDocumentStore(
    (state) => state.addDocumentWithDatasets
  );
  const updateDocumentStatus = useDocumentStore(
    (state) => state.updateDocumentStatus
  );
  const setDocumentData = useDocumentStore((state) => state.setDocumentData);

  const processFile = async (file: File, documentId: string) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const uploadResult = await uploadResponse.json();

      updateDocumentStatus(documentId, "processing");

      const extractResponse = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: uploadResult.documentId,
          filename: file.name,
        }),
      });

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.error || "Extraction failed");
      }

      const extractResult = await extractResponse.json();

      setDocumentData(
        documentId,
        extractResult.extractedData,
        extractResult.qualityScore
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Processing failed";
      updateDocumentStatus(documentId, "failed", errorMessage);
      console.error("File processing error:", err);
    }
  };

  const handleConfirmUpload = (filesWithDatasets: FileWithDatasets[]) => {
    filesWithDatasets.forEach(({ file, datasetIds }) => {
      const documentId = addDocumentWithDatasets(file, datasetIds);
      processFile(file, documentId);
    });
    setPendingFiles([]);
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      setError("Please upload only PDF files");
      return;
    }

    if (acceptedFiles.length === 0) {
      setError("No files selected");
      return;
    }

    // Store files and show dataset assignment modal
    setPendingFiles(acceptedFiles);
    setShowDatasetModal(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          flex flex-col items-center justify-center
          min-h-[200px] sm:min-h-[250px] p-6 sm:p-8 rounded-xl border-2 border-dashed
          transition-hover cursor-pointer
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
        </div>

        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-2 text-center">
          {isDragActive ? "Drop files here" : "Drag & drop PDF files"}
        </p>

        <p className="text-sm text-gray-500 text-center">or click to select</p>
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-status-error flex items-center gap-2">
          <span className="text-sm text-red-600 dark:text-red-400">
            {error}
          </span>
        </div>
      )}

      <UploadDatasetModal
        open={showDatasetModal}
        onClose={() => {
          setShowDatasetModal(false);
          setPendingFiles([]);
        }}
        files={pendingFiles}
        onConfirm={handleConfirmUpload}
      />
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocumentStore } from "@/lib/store/document-store";
import UploadDatasetModal from "./upload-dataset-modal";

interface FileWithDatasets {
  file: File;
  datasetIds: string[];
}

export function UploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        headers: { "Content-Type": "application/json" },
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
      toast.success("File processed", {
        description: `"${file.name}" has been uploaded and processed successfully.`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Processing failed";
      updateDocumentStatus(documentId, "failed", errorMessage);
      toast.error("Processing failed", {
        description: `Failed to process "${file.name}": ${errorMessage}`,
      });
    }
  };

  const handleConfirmUpload = (filesWithDatasets: FileWithDatasets[]) => {
    const fileCount = filesWithDatasets.length;
    filesWithDatasets.forEach(({ file, datasetIds }) => {
      const documentId = addDocumentWithDatasets(file, datasetIds);
      processFile(file, documentId);
    });
    toast.info("Upload started", {
      description: `${fileCount} file${
        fileCount !== 1 ? "s" : ""
      } queued for processing.`,
    });
    setPendingFiles([]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Filter for PDF files and show dataset assignment modal
    const pdfFiles = Array.from(files).filter(
      (file) => file.type === "application/pdf"
    );

    if (pdfFiles.length > 0) {
      setPendingFiles(pdfFiles);
      setShowDatasetModal(true);
    }

    // Reset input immediately
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
        className="flex items-center gap-2 h-10 sm:h-9 touch-target transition-hover"
      >
        <Upload className="w-4 h-4" />
        <span className="hidden sm:inline">Upload More</span>
        <span className="sm:hidden">Upload</span>
      </Button>

      <UploadDatasetModal
        open={showDatasetModal}
        onClose={() => {
          setShowDatasetModal(false);
          setPendingFiles([]);
        }}
        files={pendingFiles}
        onConfirm={handleConfirmUpload}
      />
    </>
  );
}

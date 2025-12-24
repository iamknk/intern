"use client";

import React, { useState } from "react";
import CreateDatasetModal from "./create-dataset-modal";
import { useDocumentStore } from "@/lib/store/document-store";
import { FileText } from "lucide-react";

export default function DatasetSidebar() {
  const datasets = useDocumentStore((s) => s.datasets);
  const documents = useDocumentStore((s) => s.documents);
  const activeDatasetId = useDocumentStore((s) => s.activeDatasetId);
  const selectDataset = useDocumentStore((s) => s.selectDataset);

  const [modalOpen, setModalOpen] = useState(false);
  const getDatasetDocCount = (datasetId: string) => {
    return documents.filter((d) => d.datasetIds?.includes(datasetId)).length;
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-lg font-bold">Geni AI Agent</h1>
        <p className="text-xs text-gray-400">Documents · Datasets</p>
      </div>

      <div className="p-2">
        <button
          onClick={() => selectDataset(null)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
            activeDatasetId === null
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-800 text-gray-300"
          }`}
        >
          <FileText className="w-5 h-5" />
          <div>
            <div className="font-medium text-sm">All Documents</div>
            <div className="text-xs opacity-70">
              View all uploaded documents
            </div>
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-2">
          <h2 className="text-sm font-medium text-gray-400">Datasets</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {datasets.length === 0 ? (
            <p className="text-xs text-gray-500 px-3 py-2">
              No datasets yet. Create one above.
            </p>
          ) : (
            datasets.map((d) => {
              const docCount = getDatasetDocCount(d.id);
              const isActive = d.id === activeDatasetId;
              return (
                <button
                  key={d.id}
                  onClick={() => selectDataset(d.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-800 text-gray-300"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: d.color ?? "#60a5fa" }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{d.name}</div>
                    <div className="text-xs opacity-70">
                      {docCount} document{docCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <CreateDatasetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </aside>
  );
}

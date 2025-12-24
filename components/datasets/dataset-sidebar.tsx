"use client";

import React, { useState, useMemo } from "react";
import CreateDatasetModal from "./create-dataset-modal";
import { useDocumentStore } from "@/lib/store/document-store";
import { FileText, Plus, Search } from "lucide-react";

interface DatasetSidebarProps {
  onNavigate?: () => void;
}

export default function DatasetSidebar({ onNavigate }: DatasetSidebarProps) {
  const datasets = useDocumentStore((s) => s.datasets);
  const documents = useDocumentStore((s) => s.documents);
  const activeDatasetId = useDocumentStore((s) => s.activeDatasetId);
  const selectDataset = useDocumentStore((s) => s.selectDataset);

  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getDatasetDocCount = (datasetId: string) => {
    return documents.filter((d) => d.datasetIds?.includes(datasetId)).length;
  };

  const filteredDatasets = useMemo(() => {
    if (!searchQuery.trim()) return datasets;
    return datasets.filter((d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [datasets, searchQuery]);

  const handleSelectDataset = (datasetId: string | null) => {
    selectDataset(datasetId);
    onNavigate?.();
  };

  return (
    <>
      <aside className="w-full h-full bg-gray-900 text-white flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-lg font-bold">Geni AI Agent</h1>
          <p className="text-xs text-gray-400">Documents · Datasets</p>
        </div>

        {/* All Documents Button */}
        <div className="p-2">
          <button
            onClick={() => handleSelectDataset(null)}
            className={`w-full flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-lg text-left transition-hover touch-target ${
              activeDatasetId === null
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-800 text-gray-300"
            }`}
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm">All Documents</div>
              <div className="text-xs opacity-70">
                View all uploaded documents
              </div>
            </div>
          </button>
        </div>

        {/* Datasets Section */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2">
            <h2 className="text-sm font-medium text-gray-400">Datasets</h2>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-blue-400 hover:text-blue-300 hover:bg-gray-800 rounded transition-hover touch-target"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="px-2 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search datasets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 h-9 text-sm border border-gray-700 rounded-lg bg-gray-800 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-hover"
              />
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto px-2 pb-4 space-y-1"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#6b7280 #374151",
              scrollbarGutter: "stable",
            }}
          >
            {datasets.length === 0 ? (
              <p className="text-xs text-gray-500 px-3 py-2">
                No datasets yet. Create one above.
              </p>
            ) : filteredDatasets.length === 0 ? (
              <p className="text-xs text-gray-500 px-3 py-2">
                No datasets match your search.
              </p>
            ) : (
              filteredDatasets.map((d) => {
                const docCount = getDatasetDocCount(d.id);
                const isActive = d.id === activeDatasetId;
                return (
                  <button
                    key={d.id}
                    onClick={() => handleSelectDataset(d.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 sm:py-2 rounded-lg text-left transition-hover touch-target ${
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
                      <div className="font-medium text-sm truncate">
                        {d.name}
                      </div>
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
      </aside>

      <CreateDatasetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

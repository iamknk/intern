"use client";

import React, { useState } from "react";
import CreateDatasetModal from "./create-dataset-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDocumentStore } from "@/lib/store/document-store";

export default function DatasetSidebar() {
  const datasets = useDocumentStore((s) => s.datasets);
  const activeDatasetId = useDocumentStore((s) => s.activeDatasetId);
  const selectDataset = useDocumentStore((s) => s.selectDataset);
  const createDataset = useDocumentStore((s) => s.createDataset);

  const [modalOpen, setModalOpen] = useState(false);
  const handleCreate = () => setModalOpen(true);

  return (
    <aside className="w-72 bg-white dark:bg-gray-900 border rounded p-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">Datasets</h4>
        <Button size="sm" variant="ghost" onClick={handleCreate}>
          New
        </Button>
      </div>

      <div className="h-[300px] overflow-auto space-y-2">
        {datasets.length === 0 && (
          <p className="text-sm text-gray-500">No datasets yet. Create one above.</p>
        )}

        {datasets.map((d) => (
          <div
            key={d.id}
            className={`p-2 rounded cursor-pointer border ${
              d.id === activeDatasetId ? "border-blue-500 bg-blue-50" : "border-transparent"
            }`}
            onClick={() => selectDataset(d.id)}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">{d.name}</div>
                <div className="text-xs text-gray-500">
                  {d.documentIds?.length ?? 0} documents
                </div>
              </div>
              <div className="ml-2">
                <Badge variant={d.id === activeDatasetId ? "secondary" : "outline"}>
                  {d.id === activeDatasetId ? "Active" : ""}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
      <CreateDatasetModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </aside>
  );
}

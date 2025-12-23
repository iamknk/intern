"use client";

import React, { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDocumentStore } from "@/lib/store/document-store";
import CreateDatasetModal from "./create-dataset-modal";

export default function DatasetSelector() {
  const datasets = useDocumentStore((s) => s.datasets);
  const activeDatasetId = useDocumentStore((s) => s.activeDatasetId);
  const selectDataset = useDocumentStore((s) => s.selectDataset);
  const createDataset = useDocumentStore((s) => s.createDataset);

  const [modalOpen, setModalOpen] = useState(false);
  const handleCreate = () => setModalOpen(true);

  return (
    <div className="flex items-center gap-3">
      <Select
        value={activeDatasetId ?? "all"}
        onValueChange={(v) => {
          if (v === "create") {
            handleCreate();
            return;
          }
          if (v === "all") selectDataset(null);
          else selectDataset(v);
        }}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Select dataset" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All datasets</SelectItem>
          {datasets.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
          <SelectItem value="create">+ Create new...</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="ghost" size="sm" onClick={handleCreate}>
        New Dataset
      </Button>
      <CreateDatasetModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDocumentStore } from "@/lib/store/document-store";

export default function CreateDatasetModal({
  open,
  onClose,
  defaultName,
}: {
  open: boolean;
  onClose: () => void;
  defaultName?: string;
}) {
  const [name, setName] = useState(defaultName ?? "");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<string | undefined>(undefined);
  const createDataset = useDocumentStore((s) => s.createDataset);

  if (!open) return null;

  const handleCreate = () => {
    const trimmed = name.trim() || "New Dataset";
    createDataset(trimmed, description.trim() || undefined, color);
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[420px] bg-white dark:bg-gray-900 rounded shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Create Dataset</h3>

        <div className="space-y-2">
          <label className="text-sm">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dataset name"
            className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800"
          />

          <label className="text-sm">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notes about this dataset"
            className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800"
            rows={3}
          />
          <label className="text-sm">Badge color</label>
          <div className="flex items-center gap-3">
            {[
              "#60a5fa",
              "#7dd3fc",
              "#86efac",
              "#fda4af",
              "#fbcfe8",
              "#fde68a",
              "#c7b3ff",
              "#ffcc99",
            ].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-label={`Select color ${c}`}
                className={`w-8 h-8 rounded-full border-2 ${
                  color === c ? "ring-2 ring-offset-1" : ""
                }`}
                style={{ background: c }}
                type="button"
              />
            ))}
            <div className="text-sm text-gray-500">Pick a badge color</div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create</Button>
        </div>
      </div>
    </div>
  );
}

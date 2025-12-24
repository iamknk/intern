"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
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
  const datasets = useDocumentStore((s) => s.datasets);

  if (!open) return null;

  const handleCreate = () => {
    const trimmed = name.trim();

    if (!trimmed) {
      toast.error("Name is required", {
        description: "Please enter a name for the dataset.",
      });
      return;
    }

    // Check for duplicate dataset name (case-insensitive)
    const isDuplicate = datasets.some(
      (d) => d.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      toast.error("Dataset already exists", {
        description: `A dataset with the name "${trimmed}" already exists. Please choose a different name.`,
      });
      return;
    }

    createDataset(trimmed, description.trim() || undefined, color);
    toast.success("Dataset created", {
      description: `"${trimmed}" has been created successfully.`,
    });
    setName("");
    setDescription("");
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 z-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[420px] bg-white dark:bg-gray-900 rounded-lg shadow-modal p-4 sm:p-6 animate-modal-in">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Create Dataset
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dataset name"
              required
              className="w-full px-3 py-2.5 h-11 sm:h-10 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-hover"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes about this dataset"
              className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-hover"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Badge color
            </label>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
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
                  className={`w-10 h-10 sm:w-8 sm:h-8 rounded-full border-2 transition-hover touch-target ${
                    color === c
                      ? "ring-2 ring-offset-2 ring-blue-500"
                      : "hover:scale-110"
                  }`}
                  style={{ background: c }}
                  type="button"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-11 sm:h-10 touch-target"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="h-11 sm:h-10 touch-target"
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body level, avoiding transform parent issues
  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}

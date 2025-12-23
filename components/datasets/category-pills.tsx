"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { useDocumentStore } from "@/lib/store/document-store";

export default function CategoryPills({
  onClick,
}: {
  onClick: (category: string) => void;
}) {
  const datasets = useDocumentStore((s) => s.datasets);
  const activeDatasetId = useDocumentStore((s) => s.activeDatasetId);

  const dataset = datasets.find((d) => d.id === activeDatasetId) ?? null;

  const pills = dataset?.categories && dataset.categories.length > 0
    ? dataset.categories
    : ["Files"];

  const total = dataset?.documentIds?.length ?? 0;

  return (
    <div className="flex items-center gap-2">
      {pills.map((p) => (
        <button
          key={p}
          onClick={() => onClick(p)}
          className="px-3 py-1 rounded-full border bg-gray-50 dark:bg-gray-800 text-sm"
        >
          <span className="mr-2">{p}</span>
          <Badge variant="secondary">{p === "Files" ? total : ""}</Badge>
        </button>
      ))}
    </div>
  );
}

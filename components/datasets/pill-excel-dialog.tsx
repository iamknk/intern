"use client";

import React from "react";
import { useDocumentStore } from "@/lib/store/document-store";
import { Button } from "@/components/ui/button";

export default function PillExcelDialog({
  open,
  onClose,
  datasetId,
  category,
}: {
  open: boolean;
  onClose: () => void;
  datasetId?: string | null;
  category?: string;
}) {
  const documents = useDocumentStore((s) => s.documents);
  const datasets = useDocumentStore((s) => s.datasets);

  if (!open) return null;

  const dataset = datasets.find((d) => d.id === datasetId) ?? null;
  const ids = dataset?.documentIds ?? [];
  const rows = ids
    .map((id) => documents.find((doc) => doc.id === id))
    .filter(Boolean) as any[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[90%] max-w-4xl bg-white dark:bg-gray-900 rounded shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{category ?? "Files"} — {dataset?.name ?? "Dataset"}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        <div className="overflow-auto max-h-[60vh] border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Filename</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Quality</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-b-0">
                  <td className="p-2">{r.filename}</td>
                  <td className="p-2">{r.status}</td>
                  <td className="p-2">{r.qualityScore ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

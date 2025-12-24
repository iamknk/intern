"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExtractedData } from "@/lib/types";

interface ExtractedDataRow extends ExtractedData {
  documentId: string;
  filename: string;
}

interface DetailedReviewModalProps {
  open: boolean;
  onClose: () => void;
  dataRows: ExtractedDataRow[];
  datasetName?: string;
}

const fieldLabels: { key: keyof ExtractedData | "filename"; label: string }[] =
  [
    { key: "filename", label: "Document" },
    { key: "name", label: "Name" },
    { key: "surname", label: "Surname" },
    { key: "address_street", label: "Street" },
    { key: "address_house_number", label: "House Number" },
    { key: "address_zip_code", label: "Zip Code" },
    { key: "address_city", label: "City" },
    { key: "warm_rent", label: "Warm Rent" },
    { key: "cold_rent", label: "Cold Rent" },
    { key: "deposit", label: "Deposit" },
    { key: "contract_term_months", label: "Contract Term (months)" },
    { key: "notice_period_months", label: "Notice Period (months)" },
    { key: "rent_increase_type", label: "Rent Increase Type" },
    { key: "date", label: "Date" },
    { key: "is_active", label: "Active" },
    { key: "landlord_entity", label: "Landlord" },
  ];

function formatValue(key: string, value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";

  if (key === "is_active") {
    return value ? "Yes" : "No";
  }

  if (key === "warm_rent" || key === "cold_rent" || key === "deposit") {
    return typeof value === "number"
      ? `€${value.toLocaleString()}`
      : String(value);
  }

  if (key === "rent_increase_type") {
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
  }

  return String(value);
}

export default function DetailedReviewModal({
  open,
  onClose,
  dataRows,
  datasetName,
}: DetailedReviewModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-[95vw] max-w-[1400px] max-h-[90vh] bg-white dark:bg-gray-900 rounded-lg shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Detailed Review
            </h3>
            {datasetName && (
              <p className="text-sm text-gray-500">
                {datasetName} - All extracted fields
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {fieldLabels.map((field) => (
                    <TableHead
                      key={field.key}
                      className="whitespace-nowrap font-medium"
                    >
                      {field.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataRows.length > 0 ? (
                  dataRows.map((row) => (
                    <TableRow key={row.documentId}>
                      {fieldLabels.map((field) => (
                        <TableCell
                          key={field.key}
                          className="whitespace-nowrap"
                        >
                          <span className="text-sm">
                            {formatValue(
                              field.key,
                              field.key === "filename"
                                ? row.filename
                                : row[field.key as keyof ExtractedData]
                            )}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={fieldLabels.length}
                      className="h-24 text-center"
                    >
                      No data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, FileText, Download } from "lucide-react";
import { useDocumentStore } from "@/lib/store/document-store";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ExtractedData } from "@/lib/types";
import { useState } from "react";

interface ExtractedDataRow extends ExtractedData {
  documentId: string;
  filename: string;
}

export function DatasetDataTable() {
  const allDocuments = useDocumentStore((state) => state.documents);
  const activeDatasetId = useDocumentStore((state) => state.activeDatasetId);
  const datasets = useDocumentStore((state) => state.datasets);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Get documents for the active dataset that have extracted data
  const dataRows = useMemo(() => {
    if (!activeDatasetId) return [];

    const datasetDocuments = allDocuments.filter(
      (doc) => doc.datasetIds?.includes(activeDatasetId) && doc.extractedData
    );

    return datasetDocuments.map((doc) => ({
      ...doc.extractedData!,
      documentId: doc.id,
      filename: doc.filename,
    }));
  }, [allDocuments, activeDatasetId]);

  const activeDataset = datasets.find((d) => d.id === activeDatasetId);

  const exportToCSV = () => {
    if (dataRows.length === 0) return;

    const headers = [
      "Document",
      "Name",
      "Surname",
      "Street",
      "House Number",
      "Zip Code",
      "City",
      "Warm Rent",
      "Cold Rent",
      "Deposit",
      "Date",
      "Rent Increase Type",
      "Active",
    ];

    const csvContent = [
      headers.join(","),
      ...dataRows.map((row) =>
        [
          `"${row.filename}"`,
          `"${row.name || ""}"`,
          `"${row.surname || ""}"`,
          `"${row.address_street || ""}"`,
          `"${row.address_house_number || ""}"`,
          `"${row.address_zip_code || ""}"`,
          `"${row.address_city || ""}"`,
          row.warm_rent || "",
          row.cold_rent || "",
          row.deposit || "",
          `"${row.date || ""}"`,
          `"${row.rent_increase_type || ""}"`,
          row.is_active !== undefined ? (row.is_active ? "Yes" : "No") : "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${activeDataset?.name || "dataset"}_data.csv`;
    link.click();
  };

  const exportToXLSX = async () => {
    if (dataRows.length === 0) return;

    // Dynamic import for xlsx library
    const XLSX = await import("xlsx");

    const worksheetData = dataRows.map((row) => ({
      Document: row.filename,
      Name: row.name || "",
      Surname: row.surname || "",
      Street: row.address_street || "",
      "House Number": row.address_house_number || "",
      "Zip Code": row.address_zip_code || "",
      City: row.address_city || "",
      "Warm Rent": row.warm_rent || "",
      "Cold Rent": row.cold_rent || "",
      Deposit: row.deposit || "",
      Date: row.date || "",
      "Rent Increase Type": row.rent_increase_type || "",
      Active: row.is_active !== undefined ? (row.is_active ? "Yes" : "No") : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Data");
    XLSX.writeFile(workbook, `${activeDataset?.name || "dataset"}_data.xlsx`);
  };

  const columns: ColumnDef<ExtractedDataRow>[] = useMemo(
    () => [
      {
        accessorKey: "filename",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0 h-auto font-medium"
          >
            Document
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium truncate max-w-[200px]">
              {row.getValue("filename")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0 h-auto font-medium"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("name") || "—"}</span>
        ),
      },
      {
        accessorKey: "surname",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0 h-auto font-medium"
          >
            Surname
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("surname") || "—"}</span>
        ),
      },
      {
        id: "address",
        header: "Address",
        cell: ({ row }) => {
          const street = row.original.address_street;
          const houseNumber = row.original.address_house_number;
          const zipCode = row.original.address_zip_code;
          const city = row.original.address_city;

          if (!street && !city)
            return <span className="text-sm text-gray-400">—</span>;

          return (
            <div className="text-sm">
              <div>
                {street} {houseNumber}
              </div>
              <div className="text-gray-500">
                {zipCode} {city}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "warm_rent",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0 h-auto font-medium"
          >
            Warm Rent
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const value = row.getValue("warm_rent") as number | undefined;
          return (
            <span className="text-sm font-medium">
              {value ? `€${value.toLocaleString()}` : "—"}
            </span>
          );
        },
      },
      {
        accessorKey: "cold_rent",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0 h-auto font-medium"
          >
            Cold Rent
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const value = row.getValue("cold_rent") as number | undefined;
          return (
            <span className="text-sm">
              {value ? `€${value.toLocaleString()}` : "—"}
            </span>
          );
        },
      },
      {
        accessorKey: "deposit",
        header: "Deposit",
        cell: ({ row }) => {
          const value = row.original.deposit;
          return (
            <span className="text-sm">
              {value ? `€${value.toLocaleString()}` : "—"}
            </span>
          );
        },
      },
      {
        accessorKey: "date",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0 h-auto font-medium"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("date") || "—"}</span>
        ),
      },
      {
        accessorKey: "rent_increase_type",
        header: "Rent Increase",
        cell: ({ row }) => {
          const value = row.getValue("rent_increase_type") as string;
          return <span className="text-sm capitalize">{value || "—"}</span>;
        },
      },
      {
        accessorKey: "is_active",
        header: "Active",
        cell: ({ row }) => {
          const value = row.getValue("is_active") as boolean | undefined;
          if (value === undefined)
            return <span className="text-sm text-gray-400">—</span>;
          return (
            <span
              className={`text-sm font-medium ${
                value ? "text-green-600" : "text-gray-500"
              }`}
            >
              {value ? "Yes" : "No"}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: dataRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (!activeDatasetId) {
    return null;
  }

  if (dataRows.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No extracted data</h3>
        <p className="text-sm">
          Documents in this dataset don&apos;t have extracted data yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-full flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {activeDataset?.name} - Extracted Data
            </h2>
            <p className="text-sm text-gray-500">
              {dataRows.length} document{dataRows.length !== 1 ? "s" : ""} with
              extracted data
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={exportToCSV}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToXLSX}>
                Export as XLSX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

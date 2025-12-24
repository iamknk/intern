"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  Eye,
  ArrowUpDown,
  Filter,
  Plus,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useDocumentStore } from "@/lib/store/document-store";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import FieldEditor from "./field-editor";
import { QualityBadge } from "./quality-badge";
import CreateDatasetModal from "@/components/datasets/create-dataset-modal";
import ManageDatasetModal from "@/components/datasets/manage-dataset-modal";
import type { Dataset } from "@/lib/types";
import type { Document, DocumentStatus } from "@/lib/types";

const statusConfig: Record<
  DocumentStatus,
  { icon: any; label: string; variant?: any; className?: string }
> = {
  queued: { icon: Clock, label: "Queued", variant: "secondary" },
  processing: { icon: Loader2, label: "Processing", variant: "default" },
  done: { icon: CheckCircle, label: "Done", variant: "default" },
  awaiting_review: { icon: Eye, label: "Awaiting Review", variant: "outline" },
  reviewed: {
    icon: CheckCircle,
    label: "Reviewed",
    variant: "default",
    className: "bg-green-600 text-white border-transparent",
  },
  failed: { icon: AlertCircle, label: "Failed", variant: "destructive" },
};

const statusOrder: Record<DocumentStatus, number> = {
  queued: 0,
  processing: 1,
  done: 2,
  awaiting_review: 3,
  reviewed: 4,
  failed: 5,
};

export function DocumentsTable() {
  const allDocuments = useDocumentStore((state) => state.documents);
  const activeDatasetId = useDocumentStore((state) => state.activeDatasetId);
  const deleteDocument = useDocumentStore((state) => state.deleteDocument);
  const setDocumentData = useDocumentStore((state) => state.setDocumentData);
  const updateDocumentStatus = useDocumentStore(
    (state) => state.updateDocumentStatus
  );
  const updateDocument = useDocumentStore((state) => state.updateDocument);
  const setUnsavedChanges = useDocumentStore(
    (state) => state.setUnsavedChanges
  );

  const documents = useMemo(() => {
    if (!activeDatasetId) {
      return allDocuments;
    }
    return allDocuments.filter((doc) =>
      doc.datasetIds?.includes(activeDatasetId)
    );
  }, [allDocuments, activeDatasetId]);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "uploadedAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [qualityFilter, setQualityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const [editedData, setEditedData] = useState<any>(null);
  const [originalEditData, setOriginalEditData] = useState<any>(null);
  const [fieldEditorKey, setFieldEditorKey] = useState(0);
  const [pillDialogOpen, setPillDialogOpen] = useState(false);
  const [selectedPill, setSelectedPill] = useState<string | undefined>(
    undefined
  );
  const datasets = useDocumentStore((s) => s.datasets);
  const selectDataset = useDocumentStore((s) => s.selectDataset);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [manageDocId, setManageDocId] = useState<string | null>(null);

  const columns: ColumnDef<Document>[] = useMemo(
    () => [
      {
        id: "dataset",
        header: () => <div className="text-sm">Datasets</div>,
        cell: ({ row }) => {
          const doc = row.original;
          const docDatasetIds = doc.datasetIds ?? [];

          const selected = datasets.filter((d) =>
            (docDatasetIds ?? []).includes(d.id)
          );

          return (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 flex-wrap overflow-hidden">
                {selected.map((d) => (
                  <span
                    key={d.id}
                    className="px-2 py-0.5 rounded-full text-xs text-white whitespace-nowrap"
                    style={{ background: d.color ?? "#60a5fa" }}
                  >
                    {d.name}
                  </span>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="p-0.5 h-6 w-6 shrink-0 ml-auto"
                onClick={() => {
                  setManageDocId(doc.id);
                  setManageModalOpen(true);
                }}
                title="Manage datasets"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          );
        },
        meta: { width: "15%" },
      },
      {
        accessorKey: "filename",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hover:bg-transparent p-0"
            >
              Filename
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const doc = row.original;
          const config = statusConfig[doc.status];
          const isProcessing = doc.status === "processing";

          return (
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="space-y-1 min-w-0">
                <p className="font-medium text-sm truncate">{doc.filename}</p>
                {doc.error && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {doc.error}
                  </p>
                )}
                {isProcessing && <Progress value={66} className="h-1 w-full" />}
              </div>
            </div>
          );
        },
        meta: { width: "20%" },
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hover:bg-transparent p-0"
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const status = row.getValue("status") as DocumentStatus;
          const config = statusConfig[status];
          const StatusIcon = config.icon;
          const isProcessing = status === "processing";

          return (
            <Badge
              variant={config.variant}
              className={`flex items-center gap-1 w-fit ${
                config.className ?? ""
              }`}
            >
              <StatusIcon
                className={`w-3 h-3 ${isProcessing ? "animate-spin" : ""}`}
              />
              {config.label}
            </Badge>
          );
        },
        sortingFn: (rowA, rowB) => {
          const statusA = rowA.getValue("status") as DocumentStatus;
          const statusB = rowB.getValue("status") as DocumentStatus;
          return statusOrder[statusA] - statusOrder[statusB];
        },
        filterFn: (row, id, value) => {
          if (value === "all") return true;
          return row.getValue(id) === value;
        },
      },
      {
        accessorKey: "qualityScore",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hover:bg-transparent p-0"
            >
              Quality
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const score = row.getValue("qualityScore") as number | undefined;
          if (score === undefined || score === null) {
            return <span className="text-sm text-gray-400">—</span>;
          }
          return <QualityBadge qualityScore={score} />;
        },
        filterFn: (row, id, value) => {
          if (value === "all") return true;
          const score = row.getValue(id) as number | undefined;
          if (score === undefined || score === null) return value === "unknown";
          if (value === "excellent") return score > 85;
          if (value === "good") return score >= 70 && score <= 85;
          if (value === "needs_review") return score >= 50 && score < 70;
          if (value === "poor") return score < 50;
          return true;
        },
      },
      {
        accessorKey: "uploadedAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hover:bg-transparent p-0"
            >
              Date Uploaded
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = row.getValue("uploadedAt") as Date;
          return (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(date).toLocaleDateString()}
            </span>
          );
        },
        sortingFn: (rowA, rowB) => {
          const dateA = new Date(rowA.getValue("uploadedAt") as Date).getTime();
          const dateB = new Date(rowB.getValue("uploadedAt") as Date).getTime();
          return dateA - dateB;
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const doc = row.original;

          return (
            <div className="flex items-center justify-end gap-2">
              {(doc.status === "done" ||
                doc.status === "awaiting_review" ||
                doc.status === "reviewed") && (
                <Button
                  variant="ghost"
                  size="sm"
                  title="View details"
                  onClick={() => {
                    setSelectedDocumentId(doc.id);
                    setEditedData(doc.extractedData ?? null);
                    setOriginalEditData(
                      doc.extractedData ? { ...doc.extractedData } : null
                    );
                    // reset unsaved changes flag when opening
                    setUnsavedChanges(doc.id, false);
                    updateDocument(doc.id, { hasUnsavedChanges: false });
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              {/* Mark-as-reviewed removed — reviews are marked when saving */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  deleteDocument(doc.id);
                  toast("Document deleted", {
                    description: `"${doc.filename}" has been removed.`,
                    icon: <CheckCircle className="w-4 h-4 text-red-500" />,
                    className: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
                  });
                }}
                title="Delete document"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [deleteDocument, updateDocument, setUnsavedChanges, datasets]
  );

  const selectedDocument =
    documents.find((d) => d.id === selectedDocumentId) ?? null;

  const handleFieldChange = (field: string, value: any) => {
    setEditedData((prev: any) => ({ ...(prev || {}), [field]: value }));
    if (selectedDocumentId) {
      setUnsavedChanges(selectedDocumentId, true);
      // Also mark the document as having unsaved changes in the store
      updateDocument(selectedDocumentId, { hasUnsavedChanges: true });
    }
  };

  const saveReview = () => {
    if (!selectedDocument || !editedData) return;
    setDocumentData(
      selectedDocument.id,
      editedData,
      selectedDocument.qualityScore ?? 0
    );
    // mark review as completed immediately on save
    updateDocumentStatus(selectedDocument.id, "reviewed");
    setUnsavedChanges(selectedDocument.id, false);
    updateDocument(selectedDocument.id, {
      hasUnsavedChanges: false,
      isReviewed: true,
    });
    toast.success("Review saved", {
      description: `Changes to "${selectedDocument.filename}" have been saved.`,
    });
    setSelectedDocumentId(null);
    setEditedData(null);
    setOriginalEditData(null);
  };

  const closeReview = () => {
    if (selectedDocumentId) {
      // discard edits: clear unsaved changes flag
      setUnsavedChanges(selectedDocumentId, false);
      updateDocument(selectedDocumentId, { hasUnsavedChanges: false });
    }
    setSelectedDocumentId(null);
    setEditedData(null);
    setOriginalEditData(null);
  };

  const resetToOriginal = () => {
    if (originalEditData) {
      setEditedData({ ...originalEditData });
      setFieldEditorKey((k) => k + 1); // Force FieldEditor to remount with fresh state
      if (selectedDocumentId) {
        setUnsavedChanges(selectedDocumentId, false);
        updateDocument(selectedDocumentId, { hasUnsavedChanges: false });
      }
    }
  };

  const filteredData = useMemo(
    () =>
      documents.filter((doc) => {
        // Search filter
        if (
          searchQuery &&
          !doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        if (statusFilter !== "all" && doc.status !== statusFilter) return false;

        if (qualityFilter !== "all" && doc.qualityScore !== undefined) {
          if (qualityFilter === "high" && doc.qualityScore <= 85) return false;
          if (
            qualityFilter === "medium" &&
            (doc.qualityScore < 70 || doc.qualityScore > 85)
          )
            return false;
          if (qualityFilter === "low" && doc.qualityScore >= 70) return false;
        }

        return true;
      }),
    [documents, statusFilter, qualityFilter, searchQuery]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  });

  const clearFilters = () => {
    setStatusFilter("all");
    setQualityFilter("all");
    setSearchQuery("");
  };

  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) +
    (qualityFilter !== "all" ? 1 : 0) +
    (searchQuery ? 1 : 0);

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No documents yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Upload PDFs to get started with data extraction.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {activeDatasetId
            ? `${
                datasets.find((d) => d.id === activeDatasetId)?.name ??
                "Dataset"
              } (${documents.length})`
            : `Documents (${documents.length})`}
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 h-9 w-[250px] text-sm border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="awaiting_review">Awaiting Review</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={qualityFilter} onValueChange={setQualityFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Quality</SelectItem>
              <SelectItem value="high">High (&gt;85%)</SelectItem>
              <SelectItem value="medium">Medium (70-85%)</SelectItem>
              <SelectItem value="low">Low (&lt;70%)</SelectItem>
            </SelectContent>
          </Select>

          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Filter className="w-3 h-3" />
              {activeFilterCount} active
            </Badge>
          )}
        </div>

        {activeFilterCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {activeFilterCount > 0 && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredData.length} of {documents.length} documents
        </p>
      )}

      <div className="rounded-md border overflow-auto">
        <Table className="table-fixed w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const width = (
                    header.column.columnDef.meta as { width?: string }
                  )?.width;
                  return (
                    <TableHead
                      key={header.id}
                      style={width ? { width } : undefined}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{" "}
          to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            filteredData.length
          )}{" "}
          of {filteredData.length} documents
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CreateDatasetModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {manageDocId && (
        <ManageDatasetModal
          open={manageModalOpen}
          onClose={() => {
            setManageModalOpen(false);
            setManageDocId(null);
          }}
          documentId={manageDocId}
        />
      )}

      {selectedDocument && (
        <div className="fixed right-6 top-20 w-[420px] max-h-[80vh] overflow-auto bg-white dark:bg-gray-900 border rounded shadow-lg p-4 z-50">
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold break-words">
                {selectedDocument.filename}
              </h3>
              <p className="text-sm text-gray-500">
                Status: {selectedDocument.status}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={closeReview}>
                Close
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Extracted Data</h4>
            {!editedData && (
              <p className="text-sm text-gray-500">
                No extracted data available.
              </p>
            )}
            {editedData && (
              <FieldEditor
                key={fieldEditorKey}
                data={editedData}
                onChange={(d) => {
                  setEditedData(d);
                  if (selectedDocumentId) {
                    setUnsavedChanges(selectedDocumentId, true);
                    updateDocument(selectedDocumentId, {
                      hasUnsavedChanges: true,
                    });
                  }
                }}
              />
            )}

            <div className="flex items-center justify-between pt-3">
              <div>
                {JSON.stringify(editedData) !==
                  JSON.stringify(originalEditData) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetToOriginal}
                    className="gap-1.5 text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-700 dark:hover:bg-orange-950"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset to Original
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={closeReview}>
                  Cancel
                </Button>
                <Button onClick={saveReview}>Save Review</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

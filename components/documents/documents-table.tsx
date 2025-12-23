'use client';

import { useState, useMemo } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FileText, CheckCircle, Clock, AlertCircle, XCircle, Loader2, Eye, ArrowUpDown, Filter } from 'lucide-react';
import { useDocumentStore } from '@/lib/store/document-store';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QualityBadge } from './quality-badge';
import type { Document, DocumentStatus } from '@/lib/types';

const statusConfig: Record<DocumentStatus, { icon: any; label: string; variant: any }> = {
  queued: { icon: Clock, label: 'Queued', variant: 'secondary' },
  processing: { icon: Loader2, label: 'Processing', variant: 'default' },
  done: { icon: CheckCircle, label: 'Done', variant: 'default' },
  failed: { icon: AlertCircle, label: 'Failed', variant: 'destructive' },
};

const statusOrder: Record<DocumentStatus, number> = {
  queued: 0,
  processing: 1,
  done: 2,
  failed: 3,
};

export function DocumentsTable() {
  const documents = useDocumentStore((state) => state.documents);
  const deleteDocument = useDocumentStore((state) => state.deleteDocument);
  
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'uploadedAt', desc: true }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [qualityFilter, setQualityFilter] = useState<string>('all');

  
  const columns: ColumnDef<Document>[] = useMemo(() => [
    {
      accessorKey: 'filename',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
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
        const isProcessing = doc.status === 'processing';
        
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
              {isProcessing && (
                <Progress value={66} className="h-1 w-full" />
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent p-0"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue('status') as DocumentStatus;
        const config = statusConfig[status];
        const StatusIcon = config.icon;
        const isProcessing = status === 'processing';
        
        return (
          <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
            <StatusIcon className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
            {config.label}
          </Badge>
        );
      },
      sortingFn: (rowA, rowB) => {
        const statusA = rowA.getValue('status') as DocumentStatus;
        const statusB = rowB.getValue('status') as DocumentStatus;
        return statusOrder[statusA] - statusOrder[statusB];
      },
      filterFn: (row, id, value) => {
        if (value === 'all') return true;
        return row.getValue(id) === value;
      },
    },
    {
      accessorKey: 'qualityScore',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent p-0"
          >
            Quality
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const score = row.getValue('qualityScore') as number | undefined;
        return score !== undefined ? (
          <QualityBadge qualityScore={score} />
        ) : (
          <span className="text-sm text-gray-400">-</span>
        );
      },
      sortingFn: (rowA, rowB) => {
        const scoreA = rowA.getValue('qualityScore') as number | undefined ?? -1;
        const scoreB = rowB.getValue('qualityScore') as number | undefined ?? -1;
        return scoreA - scoreB;
      },
      filterFn: (row, id, value) => {
        if (value === 'all') return true;
        const score = row.getValue(id) as number | undefined;
        if (score === undefined) return false;
        
        if (value === 'high') return score > 85;
        if (value === 'medium') return score >= 70 && score <= 85;
        if (value === 'low') return score < 70;
        return true;
      },
    },
    {
      accessorKey: 'uploadedAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent p-0"
          >
            Date Uploaded
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue('uploadedAt') as Date;
        return (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(date).toLocaleString()}
          </span>
        );
      },
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.getValue('uploadedAt') as Date).getTime();
        const dateB = new Date(rowB.getValue('uploadedAt') as Date).getTime();
        return dateA - dateB;
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const doc = row.original;
        
        return (
          <div className="flex items-center justify-end gap-2">
            {doc.status === 'done' && (
              <Button
                variant="ghost"
                size="sm"
                title="View details"
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteDocument(doc.id)}
              title="Delete document"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ], [deleteDocument]);

  const filteredData = useMemo(() => documents.filter((doc) => {
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
    
    if (qualityFilter !== 'all' && doc.qualityScore !== undefined) {
      if (qualityFilter === 'high' && doc.qualityScore <= 85) return false;
      if (qualityFilter === 'medium' && (doc.qualityScore < 70 || doc.qualityScore > 85)) return false;
      if (qualityFilter === 'low' && doc.qualityScore >= 70) return false;
    }
    
    return true;
  }), [documents, statusFilter, qualityFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const clearFilters = () => {
    setStatusFilter('all');
    setQualityFilter('all');
  };

  const activeFilterCount = 
    (statusFilter !== 'all' ? 1 : 0) + 
    (qualityFilter !== 'all' ? 1 : 0);

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
          Documents ({documents.length})
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="done">Done</SelectItem>
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
    </div>
  );
}

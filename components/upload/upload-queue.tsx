'use client';

import { FileText, CheckCircle, Clock, AlertCircle, XCircle, Loader2 } from 'lucide-react';
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
import type { DocumentStatus } from '@/lib/types';

const statusConfig: Record<DocumentStatus, { icon: any; label: string; variant: any }> = {
  queued: { icon: Clock, label: 'Queued', variant: 'secondary' },
  processing: { icon: Loader2, label: 'Processing', variant: 'default' },
  done: { icon: CheckCircle, label: 'Done', variant: 'default' },
  failed: { icon: AlertCircle, label: 'Failed', variant: 'destructive' },
};

export function UploadQueue() {
  const documents = useDocumentStore((state) => state.documents);
  const deleteDocument = useDocumentStore((state) => state.deleteDocument);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Documents ({documents.length})
        </h2>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Filename</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[120px]">Quality Score</TableHead>
              <TableHead className="w-[180px]">Uploaded</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => {
              const config = statusConfig[doc.status];
              const StatusIcon = config.icon;
              const isProcessing = doc.status === 'processing';

              return (
                <TableRow key={doc.id}>
                  <TableCell>
                    <FileText className="w-5 h-5 text-gray-400" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{doc.filename}</p>
                      {doc.error && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {doc.error}
                        </p>
                      )}
                      {isProcessing && (
                        <Progress value={66} className="h-1 w-full" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                      <StatusIcon className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {doc.qualityScore !== undefined ? (
                      <span className="text-sm font-medium">{doc.qualityScore}%</span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(doc.uploadedAt).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDocument(doc.id)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


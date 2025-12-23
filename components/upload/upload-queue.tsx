'use client';

import { FileText, CheckCircle, Clock, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { useDocumentStore } from '@/lib/store/document-store';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Upload Queue ({documents.length})
      </h3>
      
      <div className="space-y-2">
        {documents.map((doc) => {
          const config = statusConfig[doc.status];
          const StatusIcon = config.icon;
          const isProcessing = doc.status === 'processing';
          
          return (
            <div
              key={doc.id}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {doc.filename}
                    </p>
                    {doc.error && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {doc.error}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={config.variant} className="flex items-center gap-1">
                    <StatusIcon className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
                    {config.label}
                  </Badge>
                  
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    aria-label="Delete file"
                  >
                    <XCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  </button>
                </div>
              </div>

              {isProcessing && (
                <Progress value={66} className="h-1" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


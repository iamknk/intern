export type DocumentStatus = 'queued' | 'processing' | 'done' | 'failed';

export interface Document {
  id: string;
  filename: string;
  status: DocumentStatus;
  uploadedAt: Date;
  error?: string;
}


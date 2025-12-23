import { create } from 'zustand';
import { Document, DocumentStatus } from '../types';

interface DocumentStore {
  documents: Document[];
  addDocument: (file: File) => void;
  updateDocumentStatus: (id: string, status: DocumentStatus, error?: string) => void;
  deleteDocument: (id: string) => void;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  documents: [],
  
  addDocument: (file: File) => {
    const newDocument: Document = {
      id: crypto.randomUUID(),
      filename: file.name,
      status: 'queued',
      uploadedAt: new Date(),
    };
    
    set((state) => ({
      documents: [...state.documents, newDocument],
    }));
  },
  
  updateDocumentStatus: (id: string, status: DocumentStatus, error?: string) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, status, error } : doc
      ),
    }));
  },
  
  deleteDocument: (id: string) => {
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    }));
  },
}));


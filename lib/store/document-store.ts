import { create } from 'zustand';
import { Document, DocumentStatus, ExtractedData } from '../types';

interface DocumentStore {
  documents: Document[];
  addDocument: (file: File) => string;
  updateDocumentStatus: (id: string, status: DocumentStatus, error?: string) => void;
  setDocumentData: (id: string, data: ExtractedData, qualityScore: number) => void;
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
    
    return newDocument.id;
  },
  
  updateDocumentStatus: (id: string, status: DocumentStatus, error?: string) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, status, error } : doc
      ),
    }));
  },
  
  setDocumentData: (id: string, data: ExtractedData, qualityScore: number) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id 
          ? { 
              ...doc, 
              extractedData: data, 
              qualityScore,
              processedAt: new Date(),
              status: 'done' as DocumentStatus,
            } 
          : doc
      ),
    }));
  },
  
  deleteDocument: (id: string) => {
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    }));
  },
}));


import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Document, DocumentStatus, ExtractedData } from "../types";

interface DocumentStore {
  documents: Document[];
  addDocument: (file: File) => string;
  updateDocumentStatus: (
    id: string,
    status: DocumentStatus,
    error?: string
  ) => void;
  setDocumentData: (
    id: string,
    data: ExtractedData,
    qualityScore: number
  ) => void;
  deleteDocument: (id: string) => void;
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set) => ({
      documents: [],

      addDocument: (file: File) => {
        const newDocument: Document = {
          id: crypto.randomUUID(),
          filename: file.name,
          status: "queued",
          uploadedAt: new Date(),
        };

        set((state) => ({
          documents: [...state.documents, newDocument],
        }));

        return newDocument.id;
      },

      updateDocumentStatus: (
        id: string,
        status: DocumentStatus,
        error?: string
      ) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, status, error } : doc
          ),
        }));
      },

      setDocumentData: (
        id: string,
        data: ExtractedData,
        qualityScore: number
      ) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id
              ? {
                  ...doc,
                  extractedData: data,
                  qualityScore,
                  processedAt: new Date(),
                  status: "done" as DocumentStatus,
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
    }),
    {
      name: "document-store", // localStorage key
      // Rehydrate dates because JSON.stringify/parse turns Dates into strings
      deserialize: (str: string) => {
        try {
          const parsed = JSON.parse(str);
          if (
            parsed?.state?.documents &&
            Array.isArray(parsed.state.documents)
          ) {
            parsed.state.documents = parsed.state.documents.map((d: any) => ({
              ...d,
              uploadedAt: d.uploadedAt ? new Date(d.uploadedAt) : undefined,
              processedAt: d.processedAt ? new Date(d.processedAt) : undefined,
            }));
          }
          return parsed;
        } catch (e) {
          return JSON.parse(str);
        }
      },
    }
  )
);

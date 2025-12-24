import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Document, DocumentStatus, ExtractedData, Dataset } from "../types";

interface DocumentStore {
  documents: Document[];
  datasets: Dataset[];
  activeDatasetId?: string | null;
  addDocument: (file: File) => string;
  addDocumentWithDatasets: (file: File, datasetIds: string[]) => string;
  createDataset: (name: string, description?: string, color?: string) => string;
  selectDataset: (id: string | null) => void;
  appendDocumentsToDataset: (datasetId: string, documentIds: string[]) => void;
  removeDocumentFromDataset: (datasetId: string, documentId: string) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
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
  setUnsavedChanges: (id: string, hasChanges: boolean) => void;
  deleteDocument: (id: string) => void;
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set) => ({
      documents: [],
      datasets: [],
      activeDatasetId: null,

      addDocument: (file: File) => {
        const newDocument: Document = {
          id: crypto.randomUUID(),
          filename: file.name,
          status: "queued",
          uploadedAt: new Date(),
          datasetIds: [],
        };

        set((state) => {
          // append document to documents
          const docs = [...state.documents, newDocument];
          // if there is an active dataset, attach it (multi-membership)
          if (state.activeDatasetId) {
            const dsIndex = state.datasets.findIndex(
              (d) => d.id === state.activeDatasetId
            );
            if (dsIndex !== -1) {
              const ds = state.datasets[dsIndex];
              const updatedDs = {
                ...ds,
                documentIds: [...(ds.documentIds ?? []), newDocument.id],
              };
              const datasets = [...state.datasets];
              datasets[dsIndex] = updatedDs;
              // set datasetIds on the document
              const updatedDocs = docs.map((d) =>
                d.id === newDocument.id
                  ? { ...d, datasetIds: [state.activeDatasetId!] }
                  : d
              );
              return { documents: updatedDocs, datasets };
            }
          }

          return { documents: docs };
        });

        return newDocument.id;
      },

      addDocumentWithDatasets: (file: File, datasetIds: string[]) => {
        const newDocument: Document = {
          id: crypto.randomUUID(),
          filename: file.name,
          status: "queued",
          uploadedAt: new Date(),
          datasetIds: datasetIds,
        };

        set((state) => {
          const docs = [...state.documents, newDocument];

          if (datasetIds.length > 0) {
            const datasets = state.datasets.map((ds) => {
              if (datasetIds.includes(ds.id)) {
                return {
                  ...ds,
                  documentIds: [...(ds.documentIds ?? []), newDocument.id],
                };
              }
              return ds;
            });
            return { documents: docs, datasets };
          }

          return { documents: docs };
        });

        return newDocument.id;
      },

      createDataset: (name: string, description?: string, color?: string) => {
        const id = crypto.randomUUID();
        const newDataset: Dataset = {
          id,
          name,
          description,
          createdAt: new Date(),
          documentIds: [],
          color,
        };
        set((state) => ({
          datasets: [...state.datasets, newDataset],
        }));
        return id;
      },

      selectDataset: (id: string | null) => {
        set(() => ({ activeDatasetId: id }));
      },

      appendDocumentsToDataset: (datasetId: string, documentIds: string[]) => {
        set((state) => ({
          datasets: state.datasets.map((ds) =>
            ds.id === datasetId
              ? {
                  ...ds,
                  documentIds: Array.from(
                    new Set([...(ds.documentIds ?? []), ...documentIds])
                  ),
                }
              : ds
          ),
          documents: state.documents.map((doc) =>
            documentIds.includes(doc.id)
              ? {
                  ...doc,
                  datasetIds: Array.from(
                    new Set([...(doc.datasetIds ?? []), datasetId])
                  ),
                }
              : doc
          ),
        }));
      },

      // remove a single document from a dataset (untag)
      removeDocumentFromDataset: (datasetId: string, documentId: string) => {
        set((state) => ({
          datasets: state.datasets.map((ds) =>
            ds.id === datasetId
              ? {
                  ...ds,
                  documentIds: (ds.documentIds ?? []).filter(
                    (id) => id !== documentId
                  ),
                }
              : ds
          ),
          documents: state.documents.map((doc) =>
            doc.id === documentId
              ? {
                  ...doc,
                  datasetIds: (doc.datasetIds ?? []).filter(
                    (id) => id !== datasetId
                  ),
                }
              : doc
          ),
        }));
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

      updateDocument: (id: string, updates: Partial<Document>) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, ...updates } : doc
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
                  status: "awaiting_review" as DocumentStatus,
                }
              : doc
          ),
        }));
      },

      setUnsavedChanges: (id: string, hasChanges: boolean) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, hasUnsavedChanges: hasChanges } : doc
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
      name: "document-store",
      storage: {
        getItem: (name: string) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const parsed = JSON.parse(str);
            if (
              parsed?.state?.documents &&
              Array.isArray(parsed.state.documents)
            ) {
              parsed.state.documents = parsed.state.documents.map(
                (d: Record<string, unknown>) => ({
                  ...d,
                  datasetIds:
                    (d.datasetIds as string[]) ??
                    (d.datasetId ? [d.datasetId as string] : []),
                  uploadedAt: d.uploadedAt
                    ? new Date(d.uploadedAt as string)
                    : undefined,
                  processedAt: d.processedAt
                    ? new Date(d.processedAt as string)
                    : undefined,
                })
              );
            }
            if (
              parsed?.state?.datasets &&
              Array.isArray(parsed.state.datasets)
            ) {
              parsed.state.datasets = parsed.state.datasets.map(
                (ds: Record<string, unknown>) => ({
                  ...ds,
                  createdAt: ds.createdAt
                    ? new Date(ds.createdAt as string)
                    : undefined,
                })
              );
            }
            return parsed;
          } catch {
            return JSON.parse(str);
          }
        },
        setItem: (name: string, value: unknown) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name: string) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);

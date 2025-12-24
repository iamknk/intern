import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Document, DocumentStatus, ExtractedData, Dataset } from "../types";

interface DocumentStore {
  documents: Document[];
  datasets: Dataset[];
  activeDatasetId?: string | null;
  addDocument: (file: File) => string;
  addDocumentWithDataset: (file: File, datasetId: string | null) => string;
  addDocumentWithDatasets: (file: File, datasetIds: string[]) => string;
  createDataset: (name: string, description?: string, color?: string) => string;
  selectDataset: (id: string | null) => void;
  appendDocumentsToDataset: (datasetId: string, documentIds: string[]) => void;
  addDocumentToDataset: (datasetId: string, documentId: string) => void;
  removeDocumentFromDataset: (datasetId: string, documentId: string) => void;
  detectDuplicatesForDataset: (
    datasetId: string,
    candidateDocumentIds?: string[]
  ) => string[];
  moveDocumentToDataset: (
    documentId: string,
    datasetId?: string | null
  ) => void;
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

      addDocumentWithDataset: (file: File, datasetId: string | null) => {
        const newDocument: Document = {
          id: crypto.randomUUID(),
          filename: file.name,
          status: "queued",
          uploadedAt: new Date(),
          datasetIds: datasetId ? [datasetId] : [],
        };

        set((state) => {
          const docs = [...state.documents, newDocument];

          if (datasetId) {
            const dsIndex = state.datasets.findIndex((d) => d.id === datasetId);
            if (dsIndex !== -1) {
              const ds = state.datasets[dsIndex];
              const updatedDs = {
                ...ds,
                documentIds: [...(ds.documentIds ?? []), newDocument.id],
              };
              const datasets = [...state.datasets];
              datasets[dsIndex] = updatedDs;
              return { documents: docs, datasets };
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

      // add a single document into a dataset (tag)
      addDocumentToDataset: (datasetId: string, documentId: string) => {
        set((state) => ({
          datasets: state.datasets.map((ds) =>
            ds.id === datasetId
              ? {
                  ...ds,
                  documentIds: Array.from(
                    new Set([...(ds.documentIds ?? []), documentId])
                  ),
                }
              : ds
          ),
          documents: state.documents.map((doc) =>
            doc.id === documentId
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

      detectDuplicatesForDataset: (
        datasetId: string,
        candidateDocumentIds?: string[]
      ) => {
        // simple filename-based duplicate detection
        // returns array of candidate ids that already exist in the target dataset
        return ((): string[] => {
          // build a set of filenames in dataset
          const dataset = (useDocumentStore as any)
            .getState?.()
            ?.datasets?.find((d: Dataset) => d.id === datasetId);
          const existingIds = dataset?.documentIds ?? [];
          const existingFiles = new Set<string>();
          const stateDocs =
            (useDocumentStore as any).getState?.()?.documents ?? [];
          existingIds.forEach((id: string) => {
            const doc = stateDocs.find((d: Document) => d.id === id);
            if (doc) existingFiles.add(doc.filename.toLowerCase());
          });

          const candidates = candidateDocumentIds ?? [];
          return candidates.filter((cid) => {
            const cdoc = stateDocs.find((d: Document) => d.id === cid);
            if (!cdoc) return false;
            return existingFiles.has(cdoc.filename.toLowerCase());
          });
        })();
      },

      // For backwards compatibility: if datasetId provided, add it to the document's datasetIds;
      // if undefined/null, remove the document from all datasets (make uncategorized).
      moveDocumentToDataset: (
        documentId: string,
        datasetId?: string | null
      ) => {
        set((state) => {
          const doc = state.documents.find((d) => d.id === documentId);
          if (!doc) return {};

          let datasets = state.datasets.map((ds) => ({ ...ds }));

          if (datasetId) {
            // add membership
            datasets = datasets.map((ds) =>
              ds.id === datasetId
                ? {
                    ...ds,
                    documentIds: Array.from(
                      new Set([...(ds.documentIds ?? []), documentId])
                    ),
                  }
                : ds
            );
            const documents = state.documents.map((d) =>
              d.id === documentId
                ? {
                    ...d,
                    datasetIds: Array.from(
                      new Set([...(d.datasetIds ?? []), datasetId])
                    ),
                  }
                : d
            );
            return { datasets, documents };
          } else {
            // remove from all datasets
            datasets = datasets.map((ds) => ({
              ...ds,
              documentIds: (ds.documentIds ?? []).filter(
                (id) => id !== documentId
              ),
            }));
            const documents = state.documents.map((d) =>
              d.id === documentId ? { ...d, datasetIds: [] } : d
            );
            return { datasets, documents };
          }
        });
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
              // migrate legacy datasetId -> datasetIds
              datasetIds: d.datasetIds ?? (d.datasetId ? [d.datasetId] : []),
              uploadedAt: d.uploadedAt ? new Date(d.uploadedAt) : undefined,
              processedAt: d.processedAt ? new Date(d.processedAt) : undefined,
            }));
          }
          if (parsed?.state?.datasets && Array.isArray(parsed.state.datasets)) {
            parsed.state.datasets = parsed.state.datasets.map((ds: any) => ({
              ...ds,
              createdAt: ds.createdAt ? new Date(ds.createdAt) : undefined,
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

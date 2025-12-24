export type DocumentStatus =
  | "queued"
  | "processing"
  | "done"
  | "awaiting_review"
  | "reviewed"
  | "failed";

export interface ExtractedData {
  name: string;
  surname: string;
  address_street: string;
  address_house_number: string;
  address_zip_code: string;
  address_city: string;
  warm_rent: number;
  cold_rent: number;
  rent_increase_type: string;
  date: string;
  is_active: boolean;

  deposit?: number;
  contract_term_months?: number;
  notice_period_months?: number;
  landlord_entity?: string;

  confidence?: Record<string, number>;
}

export interface Dataset {
  id: string;
  name: string;
  createdAt: Date;
  description?: string;
  documentIds?: string[];
  // optional category pills/tags for UI grouping
  categories?: string[];
  color?: string;
}

export interface Document {
  id: string;
  filename: string;
  status: DocumentStatus;
  uploadedAt: Date;
  error?: string;
  extractedData?: ExtractedData;
  qualityScore?: number;
  processedAt?: Date;
  isReviewed?: boolean;
  hasUnsavedChanges?: boolean;
  // allow multiple dataset membership (tags)
  datasetIds?: string[];
}

export type DocumentStatus = 'queued' | 'processing' | 'done' | 'failed';

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

export interface Document {
  id: string;
  filename: string;
  status: DocumentStatus;
  uploadedAt: Date;
  error?: string;
  extractedData?: ExtractedData;
  qualityScore?: number; 
  processedAt?: Date;
}


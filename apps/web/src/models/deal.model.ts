export interface ExtractedFact {
  id: string;
  name: string;
  value: string | number;
  source_document: string;
  page_number: number;
  line_reference?: string;
  is_approved: boolean;
  is_locked: boolean;
}

export interface Deal {
  deal_id: string;
  deal_name: string;
  status: "uploading" | "extracting" | "review" | "approved" | "underwriting";
  created_at: string;
  documents: DealDocument[];
  facts: ExtractedFact[];
}

export interface DealDocument {
  document_id: string;
  file_name: string;
  document_type: "rent_roll" | "p_l" | "mortgage_statement" | "other";
  task_id?: string;
  status: "uploaded" | "processing" | "completed" | "failed";
  page_count?: number;
}


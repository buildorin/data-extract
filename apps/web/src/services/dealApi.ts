import axiosInstance from "./axios.config";
import { Deal, DealDocument, ExtractedFact } from "../models/deal.model";
import { createMockDeal, MOCK_FACTS, MOCK_DOCUMENTS, MOCK_DEALS, isMockDeal } from "./mockDealData";

// TODO: Set to false once backend is fully operational
const USE_MOCK_DATA = true;

export interface CreateDealRequest {
  deal_name: string;
}

export interface DealResponse {
  deal_id: string;
  user_id: string;
  deal_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  metadata: any;
  document_count?: number;
  fact_count?: number;
}

export interface DocumentResponse {
  document_id: string;
  deal_id: string;
  file_name: string;
  document_type: string;
  status: string;
  storage_location?: string;
  page_count?: number;
  created_at: string;
  updated_at: string;
  extracted_at?: string;
}

export interface FactResponse {
  fact_id: string;
  document_id: string;
  deal_id: string;
  fact_type: string;
  label: string;
  value: string;
  unit?: string;
  source_citation: {
    document: string;
    page: number;
    line?: string;
    bbox?: {
      left: number;
      top: number;
      width: number;
      height: number;
    };
  };
  status: string;
  confidence_score?: number;
  approved_at?: string;
  approved_by?: string;
  locked: boolean;
  created_at: string;
}

// Create a new deal
export const createDeal = async (dealName: string): Promise<DealResponse> => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newDeal = createMockDeal(dealName);
    console.log("Created mock deal:", newDeal);
    return newDeal;
  }
  
  const response = await axiosInstance.post("/api/v1/deals", {
    deal_name: dealName,
  });
  return response.data;
};

// Get all deals for the current user
export const getDeals = async (): Promise<DealResponse[]> => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_DEALS;
  }
  
  const response = await axiosInstance.get("/api/v1/deals");
  return response.data;
};

// Get a specific deal by ID
export const getDeal = async (dealId: string): Promise<DealResponse> => {
  if (USE_MOCK_DATA && isMockDeal(dealId)) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const deal = MOCK_DEALS.find((d) => d.deal_id === dealId);
    if (!deal) throw new Error("Deal not found");
    return deal;
  }
  
  const response = await axiosInstance.get(`/api/v1/deals/${dealId}`);
  return response.data;
};

// Upload documents to a deal
export const uploadDealDocuments = async (
  dealId: string,
  files: File[],
  documentType: string
): Promise<DocumentResponse[]> => {
  if (USE_MOCK_DATA && isMockDeal(dealId)) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const mockDocuments: DocumentResponse[] = files.map((file, index) => ({
      document_id: `doc-${Date.now()}-${index}-mockdata`,
      deal_id: dealId,
      file_name: file.name,
      document_type: documentType,
      status: "processing",
      storage_location: `/mock-documents/${file.name}`,
      page_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      extracted_at: undefined,
    }));
    
    MOCK_DOCUMENTS.push(...mockDocuments);
    
    const deal = MOCK_DEALS.find(d => d.deal_id === dealId);
    if (deal) {
      deal.document_count = (deal.document_count || 0) + files.length;
      deal.status = "processing_documents";
      deal.updated_at = new Date().toISOString();
    }
    
    console.log("Created mock documents:", mockDocuments);
    return mockDocuments;
  }
  
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("document_type", documentType);

  const response = await axiosInstance.post(
    `/api/v1/deals/${dealId}/documents`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  
  return response.data;
};

// Get documents for a deal
export const getDealDocuments = async (
  dealId: string
): Promise<DocumentResponse[]> => {
  if (USE_MOCK_DATA && isMockDeal(dealId)) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_DOCUMENTS.filter((d) => d.deal_id === dealId);
  }
  
  const response = await axiosInstance.get(`/api/v1/deals/${dealId}/documents`);
  return response.data;
};

// Get facts for a deal
export const getDealFacts = async (dealId: string): Promise<FactResponse[]> => {
  if (USE_MOCK_DATA && isMockDeal(dealId)) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_FACTS.filter((f) => f.deal_id === dealId);
  }
  
  const response = await axiosInstance.get(`/api/v1/deals/${dealId}/facts`);
  return response.data;
};

// Approve a single fact
export const approveFact = async (
  dealId: string,
  factId: string
): Promise<FactResponse> => {
  if (USE_MOCK_DATA && isMockDeal(dealId)) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const fact = MOCK_FACTS.find((f) => f.fact_id === factId);
    if (!fact) throw new Error("Fact not found");
    fact.status = "approved";
    fact.locked = true;
    return fact;
  }
  
  const response = await axiosInstance.patch(
    `/api/v1/deals/${dealId}/facts/${factId}/approve`
  );
  return response.data;
};

// Approve multiple facts
export const approveFacts = async (
  dealId: string,
  factIds: string[]
): Promise<FactResponse[]> => {
  if (USE_MOCK_DATA && isMockDeal(dealId)) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const approvedFacts: FactResponse[] = [];
    factIds.forEach(factId => {
      const fact = MOCK_FACTS.find((f) => f.fact_id === factId);
      if (fact) {
        fact.status = "approved";
        fact.locked = true;
        approvedFacts.push(fact);
      }
    });
    return approvedFacts;
  }
  
  const response = await axiosInstance.post(
    `/api/v1/deals/${dealId}/facts/approve-batch`,
    { fact_ids: factIds }
  );
  return response.data;
};

// Reset facts
export const resetFacts = async (
  dealId: string,
  factIds?: string[]
): Promise<void> => {
  if (USE_MOCK_DATA && isMockDeal(dealId)) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    MOCK_FACTS.forEach(fact => {
      if (fact.deal_id === dealId) {
        fact.status = "pending_approval";
        fact.locked = false;
      }
    });
    return;
  }
  
  await axiosInstance.post(
    `/api/v1/deals/${dealId}/facts/reset`,
    { fact_ids: factIds || [] }
  );
};

// Update a fact
export const updateFact = async (
  dealId: string,
  factId: string,
  updates: Partial<FactResponse>
): Promise<FactResponse> => {
  if (USE_MOCK_DATA && isMockDeal(dealId)) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const fact = MOCK_FACTS.find((f) => f.fact_id === factId);
    if (!fact) throw new Error("Fact not found");
    Object.assign(fact, updates);
    return fact;
  }
  
  const response = await axiosInstance.patch(
    `/api/v1/deals/${dealId}/facts/${factId}`,
    updates
  );
  return response.data;
};

// Update deal status
export const updateDealStatus = async (
  dealId: string,
  status: string
): Promise<void> => {
  if (USE_MOCK_DATA && isMockDeal(dealId)) {
    const deal = MOCK_DEALS.find((d) => d.deal_id === dealId);
    if (deal) {
      deal.status = status;
      deal.updated_at = new Date().toISOString();
    }
    return;
  }

  await axiosInstance.patch(`/api/v1/deals/${dealId}`, { status });
};

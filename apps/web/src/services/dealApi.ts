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
  fact_count?: number;
  url?: string; // URL to view/download the document
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
    // Simulate API delay
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
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8ba094c0-f913-4a1d-9d69-0a38a5483749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dealApi.ts:getDeals',message:'Returning mock deals',data:{dealCount:MOCK_DEALS.length,deals:MOCK_DEALS.map(d=>({id:d.deal_id,name:d.deal_name,status:d.status,factCount:d.fact_count}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return MOCK_DEALS;
  }
  
  const response = await axiosInstance.get("/api/v1/deals");
  return response.data;
};

// Get a specific deal by ID
export const getDeal = async (dealId: string): Promise<DealResponse> => {
  if (USE_MOCK_DATA && isMockDeal(dealId)) {
    // Simulate API delay
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
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_DOCUMENTS;
  }
  
  const response = await axiosInstance.get(`/api/v1/deals/${dealId}/documents`);
  return response.data;
};

// Get facts for a deal
export const getDealFacts = async (dealId: string): Promise<FactResponse[]> => {
  if (USE_MOCK_DATA && isMockDeal(dealId)) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_FACTS;
  }
  
  const response = await axiosInstance.get(`/api/v1/deals/${dealId}/facts`);
  return response.data;
};

// Update a fact value
export const updateFact = async (
  dealId: string,
  factId: string,
  value: string,
  unit?: string
): Promise<void> => {
  if (USE_MOCK_DATA && isMockDeal(dealId)) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));
    console.log("Updated mock fact:", factId, value);
    return;
  }
  
  await axiosInstance.patch(`/api/v1/deals/${dealId}/facts/${factId}`, {
    value,
    unit,
  });
};

// Approve facts (lock them)
export const approveFacts = async (
  dealId: string,
  factIds: string[]
): Promise<void> => {
  if (USE_MOCK_DATA && isMockDeal(dealId)) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log("Approved mock facts:", factIds);
    return;
  }
  
  await axiosInstance.post(`/api/v1/deals/${dealId}/facts/approve`, {
    fact_ids: factIds,
  });
};

// Reset all facts to editable
export const resetFacts = async (dealId: string): Promise<void> => {
  if (USE_MOCK_DATA && isMockDeal(dealId)) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));
    console.log("Reset mock facts for deal:", dealId);
    return;
  }
  
  await axiosInstance.post(`/api/v1/deals/${dealId}/facts/reset`);
};

// Update deal status
export const updateDealStatus = async (
  dealId: string,
  status: string
): Promise<void> => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/8ba094c0-f913-4a1d-9d69-0a38a5483749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dealApi.ts:updateDealStatus',message:'updateDealStatus called',data:{dealId,status,useMockData:USE_MOCK_DATA},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  if (USE_MOCK_DATA && isMockDeal(dealId)) {
    // Update mock deal status
    const deal = MOCK_DEALS.find((d) => d.deal_id === dealId);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8ba094c0-f913-4a1d-9d69-0a38a5483749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dealApi.ts:updateDealStatus',message:'Finding deal in mock data',data:{dealId,dealFound:!!deal,currentStatus:deal?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    if (deal) {
      const oldStatus = deal.status;
      deal.status = status;
      deal.updated_at = new Date().toISOString();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8ba094c0-f913-4a1d-9d69-0a38a5483749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dealApi.ts:updateDealStatus',message:'Updated deal status',data:{dealId,dealName:deal.deal_name,oldStatus,newStatus:deal.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      console.log("Updated mock deal status:", dealId, status);
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    return;
  }

  await axiosInstance.patch(`/api/v1/deals/${dealId}`, { status });
};


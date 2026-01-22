import axios from 'axios';

// Live share management uses localStorage since backend live share APIs are partially implemented
const USE_MOCK_DATA = true;  // Using mock data until backend live share APIs are fully integrated

// #region agent log
fetch('http://127.0.0.1:7242/ingest/8ba094c0-f913-4a1d-9d69-0a38a5483749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'liveShareApi.ts:3',message:'Module loading - checking exports',data:{USE_MOCK_DATA,exports:['getLiveShares','createLiveShare','getLiveShare','deleteLiveShare','getLiveShareAnalytics','getInvestorInterest','addInvestorInterest','deleteInvestorInterest','getPublicShare','trackView','trackShareView']},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H4'})}).catch(()=>{});
// #endregion

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface LiveShare {
  id: string;
  deal_id: string;
  short_id: string;
  share_url: string;
  expires_at: string;
  view_count: number;
  is_expired: boolean;
  created_at: string;
}

export interface CreateLiveShareRequest {
  deal_id: string;
  expires_in_days: number;
}

export interface InvestorInterest {
  id: string;
  live_share_id: string;
  name: string;
  amount: number | null;
  status: 'Interested' | 'Maybe' | 'Passed';
  notes: string | null;
  created_at: string;
}

export interface ShareAnalytics {
  view_count: number;
  interest_count: number;
  total_interest_amount: number | null;
  is_expired: boolean;
  expires_at: string;
}

/**
 * Create a new live share link
 */
export async function createLiveShare(request: CreateLiveShareRequest): Promise<LiveShare> {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/8ba094c0-f913-4a1d-9d69-0a38a5483749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'liveShareApi.ts:createLiveShare',message:'Creating live share',data:{USE_MOCK_DATA,request,requestType:typeof request,expiresInDays:request?.expires_in_days,dealId:request?.deal_id},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  
  if (USE_MOCK_DATA) {
    // Use mock data from localStorage
    const mockShares = localStorage.getItem('live_shares');
    const shares: LiveShare[] = mockShares ? JSON.parse(mockShares) : [];
    
    const shortId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const id = `live-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date();
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8ba094c0-f913-4a1d-9d69-0a38a5483749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'liveShareApi.ts:createLiveShare',message:'Before date calculation',data:{expiresInDays:request.expires_in_days,expiresInDaysType:typeof request.expires_in_days,currentDate:expiresAt.toISOString()},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    expiresAt.setDate(expiresAt.getDate() + (request.expires_in_days || 7));
    
    const newShare: LiveShare = {
      id,
      deal_id: request.deal_id,
      short_id: shortId,
      share_url: `${window.location.origin}/share/${shortId}`,
      expires_at: expiresAt.toISOString(),
      view_count: 0,
      is_expired: false,
      created_at: new Date().toISOString(),
    };
    
    shares.push(newShare);
    localStorage.setItem('live_shares', JSON.stringify(shares));
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8ba094c0-f913-4a1d-9d69-0a38a5483749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'liveShareApi.ts:createLiveShare',message:'Created mock live share',data:{newShare},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    
    return newShare;
  }
  
  const response = await axios.post<LiveShare>(
    `${API_BASE_URL}/api/v1/live-shares`,
    request,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    }
  );
  return response.data;
}

/**
 * Get all live shares for the current user
 */
export async function getLiveShares(): Promise<LiveShare[]> {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/8ba094c0-f913-4a1d-9d69-0a38a5483749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'liveShareApi.ts:getLiveShares',message:'Getting live shares',data:{USE_MOCK_DATA},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H4'})}).catch(()=>{});
  // #endregion
  
  if (USE_MOCK_DATA) {
    // Use mock data from localStorage
    const mockShares = localStorage.getItem('live_shares');
    const shares: LiveShare[] = mockShares ? JSON.parse(mockShares) : [];
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8ba094c0-f913-4a1d-9d69-0a38a5483749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'liveShareApi.ts:getLiveShares',message:'Retrieved mock live shares',data:{count:shares.length,shares},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    
    return shares;
  }
  
  const response = await axios.get<LiveShare[]>(
    `${API_BASE_URL}/api/v1/live-shares`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    }
  );
  return response.data;
}

/**
 * Get a specific live share
 */
export async function getLiveShare(id: string): Promise<LiveShare> {
  if (USE_MOCK_DATA) {
    const mockShares = localStorage.getItem('live_shares');
    const shares: LiveShare[] = mockShares ? JSON.parse(mockShares) : [];
    const share = shares.find(s => s.id === id);
    
    if (!share) {
      throw new Error('Live share not found');
    }
    
    return share;
  }
  
  const response = await axios.get<LiveShare>(
    `${API_BASE_URL}/api/v1/live-shares/${id}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    }
  );
  return response.data;
}

/**
 * Delete a live share
 */
export async function deleteLiveShare(id: string): Promise<void> {
  if (USE_MOCK_DATA) {
    const mockShares = localStorage.getItem('live_shares');
    if (!mockShares) {
      throw new Error('Live share not found');
    }
    
    const shares: LiveShare[] = JSON.parse(mockShares);
    const filtered = shares.filter(s => s.id !== id);
    
    if (filtered.length === shares.length) {
      throw new Error('Live share not found');
    }
    
    localStorage.setItem('live_shares', JSON.stringify(filtered));
    return;
  }
  
  await axios.delete(
    `${API_BASE_URL}/api/v1/live-shares/${id}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    }
  );
}

/**
 * Get analytics for a live share
 */
export async function getLiveShareAnalytics(id: string): Promise<ShareAnalytics> {
  if (USE_MOCK_DATA) {
    const mockShares = localStorage.getItem('live_shares');
    const shares: LiveShare[] = mockShares ? JSON.parse(mockShares) : [];
    const share = shares.find(s => s.id === id);
    
    if (!share) {
      throw new Error('Live share not found');
    }
    
    // Get interest data for this share
    const mockInterests = localStorage.getItem('investor_interest');
    const allInterests: InvestorInterest[] = mockInterests ? JSON.parse(mockInterests) : [];
    const shareInterests = allInterests.filter(i => i.live_share_id === id);
    
    const totalAmount = shareInterests.reduce((sum, i) => sum + (i.amount || 0), 0);
    
    return {
      view_count: share.view_count,
      interest_count: shareInterests.length,
      total_interest_amount: totalAmount > 0 ? totalAmount : null,
      is_expired: share.is_expired || new Date(share.expires_at) < new Date(),
      expires_at: share.expires_at,
    };
  }
  
  const response = await axios.get<ShareAnalytics>(
    `${API_BASE_URL}/api/v1/live-shares/${id}/analytics`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    }
  );
  return response.data;
}

/**
 * Get public share by short_id (no auth required)
 */
export async function getPublicShare(shortId: string): Promise<{ share: LiveShare; deal: any }> {
  // For now, use mock data since backend route is not yet implemented
  // TODO: Replace with actual API call once backend route is ready
  const mockShares = localStorage.getItem('live_shares');
  const mockDeals = localStorage.getItem('deals');
  
  if (mockShares && mockDeals) {
    const shares: LiveShare[] = JSON.parse(mockShares);
    const deals: any[] = JSON.parse(mockDeals);
    
    const share = shares.find(s => s.short_id === shortId);
    if (!share) {
      throw new Error('Share not found');
    }
    
    const deal = deals.find(d => d.deal_id === share.deal_id);
    if (!deal) {
      throw new Error('Deal not found');
    }
    
    return { share, deal };
  }
  
  throw new Error('Share not found');
}

/**
 * Track a view on a public share link (no auth required)
 */
export async function trackShareView(shortId: string): Promise<void> {
  await axios.post(
    `${API_BASE_URL}/api/v1/share/${shortId}/view`,
    {
      ip_address: null,
      user_agent: navigator.userAgent,
    }
  );
}

/**
 * Track a view (alias for trackShareView with optional parameters)
 */
export async function trackView(
  shortId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await axios.post(
    `${API_BASE_URL}/api/v1/share/${shortId}/view`,
    {
      ip_address: ipAddress || null,
      user_agent: userAgent || navigator.userAgent,
    }
  );
}

/**
 * Get investor interest for a live share (authenticated)
 */
export async function getInvestorInterest(liveShareId: string): Promise<InvestorInterest[]> {
  // For now, use mock data since backend route is not yet implemented
  // TODO: Replace with actual API call once backend route is ready
  const mockData = localStorage.getItem('investor_interest');
  if (mockData) {
    const allInterests = JSON.parse(mockData) as InvestorInterest[];
    return allInterests.filter(i => i.live_share_id === liveShareId);
  }
  return [];
}

/**
 * Add investor interest for a live share (authenticated)
 */
export async function addInvestorInterest(
  liveShareId: string,
  data: { name: string; amount?: number; status: string; notes?: string }
): Promise<InvestorInterest> {
  // For now, use mock data since backend route is not yet implemented
  // TODO: Replace with actual API call once backend route is ready
  const mockData = localStorage.getItem('investor_interest');
  const allInterests: InvestorInterest[] = mockData ? JSON.parse(mockData) : [];
  
  const newInterest: InvestorInterest = {
    id: `interest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    live_share_id: liveShareId,
    name: data.name,
    amount: data.amount || null,
    status: data.status as 'Interested' | 'Maybe' | 'Passed',
    notes: data.notes || null,
    created_at: new Date().toISOString(),
  };
  
  allInterests.push(newInterest);
  localStorage.setItem('investor_interest', JSON.stringify(allInterests));
  
  return newInterest;
}

/**
 * Delete investor interest (authenticated)
 */
export async function deleteInvestorInterest(
  liveShareId: string,
  interestId: string
): Promise<void> {
  // For now, use mock data since backend route is not yet implemented
  // TODO: Replace with actual API call once backend route is ready
  const mockData = localStorage.getItem('investor_interest');
  if (!mockData) {
    throw new Error('Interest not found');
  }
  
  const allInterests: InvestorInterest[] = JSON.parse(mockData);
  const filtered = allInterests.filter(
    i => !(i.live_share_id === liveShareId && i.id === interestId)
  );
  
  if (filtered.length === allInterests.length) {
    throw new Error('Interest not found');
  }
  
  localStorage.setItem('investor_interest', JSON.stringify(filtered));
}

/**
 * Submit investor interest on a public share link (no auth required)
 */
export async function submitInvestorInterest(
  shortId: string,
  data: { name: string; amount?: number; status: string; notes?: string }
): Promise<{ id: string; message: string }> {
  const response = await axios.post<{ id: string; message: string }>(
    `${API_BASE_URL}/api/v1/share/${shortId}/interest`,
    {
      name: data.name,
      amount: data.amount || null,
      status: data.status,
      notes: data.notes || null,
    }
  );
  return response.data;
}

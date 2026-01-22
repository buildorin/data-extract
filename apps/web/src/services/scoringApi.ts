import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface CalculateScoreResponse {
  score: number | null;
  tier: string | null;
  breakdown: Record<string, number> | null;
  calculated_at: string | null;
}

/**
 * Calculate Orin Score for a deal
 */
export async function calculateDealScore(dealId: string): Promise<CalculateScoreResponse> {
  const response = await axios.post<CalculateScoreResponse>(
    `${API_BASE_URL}/api/v1/deals/${dealId}/calculate-score`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    }
  );
  return response.data;
}

/**
 * Get existing Orin Score for a deal
 */
export async function getDealScore(dealId: string): Promise<CalculateScoreResponse> {
  const response = await axios.get<CalculateScoreResponse>(
    `${API_BASE_URL}/api/v1/deals/${dealId}/score`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    }
  );
  return response.data;
}

import axiosInstance from "./axios.config";

export interface UnderwritingInput {
  unit_count?: number;
  occupancy_rate?: number;
  gross_scheduled_rent?: number;
  collected_rent: number;
  operating_expenses: number;
  debt_service?: number;
  property_value?: number;
  mortgage_balance?: number;
  interest_rate?: number;
}

export interface CalculationStep {
  metric: string;
  formula: string;
  inputs: [string, number][];
  result: number;
  sources: string[];
}

export interface UnderwritingResult {
  noi: number;
  dscr?: number;
  cash_flow_after_debt?: number;
  cap_rate?: number;
  ltv?: number;
  gross_rent_multiplier?: number;
  audit_trail: CalculationStep[];
  warnings: string[];
}

export interface StressTestInput {
  base_result: UnderwritingResult;
  occupancy_adjustment?: number;
  rent_adjustment?: number;
  expense_adjustment?: number;
  interest_rate_adjustment?: number;
}

export interface StressTestComparison {
  noi_change: number;
  noi_change_pct: number;
  dscr_change?: number;
  cash_flow_change?: number;
}

export interface StressTestResult {
  stressed_noi: number;
  stressed_dscr?: number;
  stressed_cash_flow?: number;
  comparison: StressTestComparison;
}

const USE_MOCK_DATA = true; // Set to false to use real API

// Mock underwriting data
const MOCK_UNDERWRITING_DATA: Record<string, UnderwritingResult> = {
  "deal-003-mockdata": {
    noi: 70000, // Gross Scheduled Rent (120,000) - Operating Expenses (50,000)
    dscr: 1.75, // NOI (70,000) / Debt Service (40,000)
    cash_flow_after_debt: 30000, // NOI (70,000) - Debt Service (40,000)
    cap_rate: undefined,
    ltv: undefined,
    gross_rent_multiplier: undefined,
    audit_trail: [
      {
        metric: "Net Operating Income (NOI)",
        formula: "Gross Scheduled Rent - Operating Expenses",
        inputs: [
          ["Gross Scheduled Rent", 120000],
          ["Operating Expenses", 50000],
        ],
        result: 70000,
        sources: ["fact-003-mockdata", "fact-004-mockdata"],
      },
      {
        metric: "Debt Service Coverage Ratio (DSCR)",
        formula: "NOI / Annual Debt Service",
        inputs: [
          ["NOI", 70000],
          ["Annual Debt Service", 40000],
        ],
        result: 1.75,
        sources: ["fact-006-mockdata"],
      },
      {
        metric: "Cash Flow After Debt Service",
        formula: "NOI - Annual Debt Service",
        inputs: [
          ["NOI", 70000],
          ["Annual Debt Service", 40000],
        ],
        result: 30000,
        sources: ["fact-006-mockdata"],
      },
    ],
    warnings: [
      "Management fee of 5.8% is slightly above typical range (3-5%)",
    ],
  },
};

// Calculate underwriting metrics for a deal
export const calculateUnderwriting = async (
  dealId: string
): Promise<UnderwritingResult> => {
  if (USE_MOCK_DATA) {
    console.log(`[Mock] Calculating underwriting for deal: ${dealId}`);
    const mockData = MOCK_UNDERWRITING_DATA[dealId];
    if (mockData) {
      return new Promise((resolve) => setTimeout(() => resolve(mockData), 500));
    }
    throw new Error("Mock underwriting data not found for this deal");
  }

  const response = await axiosInstance.post(
    `/api/v1/deals/${dealId}/underwrite`
  );
  return response.data;
};

// Apply stress test scenarios (frontend calculation)
export const applyStressTest = (
  input: StressTestInput
): StressTestResult => {
  const base = input.base_result;

  // Extract base values from audit trail
  let gross_rent = 0;
  let operating_expenses = 0;
  let debt_service = 0;

  for (const step of base.audit_trail) {
    for (const [name, value] of step.inputs) {
      if (name === "Gross Scheduled Rent") gross_rent = value;
      if (name === "Collected Rent") gross_rent = value;
      if (name === "Operating Expenses") operating_expenses = value;
      if (name === "Annual Debt Service") debt_service = value;
      if (name === "Debt Service") debt_service = value;
    }
  }

  // Apply adjustments
  if (input.rent_adjustment !== undefined) {
    gross_rent *= 1 + input.rent_adjustment / 100;
  }

  if (input.expense_adjustment !== undefined) {
    operating_expenses *= 1 + input.expense_adjustment / 100;
  }

  if (input.interest_rate_adjustment !== undefined) {
    // Simplified: adjust debt service proportionally
    debt_service *= 1 + input.interest_rate_adjustment / 10000;
  }

  // Calculate stressed metrics
  const stressed_noi = gross_rent - operating_expenses;
  const stressed_dscr = debt_service > 0 ? stressed_noi / debt_service : undefined;
  const stressed_cash_flow = stressed_noi - debt_service;

  // Calculate changes
  const noi_change = stressed_noi - base.noi;
  const noi_change_pct = base.noi !== 0 ? (noi_change / base.noi) * 100 : 0;

  const dscr_change =
    stressed_dscr !== undefined && base.dscr !== undefined
      ? stressed_dscr - base.dscr
      : undefined;

  const cash_flow_change =
    base.cash_flow_after_debt !== undefined
      ? stressed_cash_flow - base.cash_flow_after_debt
      : undefined;

  return {
    stressed_noi,
    stressed_dscr,
    stressed_cash_flow,
    comparison: {
      noi_change,
      noi_change_pct,
      dscr_change,
      cash_flow_change,
    },
  };
};


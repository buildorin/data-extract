# Underwriting Models Feature Guide

## Overview

The Underwriting Models feature provides financial analysis and stress testing for verified real estate deals. It displays key metrics, allows scenario testing, and provides AI-driven observations based on hard-coded rules.

## Changes Implemented

### 1. Fact Review Updates

**File**: `apps/web/src/components/FactReview/FactReviewDeal.tsx`

- **Deal Name in Header**: Now displays "{Deal Name} · Fact Verification" at the top
- **"Verify All" → "Select All"**: Changed to only check/select all facts without auto-verifying
- **New "Run Underwriting Models →" Button**: 
  - Verifies all pending facts
  - Navigates to underwriting step
  - Prominent black button with arrow

### 2. New Underwriting Models View

**File**: `apps/web/src/components/Underwriting/UnderwritingModels.tsx`

#### Card-Style Deal Display
- Shows only verified deals (`fact_review` or `ready_for_underwriting` status)
- Each deal displayed as a card with:
  - Deal name
  - "Verified" badge
  - Fact count
  - Document count
  - "View Analysis →" button

#### Detailed Analysis Dialog

Opens when clicking on a deal card, showing:

**Key Metrics Section**:
- Net Operating Income (NOI)
- Debt Service Coverage Ratio (DSCR)
- Cash Flow After Debt
- Shows both base and stressed values

**Stress Test Controls**:
- **Expenses**: Slider from 0% to +20% (with +5%, +10% quick buttons)
- **Income**: Slider from -20% to 0% (with -5%, -10% quick buttons)
- Real-time metric updates as sliders change

**Observations Panel**:
- Appears when heuristic rules are triggered
- Shows warnings/critical issues
- Example: "Management fee is 7%. This is higher than typical (3–5%)."
- Action buttons:
  - "Normalize to X%" - Apply recommended value
  - "Keep Actuals" - Dismiss observation

### 3. Heuristic Rules Implemented

```typescript
// Management Fee Check
if (managementFeePercent > 5) {
  triggerObservation("Management Fee Above Market");
}

// DSCR Check
if (dscr < 1.25) {
  triggerObservation("DSCR Below Recommended Threshold");
}
```

### 4. Navigation Updates

**File**: `apps/web/src/pages/Dashboard/Dashboard.tsx`

- "Underwriting Model" left navigation now shows the new `UnderwritingModels` component
- Clicking "Underwriting Model" displays card-style list of verified deals
- Removed placeholder image, replaced with functional component

## UI/UX Design References

The design is inspired by modern fintech and fund manager tools:

### Card Layout
- **Plaid Dashboard**: Clean card-based layout for accounts
- **Carta**: Portfolio company cards with key metrics
- **AngelList**: Deal cards with status badges

### Metrics Display
- **Stripe Dashboard**: Large, prominent metric values
- **Brex**: Color-coded stress test results
- **Mercury**: Clean financial metric presentation

### Observations/Alerts
- **Ramp**: Warning cards with actionable buttons
- **Gusto**: Inline recommendations with "Fix" actions
- **QuickBooks**: Issue detection with normalize options

## User Flow

```
1. User completes fact verification
   ↓
2. Clicks "Run Underwriting Models →"
   ↓
3. Facts are verified and locked
   ↓
4. Navigates to Underwriting Models view
   ↓
5. Sees card for verified deal "Riverside Townhomes"
   ↓
6. Clicks "View Analysis →"
   ↓
7. Dialog opens showing:
   - NOI: $233,000
   - DSCR: 1.29x
   - Cash Flow: $53,000
   ↓
8. User adjusts stress test sliders:
   - Expenses: +10%
   - Income: -10%
   ↓
9. Metrics update in real-time:
   - Stressed NOI: $187,200
   - Stressed DSCR: 1.04x (shown in red)
   - Stressed Cash Flow: $7,200
   ↓
10. Observation appears:
    "⚠️ Management fee is 7%. This is higher than typical (3–5%)."
    ↓
11. User clicks "Normalize to 4%" or "Keep Actuals"
    ↓
12. Observation dismissed
    ↓
13. User clicks "Export Analysis" (future feature)
```

## Mock Data

**Riverside Townhomes** deal includes:
- Collected Rent: $378,000/year
- Operating Expenses: $145,000/year
- Debt Service: $180,000/year
- NOI: $233,000
- DSCR: 1.29x
- Cash Flow After Debt: $53,000

## Testing

### Test the Feature

1. **Navigate to Deals**:
   ```
   Dashboard → Deals → Click "Riverside Townhomes"
   ```

2. **Verify Facts**:
   ```
   Click "Select All" → Click "Verify Selected"
   OR
   Click "Run Underwriting Models →"
   ```

3. **View Underwriting**:
   ```
   Left Nav → Click "Underwriting Model"
   → See "Riverside Townhomes" card
   → Click "View Analysis →"
   ```

4. **Test Stress Scenarios**:
   ```
   Move "Expenses" slider to +10%
   Move "Income" slider to -10%
   → Watch metrics update in real-time
   ```

5. **Handle Observations**:
   ```
   See "Management Fee Above Market" warning
   → Click "Normalize to 4%" or "Keep Actuals"
   ```

## Files Modified

1. `apps/web/src/components/FactReview/FactReviewDeal.tsx`
   - Added deal name to header
   - Changed "Verify All" to "Select All"
   - Added "Run Underwriting Models →" button
   - Added `getDeal` query for deal info

2. `apps/web/src/components/Underwriting/UnderwritingModels.tsx` (NEW)
   - Card-based deal list
   - Detailed analysis dialog
   - Stress test controls
   - Observations panel with heuristic rules

3. `apps/web/src/components/Underwriting/UnderwritingModels.css` (NEW)
   - Card hover effects
   - Slider styling
   - Dialog layout

4. `apps/web/src/pages/Dashboard/Dashboard.tsx`
   - Integrated `UnderwritingModels` component
   - Updated navigation routing

5. `apps/web/src/services/dealApi.ts`
   - Added mock data support for `getDeal`
   - Exported `MOCK_DEALS` for underwriting view

## Future Enhancements

1. **More Heuristic Rules**:
   - Occupancy rate checks
   - Expense ratio analysis
   - Market comparison

2. **Export Functionality**:
   - PDF report generation
   - Excel export
   - Shareable links

3. **Historical Tracking**:
   - Save stress test scenarios
   - Compare multiple deals
   - Track changes over time

4. **Advanced Observations**:
   - LLM-powered insights
   - Market data integration
   - Peer benchmarking

## Design Decisions

### Why Card Layout?
- Easier to scan multiple deals
- Modern, familiar pattern
- Works well on mobile
- Clear visual hierarchy

### Why Dialog for Details?
- Keeps context (can see deal list behind)
- Prevents page navigation overhead
- Better for comparison (can open multiple)
- Cleaner URL structure

### Why Sliders for Stress Test?
- Intuitive interaction
- Real-time feedback
- Visual representation of changes
- Quick scenario testing

### Why Dismissible Observations?
- User maintains control
- Reduces alert fatigue
- Allows workflow continuation
- Clear action options

---

**Ready to test!** Refresh your browser and navigate to "Underwriting Model" in the left navigation.


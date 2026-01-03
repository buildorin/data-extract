# ✅ Mock Data Enabled - Test the UI Now!

## What's Been Done

I've added **test data seeding** to the frontend so you can test the entire deal flow **immediately** without waiting for the backend rebuild!

### Files Added/Modified

1. **`apps/web/src/services/mockDealData.ts`** (NEW)
   - Contains realistic mock data for deals, documents, and facts
   - Simulates a real estate property with 24 units, financials, and documents

2. **`apps/web/src/services/dealApi.ts`** (MODIFIED)
   - Added `USE_MOCK_DATA = true` flag at the top
   - All API functions now return mock data when enabled
   - Simulates API delays for realistic UX

3. **`apps/web/src/components/DealCards/DealCards.tsx`** (MODIFIED)
   - Uses mock data when `USE_MOCK_DATA = true`
   - Shows 3 sample deals with different statuses

## 🎯 Test the Full Flow Now

### Step 1: Refresh Your Browser

```bash
# Hard refresh to clear cache
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R
```

### Step 2: Navigate to Dashboard

Go to: `http://localhost:5173/dashboard`

You should immediately see:
- ✅ "Deals" as the active navigation
- ✅ "+ New Deal" button in the header
- ✅ **3 mock deals** displayed as cards:
  - Main Street Apartments (Draft)
  - Downtown Commercial Property (Processing)
  - Riverside Townhomes (Fact Review)

### Step 3: Test Deal Creation

1. **Click "+ New Deal"**
2. **Enter a deal name** (e.g., "Test Lakeside Property")
3. **Click "Create"**
4. ✅ Should show success toast
5. ✅ Should navigate to document upload step

### Step 4: Click on Existing Deal

1. **Click on "Riverside Townhomes"** (the third card)
2. ✅ Should navigate to Fact Review step
3. ✅ Should show **7 extracted facts**:
   - Unit Count: 24
   - Occupancy %: 87.5%
   - Gross Scheduled Rent: $432,000/year
   - Collected Rent: $378,000/year
   - Operating Expenses: $145,000/year
   - Debt Service: $180,000/year
   - Property Value: $3,500,000

### Step 5: Test Fact Review

In the Fact Review screen:

1. **Click on a fact value** to edit it inline
2. **Change the value** and press Enter
3. ✅ Should update (mock console log will show)
4. **Select multiple facts** with checkboxes
5. **Click "Approve Selected"**
6. ✅ Should show success toast
7. ✅ Should navigate to Underwriting step

### Step 6: Navigate to Underwriting

After approving facts, you'll see the Underwriting Dashboard (component exists but needs data integration - will show placeholder for now).

## 📊 Mock Data Details

### Mock Deals (3 total)

| Deal Name | Status | Documents | Facts |
|-----------|--------|-----------|-------|
| Main Street Apartments | Draft | 0 | 0 |
| Downtown Commercial Property | Processing | 2 | 3 |
| Riverside Townhomes | Fact Review | 4 | 7 |

### Mock Documents (4 for "Riverside Townhomes")

1. `Rent_Roll_2024.pdf` (3 pages) - ✅ Processed
2. `T12_Profit_Loss.pdf` (5 pages) - ✅ Processed
3. `Mortgage_Statement_Jan2024.pdf` (2 pages) - ✅ Processed
4. `Property_Tax_2023.pdf` (1 page) - ⏳ Pending

### Mock Facts (7 for "Riverside Townhomes")

All facts include:
- ✅ Source document reference
- ✅ Page number
- ✅ Line citation
- ✅ Confidence score (85%-98%)
- ✅ Editable values

## 🎨 What You'll See

### Deal Cards View
```
┌─────────────────────────────────┐
│ Main Street Apartments    Draft │
│                                  │
│ Documents: 0                     │
│ Facts: 0                         │
│ Created: 2 days ago              │
│                                  │
│ [View Deal]                      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Downtown Commercial  Processing │
│ Property                         │
│                                  │
│ Documents: 2                     │
│ Facts: 3                         │
│ Created: 5 days ago              │
│                                  │
│ [View Deal]                      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Riverside Townhomes  Fact Review│
│                                  │
│ Documents: 4                     │
│ Facts: 7                         │
│ Created: 10 days ago             │
│                                  │
│ [View Deal]                      │
└─────────────────────────────────┘
```

### Fact Review View
```
✓ Select All  [Approve Selected]  [Reset All]

┌────────────────────────────────────────┐
│ □ Unit Count: 24                       │
│   🟢 95% confidence                    │
│   📄 Rent_Roll_2024.pdf, Page 1       │
│   "Total Units: 24"                    │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ □ Occupancy %: 87.5%                   │
│   🟢 92% confidence                    │
│   📄 Rent_Roll_2024.pdf, Page 1       │
│   "Current Occupancy: 87.5%"           │
└────────────────────────────────────────┘

... (5 more facts)
```

## 🔄 Switching to Real Backend

Once your backend rebuild completes, you can switch to use the real API:

### 1. Update the Flag

In each of these files, change `USE_MOCK_DATA` from `true` to `false`:

```typescript
// apps/web/src/services/dealApi.ts
const USE_MOCK_DATA = false; // Change from true to false

// apps/web/src/components/DealCards/DealCards.tsx
const USE_MOCK_DATA = false; // Change from true to false
```

### 2. Verify Backend is Ready

```bash
# Check backend is running
curl http://localhost:8000/health

# Check deals endpoint exists (should return 401 Unauthorized, not 404)
curl http://localhost:8000/api/v1/deals
```

### 3. Refresh Browser

Hard refresh and you'll be using the real backend!

## 🐛 Troubleshooting

### Don't see any deals?

1. **Check browser console** (F12) - should see logs like "Created mock deal:"
2. **Hard refresh** (Cmd+Shift+R on Mac)
3. **Check the flag** - Ensure `USE_MOCK_DATA = true` in `dealApi.ts`

### Fact review not showing facts?

1. **Click on "Riverside Townhomes"** (the third deal) - it has mock facts
2. **Other deals are empty** - they're meant to show different states

### Create deal not working?

1. **Check browser console** for errors
2. **Look for toast notification** - should say "Deal created successfully!"
3. **Check if navigation happened** - URL should include `?dealId=...&step=upload`

## 📝 Console Logs

With mock data enabled, you'll see helpful console logs:

```
Created mock deal: { deal_id: "deal-1736272829000-mockdata", deal_name: "Test Property", ... }
Updated mock fact: fact-001-mockdata 30
Approved mock facts: ["fact-001-mockdata", "fact-002-mockdata"]
```

These help you understand what's happening without the backend!

## ✅ What Works with Mock Data

- ✅ Viewing list of deals
- ✅ Creating new deals
- ✅ Navigating to deal steps
- ✅ Viewing extracted facts
- ✅ Editing fact values (client-side only)
- ✅ Approving facts (client-side only)
- ✅ Resetting facts (client-side only)
- ✅ Viewing documents (metadata only)

## ❌ What Doesn't Work (Yet)

- ❌ Actual document upload (need backend)
- ❌ Real OCR extraction (need backend)
- ❌ Underwriting calculations (need implementation)
- ❌ Persistent data (refreshing browser resets to default mock data)

---

## 🎉 Ready to Test!

**Your UI is fully testable right now!** While the backend builds in the background, you can:

1. Test the entire user flow
2. Verify the UI/UX works as expected
3. Check for any visual or interaction bugs
4. Provide feedback on the design

Once the backend rebuild completes (~5-10 min), just flip the `USE_MOCK_DATA` flag to `false` and you'll have the full system working!

Happy testing! 🚀


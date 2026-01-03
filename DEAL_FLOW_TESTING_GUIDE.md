# Deal Flow Testing Guide

## ✅ Integration Complete!

All deal flow components are now integrated into the Dashboard. Here's how to test the new functionality:

## 🚀 How to Access the Deal Flow

### Step 1: Navigate to Deals
1. Open the Dashboard (`/dashboard`)
2. Click **"Deals"** in the left navigation (between "Deal Vault" and "Underwriting Model")
3. You should see the DealCards component (empty if no deals exist yet)

### Step 2: Create a New Deal
1. Click the **"+ New Deal"** button in the top-right toolbar (only visible when on Deals view)
2. Enter a deal name (e.g., "123 Main St Portfolio")
3. Click "Create Deal"
4. You'll automatically navigate to the upload step

### Step 3: Upload Documents
**URL Pattern**: `/dashboard?view=deals&dealId=xxx&step=upload`

- Select document type from dropdown (Rent Roll, P&L, Mortgage, etc.)
- Choose one or multiple files
- Click "Upload Documents"
- Files will be processed and facts will be extracted

### Step 4: Review Facts
**URL Pattern**: `/dashboard?view=deals&dealId=xxx&step=review`

You'll see:
- ✅ **Confidence Indicators**: 🟢 (High), 🟡 (Medium), 🔴 (Low)
- ✅ **Source Citations**: Document name, page number, line reference
- ✅ **Inline Editing**: Click to edit values before approval
- ✅ **Fact Locking**: Approve individual facts or all at once
- ✅ **Locked Facts**: Gray background, cannot be edited unless reset

Actions available:
- Edit fact values inline
- Select facts with checkboxes
- "Approve Selected" button
- "Approve All" button
- "Reset All Facts" button (unlocks everything)

### Step 5: View Underwriting
**URL Pattern**: `/dashboard?view=deals&dealId=xxx&step=underwrite`

You'll see:
- ✅ **Key Metrics**: NOI, DSCR, Cash Flow, Cap Rate, LTV
- ✅ **Visual Indicators**: Color-coded badges (Green=Good, Orange=Fair, Red=Poor)
- ✅ **Warnings**: Automatic recommendations from the agent
- ✅ **Stress Testing**: Real-time sliders for rent, expenses, interest rates
- ✅ **Audit Trail**: Full calculation breakdown with sources

Stress Test Controls:
- **Rent Adjustment**: -30% to +30%
- **Expense Adjustment**: -20% to +50%
- **Interest Rate**: -200bps to +300bps
- **Risk Indicator**: Color dot shows overall stress level

### Step 6: Navigate Back to Deal List
- Click "Deals" in the left navigation
- You'll see all your deals as cards with:
  - Deal name
  - Status badge
  - Document count
  - Fact count
  - Created date
  - "View Deal" button

## 🔍 What to Look For (Testing Checklist)

### ✅ Navigation
- [ ] "Deals" appears in left nav between "Deal Vault" and "Underwriting Model"
- [ ] Clicking "Deals" shows DealCards component
- [ ] "+ New Deal" button appears in toolbar when on Deals view
- [ ] Button disappears when on other views

### ✅ Deal Creation
- [ ] Dialog opens when clicking "+ New Deal"
- [ ] Can enter deal name
- [ ] "Create Deal" button is disabled when name is empty
- [ ] After creation, navigates to upload step
- [ ] Toast notification shows success

### ✅ Document Upload
- [ ] Document type dropdown works
- [ ] Can select multiple files
- [ ] File list shows with name and size
- [ ] Can remove files before upload
- [ ] Upload progress/feedback works
- [ ] After upload, can navigate to review step

### ✅ Fact Review
- [ ] Facts display with confidence indicators 🔴🟡🟢
- [ ] Source citations show (document, page, line)
- [ ] Can edit values inline
- [ ] Checkboxes for selection work
- [ ] "Approve Selected" button works
- [ ] "Approve All" button works
- [ ] After approval, facts show as locked (gray background)
- [ ] "Locked" badge appears on approved facts
- [ ] Cannot edit locked facts
- [ ] "Reset All Facts" unlocks everything

### ✅ Underwriting Dashboard
- [ ] NOI displays correctly
- [ ] DSCR shows with color-coded badge
- [ ] Cash Flow displays
- [ ] Cap Rate displays (if property value available)
- [ ] LTV displays (if mortgage + value available)
- [ ] Warnings appear if metrics are concerning
- [ ] Stress test sliders work
- [ ] Metrics update in real-time as sliders move
- [ ] Comparison shows change from baseline
- [ ] Audit trail displays all calculations
- [ ] Each calculation shows formula and inputs

### ✅ Data Flow
- [ ] Documents → Facts → Underwriting works end-to-end
- [ ] Deal status updates correctly
- [ ] Document count and fact count update
- [ ] Locked facts cannot be changed
- [ ] Reset functionality works

## 🐛 Common Issues & Solutions

### Issue: Can't see "Deals" in navigation
**Solution**: Refresh the page, make sure Dashboard.tsx changes are live

### Issue: "+ New Deal" button doesn't appear
**Solution**: Make sure you're on the Deals view (not Deal Vault)

### Issue: Facts not showing after upload
**Solution**: 
- Backend needs to process documents and extract facts
- Check that fact extraction pipeline is connected
- Verify documents table has OCR output

### Issue: Underwriting shows "No underwriting data available"
**Solution**:
- Make sure facts are approved (locked)
- Need at least: collected_rent and operating_expenses
- Check browser console for API errors

### Issue: Stress testing doesn't work
**Solution**: 
- This is frontend-only calculation, should work immediately
- Check browser console for JavaScript errors
- Verify sliders are moving

## 🔧 Backend Requirements

For the deal flow to work fully, the backend needs:

1. **Database Migration Applied**
   ```bash
   cd core
   diesel migration run
   ```

2. **Backend Running**
   ```bash
   cd core
   cargo run
   ```

3. **OCR Service Running** (for document processing)
   - Doctr service should be available
   - Check `services/doctr` is running

4. **Fact Extraction Enabled**
   - Fact extraction pipeline needs to process documents
   - Currently implemented but may need connection to OCR pipeline

## 📊 Expected API Endpoints

The frontend will call these endpoints:

- `POST /api/v1/deals` - Create deal
- `GET /api/v1/deals` - List deals
- `GET /api/v1/deals/:deal_id` - Get deal details
- `POST /api/v1/deals/:deal_id/documents` - Upload documents
- `GET /api/v1/deals/:deal_id/documents` - List documents
- `GET /api/v1/deals/:deal_id/facts` - Get facts
- `PATCH /api/v1/deals/:deal_id/facts/:fact_id` - Update fact
- `POST /api/v1/deals/:deal_id/facts/approve` - Approve facts
- `POST /api/v1/deals/:deal_id/facts/reset` - Reset facts
- `POST /api/v1/deals/:deal_id/underwrite` - Calculate underwriting

## 🎯 What's New vs. Old Flow

### Old Flow (Tasks)
- Single document per task
- No fact locking
- No underwriting calculation
- No stress testing
- No agent recommendations

### New Flow (Deals)
- Multiple documents per deal
- Fact approval & locking system
- Built-in underwriting with DSCR, NOI, etc.
- Real-time stress testing
- Intelligent agent recommendations
- Source citations for all facts
- Confidence scoring

## 🔄 Both Flows Available

The old "Deal Vault" (task-based) flow is still available:
- Keeps existing functionality
- Documents process as before
- Can use both systems in parallel
- Gradual migration path

## 📝 Next Steps After Testing

1. **Test End-to-End**:
   - Create deal → Upload docs → Review facts → Approve → View underwriting

2. **Test Edge Cases**:
   - Empty deal (no documents)
   - Upload fails
   - Fact approval with errors
   - Locked facts cannot be edited
   - Reset after approval

3. **Performance Testing**:
   - Multiple documents in one deal
   - Large files
   - Many facts
   - Stress testing with rapid slider changes

4. **User Experience**:
   - Navigation flow feels natural
   - Loading states are clear
   - Error messages are helpful
   - Success confirmations work

5. **Data Integrity**:
   - Facts stay locked after approval
   - Calculations are consistent
   - Source citations are accurate
   - Audit trail is complete

## 🎉 Success Criteria

- ✅ Can create a deal with 3+ documents in < 2 minutes
- ✅ Facts display with confidence indicators
- ✅ Fact approval/locking works correctly
- ✅ Underwriting metrics calculate accurately
- ✅ Stress testing updates in real-time
- ✅ Agent recommendations appear
- ✅ Audit trail shows all calculations

## 🆘 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check network tab for failed API calls
3. Verify backend is running
4. Check database migration status
5. Review `IMPLEMENTATION_SUMMARY.md` for architecture details

---

**Status**: ✅ Frontend integration complete, ready for testing!


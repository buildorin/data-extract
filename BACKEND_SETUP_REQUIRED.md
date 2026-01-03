# Backend Setup Required ⚠️

## Issue: 404 Error When Creating Deal

You're seeing a **404 error** when clicking "+ New Deal" because the backend API endpoints haven't been set up yet.

### What's Missing

The frontend is calling:
- `POST /api/v1/deals` (to create a deal)
- `GET /api/v1/deals` (to list deals)
- And 7 other endpoints...

But these endpoints don't exist in your running backend yet.

## ✅ How to Fix

### Step 1: Run Database Migration

The backend code is ready, but the database schema needs to be created:

```bash
cd /Users/harishmaiya/Documents/GitHub/data-extract/core
diesel migration run
```

This will create the `deals`, `documents`, and `facts` tables.

### Step 2: Restart Backend

After running the migration, restart your backend server:

```bash
# If using dev-run.sh
./scripts/dev-run.sh

# Or if running manually
cd core
cargo run
```

### Step 3: Verify API Endpoints

Once the backend is running, you should see these endpoints available:

```
POST   /api/v1/deals
GET    /api/v1/deals
GET    /api/v1/deals/:deal_id
POST   /api/v1/deals/:deal_id/documents
GET    /api/v1/deals/:deal_id/documents
GET    /api/v1/deals/:deal_id/facts
PATCH  /api/v1/deals/:deal_id/facts/:fact_id
POST   /api/v1/deals/:deal_id/facts/approve
POST   /api/v1/deals/:deal_id/facts/reset
POST   /api/v1/deals/:deal_id/underwrite
```

### Step 4: Test Again

1. Refresh the dashboard
2. Click "Deals" in navigation
3. Click "+ New Deal"
4. Enter a deal name
5. Should work now! ✅

## 🔍 Verify Migration Status

Check if the migration has been run:

```bash
cd core
diesel migration list
```

You should see `create_deals_schema` in the list of migrations.

## 📊 Verify Tables Created

Connect to your database and check:

```sql
-- Should return the tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('deals', 'documents', 'facts');
```

## 🐛 Troubleshooting

### Issue: `diesel` command not found

Install diesel CLI:
```bash
cargo install diesel_cli --no-default-features --features postgres
```

### Issue: Database connection error

Check your `DATABASE_URL` in `.env`:
```env
DATABASE_URL=postgresql://username:password@localhost/dbname
```

### Issue: Migration already exists

If you see "migration already applied", the schema is already there. Just restart the backend.

### Issue: Still getting 404

1. Check backend logs - is it running on port 8000?
2. Check `apps/web/src/services/axios.config.ts` - is the API URL correct?
3. Open browser DevTools → Network tab → See the exact URL being called

## 💡 Why This Happens

We implemented:
- ✅ Frontend UI (React components)
- ✅ Frontend API client (dealApi.ts)
- ✅ Backend API routes (routes/deal.rs)
- ✅ Backend models (models/deal.rs, document.rs, fact.rs)
- ✅ Database migration (migrations/.../up.sql)
- ❌ **Migration not run yet** ← This is the issue
- ❌ **Backend not restarted** ← Also needed

## 🎯 What Works Now (Without Backend)

Even without the backend endpoints working, the UI is fully functional for:
- Navigation
- Button states
- Dialog flows
- Component rendering

What **won't work** until backend is ready:
- Creating deals
- Uploading documents
- Extracting facts
- Running underwriting

## 📝 Alternative: Mock Data for Testing UI

If you want to test the UI without setting up the backend, I can add mock data to the components. This would let you see:
- Deal cards with sample data
- Fact review with fake facts
- Underwriting dashboard with calculated metrics

Just let me know if you want me to add temporary mock data!

---

**Next Step**: Run `diesel migration run` in the `core` directory, then restart your backend.


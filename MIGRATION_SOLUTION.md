# ✅ Solution: Run Migration Inside Docker Container

## The Problem

Your postgres is running **inside Docker** and not exposed to localhost, so you can't connect to it directly with `diesel migration run`.

## ✅ Solution: Run Migration via Docker Exec

Since the migration files are on your host machine, we'll use Docker exec to run the migration:

### Option 1: Run Migration from Docker Container (Recommended)

```bash
cd /Users/harishmaiya/Documents/GitHub/data-extract

# Copy migration files into the running server container
docker cp core/migrations data-extract-server-1:/app/migrations

# Run diesel migration inside the container
docker exec -it data-extract-server-1 diesel migration run --database-url postgresql://postgres:postgres@postgres:5432/chunkr

# Verify tables were created
docker exec -it data-extract-postgres-1 psql -U postgres -d chunkr -c "\dt"
```

You should see `deals`, `documents`, and `facts` in the table list.

### Option 2: Expose Postgres Port (Alternative)

If you want to run migrations from your host machine in the future, expose the postgres port:

1. **Edit your compose file** to add port mapping:

```yaml
# In compose-cpu.yaml or compose-local-dev.yaml
postgres:
  image: postgres:14
  ports:
    - "5432:5432"  # Add this line
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    POSTGRES_DB: chunkr
```

2. **Restart services**:

```bash
docker compose down
./scripts/dev-run.sh
```

3. **Run migration from host**:

```bash
cd core
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chunkr" diesel migration run
```

## Quick Verification Commands

After running the migration, verify everything worked:

```bash
# 1. Check tables exist
docker exec -it data-extract-postgres-1 psql -U postgres -d chunkr -c "\dt"

# Should show:
# - deals
# - documents  
# - facts
# (plus existing tables)

# 2. Check deals table structure
docker exec -it data-extract-postgres-1 psql -U postgres -d chunkr -c "\d deals"

# 3. Restart backend to load new routes
docker compose restart server

# 4. Test API endpoint
curl http://localhost:8000/api/v1/deals
# Should return: [] (empty array, not 404)
```

## After Migration Success

Once you see the tables and the API returns `[]` instead of 404:

1. ✅ Go to Dashboard → Deals
2. ✅ Click "+ New Deal"
3. ✅ Enter deal name (e.g., "Test Property Deal")
4. ✅ Click "Create"
5. ✅ Should navigate to document upload!

## Troubleshooting

### Error: "diesel: command not found" in container

The server container might not have diesel CLI. In that case:

```bash
# Install diesel in the container
docker exec -it data-extract-server-1 cargo install diesel_cli --no-default-features --features postgres

# Then run migration
docker exec -it data-extract-server-1 diesel migration run --database-url postgresql://postgres:postgres@postgres:5432/chunkr
```

### Error: "No such file or directory: migrations"

The migrations folder needs to be in the container:

```bash
# Copy migrations folder
docker cp core/migrations data-extract-server-1:/app/

# Try again
docker exec -it data-extract-server-1 diesel migration run --database-url postgresql://postgres:postgres@postgres:5432/chunkr
```

### Still Getting 404 After Migration

Restart the backend to load the new routes:

```bash
docker compose restart server

# Wait 10 seconds for it to start
sleep 10

# Test again
curl http://localhost:8000/api/v1/deals
```

## What This Does

The migration creates three new tables:

1. **`deals`** - Stores deal information (deal_id, user_id, deal_name, status)
2. **`documents`** - Stores uploaded documents per deal (document_id, deal_id, file_name, ocr_output)
3. **`facts`** - Stores extracted facts from documents (fact_id, document_id, label, value, source_citation)

These tables enable the new "Deals" workflow in your UI! 🚀


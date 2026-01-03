# Running Database Migration

## Quick Fix: Run Migration with DATABASE_URL

Since your postgres container is running, you can run the migration with the DATABASE_URL directly:

```bash
cd /Users/harishmaiya/Documents/GitHub/data-extract/core

# Run migration with inline DATABASE_URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chunkr" diesel migration run
```

## Alternative: Create .env File (Recommended)

Create a `.env` file in the `core` directory so you don't need to specify DATABASE_URL every time:

```bash
cd /Users/harishmaiya/Documents/GitHub/data-extract/core

# Create .env file
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chunkr
EOF

# Now you can run migrations without specifying the URL
diesel migration run
```

## Verify Migration Success

After running the migration, verify the tables were created:

```bash
# Connect to the database
docker exec -it data-extract-postgres-1 psql -U postgres -d chunkr

# List tables (should see deals, documents, facts)
\dt

# Exit
\q
```

## Connection Details

Based on your docker-compose setup:
- **Host**: `localhost`
- **Port**: `5432` (default)
- **Database**: `chunkr`
- **Username**: `postgres`
- **Password**: `postgres`

## After Migration

Once the migration completes successfully:

1. **Restart your backend** (if it's running):
   ```bash
   # If using docker compose
   docker compose restart server
   
   # Or restart the entire stack
   ./scripts/dev-run.sh
   ```

2. **Test the API**:
   ```bash
   # Should return 200 OK (or empty array)
   curl http://localhost:8000/api/v1/deals
   ```

3. **Try creating a deal** in the UI:
   - Go to Dashboard → Deals
   - Click "+ New Deal"
   - Enter a deal name
   - Should work now! ✅

## Troubleshooting

### Error: "could not connect to server"

The postgres container might not be exposing port 5432 to localhost. Check:

```bash
docker ps | grep postgres
```

If you don't see `5432:5432` in the ports column, you need to expose the port:

```bash
# Stop containers
docker compose down

# Edit compose file to add port mapping for postgres
# Then restart
./scripts/dev-run.sh
```

### Error: "database 'chunkr' does not exist"

Create the database:

```bash
docker exec -it data-extract-postgres-1 psql -U postgres -c "CREATE DATABASE chunkr;"
```

### Error: "permission denied"

Make sure you're in the `core` directory and have write permissions:

```bash
cd /Users/harishmaiya/Documents/GitHub/data-extract/core
ls -la migrations/
```

## Next Steps

After successful migration:
1. ✅ Tables created (`deals`, `documents`, `facts`)
2. ✅ Backend restarted
3. ✅ API endpoints available
4. ✅ UI can create deals

You're ready to test the full deal flow! 🚀


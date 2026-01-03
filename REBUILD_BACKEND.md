# 🔧 Backend Needs Rebuild

## The Real Problem

The Docker container is running a **pre-built image** from GitHub Container Registry:
- Image: `ghcr.io/buildorin/orin-server:latest`
- This image was built BEFORE we added the deal routes
- Simply restarting doesn't help - we need to rebuild with local source code

## ✅ Solution: Build Locally

You have two options:

### Option 1: Use Local Development Mode (Recommended)

Your `dev-run.sh` script supports local build mode:

```bash
cd /Users/harishmaiya/Documents/GitHub/data-extract

# Stop current containers
docker compose down

# Start in LOCAL mode (builds from source)
./scripts/dev-run.sh local
```

This will:
1. Build the backend from your local `core/` directory
2. Include all the new deal routes
3. Start all services

**Note**: First build might take 5-10 minutes as it compiles Rust code.

### Option 2: Rebuild Specific Service

If you want to keep using remote mode but rebuild just the server:

```bash
cd /Users/harishmaiya/Documents/GitHub/data-extract

# Build the server locally
docker compose -f compose-local-dev.yaml build server

# Restart with the new build
docker compose up -d server

# Wait for it to start
sleep 15

# Test the endpoint
curl http://localhost:8000/api/v1/deals
```

## Expected Result

After rebuilding, the logs should show:
- ✅ Backend starts successfully
- ✅ Routes registered
- ✅ `GET /api/v1/deals` returns `401 Unauthorized` (good!) or `[]` (if auth is disabled)
- ✅ NOT `404 Not Found`

## Verify It Worked

```bash
# Check logs don't show 404 for /deals
docker logs data-extract-server-1 --tail 20 | grep deals

# Test API
curl -v http://localhost:8000/api/v1/deals 2>&1 | grep "< HTTP"

# Should see: < HTTP/1.1 401 Unauthorized
# NOT: < HTTP/1.1 404 Not Found
```

## Why This Happened

1. ✅ We created the route files (`routes/deal.rs`)
2. ✅ We registered them in `lib.rs` (lines 207-218)
3. ✅ We ran the database migration
4. ❌ **We didn't rebuild the Docker container**

The running container has the OLD compiled binary that doesn't know about the new routes.

## After Successful Rebuild

Once you see the backend starting without errors:

1. **Refresh your browser** (Cmd+Shift+R)
2. **Go to Dashboard → Deals**
3. **Click "+ New Deal"**
4. **Enter a deal name**
5. **Should work!** ✅

## Troubleshooting

### Build fails with "cargo: command not found"

The local build requires Rust toolchain. If you don't have it:

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Or use the remote image (but you'll need to push your changes to GitHub first)
```

### Build takes forever

Rust compilation is slow on first build. It's caching dependencies. Subsequent builds will be faster (~1-2 minutes).

### Still getting 404 after rebuild

1. **Check the container is using the new image**:
   ```bash
   docker images | grep server
   ```

2. **Verify the routes exist in the binary**:
   ```bash
   docker logs data-extract-server-1 | grep -i "actix-web"
   ```

3. **Make sure you rebuilt the right service**:
   ```bash
   docker ps | grep server
   ```

## Quick Command

Just run this:

```bash
cd /Users/harishmaiya/Documents/GitHub/data-extract && ./scripts/dev-run.sh local
```

Then wait ~5-10 minutes for the first build, and you're good to go! 🚀


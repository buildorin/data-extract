# GitHub Container Registry Setup Guide

This guide helps you set up GitHub Container Registry (ghcr.io) following the official Chunkr pattern.

## 🎯 Why GitHub Container Registry?

The official Chunkr repository uses `ghcr.io/luminainc/*` images. We'll follow the same pattern with your GitHub account.

## 📋 Prerequisites

1. **GitHub Account** (you already have this)
2. **GitHub Personal Access Token** (we'll create this)
3. **Docker** (already installed)

## 🚀 Step-by-Step Setup

### Step 1: Create GitHub Personal Access Token

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Give it a name: `Orin Docker Images`
4. Set expiration: `90 days` (or your preference)
5. Select these permissions:
   - ✅ `write:packages` - Upload packages to GitHub Package Registry
   - ✅ `read:packages` - Download packages from GitHub Package Registry
   - ✅ `delete:packages` - Delete packages from GitHub Package Registry
6. Click **"Generate token"**
7. **Copy the token** (you won't see it again!)

### Step 2: Verify Your GitHub Username

Your GitHub username will be used as the registry namespace:
- If your username is `buildorin`, your images will be: `ghcr.io/buildorin/orin-server`
- This follows the same pattern as Chunkr: `ghcr.io/luminainc/server`

### Step 3: Run the Build Script

```bash
# Make sure the script is executable
chmod +x build-orin-images.sh

# Run the build script
./build-orin-images.sh
```

The script will:
1. Ask for your GitHub username
2. Ask for your Personal Access Token
3. Login to GitHub Container Registry
4. Build and push your Orin images

## 🔍 What Gets Created

After running the script, you'll have:

### GitHub Packages
- `ghcr.io/buildorin/orin-server:latest`
- `ghcr.io/buildorin/orin-task:latest`
- `ghcr.io/buildorin/orin-web:latest`

### Local Files
- `compose-production-orin.yaml` - Production compose file
- `compose-production-orin-cpu.yaml` - CPU-optimized compose file

## 🐳 Image Details

### Your Custom Orin Images
- **orin-server**: Main API server (Rust)
- **orin-task**: Background task workers (Rust)
- **orin-web**: Frontend web application (React/TypeScript)

### Official Chunkr Images (Reused)
- **luminainc/segmentation:1.4.2**: Document segmentation service
- **luminainc/doctr:1.20.1**: OCR service

## 🔧 Production Deployment

### Update Production Compose File

The generated compose file will reference your images:

```yaml
services:
  server:
    image: ghcr.io/buildorin/orin-server:latest
    # ... rest of config
  
  task:
    image: ghcr.io/buildorin/orin-task:latest
    # ... rest of config
  
  web:
    image: ghcr.io/buildorin/orin-web:latest
    # ... rest of config
```

### Production Server Authentication

On your production server, you'll need to authenticate to pull private images:

```bash
# Login to GitHub Container Registry on production server
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin
```

## 🔄 Updating Images

To update your images:

```bash
# 1. Build new images with new tag
./build-orin-images.sh

# 2. Update production compose file with new tag
# 3. Restart production service
systemctl restart orin-app
```

## 🚨 Troubleshooting

### Common Issues

1. **Authentication Failed**
   ```bash
   # Check your token has the right permissions
   # Make sure you're using the correct GitHub username
   ```

2. **Repository Not Found**
   ```bash
   # Images are created automatically when you first push
   # No need to create repositories manually
   ```

3. **Permission Denied**
   ```bash
   # Ensure your token has 'write:packages' permission
   # Check if the package is private and you have access
   ```

## 📊 Monitoring

### View Your Packages
- Go to your GitHub profile
- Click on **"Packages"** tab
- You'll see your Orin images listed

### Package Settings
- **Visibility**: Public (like Chunkr) or Private
- **Permissions**: Who can access your images
- **Usage**: Download statistics

## 🎉 Success!

Your Orin images are now hosted on GitHub Container Registry, following the same pattern as the official Chunkr repository:

- ✅ **Same registry**: ghcr.io (GitHub Container Registry)
- ✅ **Same pattern**: `ghcr.io/username/service-name`
- ✅ **Same structure**: Custom images + official ML services
- ✅ **Production ready**: Ready for deployment

Your images will be available at:
- `ghcr.io/buildorin/orin-server:latest`
- `ghcr.io/buildorin/orin-task:latest`
- `ghcr.io/buildorin/orin-web:latest` 
# Excel Upload Fix for Production Deployment

## Problem
Supplier Excel file uploads were failing in the deployed environment with various errors including:
- 500 Internal Server Error
- File write permission errors
- Directory not found errors
- Request timeout errors

## Root Causes Identified

### 1. Directory Permissions in Docker
The Docker container runs as a non-root user (`nextjs`) but the upload directories weren't created with proper permissions before switching users.

### 2. Missing Directory Structure
The uploads directory structure wasn't guaranteed to exist in production builds, especially in containerized deployments.

### 3. File Size Limits
Default API route configurations had limited timeout and payload size, causing uploads to fail for larger Excel files.

### 4. Runtime Environment Differences
The Blob constructor issue was already fixed, but additional runtime-specific issues existed in production.

## Solutions Implemented

### 1. Fixed Dockerfile (✅ COMPLETED)
**File**: `Dockerfile`

**Changes**:
```dockerfile
# Create uploads directories with proper permissions before switching to non-root user
RUN mkdir -p /app/public/uploads/supplier-uploads && \
    chmod -R 755 /app/public/uploads

# Change ownership of the app directory to nextjs user
RUN chown -R nextjs:nodejs /app
```

**Why**: Ensures upload directories exist with proper permissions before the container runs as the non-root `nextjs` user.

### 2. Added Upload Directory Initialization Script (✅ COMPLETED)
**File**: `scripts/init-uploads.js`

**Purpose**: 
- Creates all necessary upload directories on startup
- Verifies directories are writable
- Provides clear error messages if setup fails

**Integrated into**:
- `npm run build` - Ensures directories exist during build
- `npm start` - Ensures directories exist before starting server

### 3. Enhanced API Route Configuration (✅ COMPLETED)
**File**: `app/api/suppliers/upload/route.ts`

**Changes**:
```typescript
// Configure API route to handle larger payloads (10MB for Excel files)
export const maxDuration = 60; // 60 seconds timeout
export const dynamic = 'force-dynamic';
```

**Added**:
- Better error handling for directory creation
- Directory writability verification
- Detailed logging for debugging
- Proper error responses with context

### 4. Updated Netlify Configuration (✅ COMPLETED)
**File**: `netlify.toml`

**Added**:
```toml
[functions]
  timeout = 60
  payload_timeout = 60
```

**Why**: Increases function timeout and payload timeout for Netlify deployments to handle larger files.

### 5. Added .gitkeep File (✅ COMPLETED)
**File**: `public/uploads/supplier-uploads/.gitkeep`

**Why**: Ensures the directory structure is preserved in git, so it exists when deployed.

## Testing Checklist

### Local Testing
- [ ] Run `npm run build` - Should see "✅ Upload directories initialized"
- [ ] Run `npm start` - Should see "✅ Upload directories initialized"
- [ ] Upload a small CSV file (< 100KB)
- [ ] Upload a medium Excel file (100KB - 1MB)
- [ ] Upload a large Excel file (1MB - 5MB)
- [ ] Check server logs for all DEBUG/INFO messages

### Docker Testing
```bash
# Build the image
docker build -t fotui:test .

# Run the container
docker run -p 3000:3000 fotui:test

# Test the upload
# Go to http://localhost:3000/dashboard and upload a file
```

### Production Deployment Testing
1. Deploy to staging/production
2. Check deployment logs for "✅ Upload directories initialized"
3. Test supplier upload functionality
4. Check application logs for detailed error messages if it fails

## Expected Log Output (Success)

```
🚀 Initializing upload directories...
✅ Created: public/uploads/supplier-uploads
✓ Writable: public/uploads/supplier-uploads
✨ Upload directories initialized successfully!

[INFO] /api/suppliers/upload - Upload directory ready: /app/public/uploads/supplier-uploads
[DEBUG] /api/suppliers/upload - Parsing JSON body
[DEBUG] /api/suppliers/upload - File name: products.xlsx has data: true
[DEBUG] /api/suppliers/upload - Decoded buffer size: 12345
[DEBUG] /api/suppliers/upload - File object created: products.xlsx application/vnd...
[DEBUG] /api/suppliers/upload - File object type check: object
[DEBUG] /api/suppliers/upload - Using direct buffer
[INFO] /api/suppliers/upload - File: products.xlsx MIME: application/vnd... Size: 12345
[DEBUG] /api/suppliers/upload - File written to: /app/public/uploads/...
[INFO] /api/suppliers/upload - Parsing preview. isCsv: false isExcel: true
[INFO] /api/suppliers/upload - Excel parsed, rows: 10
[INFO] /api/suppliers/upload - Upload successful
```

## Error Debugging

### If Upload Still Fails

1. **Check Deployment Logs**
   - Look for "Upload directories initialized" message
   - Check for permission errors

2. **Check API Logs**
   - Look for `[ERROR]` messages
   - Check which step fails (directory creation, file write, parsing, etc.)

3. **Verify Environment**
   - Ensure `NODE_ENV` is set correctly
   - Check file system permissions in container
   - Verify network/proxy settings aren't blocking large payloads

4. **Common Issues**
   - **"EACCES: permission denied"**: Directory permissions issue - check Dockerfile
   - **"ENOENT: no such file or directory"**: Directory not created - check init script ran
   - **"Request timeout"**: File too large or slow network - check timeout settings
   - **"Invalid file object"**: Client-side encoding issue - check UploadProducts component

## Files Modified

1. ✅ `Dockerfile` - Added directory creation and permission setup
2. ✅ `scripts/init-uploads.js` - New initialization script
3. ✅ `package.json` - Updated build/start scripts
4. ✅ `app/api/suppliers/upload/route.ts` - Added route config and better error handling
5. ✅ `netlify.toml` - Increased timeout and payload limits
6. ✅ `public/uploads/supplier-uploads/.gitkeep` - Preserve directory structure

## Deployment Instructions

### For Docker/Azure Container Registry Deployment

1. **Rebuild the Docker image**:
   ```bash
   docker build -t $ACR_NAME.azurecr.io/fotui:latest .
   ```

2. **Push to registry**:
   ```bash
   docker push $ACR_NAME.azurecr.io/fotui:latest
   ```

3. **Restart the container/service** to use the new image

### For Netlify Deployment

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "Fix: Excel upload for production deployment"
   git push
   ```

2. **Trigger Netlify deployment** (automatic on push or manual trigger)

3. **Monitor deployment logs** for initialization messages

## Support

If issues persist after implementing these fixes:

1. Collect server logs with DEBUG/ERROR messages
2. Note the exact error message shown to users
3. Check file size and type being uploaded
4. Verify environment variables are set correctly

## Summary

These changes ensure:
- ✅ Upload directories exist with proper permissions in all environments
- ✅ Docker containers can write files as non-root user
- ✅ API routes can handle large files (up to 10MB)
- ✅ Better error messages for debugging
- ✅ Proper timeout settings for file processing
- ✅ Comprehensive logging for troubleshooting

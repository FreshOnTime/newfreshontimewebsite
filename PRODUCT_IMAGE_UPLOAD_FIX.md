# Product Image Upload Fix for Netlify Deployment

## Problem
Product image uploads were failing in Netlify deployment because the system was trying to use Azure Storage, which requires Azure credentials that may not be available in all deployments.

## Solution Implemented

### Adaptive Local Storage System
Created a new **LocalStorageService** that automatically adapts to the deployment environment:

#### For Serverless Environments (Netlify, Vercel, Lambda):
- ✅ Images are returned as **data URLs (base64)** 
- ✅ Can be stored directly in the database with product records
- ✅ No external storage service required
- ✅ No file system write issues (uses /tmp if needed)

#### For Traditional/Docker Deployments:
- ✅ Images stored in `public/uploads/product-images` directory
- ✅ Accessible via public URLs like `/uploads/product-images/filename.jpg`
- ✅ Persistent storage on disk

## Files Modified

### 1. **New File**: `lib/storage/localStorage.ts`
Created adaptive storage service that:
- Detects serverless environment automatically
- Uses /tmp in serverless or public/uploads in traditional deployments
- Returns appropriate URL format (data URL vs public URL)

### 2. **Updated**: `app/api/upload/images/products/route.ts`
- Changed from Azure Storage to Local Storage
- Added route configuration (maxDuration, dynamic)
- Improved error handling
- Added logging for debugging

### 3. **Updated**: `scripts/init-uploads.js`
Added directories:
- `public/uploads/product-images`
- `public/uploads/banner-images`

### 4. **Updated**: `Dockerfile`
Creates all upload directories with proper permissions:
```dockerfile
RUN mkdir -p /app/public/uploads/supplier-uploads \
             /app/public/uploads/product-images \
             /app/public/uploads/banner-images && \
    chmod -R 755 /app/public/uploads
```

### 5. **New Files**: Directory placeholders
- `public/uploads/product-images/.gitkeep`
- `public/uploads/banner-images/.gitkeep`

## How It Works

### Upload Flow

1. **User uploads image** via product form
2. **API Route** (`/api/upload/images/products`) receives the image
3. **LocalStorageService** detects environment:
   - **Netlify**: Returns data URL (base64)
   - **Docker**: Saves to disk, returns public URL
4. **Frontend** receives the URL and stores it with the product

### Data URL Format (Serverless)
```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...
```

This can be:
- Used directly in `<img>` tags
- Stored in database with product records
- Displayed without additional file serving

### Public URL Format (Traditional)
```
/uploads/product-images/1234567890-abc123-product.jpg
```

This is:
- Served by Next.js static file handler
- Accessible publicly
- Cached by browser/CDN

## Testing

### Local Testing
```bash
# Start dev server
npm run dev

# Upload a product image through the UI
# Check console logs for confirmation
```

### Production Testing (Netlify)
1. Deploy to Netlify
2. Navigate to product creation/edit page
3. Upload an image
4. Verify:
   - No console errors
   - Image displays correctly
   - Data URL is stored in database

## Benefits

✅ **No Azure dependency** - Works without Azure Storage credentials  
✅ **Environment agnostic** - Works in serverless and traditional deployments  
✅ **Zero configuration** - Automatically detects and adapts  
✅ **Cost effective** - No external storage costs  
✅ **Simple deployment** - No additional services to set up  

## Image Storage Recommendations

### For Serverless (Netlify):
- **Small images** (< 100KB): Store as data URLs in database
- **Large images** (> 100KB): Consider using:
  - Netlify's Large Media (Git LFS)
  - External CDN (Cloudinary, imgix)
  - Compress images before upload

### For Docker/Traditional:
- Images stored on disk work well
- Consider adding:
  - Image optimization/compression
  - CDN for production
  - Backup strategy

## Future Enhancements

1. **Image Optimization**: Add automatic compression/resize
2. **CDN Integration**: Optional CDN for better performance
3. **Multiple Images**: Support image galleries per product
4. **Image Migration**: Tool to move from data URLs to CDN

## Environment Variables

No additional environment variables needed! The system works out of the box.

Optional (for Azure Storage fallback):
```env
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
```

## Troubleshooting

### Issue: Images not uploading
**Check**:
1. File size limits (default: 10MB)
2. File type (jpg, jpeg, png, gif, webp)
3. Browser console for errors
4. Server logs for detailed error messages

### Issue: Images not displaying
**Check**:
1. For data URLs: Check database - should see `data:image/...`
2. For file URLs: Check `public/uploads/product-images` directory exists
3. Browser network tab - check image request status

### Issue: "Storage permission error"
**Solution**:
- In serverless: Shouldn't happen (uses data URLs)
- In Docker: Check Dockerfile creates directories before switching to nextjs user

## Migration from Azure Storage

If you have existing products with Azure URLs:

1. **Keep existing URLs** - They'll continue to work if Azure Storage is accessible
2. **New uploads** - Will use new local storage system
3. **Optional migration** - Create a script to download and re-upload images

## Summary

This fix ensures product image uploads work reliably in **any deployment environment** without requiring external storage services or complex configuration. Images are stored optimally based on where the application is running.

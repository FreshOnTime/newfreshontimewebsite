import { NextRequest } from "next/server";
import { getProductImageStorage } from "@/lib/storage/localStorage";
import { parseMultipartForm, validateImageFile, generateUniqueFileName, FileUpload } from "@/lib/utils/multipartParser";
import { sendSuccess, sendInternalError, sendBadRequest } from "@/lib/utils/apiResponses";

// Configure route for file uploads
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Disable Next.js body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    // Parse multipart form data
    const fields = await parseMultipartForm(req);
    
    // Get the image file from the form data
    const imageField = fields['image'];
    if (!imageField || typeof imageField === 'string') {
      return sendBadRequest("No image file provided");
    }

    const imageFile = imageField as FileUpload;
    
    // Validate the image file
    try {
      validateImageFile(imageFile);
    } catch (validationError) {
      return sendBadRequest(validationError instanceof Error ? validationError.message : "Invalid file");
    }

    // Generate unique filename
    const uniqueFileName = generateUniqueFileName(imageFile.filename);
    
    // Upload to Local/Serverless Storage
    const storageService = getProductImageStorage();
    const imageUrl = await storageService.uploadFile(
      uniqueFileName,
      imageFile.buffer,
      imageFile.type
    );

    console.log('[INFO] Product image uploaded:', {
      fileName: uniqueFileName,
      size: imageFile.size,
      isServerless: storageService.isServerlessEnvironment()
    });

    return sendSuccess("Image uploaded successfully", {
      url: imageUrl,
      filename: uniqueFileName,
      originalName: imageFile.filename,
      size: imageFile.size,
      type: imageFile.type
    });

  } catch (error) {
    console.error("Upload error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('multipart/form-data')) {
        return sendBadRequest("Invalid request format. Use multipart/form-data");
      }
      if (error.message.includes('EACCES') || error.message.includes('permission')) {
        return sendInternalError("Storage permission error. Check file system permissions.");
      }
    }
    
    return sendInternalError("Failed to upload image");
  }
}

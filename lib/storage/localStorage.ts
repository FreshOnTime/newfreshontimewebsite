import fs from 'fs';
import path from 'path';

/**
 * Local/Serverless Storage Service
 * 
 * For serverless environments (Netlify, Vercel):
 * - Stores images as base64 in MongoDB (since file system is ephemeral)
 * - Returns data URLs for immediate use
 * 
 * For containerized/traditional deployments:
 * - Stores images in public/uploads directory
 * - Returns public URLs
 */
export class LocalStorageService {
  private uploadDir: string;
  private isServerless: boolean;
  private publicPath: string;

  constructor(containerName: string) {
    this.isServerless = !!(
      process.env.NETLIFY || 
      process.env.VERCEL || 
      process.env.AWS_LAMBDA_FUNCTION_NAME
    );
    
    if (this.isServerless) {
      // Use /tmp in serverless environments
      this.uploadDir = path.join('/tmp', 'uploads', containerName);
      this.publicPath = `/api/images/${containerName}`; // Will serve from DB
    } else {
      // Use public directory in traditional deployments
      this.uploadDir = path.join(process.cwd(), 'public', 'uploads', containerName);
      this.publicPath = `/uploads/${containerName}`;
    }
  }

  async uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<string> {
    try {
      if (this.isServerless) {
        // In serverless, return a data URL (base64)
        // The actual storage will be handled by the API route in the database
        const base64 = fileBuffer.toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64}`;
        return dataUrl;
      } else {
        // In traditional deployment, save to disk
        await fs.promises.mkdir(this.uploadDir, { recursive: true });
        
        const filePath = path.join(this.uploadDir, fileName);
        await fs.promises.writeFile(filePath, fileBuffer);
        
        // Return public URL
        return `${this.publicPath}/${fileName}`;
      }
    } catch (error) {
      console.error('Error uploading file to local storage:', error);
      throw new Error('Failed to upload file');
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    if (this.isServerless) {
      // In serverless, deletion is handled at the database level
      return;
    }
    
    try {
      const filePath = path.join(this.uploadDir, fileName);
      await fs.promises.unlink(filePath).catch(() => {
        // Ignore if file doesn't exist
      });
    } catch (error) {
      console.error('Error deleting file from local storage:', error);
      throw new Error('Failed to delete file');
    }
  }

  async fileExists(fileName: string): Promise<boolean> {
    if (this.isServerless) {
      // In serverless, existence check is handled at the database level
      return false;
    }
    
    try {
      const filePath = path.join(this.uploadDir, fileName);
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async listFiles(prefix?: string): Promise<string[]> {
    if (this.isServerless) {
      // In serverless, file listing is handled at the database level
      return [];
    }
    
    try {
      await fs.promises.mkdir(this.uploadDir, { recursive: true });
      const files = await fs.promises.readdir(this.uploadDir);
      
      if (prefix) {
        return files.filter(file => file.startsWith(prefix));
      }
      
      return files;
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error('Failed to list files');
    }
  }

  isServerlessEnvironment(): boolean {
    return this.isServerless;
  }
}

// Singleton instances for different storage containers
let productImageStorage: LocalStorageService | null = null;
let bannerImageStorage: LocalStorageService | null = null;

export function getProductImageStorage(): LocalStorageService {
  if (!productImageStorage) {
    productImageStorage = new LocalStorageService('product-images');
  }
  return productImageStorage;
}

export function getBannerImageStorage(): LocalStorageService {
  if (!bannerImageStorage) {
    bannerImageStorage = new LocalStorageService('banner-images');
  }
  return bannerImageStorage;
}

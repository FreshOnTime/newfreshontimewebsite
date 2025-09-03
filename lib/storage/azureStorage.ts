import { BlobServiceClient, BlobUploadOptions } from "@azure/storage-blob";

export class AzureStorageService {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;

  constructor(connectionString: string, containerName: string) {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.containerName = containerName;
  }

  async uploadFile(
    fileName: string, 
    fileBuffer: Buffer, 
    mimeType: string
  ): Promise<string> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      // Ensure container exists
      await containerClient.createIfNotExists({
        access: 'blob' // Allow public read access to blobs
      });

      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      
      const uploadOptions: BlobUploadOptions = {
        blobHTTPHeaders: {
          blobContentType: mimeType,
        },
      };

      await blockBlobClient.upload(fileBuffer, fileBuffer.length, uploadOptions);
      
      return blockBlobClient.url;
    } catch (error) {
      console.error('Error uploading file to Azure Storage:', error);
      throw new Error('Failed to upload file');
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      
      await blockBlobClient.deleteIfExists();
    } catch (error) {
      console.error('Error deleting file from Azure Storage:', error);
      throw new Error('Failed to delete file');
    }
  }

  async fileExists(fileName: string): Promise<boolean> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      
      const exists = await blockBlobClient.exists();
      return exists;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  }

  async listFiles(prefix?: string): Promise<string[]> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const files: string[] = [];

      const listOptions = prefix ? { prefix } : undefined;
      
      for await (const blob of containerClient.listBlobsFlat(listOptions)) {
        files.push(blob.name);
      }

      return files;
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error('Failed to list files');
    }
  }
}

// Singleton instances for different storage containers
let productImageStorage: AzureStorageService | null = null;
let bannerImageStorage: AzureStorageService | null = null;

export function getProductImageStorage(): AzureStorageService {
  if (!productImageStorage) {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('AZURE_STORAGE_CONNECTION_STRING environment variable is required');
    }
    productImageStorage = new AzureStorageService(connectionString, 'product-images');
  }
  return productImageStorage;
}

export function getBannerImageStorage(): AzureStorageService {
  if (!bannerImageStorage) {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('AZURE_STORAGE_CONNECTION_STRING environment variable is required');
    }
    bannerImageStorage = new AzureStorageService(connectionString, 'banner-images');
  }
  return bannerImageStorage;
}

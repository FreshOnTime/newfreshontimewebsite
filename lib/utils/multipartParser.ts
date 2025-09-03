import { NextRequest } from 'next/server';

export interface FileUpload {
  name: string;
  filename: string;
  type: string;
  buffer: Buffer;
  size: number;
}

export interface FormFields {
  [key: string]: string | FileUpload;
}

export async function parseMultipartForm(request: NextRequest): Promise<FormFields> {
  const contentType = request.headers.get('content-type');
  
  if (!contentType || !contentType.includes('multipart/form-data')) {
    throw new Error('Content-Type must be multipart/form-data');
  }

  const boundary = contentType.split('boundary=')[1];
  if (!boundary) {
    throw new Error('No boundary found in Content-Type header');
  }

  const body = await request.arrayBuffer();
  const bodyBytes = new Uint8Array(body);
  const boundaryBytes = new TextEncoder().encode('--' + boundary);
  const fields: FormFields = {};

  let start = 0;
  while (start < bodyBytes.length) {
    // Find the start of the next part
    const boundaryIndex = findBytes(bodyBytes, boundaryBytes, start);
    if (boundaryIndex === -1) break;

    start = boundaryIndex + boundaryBytes.length;
    
    // Skip CRLF after boundary
    if (start + 1 < bodyBytes.length && bodyBytes[start] === 13 && bodyBytes[start + 1] === 10) {
      start += 2;
    }

    // Find the end of headers (double CRLF)
    const headerEndIndex = findBytes(bodyBytes, new TextEncoder().encode('\r\n\r\n'), start);
    if (headerEndIndex === -1) break;

    const headerBytes = bodyBytes.slice(start, headerEndIndex);
    const headerText = new TextDecoder().decode(headerBytes);
    
    // Parse Content-Disposition header
    const dispositionMatch = headerText.match(/Content-Disposition: form-data; name="([^"]+)"(?:; filename="([^"]+)")?/);
    if (!dispositionMatch) continue;

    const fieldName = dispositionMatch[1];
    const filename = dispositionMatch[2];

    // Parse Content-Type header if present
    const typeMatch = headerText.match(/Content-Type: (.+)/);
    const contentType = typeMatch ? typeMatch[1].trim() : 'text/plain';

    // Find the start of data
    const dataStart = headerEndIndex + 4; // Skip \r\n\r\n

    // Find the end of data (next boundary)
    const nextBoundaryIndex = findBytes(bodyBytes, new TextEncoder().encode('\r\n--' + boundary), dataStart);
    const dataEnd = nextBoundaryIndex !== -1 ? nextBoundaryIndex : bodyBytes.length;

    const dataBytes = bodyBytes.slice(dataStart, dataEnd);

    if (filename) {
      // This is a file upload
      fields[fieldName] = {
        name: fieldName,
        filename,
        type: contentType,
        buffer: Buffer.from(dataBytes),
        size: dataBytes.length
      };
    } else {
      // This is a regular form field
      fields[fieldName] = new TextDecoder().decode(dataBytes);
    }

    start = dataEnd;
  }

  return fields;
}

function findBytes(haystack: Uint8Array, needle: Uint8Array, start = 0): number {
  for (let i = start; i <= haystack.length - needle.length; i++) {
    let found = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        found = false;
        break;
      }
    }
    if (found) return i;
  }
  return -1;
}

export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
}

export function validateImageFile(file: FileUpload): void {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
  const maxSize = 4 * 1024 * 1024; // 4MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, and AVIF images are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 4MB.');
  }

  if (!file.filename) {
    throw new Error('Filename is required.');
  }
}

import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import config from '../config';

// Check if Cloudinary is configured
const USE_LOCAL_STORAGE = !config.cloudinary.cloudName || !config.cloudinary.apiKey;

// Local storage directory for development
const LOCAL_STORAGE_DIR = path.join(process.cwd(), 'uploads');

// Ensure local storage directory exists
if (USE_LOCAL_STORAGE && !fs.existsSync(LOCAL_STORAGE_DIR)) {
  fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}

// Configure Cloudinary
if (!USE_LOCAL_STORAGE) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

export interface UploadResult {
  key: string;
  url: string;
}

// Generate a unique file key
function generateFileKey(userId: string, fileName: string, folder: string): string {
  const ext = fileName.split('.').pop() || '';
  const uniqueId = uuidv4();
  return `${folder}/${userId}/${uniqueId}.${ext}`;
}

// Get resource type based on file extension
function getResourceType(fileName: string): 'image' | 'raw' | 'video' | 'auto' {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];

  if (imageExts.includes(ext)) {
    return 'image';
  }
  // PDF, DOCX, JSON, etc. are 'raw' files
  return 'raw';
}

// Upload a file to Cloudinary or local storage
export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  userId: string,
  folder: string = 'resumes',
  contentType: string = 'application/octet-stream'
): Promise<UploadResult> {
  const key = generateFileKey(userId, fileName, folder);

  if (USE_LOCAL_STORAGE) {
    // Local storage fallback
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, buffer);
    const url = `file://${filePath}`;
    return { key, url };
  }

  // Upload to Cloudinary
  const resourceType = getResourceType(fileName);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: key.replace(/\.[^/.]+$/, ''), // Remove extension for public_id
        folder: 'cv-builder',
        resource_type: resourceType,
        access_mode: 'authenticated', // Requires signed URLs
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'));
          return;
        }
        resolve({
          key: result.public_id,
          url: result.secure_url,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

// Get a signed URL for downloading (secure access)
export async function getPresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  if (USE_LOCAL_STORAGE) {
    // For local storage, return a file URL
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    return `file://${filePath}`;
  }

  // Generate signed URL with expiration
  const timestamp = Math.floor(Date.now() / 1000) + expiresIn;

  // Determine resource type from key
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(key);
  const resourceType = isImage ? 'image' : 'raw';

  const url = cloudinary.url(key, {
    secure: true,
    resource_type: resourceType,
    sign_url: true,
    type: 'authenticated',
    expires_at: timestamp,
  });

  return url;
}

// Get file content from Cloudinary or local storage
export async function getFile(key: string): Promise<Buffer> {
  if (USE_LOCAL_STORAGE) {
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    return fs.readFileSync(filePath);
  }

  // Get the secure URL and fetch the file
  const url = await getPresignedDownloadUrl(key);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Delete a file from Cloudinary or local storage
export async function deleteFile(key: string): Promise<void> {
  // Skip if key is empty or invalid
  if (!key || key.trim() === '') {
    return;
  }

  if (USE_LOCAL_STORAGE) {
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    // Ensure we're not trying to delete the uploads directory itself
    if (filePath === LOCAL_STORAGE_DIR || !filePath.startsWith(LOCAL_STORAGE_DIR + path.sep)) {
      return;
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
    }
    return;
  }

  // Determine resource type from key
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(key);
  const resourceType = isImage ? 'image' : 'raw';

  await cloudinary.uploader.destroy(key, { resource_type: resourceType });
}

// Upload generated document (PDF/DOCX)
export async function uploadDocument(
  buffer: Buffer,
  userId: string,
  type: 'pdf' | 'docx',
  prefix: string = 'generated'
): Promise<UploadResult> {
  const contentType = type === 'pdf'
    ? 'application/pdf'
    : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const fileName = `${prefix}-${Date.now()}.${type}`;

  return uploadFile(buffer, fileName, userId, 'documents', contentType);
}

// Upload image (for thumbnails, avatars, etc.)
export async function uploadImage(
  buffer: Buffer,
  userId: string,
  folder: string = 'images'
): Promise<UploadResult> {
  const fileName = `image-${Date.now()}.png`;
  return uploadFile(buffer, fileName, userId, folder, 'image/png');
}

// Get public URL for images (no authentication needed for thumbnails)
export function getPublicImageUrl(key: string, options?: { width?: number; height?: number }): string {
  if (USE_LOCAL_STORAGE) {
    return `file://${path.join(LOCAL_STORAGE_DIR, key)}`;
  }

  return cloudinary.url(key, {
    secure: true,
    resource_type: 'image',
    transformation: options ? [
      { width: options.width, height: options.height, crop: 'fill' }
    ] : undefined,
  });
}

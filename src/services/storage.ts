import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import config from '../config';

// Check if S3 is configured
const USE_LOCAL_STORAGE = !config.aws.accessKeyId || !config.aws.s3Bucket;

// Local storage directory for development
const LOCAL_STORAGE_DIR = path.join(process.cwd(), 'uploads');

// Ensure local storage directory exists
if (USE_LOCAL_STORAGE && !fs.existsSync(LOCAL_STORAGE_DIR)) {
  fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}

const s3Client = USE_LOCAL_STORAGE ? null : new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

const BUCKET_NAME = config.aws.s3Bucket;

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

// Upload a file to S3 or local storage
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

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  });

  await s3Client!.send(command);

  const url = `https://${BUCKET_NAME}.s3.${config.aws.region}.amazonaws.com/${key}`;

  return { key, url };
}

// Get a presigned URL for downloading
export async function getPresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  if (USE_LOCAL_STORAGE) {
    // For local storage, return a file URL
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    return `file://${filePath}`;
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client!, command, { expiresIn });
}

// Get file content from S3 or local storage
export async function getFile(key: string): Promise<Buffer> {
  if (USE_LOCAL_STORAGE) {
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    return fs.readFileSync(filePath);
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const response = await s3Client!.send(command);
  const stream = response.Body as NodeJS.ReadableStream;

  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }

  return Buffer.concat(chunks);
}

// Delete a file from S3 or local storage
export async function deleteFile(key: string): Promise<void> {
  if (USE_LOCAL_STORAGE) {
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client!.send(command);
}

// Upload generated document (PDF/DOCX)
export async function uploadDocument(
  buffer: Buffer,
  userId: string,
  type: 'pdf' | 'docx',
  prefix: string = 'generated'
): Promise<UploadResult> {
  const contentType = type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const fileName = `${prefix}-${Date.now()}.${type}`;

  return uploadFile(buffer, fileName, userId, 'documents', contentType);
}

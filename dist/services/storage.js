"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = uploadFile;
exports.getPresignedDownloadUrl = getPresignedDownloadUrl;
exports.getFile = getFile;
exports.deleteFile = deleteFile;
exports.uploadDocument = uploadDocument;
exports.uploadImage = uploadImage;
exports.getPublicImageUrl = getPublicImageUrl;
const cloudinary_1 = require("cloudinary");
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = __importDefault(require("../config"));
// Check if Cloudinary is configured
const USE_LOCAL_STORAGE = !config_1.default.cloudinary.cloudName || !config_1.default.cloudinary.apiKey;
// Local storage directory for development
const LOCAL_STORAGE_DIR = path.join(process.cwd(), 'uploads');
// Ensure local storage directory exists
if (USE_LOCAL_STORAGE && !fs.existsSync(LOCAL_STORAGE_DIR)) {
    fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}
// Configure Cloudinary
if (!USE_LOCAL_STORAGE) {
    cloudinary_1.v2.config({
        cloud_name: config_1.default.cloudinary.cloudName,
        api_key: config_1.default.cloudinary.apiKey,
        api_secret: config_1.default.cloudinary.apiSecret,
        secure: true,
    });
}
// Generate a unique file key
function generateFileKey(userId, fileName, folder) {
    const ext = fileName.split('.').pop() || '';
    const uniqueId = (0, uuid_1.v4)();
    return `${folder}/${userId}/${uniqueId}.${ext}`;
}
// Get resource type based on file extension
function getResourceType(fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    if (imageExts.includes(ext)) {
        return 'image';
    }
    // PDF, DOCX, JSON, etc. are 'raw' files
    return 'raw';
}
// Upload a file to Cloudinary or local storage
async function uploadFile(buffer, fileName, userId, folder = 'resumes', contentType = 'application/octet-stream') {
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
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            public_id: key.replace(/\.[^/.]+$/, ''), // Remove extension for public_id
            folder: 'cv-builder',
            resource_type: resourceType,
            access_mode: 'authenticated', // Requires signed URLs
        }, (error, result) => {
            if (error || !result) {
                reject(error || new Error('Upload failed'));
                return;
            }
            resolve({
                key: result.public_id,
                url: result.secure_url,
            });
        });
        uploadStream.end(buffer);
    });
}
// Get a signed URL for downloading (secure access)
async function getPresignedDownloadUrl(key, expiresIn = 3600) {
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
    const url = cloudinary_1.v2.url(key, {
        secure: true,
        resource_type: resourceType,
        sign_url: true,
        type: 'authenticated',
        expires_at: timestamp,
    });
    return url;
}
// Get file content from Cloudinary or local storage
async function getFile(key) {
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
async function deleteFile(key) {
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
    await cloudinary_1.v2.uploader.destroy(key, { resource_type: resourceType });
}
// Upload generated document (PDF/DOCX)
async function uploadDocument(buffer, userId, type, prefix = 'generated') {
    const contentType = type === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const fileName = `${prefix}-${Date.now()}.${type}`;
    return uploadFile(buffer, fileName, userId, 'documents', contentType);
}
// Upload image (for thumbnails, avatars, etc.)
async function uploadImage(buffer, userId, folder = 'images') {
    const fileName = `image-${Date.now()}.png`;
    return uploadFile(buffer, fileName, userId, folder, 'image/png');
}
// Get public URL for images (no authentication needed for thumbnails)
function getPublicImageUrl(key, options) {
    if (USE_LOCAL_STORAGE) {
        return `file://${path.join(LOCAL_STORAGE_DIR, key)}`;
    }
    return cloudinary_1.v2.url(key, {
        secure: true,
        resource_type: 'image',
        transformation: options ? [
            { width: options.width, height: options.height, crop: 'fill' }
        ] : undefined,
    });
}
//# sourceMappingURL=storage.js.map
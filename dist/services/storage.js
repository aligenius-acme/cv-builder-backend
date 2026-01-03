"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = uploadFile;
exports.getPresignedDownloadUrl = getPresignedDownloadUrl;
exports.getFile = getFile;
exports.deleteFile = deleteFile;
exports.uploadDocument = uploadDocument;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const config_1 = __importDefault(require("../config"));
const s3Client = new client_s3_1.S3Client({
    region: config_1.default.aws.region,
    credentials: {
        accessKeyId: config_1.default.aws.accessKeyId,
        secretAccessKey: config_1.default.aws.secretAccessKey,
    },
});
const BUCKET_NAME = config_1.default.aws.s3Bucket;
// Generate a unique file key
function generateFileKey(userId, fileName, folder) {
    const ext = fileName.split('.').pop() || '';
    const uniqueId = (0, uuid_1.v4)();
    return `${folder}/${userId}/${uniqueId}.${ext}`;
}
// Upload a file to S3
async function uploadFile(buffer, fileName, userId, folder = 'resumes', contentType = 'application/octet-stream') {
    const key = generateFileKey(userId, fileName, folder);
    const command = new client_s3_1.PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ServerSideEncryption: 'AES256',
    });
    await s3Client.send(command);
    const url = `https://${BUCKET_NAME}.s3.${config_1.default.aws.region}.amazonaws.com/${key}`;
    return { key, url };
}
// Get a presigned URL for downloading
async function getPresignedDownloadUrl(key, expiresIn = 3600) {
    const command = new client_s3_1.GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });
    return (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn });
}
// Get file content from S3
async function getFile(key) {
    const command = new client_s3_1.GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });
    const response = await s3Client.send(command);
    const stream = response.Body;
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}
// Delete a file from S3
async function deleteFile(key) {
    const command = new client_s3_1.DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });
    await s3Client.send(command);
}
// Upload generated document (PDF/DOCX)
async function uploadDocument(buffer, userId, type, prefix = 'generated') {
    const contentType = type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const fileName = `${prefix}-${Date.now()}.${type}`;
    return uploadFile(buffer, fileName, userId, 'documents', contentType);
}
//# sourceMappingURL=storage.js.map
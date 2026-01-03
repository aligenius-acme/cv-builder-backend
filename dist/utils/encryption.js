"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.hash = hash;
exports.generateToken = generateToken;
const crypto_1 = __importDefault(require("crypto"));
const config_1 = __importDefault(require("../config"));
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
// Derive key from encryption key using PBKDF2
function deriveKey(salt) {
    return crypto_1.default.pbkdf2Sync(config_1.default.encryptionKey, salt, 100000, KEY_LENGTH, 'sha256');
}
// Encrypt data using AES-256-GCM
function encrypt(text) {
    const salt = crypto_1.default.randomBytes(SALT_LENGTH);
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const key = deriveKey(salt);
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    // Combine salt + iv + tag + encrypted data
    const result = Buffer.concat([salt, iv, tag, encrypted]);
    return result.toString('base64');
}
// Decrypt data using AES-256-GCM
function decrypt(encryptedText) {
    const data = Buffer.from(encryptedText, 'base64');
    const salt = data.subarray(0, SALT_LENGTH);
    const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = data.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const key = deriveKey(salt);
    const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
}
// Hash sensitive data for comparison (one-way)
function hash(text) {
    return crypto_1.default.createHash('sha256').update(text).digest('hex');
}
// Generate a secure random token
function generateToken(length = 32) {
    return crypto_1.default.randomBytes(length).toString('hex');
}
//# sourceMappingURL=encryption.js.map
import { generateToken, encrypt, decrypt } from '../utils/encryption';

describe('Encryption Utils', () => {
  describe('generateToken', () => {
    it('should generate a token of default length', () => {
      const token = generateToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate unique tokens', () => {
      const tokens = new Set<string>();
      for (let i = 0; i < 100; i++) {
        tokens.add(generateToken());
      }
      expect(tokens.size).toBe(100);
    });
  });

  describe('encrypt/decrypt', () => {
    const testData = 'sensitive data to encrypt';

    beforeAll(() => {
      // Set encryption key for tests
      process.env.ENCRYPTION_KEY = '12345678901234567890123456789012';
    });

    it('should encrypt and decrypt data correctly', () => {
      const encrypted = encrypt(testData);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(testData);

      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(testData);
    });

    it('should produce different ciphertext for same plaintext', () => {
      const encrypted1 = encrypt(testData);
      const encrypted2 = encrypt(testData);
      expect(encrypted1).not.toBe(encrypted2);

      // But both should decrypt to same value
      expect(decrypt(encrypted1)).toBe(testData);
      expect(decrypt(encrypted2)).toBe(testData);
    });

    it('should handle empty strings', () => {
      const encrypted = encrypt('');
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe('');
    });

    it('should handle special characters', () => {
      const specialData = 'Test with émojis! 🎉 and special chars: <>&"\'';
      const encrypted = encrypt(specialData);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(specialData);
    });

    it('should handle long strings', () => {
      const longData = 'a'.repeat(10000);
      const encrypted = encrypt(longData);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(longData);
    });
  });
});

describe('Error Classes', () => {
  const { ValidationError, AuthenticationError, NotFoundError } = require('../utils/errors');

  it('should create ValidationError with correct properties', () => {
    const error = new ValidationError('Test validation error');
    expect(error.message).toBe('Test validation error');
    expect(error.statusCode).toBe(400);
  });

  it('should create AuthenticationError with correct properties', () => {
    const error = new AuthenticationError('Test auth error');
    expect(error.message).toBe('Test auth error');
    expect(error.statusCode).toBe(401);
  });

  it('should create NotFoundError with correct properties', () => {
    const error = new NotFoundError('Test not found');
    expect(error.message).toBe('Test not found');
    expect(error.statusCode).toBe(404);
  });
});

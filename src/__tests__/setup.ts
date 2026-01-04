// Test setup file
import { prisma } from '../utils/prisma';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1d';

// Mock external services
jest.mock('../services/email', () => ({
  emailService: {
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
    sendOrgInviteEmail: jest.fn().mockResolvedValue(true),
  },
}));

// Cleanup after tests
afterAll(async () => {
  await prisma.$disconnect();
});

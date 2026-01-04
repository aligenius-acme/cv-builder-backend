import request from 'supertest';
import express from 'express';
import { prisma } from '../utils/prisma';
import authRoutes from '../routes/auth';
import { errorHandler } from '../middleware/errorHandler';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

describe('Auth API', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  let authToken: string;
  let userId: string;

  afterAll(async () => {
    // Cleanup test user
    if (userId) {
      await prisma.subscription.deleteMany({ where: { userId } });
      await prisma.user.deleteMany({ where: { id: userId } });
    }
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'Test',
          lastName: 'User',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testEmail.toLowerCase());
      expect(res.body.data.token).toBeDefined();

      authToken = res.body.data.token;
      userId = res.body.data.user.id;
    });

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'new@example.com',
          password: 'short',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          password: testPassword,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword,
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testEmail.toLowerCase());
    });

    it('should reject without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update profile', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe('Updated');
      expect(res.body.data.lastName).toBe('Name');
    });
  });

  describe('PUT /api/auth/change-password', () => {
    it('should change password with correct current password', async () => {
      const newPassword = 'NewPassword456!';

      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: testPassword,
          newPassword: newPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify new password works
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: newPassword,
        });

      expect(loginRes.status).toBe(200);
    });

    it('should reject incorrect current password', async () => {
      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'NewPassword789!',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should accept valid email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testEmail,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should not reveal if email exists', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com',
        });

      // Should return same response for security
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

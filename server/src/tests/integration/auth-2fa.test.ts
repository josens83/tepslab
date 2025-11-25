import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import { User } from '../../models/User';
import { TwoFactorService } from '../../services/twoFactorService';

describe('2FA Integration Tests', () => {
  let app: any;
  let authToken: string;
  let userId: string;
  let twoFactorSecret: string;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/tepslab-test');
  });

  afterAll(async () => {
    // Clean up and disconnect
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});

    // Create a test user
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test2fa@example.com',
        password: 'Test123!@#',
        name: 'Test User',
      });

    authToken = response.body.data.token;
    userId = response.body.data.user._id;
  });

  describe('POST /api/auth/2fa/setup', () => {
    test('should generate 2FA secret and QR code', async () => {
      const response = await request(app)
        .post('/api/auth/2fa/setup')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.secret).toBeDefined();
      expect(response.body.data.qrCodeUrl).toBeDefined();
      expect(response.body.data.backupCodes).toHaveLength(10);

      twoFactorSecret = response.body.data.secret;
    });

    test('should require authentication', async () => {
      await request(app)
        .post('/api/auth/2fa/setup')
        .expect(401);
    });
  });

  describe('POST /api/auth/2fa/enable', () => {
    test('should enable 2FA with valid token', async () => {
      // Setup 2FA first
      const setupResponse = await request(app)
        .post('/api/auth/2fa/setup')
        .set('Authorization', `Bearer ${authToken}`);

      const secret = setupResponse.body.data.secret;

      // Generate valid TOTP token
      const token = TwoFactorService.generateToken(secret);

      const response = await request(app)
        .post('/api/auth/2fa/enable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ token })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('enabled');

      // Verify user has 2FA enabled
      const user = await User.findById(userId);
      expect(user?.twoFactorEnabled).toBe(true);
    });

    test('should fail with invalid token', async () => {
      await request(app)
        .post('/api/auth/2fa/setup')
        .set('Authorization', `Bearer ${authToken}`);

      await request(app)
        .post('/api/auth/2fa/enable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ token: '000000' })
        .expect(400);
    });
  });

  describe('POST /api/auth/login with 2FA', () => {
    test('should require 2FA token when enabled', async () => {
      // Enable 2FA
      const setupResponse = await request(app)
        .post('/api/auth/2fa/setup')
        .set('Authorization', `Bearer ${authToken}`);

      const secret = setupResponse.body.data.secret;
      const token = TwoFactorService.generateToken(secret);

      await request(app)
        .post('/api/auth/2fa/enable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ token });

      // Try to login without 2FA token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test2fa@example.com',
          password: 'Test123!@#',
        })
        .expect(200);

      expect(loginResponse.body.data.requiresTwoFactor).toBe(true);
      expect(loginResponse.body.data.userId).toBeDefined();
      expect(loginResponse.body.data.token).toBeUndefined();
    });

    test('should login successfully with valid 2FA token', async () => {
      // Enable 2FA
      const setupResponse = await request(app)
        .post('/api/auth/2fa/setup')
        .set('Authorization', `Bearer ${authToken}`);

      const secret = setupResponse.body.data.secret;
      const enableToken = TwoFactorService.generateToken(secret);

      await request(app)
        .post('/api/auth/2fa/enable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ token: enableToken });

      // Login with 2FA token
      const loginToken = TwoFactorService.generateToken(secret);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test2fa@example.com',
          password: 'Test123!@#',
          twoFactorToken: loginToken,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.twoFactorEnabled).toBe(true);
    });

    test('should fail login with invalid 2FA token', async () => {
      // Enable 2FA
      const setupResponse = await request(app)
        .post('/api/auth/2fa/setup')
        .set('Authorization', `Bearer ${authToken}`);

      const secret = setupResponse.body.data.secret;
      const token = TwoFactorService.generateToken(secret);

      await request(app)
        .post('/api/auth/2fa/enable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ token });

      // Try login with invalid 2FA token
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test2fa@example.com',
          password: 'Test123!@#',
          twoFactorToken: '000000',
        })
        .expect(401);
    });
  });

  describe('POST /api/auth/2fa/backup-codes/regenerate', () => {
    test('should regenerate backup codes', async () => {
      // Setup and enable 2FA
      const setupResponse = await request(app)
        .post('/api/auth/2fa/setup')
        .set('Authorization', `Bearer ${authToken}`);

      const secret = setupResponse.body.data.secret;
      const oldBackupCodes = setupResponse.body.data.backupCodes;
      const token = TwoFactorService.generateToken(secret);

      await request(app)
        .post('/api/auth/2fa/enable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ token });

      // Regenerate backup codes
      const newToken = TwoFactorService.generateToken(secret);

      const response = await request(app)
        .post('/api/auth/2fa/backup-codes/regenerate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ token: newToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.backupCodes).toHaveLength(10);
      expect(response.body.data.backupCodes).not.toEqual(oldBackupCodes);
    });
  });

  describe('POST /api/auth/2fa/disable', () => {
    test('should disable 2FA with valid token', async () => {
      // Setup and enable 2FA
      const setupResponse = await request(app)
        .post('/api/auth/2fa/setup')
        .set('Authorization', `Bearer ${authToken}`);

      const secret = setupResponse.body.data.secret;
      const enableToken = TwoFactorService.generateToken(secret);

      await request(app)
        .post('/api/auth/2fa/enable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ token: enableToken });

      // Disable 2FA
      const disableToken = TwoFactorService.generateToken(secret);

      const response = await request(app)
        .post('/api/auth/2fa/disable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ token: disableToken })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify 2FA is disabled
      const user = await User.findById(userId);
      expect(user?.twoFactorEnabled).toBe(false);
    });
  });
});

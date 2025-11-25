"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const globals_1 = require("@jest/globals");
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../../models/User");
const twoFactorService_1 = require("../../services/twoFactorService");
(0, globals_1.describe)('2FA Integration Tests', () => {
    let app;
    let authToken;
    let userId;
    let twoFactorSecret;
    (0, globals_1.beforeAll)(async () => {
        // Connect to test database
        await mongoose_1.default.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/tepslab-test');
    });
    (0, globals_1.afterAll)(async () => {
        // Clean up and disconnect
        await User_1.User.deleteMany({});
        await mongoose_1.default.connection.close();
    });
    (0, globals_1.beforeEach)(async () => {
        // Clear users before each test
        await User_1.User.deleteMany({});
        // Create a test user
        const response = await (0, supertest_1.default)(app)
            .post('/api/auth/register')
            .send({
            email: 'test2fa@example.com',
            password: 'Test123!@#',
            name: 'Test User',
        });
        authToken = response.body.data.token;
        userId = response.body.data.user._id;
    });
    (0, globals_1.describe)('POST /api/auth/2fa/setup', () => {
        (0, globals_1.test)('should generate 2FA secret and QR code', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/2fa/setup')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.data.secret).toBeDefined();
            (0, globals_1.expect)(response.body.data.qrCodeUrl).toBeDefined();
            (0, globals_1.expect)(response.body.data.backupCodes).toHaveLength(10);
            twoFactorSecret = response.body.data.secret;
        });
        (0, globals_1.test)('should require authentication', async () => {
            await (0, supertest_1.default)(app)
                .post('/api/auth/2fa/setup')
                .expect(401);
        });
    });
    (0, globals_1.describe)('POST /api/auth/2fa/enable', () => {
        (0, globals_1.test)('should enable 2FA with valid token', async () => {
            // Setup 2FA first
            const setupResponse = await (0, supertest_1.default)(app)
                .post('/api/auth/2fa/setup')
                .set('Authorization', `Bearer ${authToken}`);
            const secret = setupResponse.body.data.secret;
            // Generate valid TOTP token
            const token = twoFactorService_1.TwoFactorService.generateToken(secret);
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/2fa/enable')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ token })
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.message).toContain('enabled');
            // Verify user has 2FA enabled
            const user = await User_1.User.findById(userId);
            (0, globals_1.expect)(user?.twoFactorEnabled).toBe(true);
        });
        (0, globals_1.test)('should fail with invalid token', async () => {
            await (0, supertest_1.default)(app)
                .post('/api/auth/2fa/setup')
                .set('Authorization', `Bearer ${authToken}`);
            await (0, supertest_1.default)(app)
                .post('/api/auth/2fa/enable')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ token: '000000' })
                .expect(400);
        });
    });
    (0, globals_1.describe)('POST /api/auth/login with 2FA', () => {
        (0, globals_1.test)('should require 2FA token when enabled', async () => {
            // Enable 2FA
            const setupResponse = await (0, supertest_1.default)(app)
                .post('/api/auth/2fa/setup')
                .set('Authorization', `Bearer ${authToken}`);
            const secret = setupResponse.body.data.secret;
            const token = twoFactorService_1.TwoFactorService.generateToken(secret);
            await (0, supertest_1.default)(app)
                .post('/api/auth/2fa/enable')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ token });
            // Try to login without 2FA token
            const loginResponse = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: 'test2fa@example.com',
                password: 'Test123!@#',
            })
                .expect(200);
            (0, globals_1.expect)(loginResponse.body.data.requiresTwoFactor).toBe(true);
            (0, globals_1.expect)(loginResponse.body.data.userId).toBeDefined();
            (0, globals_1.expect)(loginResponse.body.data.token).toBeUndefined();
        });
        (0, globals_1.test)('should login successfully with valid 2FA token', async () => {
            // Enable 2FA
            const setupResponse = await (0, supertest_1.default)(app)
                .post('/api/auth/2fa/setup')
                .set('Authorization', `Bearer ${authToken}`);
            const secret = setupResponse.body.data.secret;
            const enableToken = twoFactorService_1.TwoFactorService.generateToken(secret);
            await (0, supertest_1.default)(app)
                .post('/api/auth/2fa/enable')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ token: enableToken });
            // Login with 2FA token
            const loginToken = twoFactorService_1.TwoFactorService.generateToken(secret);
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: 'test2fa@example.com',
                password: 'Test123!@#',
                twoFactorToken: loginToken,
            })
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.data.token).toBeDefined();
            (0, globals_1.expect)(response.body.data.user.twoFactorEnabled).toBe(true);
        });
        (0, globals_1.test)('should fail login with invalid 2FA token', async () => {
            // Enable 2FA
            const setupResponse = await (0, supertest_1.default)(app)
                .post('/api/auth/2fa/setup')
                .set('Authorization', `Bearer ${authToken}`);
            const secret = setupResponse.body.data.secret;
            const token = twoFactorService_1.TwoFactorService.generateToken(secret);
            await (0, supertest_1.default)(app)
                .post('/api/auth/2fa/enable')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ token });
            // Try login with invalid 2FA token
            await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: 'test2fa@example.com',
                password: 'Test123!@#',
                twoFactorToken: '000000',
            })
                .expect(401);
        });
    });
    (0, globals_1.describe)('POST /api/auth/2fa/backup-codes/regenerate', () => {
        (0, globals_1.test)('should regenerate backup codes', async () => {
            // Setup and enable 2FA
            const setupResponse = await (0, supertest_1.default)(app)
                .post('/api/auth/2fa/setup')
                .set('Authorization', `Bearer ${authToken}`);
            const secret = setupResponse.body.data.secret;
            const oldBackupCodes = setupResponse.body.data.backupCodes;
            const token = twoFactorService_1.TwoFactorService.generateToken(secret);
            await (0, supertest_1.default)(app)
                .post('/api/auth/2fa/enable')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ token });
            // Regenerate backup codes
            const newToken = twoFactorService_1.TwoFactorService.generateToken(secret);
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/2fa/backup-codes/regenerate')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ token: newToken })
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.data.backupCodes).toHaveLength(10);
            (0, globals_1.expect)(response.body.data.backupCodes).not.toEqual(oldBackupCodes);
        });
    });
    (0, globals_1.describe)('POST /api/auth/2fa/disable', () => {
        (0, globals_1.test)('should disable 2FA with valid token', async () => {
            // Setup and enable 2FA
            const setupResponse = await (0, supertest_1.default)(app)
                .post('/api/auth/2fa/setup')
                .set('Authorization', `Bearer ${authToken}`);
            const secret = setupResponse.body.data.secret;
            const enableToken = twoFactorService_1.TwoFactorService.generateToken(secret);
            await (0, supertest_1.default)(app)
                .post('/api/auth/2fa/enable')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ token: enableToken });
            // Disable 2FA
            const disableToken = twoFactorService_1.TwoFactorService.generateToken(secret);
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/2fa/disable')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ token: disableToken })
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            // Verify 2FA is disabled
            const user = await User_1.User.findById(userId);
            (0, globals_1.expect)(user?.twoFactorEnabled).toBe(false);
        });
    });
});
//# sourceMappingURL=auth-2fa.test.js.map
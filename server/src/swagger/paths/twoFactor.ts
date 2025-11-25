/**
 * @swagger
 * tags:
 *   name: TwoFactor
 *   description: Two-Factor Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/2fa/status:
 *   get:
 *     summary: Get 2FA status
 *     tags: [TwoFactor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     twoFactorEnabled:
 *                       type: boolean
 */

/**
 * @swagger
 * /api/auth/2fa/setup:
 *   post:
 *     summary: Setup 2FA
 *     description: Generate 2FA secret and QR code
 *     tags: [TwoFactor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA setup data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TwoFactorSetup'
 */

/**
 * @swagger
 * /api/auth/2fa/enable:
 *   post:
 *     summary: Enable 2FA
 *     description: Enable 2FA after verifying the initial code
 *     tags: [TwoFactor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *       400:
 *         description: Invalid verification code
 */

/**
 * @swagger
 * /api/auth/2fa/disable:
 *   post:
 *     summary: Disable 2FA
 *     tags: [TwoFactor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *       400:
 *         description: Invalid verification code
 */

/**
 * @swagger
 * /api/auth/2fa/verify:
 *   post:
 *     summary: Verify 2FA token during login
 *     tags: [TwoFactor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - token
 *             properties:
 *               userId:
 *                 type: string
 *               token:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 2FA verified successfully
 *       401:
 *         description: Invalid verification code
 */

/**
 * @swagger
 * /api/auth/2fa/backup-codes/regenerate:
 *   post:
 *     summary: Regenerate backup codes
 *     tags: [TwoFactor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Backup codes regenerated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 */

export {};

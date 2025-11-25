/**
 * @swagger
 * tags:
 *   name: Subscription
 *   description: Subscription management endpoints
 */

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Get current subscription
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current subscription data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 */

/**
 * @swagger
 * /api/subscriptions/plans:
 *   get:
 *     summary: Get all subscription plans
 *     tags: [Subscription]
 *     responses:
 *       200:
 *         description: List of subscription plans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */

/**
 * @swagger
 * /api/subscriptions/subscribe:
 *   post:
 *     summary: Subscribe to a plan
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tier
 *               - billingCycle
 *             properties:
 *               tier:
 *                 type: string
 *                 enum: [free, basic, premium, enterprise]
 *               billingCycle:
 *                 type: string
 *                 enum: [monthly, yearly]
 *               trialDays:
 *                 type: number
 *     responses:
 *       200:
 *         description: Subscription created
 */

/**
 * @swagger
 * /api/subscriptions/upgrade:
 *   post:
 *     summary: Upgrade subscription
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tier
 *             properties:
 *               tier:
 *                 type: string
 *                 enum: [basic, premium, enterprise]
 *     responses:
 *       200:
 *         description: Subscription upgraded
 */

/**
 * @swagger
 * /api/subscriptions/cancel:
 *   post:
 *     summary: Cancel subscription
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               immediate:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Subscription cancelled
 */

export {};

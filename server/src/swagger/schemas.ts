/**
 * Swagger/OpenAPI schemas for all models
 */

export const schemas = {
  // Auth & User
  User: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      email: { type: 'string', format: 'email' },
      name: { type: 'string' },
      phone: { type: 'string' },
      birthDate: { type: 'string', format: 'date' },
      targetScore: { type: 'number' },
      currentLevel: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
      provider: { type: 'string', enum: ['local', 'kakao', 'naver', 'google', 'facebook', 'github', 'apple'] },
      role: { type: 'string', enum: ['student', 'instructor', 'admin'] },
      isEmailVerified: { type: 'boolean' },
      twoFactorEnabled: { type: 'boolean' },
      enrolledCourses: { type: 'array', items: { type: 'string' } },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },

  // 2FA
  TwoFactorSetup: {
    type: 'object',
    properties: {
      secret: { type: 'string' },
      qrCodeUrl: { type: 'string', format: 'uri' },
      backupCodes: { type: 'array', items: { type: 'string' } },
      message: { type: 'string' },
    },
  },

  // Subscription
  Subscription: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      userId: { type: 'string' },
      tier: { type: 'string', enum: ['free', 'basic', 'premium', 'enterprise'] },
      status: { type: 'string', enum: ['active', 'cancelled', 'expired', 'past_due', 'trialing'] },
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
      cancelAtPeriodEnd: { type: 'boolean' },
      trialEndDate: { type: 'string', format: 'date-time' },
      billingCycle: { type: 'string', enum: ['monthly', 'yearly'] },
      amount: { type: 'number' },
      currency: { type: 'string' },
      features: {
        type: 'object',
        properties: {
          maxCourses: { type: 'number' },
          maxAIRequests: { type: 'number' },
          maxUploads: { type: 'number' },
          prioritySupport: { type: 'boolean' },
          offlineAccess: { type: 'boolean' },
          certificatesEnabled: { type: 'boolean' },
          customBranding: { type: 'boolean' },
          apiAccess: { type: 'boolean' },
        },
      },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },

  // Coupon
  Coupon: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      code: { type: 'string' },
      name: { type: 'string' },
      description: { type: 'string' },
      discountType: { type: 'string', enum: ['percentage', 'fixed_amount'] },
      discountValue: { type: 'number' },
      minPurchaseAmount: { type: 'number' },
      maxDiscountAmount: { type: 'number' },
      usageLimit: { type: 'number' },
      usageCount: { type: 'number' },
      perUserLimit: { type: 'number' },
      validFrom: { type: 'string', format: 'date-time' },
      validUntil: { type: 'string', format: 'date-time' },
      status: { type: 'string', enum: ['active', 'inactive', 'expired'] },
      applicableTiers: { type: 'array', items: { type: 'string' } },
      applicableCourses: { type: 'array', items: { type: 'string' } },
      createdBy: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },

  // Instructor Revenue
  InstructorRevenue: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      instructorId: { type: 'string' },
      courseId: { type: 'string' },
      enrollmentId: { type: 'string' },
      paymentId: { type: 'string' },
      totalAmount: { type: 'number' },
      platformFee: { type: 'number' },
      instructorShare: { type: 'number' },
      sharePercentage: { type: 'number' },
      currency: { type: 'string' },
      status: { type: 'string', enum: ['pending', 'approved', 'paid', 'refunded'] },
      paidAt: { type: 'string', format: 'date-time' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },

  // Payout Request
  PayoutRequest: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      instructorId: { type: 'string' },
      amount: { type: 'number' },
      currency: { type: 'string' },
      payoutMethod: { type: 'string', enum: ['bank_transfer', 'paypal', 'stripe'] },
      payoutDetails: { type: 'object' },
      status: { type: 'string', enum: ['pending', 'processing', 'completed', 'rejected'] },
      revenueIds: { type: 'array', items: { type: 'string' } },
      processedBy: { type: 'string' },
      processedAt: { type: 'string', format: 'date-time' },
      rejectionReason: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },

  // Security Audit Log
  SecurityAuditLog: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      userId: { type: 'string' },
      eventType: { type: 'string' },
      eventDescription: { type: 'string' },
      ipAddress: { type: 'string' },
      userAgent: { type: 'string' },
      metadata: { type: 'object' },
      severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
      success: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },

  // API Responses
  SuccessResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string' },
      data: { type: 'object' },
    },
  },

  ErrorResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      error: { type: 'string' },
      message: { type: 'string' },
    },
  },

  // Pagination
  PaginatedResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: { type: 'array', items: { type: 'object' } },
      pagination: {
        type: 'object',
        properties: {
          page: { type: 'number' },
          limit: { type: 'number' },
          total: { type: 'number' },
          pages: { type: 'number' },
        },
      },
    },
  },
};

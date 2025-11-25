/**
 * Swagger/OpenAPI schemas for all models
 */
export declare const schemas: {
    User: {
        type: string;
        properties: {
            _id: {
                type: string;
            };
            email: {
                type: string;
                format: string;
            };
            name: {
                type: string;
            };
            phone: {
                type: string;
            };
            birthDate: {
                type: string;
                format: string;
            };
            targetScore: {
                type: string;
            };
            currentLevel: {
                type: string;
                enum: string[];
            };
            provider: {
                type: string;
                enum: string[];
            };
            role: {
                type: string;
                enum: string[];
            };
            isEmailVerified: {
                type: string;
            };
            twoFactorEnabled: {
                type: string;
            };
            enrolledCourses: {
                type: string;
                items: {
                    type: string;
                };
            };
            createdAt: {
                type: string;
                format: string;
            };
            updatedAt: {
                type: string;
                format: string;
            };
        };
    };
    TwoFactorSetup: {
        type: string;
        properties: {
            secret: {
                type: string;
            };
            qrCodeUrl: {
                type: string;
                format: string;
            };
            backupCodes: {
                type: string;
                items: {
                    type: string;
                };
            };
            message: {
                type: string;
            };
        };
    };
    Subscription: {
        type: string;
        properties: {
            _id: {
                type: string;
            };
            userId: {
                type: string;
            };
            tier: {
                type: string;
                enum: string[];
            };
            status: {
                type: string;
                enum: string[];
            };
            startDate: {
                type: string;
                format: string;
            };
            endDate: {
                type: string;
                format: string;
            };
            cancelAtPeriodEnd: {
                type: string;
            };
            trialEndDate: {
                type: string;
                format: string;
            };
            billingCycle: {
                type: string;
                enum: string[];
            };
            amount: {
                type: string;
            };
            currency: {
                type: string;
            };
            features: {
                type: string;
                properties: {
                    maxCourses: {
                        type: string;
                    };
                    maxAIRequests: {
                        type: string;
                    };
                    maxUploads: {
                        type: string;
                    };
                    prioritySupport: {
                        type: string;
                    };
                    offlineAccess: {
                        type: string;
                    };
                    certificatesEnabled: {
                        type: string;
                    };
                    customBranding: {
                        type: string;
                    };
                    apiAccess: {
                        type: string;
                    };
                };
            };
            createdAt: {
                type: string;
                format: string;
            };
            updatedAt: {
                type: string;
                format: string;
            };
        };
    };
    Coupon: {
        type: string;
        properties: {
            _id: {
                type: string;
            };
            code: {
                type: string;
            };
            name: {
                type: string;
            };
            description: {
                type: string;
            };
            discountType: {
                type: string;
                enum: string[];
            };
            discountValue: {
                type: string;
            };
            minPurchaseAmount: {
                type: string;
            };
            maxDiscountAmount: {
                type: string;
            };
            usageLimit: {
                type: string;
            };
            usageCount: {
                type: string;
            };
            perUserLimit: {
                type: string;
            };
            validFrom: {
                type: string;
                format: string;
            };
            validUntil: {
                type: string;
                format: string;
            };
            status: {
                type: string;
                enum: string[];
            };
            applicableTiers: {
                type: string;
                items: {
                    type: string;
                };
            };
            applicableCourses: {
                type: string;
                items: {
                    type: string;
                };
            };
            createdBy: {
                type: string;
            };
            createdAt: {
                type: string;
                format: string;
            };
            updatedAt: {
                type: string;
                format: string;
            };
        };
    };
    InstructorRevenue: {
        type: string;
        properties: {
            _id: {
                type: string;
            };
            instructorId: {
                type: string;
            };
            courseId: {
                type: string;
            };
            enrollmentId: {
                type: string;
            };
            paymentId: {
                type: string;
            };
            totalAmount: {
                type: string;
            };
            platformFee: {
                type: string;
            };
            instructorShare: {
                type: string;
            };
            sharePercentage: {
                type: string;
            };
            currency: {
                type: string;
            };
            status: {
                type: string;
                enum: string[];
            };
            paidAt: {
                type: string;
                format: string;
            };
            createdAt: {
                type: string;
                format: string;
            };
            updatedAt: {
                type: string;
                format: string;
            };
        };
    };
    PayoutRequest: {
        type: string;
        properties: {
            _id: {
                type: string;
            };
            instructorId: {
                type: string;
            };
            amount: {
                type: string;
            };
            currency: {
                type: string;
            };
            payoutMethod: {
                type: string;
                enum: string[];
            };
            payoutDetails: {
                type: string;
            };
            status: {
                type: string;
                enum: string[];
            };
            revenueIds: {
                type: string;
                items: {
                    type: string;
                };
            };
            processedBy: {
                type: string;
            };
            processedAt: {
                type: string;
                format: string;
            };
            rejectionReason: {
                type: string;
            };
            createdAt: {
                type: string;
                format: string;
            };
            updatedAt: {
                type: string;
                format: string;
            };
        };
    };
    SecurityAuditLog: {
        type: string;
        properties: {
            _id: {
                type: string;
            };
            userId: {
                type: string;
            };
            eventType: {
                type: string;
            };
            eventDescription: {
                type: string;
            };
            ipAddress: {
                type: string;
            };
            userAgent: {
                type: string;
            };
            metadata: {
                type: string;
            };
            severity: {
                type: string;
                enum: string[];
            };
            success: {
                type: string;
            };
            createdAt: {
                type: string;
                format: string;
            };
        };
    };
    SuccessResponse: {
        type: string;
        properties: {
            success: {
                type: string;
                example: boolean;
            };
            message: {
                type: string;
            };
            data: {
                type: string;
            };
        };
    };
    ErrorResponse: {
        type: string;
        properties: {
            success: {
                type: string;
                example: boolean;
            };
            error: {
                type: string;
            };
            message: {
                type: string;
            };
        };
    };
    PaginatedResponse: {
        type: string;
        properties: {
            success: {
                type: string;
            };
            data: {
                type: string;
                items: {
                    type: string;
                };
            };
            pagination: {
                type: string;
                properties: {
                    page: {
                        type: string;
                    };
                    limit: {
                        type: string;
                    };
                    total: {
                        type: string;
                    };
                    pages: {
                        type: string;
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=schemas.d.ts.map
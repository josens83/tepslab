"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serveSwaggerJson = exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TEPS Lab API Documentation',
            version: '1.0.0',
            description: 'TEPS Learning Platform API - Premium TEPS test preparation platform',
            contact: {
                name: 'TEPS Lab Support',
                email: 'support@tepslab.com',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
            {
                url: 'https://api.tepslab.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token',
                },
                refreshToken: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'refreshToken',
                    description: 'Refresh token stored in HTTP-only cookie',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'User ID',
                        },
                        name: {
                            type: 'string',
                            description: 'User full name',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                        },
                        phone: {
                            type: 'string',
                            description: 'User phone number',
                        },
                        role: {
                            type: 'string',
                            enum: ['student', 'instructor', 'admin'],
                            description: 'User role',
                        },
                        profileImage: {
                            type: 'string',
                            description: 'Profile image URL',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Course: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Course ID',
                        },
                        title: {
                            type: 'string',
                            description: 'Course title',
                        },
                        description: {
                            type: 'string',
                            description: 'Course description',
                        },
                        instructor: {
                            type: 'string',
                            description: 'Instructor ID',
                        },
                        category: {
                            type: 'string',
                            enum: ['문법', '독해', '청해', '어휘', '종합'],
                            description: 'Course category',
                        },
                        level: {
                            type: 'string',
                            enum: ['초급', '중급', '고급'],
                            description: 'Course difficulty level',
                        },
                        targetScore: {
                            type: 'string',
                            enum: ['327점', '387점', '450점', '550점'],
                            description: 'Target TEPS score',
                        },
                        price: {
                            type: 'number',
                            description: 'Course price in KRW',
                        },
                        discountPrice: {
                            type: 'number',
                            description: 'Discounted price',
                        },
                        duration: {
                            type: 'number',
                            description: 'Course duration in minutes',
                        },
                        rating: {
                            type: 'number',
                            minimum: 0,
                            maximum: 5,
                            description: 'Average course rating',
                        },
                        enrolledCount: {
                            type: 'number',
                            description: 'Number of enrolled students',
                        },
                        thumbnail: {
                            type: 'string',
                            description: 'Course thumbnail URL',
                        },
                        status: {
                            type: 'string',
                            enum: ['draft', 'published', 'archived'],
                            description: 'Course status',
                        },
                    },
                },
                Enrollment: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                        },
                        userId: {
                            type: 'string',
                            description: 'Enrolled user ID',
                        },
                        courseId: {
                            type: 'string',
                            description: 'Enrolled course ID',
                        },
                        progress: {
                            type: 'number',
                            minimum: 0,
                            maximum: 100,
                            description: 'Course completion percentage',
                        },
                        completedLessons: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            description: 'List of completed lesson IDs',
                        },
                        enrolledAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Payment: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                        },
                        userId: {
                            type: 'string',
                        },
                        courseId: {
                            type: 'string',
                        },
                        amount: {
                            type: 'number',
                            description: 'Payment amount in KRW',
                        },
                        method: {
                            type: 'string',
                            enum: ['card', 'virtual_account', 'transfer'],
                            description: 'Payment method',
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'completed', 'failed', 'refunded'],
                            description: 'Payment status',
                        },
                        paymentKey: {
                            type: 'string',
                            description: 'TossPayments payment key',
                        },
                        orderId: {
                            type: 'string',
                            description: 'Unique order ID',
                        },
                        paidAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Review: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                        },
                        userId: {
                            type: 'string',
                        },
                        courseId: {
                            type: 'string',
                        },
                        rating: {
                            type: 'number',
                            minimum: 1,
                            maximum: 5,
                        },
                        comment: {
                            type: 'string',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            description: 'Error message',
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            description: 'Detailed error messages',
                        },
                    },
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        message: {
                            type: 'string',
                        },
                        data: {
                            type: 'object',
                            description: 'Response data',
                        },
                    },
                },
            },
            responses: {
                UnauthorizedError: {
                    description: 'Access token is missing or invalid',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
                NotFoundError: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
                ValidationError: {
                    description: 'Validation error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Auth',
                description: 'Authentication endpoints',
            },
            {
                name: 'Users',
                description: 'User management endpoints',
            },
            {
                name: 'Courses',
                description: 'Course management endpoints',
            },
            {
                name: 'Enrollments',
                description: 'Course enrollment endpoints',
            },
            {
                name: 'Payments',
                description: 'Payment processing endpoints',
            },
            {
                name: 'Reviews',
                description: 'Course review endpoints',
            },
            {
                name: 'Tests',
                description: 'Diagnostic test endpoints',
            },
            {
                name: 'Admin',
                description: 'Admin management endpoints',
            },
        ],
    },
    apis: [
        './src/routes/*.ts',
        './src/controllers/*.ts',
        './src/models/*.ts',
    ],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
/**
 * Swagger JSON endpoint
 */
const serveSwaggerJson = (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(exports.swaggerSpec);
};
exports.serveSwaggerJson = serveSwaggerJson;
//# sourceMappingURL=swagger.js.map
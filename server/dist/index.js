"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const hpp_1 = __importDefault(require("hpp"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const Sentry = __importStar(require("@sentry/node"));
const sentry_1 = require("./config/sentry");
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const openai_1 = require("./config/openai");
const swagger_1 = require("./config/swagger");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const twoFactorRoutes_1 = __importDefault(require("./routes/twoFactorRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const enrollmentRoutes_1 = __importDefault(require("./routes/enrollmentRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const testRoutes_1 = __importDefault(require("./routes/testRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const sitemapRoutes_1 = __importDefault(require("./routes/sitemapRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const noteRoutes_1 = __importDefault(require("./routes/noteRoutes"));
const bookmarkRoutes_1 = __importDefault(require("./routes/bookmarkRoutes"));
const aiTutorRoutes_1 = __importDefault(require("./routes/aiTutorRoutes"));
const tepsQuestions_1 = __importDefault(require("./routes/tepsQuestions"));
const personalizedLearning_1 = __importDefault(require("./routes/personalizedLearning"));
const tepsExams_1 = __importDefault(require("./routes/tepsExams"));
const enhancedAITutor_1 = __importDefault(require("./routes/enhancedAITutor"));
const learningAnalytics_1 = __importDefault(require("./routes/learningAnalytics"));
const studyGroup_1 = __importDefault(require("./routes/studyGroup"));
const forum_1 = __importDefault(require("./routes/forum"));
const messaging_1 = __importDefault(require("./routes/messaging"));
const partnerMatching_1 = __importDefault(require("./routes/partnerMatching"));
const gamification_1 = __importDefault(require("./routes/gamification"));
const errorHandler_1 = require("./middleware/errorHandler");
// Load environment variables
dotenv_1.default.config();
// Initialize Sentry
(0, sentry_1.initSentry)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Sentry request handler
// Note: In newer Sentry SDK versions, use Sentry.setupExpressErrorHandler(app) after all routes
// Security Middleware
// Set security HTTP headers
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://js.tosspayments.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https://api.tosspayments.com"],
            frameSrc: ["'self'", "https://js.tosspayments.com"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
// Apply rate limiting to API routes
app.use('/api/', limiter);
// Stricter rate limit for auth routes
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
// Data sanitization against NoSQL query injection
app.use((0, express_mongo_sanitize_1.default)());
// Data sanitization against XSS
app.use((0, xss_clean_1.default)());
// Prevent parameter pollution
app.use((0, hpp_1.default)({
    whitelist: [
        'targetScore',
        'level',
        'category',
        'price',
        'rating',
        'sort',
    ],
}));
// Enable CORS
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
// Compression middleware
app.use((0, compression_1.default)());
// Body parser
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Cookie parser
app.use((0, cookie_parser_1.default)());
// Health check route
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});
// API Documentation
app.get('/api-docs/swagger.json', swagger_1.serveSwaggerJson);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'TEPS Lab API Docs',
}));
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/auth/2fa', twoFactorRoutes_1.default);
app.use('/api/courses', courseRoutes_1.default);
app.use('/api/enrollments', enrollmentRoutes_1.default);
app.use('/api/payments', paymentRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/reviews', reviewRoutes_1.default);
app.use('/api/tests', testRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/uploads', uploadRoutes_1.default);
app.use('/api/sitemap', sitemapRoutes_1.default);
app.use('/api/notes', noteRoutes_1.default);
app.use('/api/bookmarks', bookmarkRoutes_1.default);
app.use('/api/ai-tutor', aiTutorRoutes_1.default);
app.use('/api/teps-questions', tepsQuestions_1.default);
app.use('/api/personalized-learning', personalizedLearning_1.default);
app.use('/api/teps-exams', tepsExams_1.default);
app.use('/api/enhanced-ai-tutor', enhancedAITutor_1.default);
app.use('/api/learning-analytics', learningAnalytics_1.default);
// Phase 5-1: Social Learning & Community Features
app.use('/api/study-groups', studyGroup_1.default);
app.use('/api/forum', forum_1.default);
app.use('/api/messaging', messaging_1.default);
app.use('/api/partner-matching', partnerMatching_1.default);
// Phase 5-2: Gamification & Engagement System
app.use('/api/gamification', gamification_1.default);
// Serve uploaded files
app.use('/uploads', express_1.default.static('uploads'));
// Sentry error handler (using newer API)
Sentry.setupExpressErrorHandler(app);
// Error handling
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
// Start server
const startServer = async () => {
    try {
        // Connect to database
        await (0, database_1.connectDatabase)();
        // Initialize Redis (optional)
        (0, redis_1.initRedis)();
        // Initialize OpenAI (optional)
        (0, openai_1.initOpenAI)();
        // Start listening
        app.listen(PORT, () => {
            console.log('');
            console.log('🚀 Server started successfully');
            console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`   Port: ${PORT}`);
            console.log(`   URL: http://localhost:${PORT}`);
            console.log('');
            console.log('📝 Available routes:');
            console.log('   GET  /health');
            console.log('');
            console.log('   Auth:');
            console.log('   POST /api/auth/register');
            console.log('   POST /api/auth/login');
            console.log('   GET  /api/auth/me');
            console.log('   GET  /api/auth/kakao');
            console.log('   GET  /api/auth/naver');
            console.log('');
            console.log('   Courses:');
            console.log('   GET  /api/courses');
            console.log('   GET  /api/courses/featured');
            console.log('   GET  /api/courses/:id');
            console.log('   POST /api/courses (Admin)');
            console.log('');
            console.log('   Enrollments:');
            console.log('   POST /api/enrollments');
            console.log('   GET  /api/enrollments');
            console.log('   PUT  /api/enrollments/:id/progress');
            console.log('');
            console.log('   Payments:');
            console.log('   POST /api/payments/ready');
            console.log('   POST /api/payments/confirm');
            console.log('   GET  /api/payments');
            console.log('   GET  /api/payments/:id');
            console.log('   POST /api/payments/:id/cancel');
            console.log('');
            console.log('   Users:');
            console.log('   GET  /api/users/profile');
            console.log('   PUT  /api/users/profile');
            console.log('   PUT  /api/users/password');
            console.log('   DELETE /api/users/account');
            console.log('');
            console.log('   Reviews:');
            console.log('   GET  /api/reviews/course/:courseId');
            console.log('   GET  /api/reviews/my');
            console.log('   POST /api/reviews');
            console.log('   PUT  /api/reviews/:id');
            console.log('   DELETE /api/reviews/:id');
            console.log('   POST /api/reviews/:id/helpful');
            console.log('');
            console.log('   Tests:');
            console.log('   GET  /api/tests');
            console.log('   GET  /api/tests/:id');
            console.log('   POST /api/tests/:id/submit');
            console.log('   GET  /api/tests/results/my');
            console.log('   GET  /api/tests/results/:id');
            console.log('   POST /api/tests (Admin)');
            console.log('');
            console.log('   Admin:');
            console.log('   GET  /api/admin/stats');
            console.log('   GET  /api/admin/users');
            console.log('   PUT  /api/admin/users/:id/status');
            console.log('   GET  /api/admin/courses');
            console.log('');
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map
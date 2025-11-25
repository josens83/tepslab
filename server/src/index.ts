import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import * as Sentry from '@sentry/node';
import { initSentry } from './config/sentry';
import { connectDatabase } from './config/database';
import { initRedis } from './config/redis';
import { initOpenAI } from './config/openai';
import { swaggerSpec, serveSwaggerJson } from './config/swagger';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/authRoutes';
import twoFactorRoutes from './routes/twoFactorRoutes';
import courseRoutes from './routes/courseRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes';
import paymentRoutes from './routes/paymentRoutes';
import userRoutes from './routes/userRoutes';
import reviewRoutes from './routes/reviewRoutes';
import testRoutes from './routes/testRoutes';
import adminRoutes from './routes/adminRoutes';
import sitemapRoutes from './routes/sitemapRoutes';
import uploadRoutes from './routes/uploadRoutes';
import noteRoutes from './routes/noteRoutes';
import bookmarkRoutes from './routes/bookmarkRoutes';
import aiTutorRoutes from './routes/aiTutorRoutes';
import tepsQuestionsRoutes from './routes/tepsQuestions';
import personalizedLearningRoutes from './routes/personalizedLearning';
import tepsExamsRoutes from './routes/tepsExams';
import enhancedAITutorRoutes from './routes/enhancedAITutor';
import learningAnalyticsRoutes from './routes/learningAnalytics';
import studyGroupRoutes from './routes/studyGroup';
import forumRoutes from './routes/forum';
import messagingRoutes from './routes/messaging';
import partnerMatchingRoutes from './routes/partnerMatching';
import gamificationRoutes from './routes/gamification';
import advancedAIRoutes from './routes/advancedAI';
import { errorHandler, notFound } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Initialize Sentry
initSentry();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Sentry request handler must be the first middleware
app.use(Sentry.Handlers.requestHandler());

// Security Middleware
// Set security HTTP headers
app.use(helmet({
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
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
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
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Compression middleware
app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Health check route
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Documentation
app.get('/api-docs/swagger.json', serveSwaggerJson);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TEPS Lab API Docs',
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/2fa', twoFactorRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/sitemap', sitemapRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/ai-tutor', aiTutorRoutes);
app.use('/api/teps-questions', tepsQuestionsRoutes);
app.use('/api/personalized-learning', personalizedLearningRoutes);
app.use('/api/teps-exams', tepsExamsRoutes);
app.use('/api/enhanced-ai-tutor', enhancedAITutorRoutes);
app.use('/api/learning-analytics', learningAnalyticsRoutes);

// Phase 5-1: Social Learning & Community Features
app.use('/api/study-groups', studyGroupRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/partner-matching', partnerMatchingRoutes);

// Phase 5-2: Gamification & Engagement System
app.use('/api/gamification', gamificationRoutes);

// Phase 5-3: Advanced AI Features
app.use('/api/advanced-ai', advancedAIRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Sentry error handler must be before other error handlers
app.use(Sentry.Handlers.errorHandler());

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Initialize Redis (optional)
    initRedis();

    // Initialize OpenAI (optional)
    initOpenAI();

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
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

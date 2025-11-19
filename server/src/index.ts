import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes';
import paymentRoutes from './routes/paymentRoutes';
import userRoutes from './routes/userRoutes';
import reviewRoutes from './routes/reviewRoutes';
import testRoutes from './routes/testRoutes';
import adminRoutes from './routes/adminRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { errorHandler, notFound } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check route
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

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
      console.log('   GET  /api/admin/payments');
      console.log('   POST /api/admin/payments/:id/refund');
      console.log('');
      console.log('   Uploads:');
      console.log('   POST /api/uploads/image');
      console.log('   POST /api/uploads/images');
      console.log('   POST /api/uploads/video (Admin)');
      console.log('   POST /api/uploads/avatar');
      console.log('   DELETE /api/uploads/:filename');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

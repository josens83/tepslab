"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const enrollmentRoutes_1 = __importDefault(require("./routes/enrollmentRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const testRoutes_1 = __importDefault(require("./routes/testRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check route
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/courses', courseRoutes_1.default);
app.use('/api/enrollments', enrollmentRoutes_1.default);
app.use('/api/payments', paymentRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/reviews', reviewRoutes_1.default);
app.use('/api/tests', testRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
// Error handling
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
// Start server
const startServer = async () => {
    try {
        // Connect to database
        await (0, database_1.connectDatabase)();
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
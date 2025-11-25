import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getAdminCourses,
  getAdminPayments,
  refundPayment,
} from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Admin
 */
router.get('/stats', getDashboardStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin
 */
router.get('/users', getUsers);

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Update user status
 * @access  Admin
 */
router.put('/users/:id/status', updateUserStatus);

/**
 * @route   GET /api/admin/courses
 * @desc    Get all courses (admin view)
 * @access  Admin
 */
router.get('/courses', getAdminCourses);

/**
 * @route   GET /api/admin/payments
 * @desc    Get all payments (admin view)
 * @access  Admin
 */
router.get('/payments', getAdminPayments);

/**
 * @route   POST /api/admin/payments/:id/refund
 * @desc    Refund a payment
 * @access  Admin
 */
router.post('/payments/:id/refund', refundPayment);

export default router;

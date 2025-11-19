"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All admin routes require authentication and admin role
router.use(auth_1.authenticate);
router.use(auth_1.requireAdmin);
/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Admin
 */
router.get('/stats', adminController_1.getDashboardStats);
/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin
 */
router.get('/users', adminController_1.getUsers);
/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Update user status
 * @access  Admin
 */
router.put('/users/:id/status', adminController_1.updateUserStatus);
/**
 * @route   GET /api/admin/courses
 * @desc    Get all courses (admin view)
 * @access  Admin
 */
router.get('/courses', adminController_1.getAdminCourses);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map
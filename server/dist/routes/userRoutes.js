"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', userController_1.getProfile);
/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', userController_1.updateProfile);
/**
 * @route   PUT /api/users/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/password', userController_1.changePassword);
/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', userController_1.deleteAccount);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map
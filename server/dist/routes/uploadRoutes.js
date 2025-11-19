"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadController_1 = require("../controllers/uploadController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../config/upload");
const router = (0, express_1.Router)();
// All upload routes require authentication
router.use(auth_1.authenticate);
/**
 * @route   POST /api/uploads/image
 * @desc    Upload single image
 * @access  Private
 */
router.post('/image', upload_1.imageUpload.single('image'), uploadController_1.uploadImage);
/**
 * @route   POST /api/uploads/images
 * @desc    Upload multiple images (max 10)
 * @access  Private
 */
router.post('/images', upload_1.imageUpload.array('images', 10), uploadController_1.uploadMultipleImages);
/**
 * @route   POST /api/uploads/video
 * @desc    Upload video (admin only for course videos)
 * @access  Admin
 */
router.post('/video', auth_1.requireAdmin, upload_1.videoUpload.single('video'), uploadController_1.uploadVideo);
/**
 * @route   POST /api/uploads/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post('/avatar', upload_1.imageUpload.single('avatar'), uploadController_1.uploadAvatar);
/**
 * @route   DELETE /api/uploads/:filename
 * @desc    Delete uploaded file
 * @access  Private
 */
router.delete('/:filename', uploadController_1.deleteFile);
exports.default = router;
//# sourceMappingURL=uploadRoutes.js.map
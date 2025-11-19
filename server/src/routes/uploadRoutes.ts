import { Router } from 'express';
import {
  uploadImage,
  uploadMultipleImages,
  uploadVideo,
  deleteFile,
  uploadAvatar,
} from '../controllers/uploadController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { imageUpload, videoUpload } from '../config/upload';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/uploads/image
 * @desc    Upload single image
 * @access  Private
 */
router.post('/image', imageUpload.single('image'), uploadImage);

/**
 * @route   POST /api/uploads/images
 * @desc    Upload multiple images (max 10)
 * @access  Private
 */
router.post('/images', imageUpload.array('images', 10), uploadMultipleImages);

/**
 * @route   POST /api/uploads/video
 * @desc    Upload video (admin only for course videos)
 * @access  Admin
 */
router.post('/video', requireAdmin, videoUpload.single('video'), uploadVideo);

/**
 * @route   POST /api/uploads/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post('/avatar', imageUpload.single('avatar'), uploadAvatar);

/**
 * @route   DELETE /api/uploads/:filename
 * @desc    Delete uploaded file
 * @access  Private
 */
router.delete('/:filename', deleteFile);

export default router;

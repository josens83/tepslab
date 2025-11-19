import { Router } from 'express';
import {
  createReview,
  getCourseReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  markHelpful,
} from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/reviews/course/:courseId
 * @desc    Get reviews for a course
 * @access  Public
 */
router.get('/course/:courseId', getCourseReviews);

/**
 * @route   GET /api/reviews/my
 * @desc    Get current user's reviews
 * @access  Private
 */
router.get('/my', authenticate, getMyReviews);

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private
 */
router.post('/', authenticate, createReview);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update a review
 * @access  Private
 */
router.put('/:id', authenticate, updateReview);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Private
 */
router.delete('/:id', authenticate, deleteReview);

/**
 * @route   POST /api/reviews/:id/helpful
 * @desc    Mark a review as helpful
 * @access  Private
 */
router.post('/:id/helpful', authenticate, markHelpful);

export default router;

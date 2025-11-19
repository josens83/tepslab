"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviewController_1 = require("../controllers/reviewController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/reviews/course/:courseId
 * @desc    Get reviews for a course
 * @access  Public
 */
router.get('/course/:courseId', reviewController_1.getCourseReviews);
/**
 * @route   GET /api/reviews/my
 * @desc    Get current user's reviews
 * @access  Private
 */
router.get('/my', auth_1.authenticate, reviewController_1.getMyReviews);
/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private
 */
router.post('/', auth_1.authenticate, reviewController_1.createReview);
/**
 * @route   PUT /api/reviews/:id
 * @desc    Update a review
 * @access  Private
 */
router.put('/:id', auth_1.authenticate, reviewController_1.updateReview);
/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Private
 */
router.delete('/:id', auth_1.authenticate, reviewController_1.deleteReview);
/**
 * @route   POST /api/reviews/:id/helpful
 * @desc    Mark a review as helpful
 * @access  Private
 */
router.post('/:id/helpful', auth_1.authenticate, reviewController_1.markHelpful);
exports.default = router;
//# sourceMappingURL=reviewRoutes.js.map
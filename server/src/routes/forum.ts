import express from 'express';
import * as forumController from '../controllers/forumController';
import { auth } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = express.Router();

// Post Routes

/**
 * @route   POST /api/forum/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post('/posts', auth, forumController.createPost);

/**
 * @route   GET /api/forum/posts
 * @desc    Get all posts with filters
 * @access  Public
 */
router.get('/posts', forumController.getPosts);

/**
 * @route   GET /api/forum/posts/:id
 * @desc    Get post by ID
 * @access  Public
 */
router.get('/posts/:id', forumController.getPost);

/**
 * @route   PUT /api/forum/posts/:id
 * @desc    Update a post
 * @access  Private (Author)
 */
router.put('/posts/:id', auth, forumController.updatePost);

/**
 * @route   DELETE /api/forum/posts/:id
 * @desc    Delete a post
 * @access  Private (Author/Admin)
 */
router.delete('/posts/:id', auth, forumController.deletePost);

/**
 * @route   POST /api/forum/posts/:id/close
 * @desc    Close a post (questions)
 * @access  Private (Author)
 */
router.post('/posts/:id/close', auth, forumController.closePost);

/**
 * @route   POST /api/forum/posts/:id/upvote
 * @desc    Toggle upvote on post
 * @access  Private
 */
router.post('/posts/:id/upvote', auth, forumController.toggleUpvote);

/**
 * @route   POST /api/forum/posts/:id/downvote
 * @desc    Toggle downvote on post
 * @access  Private
 */
router.post('/posts/:id/downvote', auth, forumController.toggleDownvote);

/**
 * @route   POST /api/forum/posts/:id/pin
 * @desc    Pin/Unpin a post
 * @access  Private (Admin)
 */
router.post('/posts/:id/pin', auth, requireAdmin, forumController.pinPost);

/**
 * @route   POST /api/forum/posts/:id/feature
 * @desc    Feature/Unfeature a post
 * @access  Private (Admin)
 */
router.post('/posts/:id/feature', auth, requireAdmin, forumController.featurePost);

// Comment Routes

/**
 * @route   POST /api/forum/posts/:postId/comments
 * @desc    Create a comment on a post
 * @access  Private
 */
router.post('/posts/:postId/comments', auth, forumController.createComment);

/**
 * @route   GET /api/forum/posts/:postId/comments
 * @desc    Get comments for a post
 * @access  Public
 */
router.get('/posts/:postId/comments', forumController.getComments);

/**
 * @route   PUT /api/forum/comments/:id
 * @desc    Update a comment
 * @access  Private (Author)
 */
router.put('/comments/:id', auth, forumController.updateComment);

/**
 * @route   DELETE /api/forum/comments/:id
 * @desc    Delete a comment
 * @access  Private (Author/Admin)
 */
router.delete('/comments/:id', auth, forumController.deleteComment);

/**
 * @route   POST /api/forum/comments/:id/upvote
 * @desc    Toggle upvote on comment
 * @access  Private
 */
router.post('/comments/:id/upvote', auth, forumController.toggleCommentUpvote);

/**
 * @route   POST /api/forum/comments/:id/downvote
 * @desc    Toggle downvote on comment
 * @access  Private
 */
router.post('/comments/:id/downvote', auth, forumController.toggleCommentDownvote);

/**
 * @route   POST /api/forum/posts/:postId/accept/:commentId
 * @desc    Accept an answer for a question
 * @access  Private (Post Author)
 */
router.post('/posts/:postId/accept/:commentId', auth, forumController.acceptAnswer);

// Utility Routes

/**
 * @route   GET /api/forum/tags/trending
 * @desc    Get trending tags
 * @access  Public
 */
router.get('/tags/trending', forumController.getTrendingTags);

/**
 * @route   GET /api/forum/users/:userId/activity
 * @desc    Get user's forum activity
 * @access  Public
 */
router.get('/users/:userId/activity', forumController.getUserActivity);

/**
 * @route   GET /api/forum/my-activity
 * @desc    Get current user's forum activity
 * @access  Private
 */
router.get('/my-activity', auth, forumController.getUserActivity);

export default router;

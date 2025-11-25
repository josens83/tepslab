"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const forumController = __importStar(require("../controllers/forumController"));
const auth_1 = require("../middleware/auth");
const requireAdmin_1 = require("../middleware/requireAdmin");
const router = express_1.default.Router();
// Post Routes
/**
 * @route   POST /api/forum/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post('/posts', auth_1.auth, forumController.createPost);
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
router.put('/posts/:id', auth_1.auth, forumController.updatePost);
/**
 * @route   DELETE /api/forum/posts/:id
 * @desc    Delete a post
 * @access  Private (Author/Admin)
 */
router.delete('/posts/:id', auth_1.auth, forumController.deletePost);
/**
 * @route   POST /api/forum/posts/:id/close
 * @desc    Close a post (questions)
 * @access  Private (Author)
 */
router.post('/posts/:id/close', auth_1.auth, forumController.closePost);
/**
 * @route   POST /api/forum/posts/:id/upvote
 * @desc    Toggle upvote on post
 * @access  Private
 */
router.post('/posts/:id/upvote', auth_1.auth, forumController.toggleUpvote);
/**
 * @route   POST /api/forum/posts/:id/downvote
 * @desc    Toggle downvote on post
 * @access  Private
 */
router.post('/posts/:id/downvote', auth_1.auth, forumController.toggleDownvote);
/**
 * @route   POST /api/forum/posts/:id/pin
 * @desc    Pin/Unpin a post
 * @access  Private (Admin)
 */
router.post('/posts/:id/pin', auth_1.auth, requireAdmin_1.requireAdmin, forumController.pinPost);
/**
 * @route   POST /api/forum/posts/:id/feature
 * @desc    Feature/Unfeature a post
 * @access  Private (Admin)
 */
router.post('/posts/:id/feature', auth_1.auth, requireAdmin_1.requireAdmin, forumController.featurePost);
// Comment Routes
/**
 * @route   POST /api/forum/posts/:postId/comments
 * @desc    Create a comment on a post
 * @access  Private
 */
router.post('/posts/:postId/comments', auth_1.auth, forumController.createComment);
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
router.put('/comments/:id', auth_1.auth, forumController.updateComment);
/**
 * @route   DELETE /api/forum/comments/:id
 * @desc    Delete a comment
 * @access  Private (Author/Admin)
 */
router.delete('/comments/:id', auth_1.auth, forumController.deleteComment);
/**
 * @route   POST /api/forum/comments/:id/upvote
 * @desc    Toggle upvote on comment
 * @access  Private
 */
router.post('/comments/:id/upvote', auth_1.auth, forumController.toggleCommentUpvote);
/**
 * @route   POST /api/forum/comments/:id/downvote
 * @desc    Toggle downvote on comment
 * @access  Private
 */
router.post('/comments/:id/downvote', auth_1.auth, forumController.toggleCommentDownvote);
/**
 * @route   POST /api/forum/posts/:postId/accept/:commentId
 * @desc    Accept an answer for a question
 * @access  Private (Post Author)
 */
router.post('/posts/:postId/accept/:commentId', auth_1.auth, forumController.acceptAnswer);
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
router.get('/my-activity', auth_1.auth, forumController.getUserActivity);
exports.default = router;
//# sourceMappingURL=forum.js.map
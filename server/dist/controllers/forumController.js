"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.featurePost = exports.pinPost = exports.getUserActivity = exports.getTrendingTags = exports.acceptAnswer = exports.toggleCommentDownvote = exports.toggleCommentUpvote = exports.deleteComment = exports.updateComment = exports.getComments = exports.createComment = exports.toggleDownvote = exports.toggleUpvote = exports.closePost = exports.deletePost = exports.updatePost = exports.getPosts = exports.getPost = exports.createPost = void 0;
const forumService_1 = require("../services/forumService");
const mongoose_1 = __importDefault(require("mongoose"));
// Post Controllers
const createPost = async (req, res, next) => {
    try {
        const authorId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const post = await forumService_1.ForumService.createPost(authorId, req.body);
        res.status(201).json({
            success: true,
            data: post
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createPost = createPost;
const getPost = async (req, res, next) => {
    try {
        const postId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const post = await forumService_1.ForumService.getPostById(postId, true);
        if (!post) {
            res.status(404).json({
                success: false,
                message: 'Post not found'
            });
            return;
        }
        res.json({
            success: true,
            data: post
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPost = getPost;
const getPosts = async (req, res, next) => {
    try {
        const filters = {};
        if (req.query.postType)
            filters.postType = req.query.postType;
        if (req.query.category)
            filters.category = req.query.category;
        if (req.query.tags)
            filters.tags = req.query.tags.split(',');
        if (req.query.targetScore)
            filters.targetScore = Number(req.query.targetScore);
        if (req.query.author)
            filters.author = new mongoose_1.default.Types.ObjectId(req.query.author);
        if (req.query.search)
            filters.search = req.query.search;
        if (req.query.sortBy)
            filters.sortBy = req.query.sortBy;
        if (req.query.page)
            filters.page = Number(req.query.page);
        if (req.query.limit)
            filters.limit = Number(req.query.limit);
        const result = await forumService_1.ForumService.getPosts(filters);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPosts = getPosts;
const updatePost = async (req, res, next) => {
    try {
        const postId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const authorId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const post = await forumService_1.ForumService.updatePost(postId, authorId, req.body);
        res.json({
            success: true,
            message: 'Post updated successfully',
            data: post
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updatePost = updatePost;
const deletePost = async (req, res, next) => {
    try {
        const postId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const isAdmin = req.user.role === 'admin';
        await forumService_1.ForumService.deletePost(postId, userId, isAdmin);
        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deletePost = deletePost;
const closePost = async (req, res, next) => {
    try {
        const postId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const post = await forumService_1.ForumService.closePost(postId, userId);
        res.json({
            success: true,
            message: 'Post closed successfully',
            data: post
        });
    }
    catch (error) {
        next(error);
    }
};
exports.closePost = closePost;
const toggleUpvote = async (req, res, next) => {
    try {
        const postId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const post = await forumService_1.ForumService.toggleUpvote(postId, userId);
        res.json({
            success: true,
            data: post
        });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleUpvote = toggleUpvote;
const toggleDownvote = async (req, res, next) => {
    try {
        const postId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const post = await forumService_1.ForumService.toggleDownvote(postId, userId);
        res.json({
            success: true,
            data: post
        });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleDownvote = toggleDownvote;
// Comment Controllers
const createComment = async (req, res, next) => {
    try {
        const postId = new mongoose_1.default.Types.ObjectId(req.params.postId);
        const authorId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const { content, parentId } = req.body;
        const comment = await forumService_1.ForumService.createComment(postId, authorId, content, parentId ? new mongoose_1.default.Types.ObjectId(parentId) : undefined);
        res.status(201).json({
            success: true,
            data: comment
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createComment = createComment;
const getComments = async (req, res, next) => {
    try {
        const postId = new mongoose_1.default.Types.ObjectId(req.params.postId);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        const result = await forumService_1.ForumService.getComments(postId, page, limit);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getComments = getComments;
const updateComment = async (req, res, next) => {
    try {
        const commentId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const authorId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const { content } = req.body;
        const comment = await forumService_1.ForumService.updateComment(commentId, authorId, content);
        res.json({
            success: true,
            message: 'Comment updated successfully',
            data: comment
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateComment = updateComment;
const deleteComment = async (req, res, next) => {
    try {
        const commentId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const isAdmin = req.user.role === 'admin';
        await forumService_1.ForumService.deleteComment(commentId, userId, isAdmin);
        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteComment = deleteComment;
const toggleCommentUpvote = async (req, res, next) => {
    try {
        const commentId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const comment = await forumService_1.ForumService.toggleCommentUpvote(commentId, userId);
        res.json({
            success: true,
            data: comment
        });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleCommentUpvote = toggleCommentUpvote;
const toggleCommentDownvote = async (req, res, next) => {
    try {
        const commentId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const comment = await forumService_1.ForumService.toggleCommentDownvote(commentId, userId);
        res.json({
            success: true,
            data: comment
        });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleCommentDownvote = toggleCommentDownvote;
const acceptAnswer = async (req, res, next) => {
    try {
        const postId = new mongoose_1.default.Types.ObjectId(req.params.postId);
        const commentId = new mongoose_1.default.Types.ObjectId(req.params.commentId);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const post = await forumService_1.ForumService.acceptAnswer(postId, commentId, userId);
        res.json({
            success: true,
            message: 'Answer accepted successfully',
            data: post
        });
    }
    catch (error) {
        next(error);
    }
};
exports.acceptAnswer = acceptAnswer;
const getTrendingTags = async (req, res, next) => {
    try {
        const limit = Number(req.query.limit) || 10;
        const tags = await forumService_1.ForumService.getTrendingTags(limit);
        res.json({
            success: true,
            data: tags
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTrendingTags = getTrendingTags;
const getUserActivity = async (req, res, next) => {
    try {
        const userId = new mongoose_1.default.Types.ObjectId(req.params.userId || req.user.userId);
        const activity = await forumService_1.ForumService.getUserActivity(userId);
        res.json({
            success: true,
            data: activity
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserActivity = getUserActivity;
const pinPost = async (req, res, next) => {
    try {
        const postId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const post = await forumService_1.ForumService.pinPost(postId);
        res.json({
            success: true,
            message: 'Post pin toggled successfully',
            data: post
        });
    }
    catch (error) {
        next(error);
    }
};
exports.pinPost = pinPost;
const featurePost = async (req, res, next) => {
    try {
        const postId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const post = await forumService_1.ForumService.featurePost(postId);
        res.json({
            success: true,
            message: 'Post feature toggled successfully',
            data: post
        });
    }
    catch (error) {
        next(error);
    }
};
exports.featurePost = featurePost;
//# sourceMappingURL=forumController.js.map
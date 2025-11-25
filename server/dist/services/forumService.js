"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForumService = void 0;
const Forum_1 = require("../models/Forum");
/**
 * Forum Service
 */
class ForumService {
    /**
     * Create a new forum post
     */
    static async createPost(authorId, postData) {
        const post = new Forum_1.ForumPost({
            ...postData,
            author: authorId,
            status: Forum_1.PostStatus.ACTIVE,
            views: 0,
            upvotes: [],
            downvotes: [],
            hasAcceptedAnswer: false
        });
        await post.save();
        return post.populate('author', 'name avatar');
    }
    /**
     * Get post by ID
     */
    static async getPostById(postId, incrementView = true) {
        const post = await Forum_1.ForumPost.findById(postId)
            .populate('author', 'name avatar email')
            .populate('acceptedAnswerId');
        if (post && incrementView) {
            await post.incrementViews();
        }
        return post;
    }
    /**
     * Get all posts with filters
     */
    static async getPosts(filters) {
        const { postType, status = Forum_1.PostStatus.ACTIVE, category, tags, targetScore, author, search, sortBy = 'recent', page = 1, limit = 20 } = filters;
        const query = { status };
        if (postType) {
            query.postType = postType;
        }
        if (category) {
            query.category = category;
        }
        if (tags && tags.length > 0) {
            query.tags = { $in: tags };
        }
        if (targetScore) {
            query.targetScore = {
                $gte: targetScore - 50,
                $lte: targetScore + 50
            };
        }
        if (author) {
            query.author = author;
        }
        if (search) {
            query.$text = { $search: search };
        }
        const skip = (page - 1) * limit;
        // Determine sort order
        let sort = { createdAt: -1 };
        switch (sortBy) {
            case 'popular':
                sort = { views: -1, createdAt: -1 };
                break;
            case 'trending':
                // Posts with most upvotes in last 7 days
                query.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
                sort = { 'upvotes.length': -1, views: -1 };
                break;
            case 'unanswered':
                query.postType = Forum_1.PostType.QUESTION;
                query.hasAcceptedAnswer = false;
                break;
            default:
                sort = { isPinned: -1, isFeatured: -1, createdAt: -1 };
        }
        const [posts, total] = await Promise.all([
            Forum_1.ForumPost.find(query)
                .populate('author', 'name avatar')
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Forum_1.ForumPost.countDocuments(query)
        ]);
        return {
            posts,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
    /**
     * Update post
     */
    static async updatePost(postId, authorId, updates) {
        const post = await Forum_1.ForumPost.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }
        if (post.author.toString() !== authorId.toString()) {
            throw new Error('Only the author can update this post');
        }
        if (updates.title)
            post.title = updates.title;
        if (updates.content)
            post.content = updates.content;
        if (updates.tags)
            post.tags = updates.tags;
        if (updates.category)
            post.category = updates.category;
        if (updates.targetScore)
            post.targetScore = updates.targetScore;
        post.editedAt = new Date();
        await post.save();
        return post;
    }
    /**
     * Delete post
     */
    static async deletePost(postId, userId, isAdmin = false) {
        const post = await Forum_1.ForumPost.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }
        if (!isAdmin && post.author.toString() !== userId.toString()) {
            throw new Error('Only the author or admin can delete this post');
        }
        post.status = Forum_1.PostStatus.DELETED;
        await post.save();
        // Also delete all comments
        await Forum_1.ForumComment.updateMany({ postId }, { deletedAt: new Date() });
    }
    /**
     * Close post (for questions)
     */
    static async closePost(postId, userId) {
        const post = await Forum_1.ForumPost.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }
        if (post.author.toString() !== userId.toString()) {
            throw new Error('Only the author can close this post');
        }
        post.status = Forum_1.PostStatus.CLOSED;
        post.closedAt = new Date();
        await post.save();
        return post;
    }
    /**
     * Toggle upvote on post
     */
    static async toggleUpvote(postId, userId) {
        const post = await Forum_1.ForumPost.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }
        post.toggleUpvote(userId);
        await post.save();
        return post;
    }
    /**
     * Toggle downvote on post
     */
    static async toggleDownvote(postId, userId) {
        const post = await Forum_1.ForumPost.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }
        post.toggleDownvote(userId);
        await post.save();
        return post;
    }
    /**
     * Create comment
     */
    static async createComment(postId, authorId, content, parentId) {
        const post = await Forum_1.ForumPost.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }
        if (post.status === Forum_1.PostStatus.CLOSED) {
            throw new Error('Cannot comment on closed post');
        }
        const comment = new Forum_1.ForumComment({
            postId,
            author: authorId,
            content,
            parentId,
            upvotes: [],
            downvotes: [],
            isAccepted: false
        });
        await comment.save();
        return comment.populate('author', 'name avatar');
    }
    /**
     * Get comments for post
     */
    static async getComments(postId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [comments, total] = await Promise.all([
            Forum_1.ForumComment.find({
                postId,
                deletedAt: { $exists: false }
            })
                .populate('author', 'name avatar')
                .populate('parentId')
                .sort({ isAccepted: -1, createdAt: 1 })
                .skip(skip)
                .limit(limit),
            Forum_1.ForumComment.countDocuments({
                postId,
                deletedAt: { $exists: false }
            })
        ]);
        return { comments, total };
    }
    /**
     * Update comment
     */
    static async updateComment(commentId, authorId, content) {
        const comment = await Forum_1.ForumComment.findById(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }
        if (comment.author.toString() !== authorId.toString()) {
            throw new Error('Only the author can update this comment');
        }
        comment.content = content;
        comment.editedAt = new Date();
        await comment.save();
        return comment;
    }
    /**
     * Delete comment
     */
    static async deleteComment(commentId, userId, isAdmin = false) {
        const comment = await Forum_1.ForumComment.findById(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }
        if (!isAdmin && comment.author.toString() !== userId.toString()) {
            throw new Error('Only the author or admin can delete this comment');
        }
        comment.deletedAt = new Date();
        await comment.save();
    }
    /**
     * Toggle upvote on comment
     */
    static async toggleCommentUpvote(commentId, userId) {
        const comment = await Forum_1.ForumComment.findById(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }
        comment.toggleUpvote(userId);
        await comment.save();
        return comment;
    }
    /**
     * Toggle downvote on comment
     */
    static async toggleCommentDownvote(commentId, userId) {
        const comment = await Forum_1.ForumComment.findById(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }
        comment.toggleDownvote(userId);
        await comment.save();
        return comment;
    }
    /**
     * Accept answer
     */
    static async acceptAnswer(postId, commentId, userId) {
        const post = await Forum_1.ForumPost.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }
        if (post.postType !== Forum_1.PostType.QUESTION) {
            throw new Error('Can only accept answers on questions');
        }
        if (post.author.toString() !== userId.toString()) {
            throw new Error('Only the question author can accept an answer');
        }
        const comment = await Forum_1.ForumComment.findById(commentId);
        if (!comment || comment.postId.toString() !== postId.toString()) {
            throw new Error('Comment not found or does not belong to this post');
        }
        // Unaccept previous answer if exists
        if (post.acceptedAnswerId) {
            const previousAnswer = await Forum_1.ForumComment.findById(post.acceptedAnswerId);
            if (previousAnswer) {
                previousAnswer.isAccepted = false;
                await previousAnswer.save();
            }
        }
        // Accept new answer
        post.acceptAnswer(commentId);
        comment.isAccepted = true;
        await Promise.all([post.save(), comment.save()]);
        return post;
    }
    /**
     * Get trending tags
     */
    static async getTrendingTags(limit = 10) {
        const result = await Forum_1.ForumPost.aggregate([
            {
                $match: {
                    status: Forum_1.PostStatus.ACTIVE,
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
                }
            },
            { $unwind: '$tags' },
            {
                $group: {
                    _id: '$tags',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    tag: '$_id',
                    count: 1
                }
            }
        ]);
        return result;
    }
    /**
     * Get user activity
     */
    static async getUserActivity(userId) {
        const [posts, comments, upvotedPosts] = await Promise.all([
            Forum_1.ForumPost.countDocuments({ author: userId, status: Forum_1.PostStatus.ACTIVE }),
            Forum_1.ForumComment.countDocuments({ author: userId, deletedAt: { $exists: false } }),
            Forum_1.ForumPost.countDocuments({ upvotes: userId })
        ]);
        return {
            totalPosts: posts,
            totalComments: comments,
            totalUpvotes: upvotedPosts
        };
    }
    /**
     * Pin post (admin only)
     */
    static async pinPost(postId) {
        const post = await Forum_1.ForumPost.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }
        post.isPinned = !post.isPinned;
        await post.save();
        return post;
    }
    /**
     * Feature post (admin only)
     */
    static async featurePost(postId) {
        const post = await Forum_1.ForumPost.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }
        post.isFeatured = !post.isFeatured;
        await post.save();
        return post;
    }
}
exports.ForumService = ForumService;
//# sourceMappingURL=forumService.js.map
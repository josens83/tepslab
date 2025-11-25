import { IForumPost, IForumComment, PostType, PostStatus } from '../models/Forum';
import mongoose from 'mongoose';
/**
 * Forum Service
 */
export declare class ForumService {
    /**
     * Create a new forum post
     */
    static createPost(authorId: mongoose.Types.ObjectId, postData: {
        title: string;
        content: string;
        postType: PostType;
        category: string;
        tags?: string[];
        targetScore?: number;
        attachments?: {
            type: string;
            url: string;
            filename: string;
        }[];
    }): Promise<IForumPost>;
    /**
     * Get post by ID
     */
    static getPostById(postId: mongoose.Types.ObjectId, incrementView?: boolean): Promise<IForumPost | null>;
    /**
     * Get all posts with filters
     */
    static getPosts(filters: {
        postType?: PostType;
        status?: PostStatus;
        category?: string;
        tags?: string[];
        targetScore?: number;
        author?: mongoose.Types.ObjectId;
        search?: string;
        sortBy?: 'recent' | 'popular' | 'trending' | 'unanswered';
        page?: number;
        limit?: number;
    }): Promise<{
        posts: IForumPost[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Update post
     */
    static updatePost(postId: mongoose.Types.ObjectId, authorId: mongoose.Types.ObjectId, updates: {
        title?: string;
        content?: string;
        tags?: string[];
        category?: string;
        targetScore?: number;
    }): Promise<IForumPost>;
    /**
     * Delete post
     */
    static deletePost(postId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, isAdmin?: boolean): Promise<void>;
    /**
     * Close post (for questions)
     */
    static closePost(postId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<IForumPost>;
    /**
     * Toggle upvote on post
     */
    static toggleUpvote(postId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<IForumPost>;
    /**
     * Toggle downvote on post
     */
    static toggleDownvote(postId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<IForumPost>;
    /**
     * Create comment
     */
    static createComment(postId: mongoose.Types.ObjectId, authorId: mongoose.Types.ObjectId, content: string, parentId?: mongoose.Types.ObjectId): Promise<IForumComment>;
    /**
     * Get comments for post
     */
    static getComments(postId: mongoose.Types.ObjectId, page?: number, limit?: number): Promise<{
        comments: IForumComment[];
        total: number;
    }>;
    /**
     * Update comment
     */
    static updateComment(commentId: mongoose.Types.ObjectId, authorId: mongoose.Types.ObjectId, content: string): Promise<IForumComment>;
    /**
     * Delete comment
     */
    static deleteComment(commentId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, isAdmin?: boolean): Promise<void>;
    /**
     * Toggle upvote on comment
     */
    static toggleCommentUpvote(commentId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<IForumComment>;
    /**
     * Toggle downvote on comment
     */
    static toggleCommentDownvote(commentId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<IForumComment>;
    /**
     * Accept answer
     */
    static acceptAnswer(postId: mongoose.Types.ObjectId, commentId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<IForumPost>;
    /**
     * Get trending tags
     */
    static getTrendingTags(limit?: number): Promise<{
        tag: string;
        count: number;
    }[]>;
    /**
     * Get user activity
     */
    static getUserActivity(userId: mongoose.Types.ObjectId): Promise<{
        totalPosts: number;
        totalComments: number;
        totalUpvotes: number;
    }>;
    /**
     * Pin post (admin only)
     */
    static pinPost(postId: mongoose.Types.ObjectId): Promise<IForumPost>;
    /**
     * Feature post (admin only)
     */
    static featurePost(postId: mongoose.Types.ObjectId): Promise<IForumPost>;
}
//# sourceMappingURL=forumService.d.ts.map
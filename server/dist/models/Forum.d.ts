import mongoose, { Document } from 'mongoose';
/**
 * Forum Post Types
 */
export declare enum PostType {
    QUESTION = "question",
    DISCUSSION = "discussion",
    ANNOUNCEMENT = "announcement",
    STUDY_TIP = "study_tip"
}
export declare enum PostStatus {
    ACTIVE = "active",
    CLOSED = "closed",
    DELETED = "deleted"
}
/**
 * Forum Post Interface
 */
export interface IForumPost extends Document {
    title: string;
    content: string;
    postType: PostType;
    status: PostStatus;
    author: mongoose.Types.ObjectId;
    tags: string[];
    category: string;
    targetScore?: number;
    views: number;
    upvotes: mongoose.Types.ObjectId[];
    downvotes: mongoose.Types.ObjectId[];
    hasAcceptedAnswer: boolean;
    acceptedAnswerId?: mongoose.Types.ObjectId;
    attachments: {
        type: string;
        url: string;
        filename: string;
    }[];
    isPinned: boolean;
    isFeatured: boolean;
    editedAt?: Date;
    closedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    incrementViews(): void;
    toggleUpvote(userId: mongoose.Types.ObjectId): void;
    toggleDownvote(userId: mongoose.Types.ObjectId): void;
    acceptAnswer(commentId: mongoose.Types.ObjectId): void;
}
/**
 * Forum Comment Interface
 */
export interface IForumComment extends Document {
    postId: mongoose.Types.ObjectId;
    content: string;
    author: mongoose.Types.ObjectId;
    parentId?: mongoose.Types.ObjectId;
    upvotes: mongoose.Types.ObjectId[];
    downvotes: mongoose.Types.ObjectId[];
    isAccepted: boolean;
    editedAt?: Date;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    toggleUpvote(userId: mongoose.Types.ObjectId): void;
    toggleDownvote(userId: mongoose.Types.ObjectId): void;
}
/**
 * Forum Models
 */
export declare const ForumPost: mongoose.Model<IForumPost, {}, {}, {}, mongoose.Document<unknown, {}, IForumPost, {}, {}> & IForumPost & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const ForumComment: mongoose.Model<IForumComment, {}, {}, {}, mongoose.Document<unknown, {}, IForumComment, {}, {}> & IForumComment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Forum.d.ts.map
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForumComment = exports.ForumPost = exports.PostStatus = exports.PostType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Forum Post Types
 */
var PostType;
(function (PostType) {
    PostType["QUESTION"] = "question";
    PostType["DISCUSSION"] = "discussion";
    PostType["ANNOUNCEMENT"] = "announcement";
    PostType["STUDY_TIP"] = "study_tip";
})(PostType || (exports.PostType = PostType = {}));
var PostStatus;
(function (PostStatus) {
    PostStatus["ACTIVE"] = "active";
    PostStatus["CLOSED"] = "closed";
    PostStatus["DELETED"] = "deleted";
})(PostStatus || (exports.PostStatus = PostStatus = {}));
/**
 * Forum Post Schema
 */
const forumPostSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 200
    },
    content: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 10000
    },
    postType: {
        type: String,
        enum: Object.values(PostType),
        default: PostType.DISCUSSION
    },
    status: {
        type: String,
        enum: Object.values(PostStatus),
        default: PostStatus.ACTIVE
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
            type: String,
            lowercase: true,
            trim: true,
            maxlength: 30
        }],
    category: {
        type: String,
        required: true,
        enum: ['grammar', 'vocabulary', 'listening', 'reading', 'general', 'study-tips', 'exam-prep']
    },
    targetScore: {
        type: Number,
        min: 200,
        max: 990
    },
    views: {
        type: Number,
        default: 0,
        min: 0
    },
    upvotes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    downvotes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    hasAcceptedAnswer: {
        type: Boolean,
        default: false
    },
    acceptedAnswerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ForumComment'
    },
    attachments: [{
            type: {
                type: String,
                enum: ['image', 'file']
            },
            url: String,
            filename: String
        }],
    isPinned: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    editedAt: Date,
    closedAt: Date
}, {
    timestamps: true
});
/**
 * Forum Comment Schema
 */
const forumCommentSchema = new mongoose_1.Schema({
    postId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ForumPost',
        required: true
    },
    content: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 5000
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ForumComment'
    },
    upvotes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    downvotes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    isAccepted: {
        type: Boolean,
        default: false
    },
    editedAt: Date,
    deletedAt: Date
}, {
    timestamps: true
});
// Indexes for ForumPost
forumPostSchema.index({ author: 1, createdAt: -1 });
forumPostSchema.index({ category: 1, createdAt: -1 });
forumPostSchema.index({ postType: 1, status: 1 });
forumPostSchema.index({ tags: 1 });
forumPostSchema.index({ targetScore: 1 });
forumPostSchema.index({ isPinned: -1, isFeatured: -1, createdAt: -1 });
forumPostSchema.index({ views: -1 });
// Text search index
forumPostSchema.index({ title: 'text', content: 'text', tags: 'text' });
// Indexes for ForumComment
forumCommentSchema.index({ postId: 1, createdAt: 1 });
forumCommentSchema.index({ author: 1, createdAt: -1 });
forumCommentSchema.index({ parentId: 1 });
forumCommentSchema.index({ isAccepted: 1 });
// Virtual: vote score
forumPostSchema.virtual('voteScore').get(function () {
    return this.upvotes.length - this.downvotes.length;
});
forumCommentSchema.virtual('voteScore').get(function () {
    return this.upvotes.length - this.downvotes.length;
});
// Method: Increment view count
forumPostSchema.methods.incrementViews = function () {
    this.views += 1;
    return this.save();
};
// Method: Toggle upvote
forumPostSchema.methods.toggleUpvote = function (userId) {
    const upvoteIndex = this.upvotes.findIndex((id) => id.toString() === userId.toString());
    if (upvoteIndex > -1) {
        // Remove upvote
        this.upvotes.splice(upvoteIndex, 1);
    }
    else {
        // Add upvote and remove downvote if exists
        const downvoteIndex = this.downvotes.findIndex((id) => id.toString() === userId.toString());
        if (downvoteIndex > -1) {
            this.downvotes.splice(downvoteIndex, 1);
        }
        this.upvotes.push(userId);
    }
};
// Method: Toggle downvote
forumPostSchema.methods.toggleDownvote = function (userId) {
    const downvoteIndex = this.downvotes.findIndex((id) => id.toString() === userId.toString());
    if (downvoteIndex > -1) {
        // Remove downvote
        this.downvotes.splice(downvoteIndex, 1);
    }
    else {
        // Add downvote and remove upvote if exists
        const upvoteIndex = this.upvotes.findIndex((id) => id.toString() === userId.toString());
        if (upvoteIndex > -1) {
            this.upvotes.splice(upvoteIndex, 1);
        }
        this.downvotes.push(userId);
    }
};
// Method: Accept answer
forumPostSchema.methods.acceptAnswer = function (commentId) {
    this.hasAcceptedAnswer = true;
    this.acceptedAnswerId = commentId;
};
// Apply same vote methods to comments
forumCommentSchema.methods.toggleUpvote = forumPostSchema.methods.toggleUpvote;
forumCommentSchema.methods.toggleDownvote = forumPostSchema.methods.toggleDownvote;
/**
 * Forum Models
 */
exports.ForumPost = mongoose_1.default.model('ForumPost', forumPostSchema);
exports.ForumComment = mongoose_1.default.model('ForumComment', forumCommentSchema);
//# sourceMappingURL=Forum.js.map
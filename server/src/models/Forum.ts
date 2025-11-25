import mongoose, { Schema, Document } from 'mongoose';

/**
 * Forum Post Types
 */
export enum PostType {
  QUESTION = 'question',
  DISCUSSION = 'discussion',
  ANNOUNCEMENT = 'announcement',
  STUDY_TIP = 'study_tip'
}

export enum PostStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  DELETED = 'deleted'
}

/**
 * Forum Post Interface
 */
export interface IForumPost extends Document {
  title: string;
  content: string;
  postType: PostType;
  status: PostStatus;

  // Author
  author: mongoose.Types.ObjectId;

  // Categorization
  tags: string[];
  category: string; // Grammar, Vocabulary, Listening, Reading, General
  targetScore?: number;

  // Engagement
  views: number;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];

  // Question-specific
  hasAcceptedAnswer: boolean;
  acceptedAnswerId?: mongoose.Types.ObjectId;

  // Attachments
  attachments: {
    type: string; // 'image', 'file'
    url: string;
    filename: string;
  }[];

  // Metadata
  isPinned: boolean;
  isFeatured: boolean;
  editedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Forum Comment Interface
 */
export interface IForumComment extends Document {
  postId: mongoose.Types.ObjectId;
  content: string;

  // Author
  author: mongoose.Types.ObjectId;

  // Parent comment (for nested replies)
  parentId?: mongoose.Types.ObjectId;

  // Engagement
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];

  // Question answer
  isAccepted: boolean;

  // Metadata
  editedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Forum Post Schema
 */
const forumPostSchema = new Schema<IForumPost>(
  {
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
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    downvotes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    hasAcceptedAnswer: {
      type: Boolean,
      default: false
    },
    acceptedAnswerId: {
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true
  }
);

/**
 * Forum Comment Schema
 */
const forumCommentSchema = new Schema<IForumComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'ForumComment'
    },
    upvotes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    downvotes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    isAccepted: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    deletedAt: Date
  },
  {
    timestamps: true
  }
);

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
forumPostSchema.virtual('voteScore').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

forumCommentSchema.virtual('voteScore').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Method: Increment view count
forumPostSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method: Toggle upvote
forumPostSchema.methods.toggleUpvote = function(userId: mongoose.Types.ObjectId) {
  const upvoteIndex = this.upvotes.findIndex(
    (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()
  );

  if (upvoteIndex > -1) {
    // Remove upvote
    this.upvotes.splice(upvoteIndex, 1);
  } else {
    // Add upvote and remove downvote if exists
    const downvoteIndex = this.downvotes.findIndex(
      (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()
    );
    if (downvoteIndex > -1) {
      this.downvotes.splice(downvoteIndex, 1);
    }
    this.upvotes.push(userId);
  }
};

// Method: Toggle downvote
forumPostSchema.methods.toggleDownvote = function(userId: mongoose.Types.ObjectId) {
  const downvoteIndex = this.downvotes.findIndex(
    (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()
  );

  if (downvoteIndex > -1) {
    // Remove downvote
    this.downvotes.splice(downvoteIndex, 1);
  } else {
    // Add downvote and remove upvote if exists
    const upvoteIndex = this.upvotes.findIndex(
      (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()
    );
    if (upvoteIndex > -1) {
      this.upvotes.splice(upvoteIndex, 1);
    }
    this.downvotes.push(userId);
  }
};

// Method: Accept answer
forumPostSchema.methods.acceptAnswer = function(commentId: mongoose.Types.ObjectId) {
  this.hasAcceptedAnswer = true;
  this.acceptedAnswerId = commentId;
};

// Apply same vote methods to comments
forumCommentSchema.methods.toggleUpvote = forumPostSchema.methods.toggleUpvote;
forumCommentSchema.methods.toggleDownvote = forumPostSchema.methods.toggleDownvote;

/**
 * Forum Models
 */
export const ForumPost = mongoose.model<IForumPost>('ForumPost', forumPostSchema);
export const ForumComment = mongoose.model<IForumComment>('ForumComment', forumCommentSchema);

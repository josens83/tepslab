import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewDocument extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  rating: number; // 1-5
  title: string;
  comment: string;
  beforeScore?: number; // TEPS score before
  afterScore?: number; // TEPS score after
  studyDuration?: number; // study period in days
  isVerified: boolean; // admin verification
  isPublished: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    comment: {
      type: String,
      required: true,
    },
    beforeScore: {
      type: Number,
      min: 0,
      max: 990,
    },
    afterScore: {
      type: Number,
      min: 0,
      max: 990,
    },
    studyDuration: {
      type: Number,
      min: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ courseId: 1, isPublished: 1 });
reviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });
reviewSchema.index({ rating: 1 });

export const Review = mongoose.model<IReviewDocument>('Review', reviewSchema);

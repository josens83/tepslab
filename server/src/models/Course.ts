import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson {
  title: string;
  description: string;
  videoUrl?: string;
  duration: number; // in minutes
  order: number;
  isFree: boolean;
  materials?: string[]; // URLs to downloadable materials
}

export interface ICourseDocument extends Document {
  title: string;
  description: string;
  instructor: string;
  thumbnailUrl?: string;
  targetScore: number; // 327, 387, 450, 550, 600
  level: 'beginner' | 'intermediate' | 'advanced';
  category: 'grammar' | 'vocabulary' | 'listening' | 'reading' | 'comprehensive';
  price: number;
  discountPrice?: number;
  duration: number; // total course duration in hours
  lessonsCount: number;
  lessons: ILesson[];
  features: string[]; // key features/benefits
  curriculum: string[]; // curriculum overview
  requirements: string[]; // prerequisites
  isPublished: boolean;
  isFeatured: boolean;
  enrolledCount: number;
  rating: number;
  reviewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
  },
  duration: {
    type: Number,
    required: true,
    min: 0,
  },
  order: {
    type: Number,
    required: true,
  },
  isFree: {
    type: Boolean,
    default: false,
  },
  materials: [String],
});

const courseSchema = new Schema<ICourseDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    instructor: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    targetScore: {
      type: Number,
      required: true,
      enum: [327, 387, 450, 550, 600],
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    category: {
      type: String,
      enum: ['grammar', 'vocabulary', 'listening', 'reading', 'comprehensive'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    lessonsCount: {
      type: Number,
      default: 0,
    },
    lessons: [lessonSchema],
    features: [String],
    curriculum: [String],
    requirements: [String],
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
courseSchema.index({ targetScore: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ isFeatured: 1 });
courseSchema.index({ price: 1 });
courseSchema.index({ title: 'text', description: 'text' }); // Text search

// Update lessonsCount before saving
courseSchema.pre('save', function (next) {
  this.lessonsCount = this.lessons.length;
  next();
});

export const Course = mongoose.model<ICourseDocument>('Course', courseSchema);

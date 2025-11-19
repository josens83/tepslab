import mongoose, { Schema, Document } from 'mongoose';

export interface IProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: Date;
  lastWatchedAt: Date;
  watchDuration: number; // in seconds
}

export interface IEnrollmentDocument extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  enrolledAt: Date;
  expiresAt?: Date; // for time-limited courses
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  progress: IProgress[];
  completionPercentage: number;
  lastAccessedAt: Date;
  paymentId?: string; // reference to payment transaction
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>({
  lessonId: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  lastWatchedAt: {
    type: Date,
    default: Date.now,
  },
  watchDuration: {
    type: Number,
    default: 0,
  },
});

const enrollmentSchema = new Schema<IEnrollmentDocument>(
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
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'expired', 'cancelled'],
      default: 'active',
    },
    progress: [progressSchema],
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    paymentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ userId: 1, status: 1 });
enrollmentSchema.index({ courseId: 1 });
enrollmentSchema.index({ expiresAt: 1 });

// Calculate completion percentage before saving
enrollmentSchema.pre('save', function (next) {
  if (this.progress.length > 0) {
    const completedLessons = this.progress.filter((p) => p.completed).length;
    this.completionPercentage = Math.round(
      (completedLessons / this.progress.length) * 100
    );

    // Auto-update status to completed if all lessons are done
    if (this.completionPercentage === 100) {
      this.status = 'completed';
    }
  }
  next();
});

export const Enrollment = mongoose.model<IEnrollmentDocument>(
  'Enrollment',
  enrollmentSchema
);

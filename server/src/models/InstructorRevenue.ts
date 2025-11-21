import mongoose, { Schema, Document } from 'mongoose';

export interface IInstructorRevenueDocument extends Document {
  instructorId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  enrollmentId: mongoose.Types.ObjectId;
  paymentId: mongoose.Types.ObjectId;
  totalAmount: number; // Original payment amount
  platformFee: number; // Platform's share
  instructorShare: number; // Instructor's share
  sharePercentage: number; // Instructor's share percentage (e.g., 70 for 70%)
  currency: string;
  status: 'pending' | 'approved' | 'paid' | 'refunded';
  paidAt?: Date;
  payoutMethod?: string;
  payoutDetails?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const instructorRevenueSchema = new Schema<IInstructorRevenueDocument>(
  {
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    instructorShare: {
      type: Number,
      required: true,
    },
    sharePercentage: {
      type: Number,
      required: true,
      default: 70, // Default 70% to instructor, 30% to platform
    },
    currency: {
      type: String,
      default: 'KRW',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid', 'refunded'],
      default: 'pending',
      index: true,
    },
    paidAt: {
      type: Date,
    },
    payoutMethod: {
      type: String,
    },
    payoutDetails: {
      type: Schema.Types.Mixed,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
instructorRevenueSchema.index({ instructorId: 1, status: 1 });
instructorRevenueSchema.index({ status: 1, createdAt: -1 });
instructorRevenueSchema.index({ instructorId: 1, createdAt: -1 });

export const InstructorRevenue = mongoose.model<IInstructorRevenueDocument>(
  'InstructorRevenue',
  instructorRevenueSchema
);

// Instructor payout request
export interface IPayoutRequestDocument extends Document {
  instructorId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  payoutMethod: 'bank_transfer' | 'paypal' | 'stripe';
  payoutDetails: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    paypalEmail?: string;
    stripeAccountId?: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  revenueIds: mongoose.Types.ObjectId[]; // Related revenue records
  processedBy?: mongoose.Types.ObjectId; // Admin who processed
  processedAt?: Date;
  rejectionReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const payoutRequestSchema = new Schema<IPayoutRequestDocument>(
  {
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'KRW',
    },
    payoutMethod: {
      type: String,
      enum: ['bank_transfer', 'paypal', 'stripe'],
      required: true,
    },
    payoutDetails: {
      bankName: String,
      accountNumber: String,
      accountHolder: String,
      paypalEmail: String,
      stripeAccountId: String,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'rejected'],
      default: 'pending',
      index: true,
    },
    revenueIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'InstructorRevenue',
      },
    ],
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
payoutRequestSchema.index({ instructorId: 1, status: 1 });
payoutRequestSchema.index({ status: 1, createdAt: -1 });

export const PayoutRequest = mongoose.model<IPayoutRequestDocument>(
  'PayoutRequest',
  payoutRequestSchema
);

// Revenue sharing configuration
export const RevenueShareConfig = {
  default: {
    instructorShare: 70, // 70%
    platformShare: 30, // 30%
  },
  premium: {
    instructorShare: 80, // 80% for premium instructors
    platformShare: 20, // 20%
  },
  enterprise: {
    instructorShare: 85, // 85% for enterprise instructors
    platformShare: 15, // 15%
  },
  minimumPayout: 50000, // Minimum 50,000 KRW for payout
  payoutSchedule: 'monthly', // monthly, biweekly, weekly
  holdingPeriod: 14, // Days to hold revenue before available for payout
};

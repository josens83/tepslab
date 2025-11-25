import mongoose, { Schema, Document } from 'mongoose';

export type DiscountType = 'percentage' | 'fixed_amount';
export type CouponStatus = 'active' | 'inactive' | 'expired';

export interface ICouponDocument extends Document {
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number; // Percentage (0-100) or fixed amount
  minPurchaseAmount?: number;
  maxDiscountAmount?: number; // Max discount for percentage types
  usageLimit?: number; // Total usage limit
  usageCount: number; // Current usage count
  perUserLimit?: number; // Limit per user
  validFrom: Date;
  validUntil: Date;
  status: CouponStatus;
  applicableTiers?: string[]; // Which subscription tiers this applies to
  applicableCourses?: mongoose.Types.ObjectId[]; // Specific courses (empty = all)
  createdBy: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  isValid(): boolean;
  calculateDiscount(amount: number): number;
}

const couponSchema = new Schema<ICouponDocument>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed_amount'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
    },
    usageLimit: {
      type: Number,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
    },
    validFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
      index: true,
    },
    applicableTiers: {
      type: [String],
      default: [],
    },
    applicableCourses: {
      type: [Schema.Types.ObjectId],
      ref: 'Course',
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
couponSchema.index({ code: 1, status: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });
couponSchema.index({ status: 1, validUntil: 1 });

// Method to check if coupon is valid
couponSchema.methods.isValid = function(): boolean {
  const now = new Date();

  return (
    this.status === 'active' &&
    now >= this.validFrom &&
    now <= this.validUntil &&
    (!this.usageLimit || this.usageCount < this.usageLimit)
  );
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(
  originalAmount: number
): number {
  if (!this.isValid()) {
    return 0;
  }

  if (this.minPurchaseAmount && originalAmount < this.minPurchaseAmount) {
    return 0;
  }

  let discount = 0;

  if (this.discountType === 'percentage') {
    discount = (originalAmount * this.discountValue) / 100;

    // Apply maximum discount limit if set
    if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
      discount = this.maxDiscountAmount;
    }
  } else {
    // Fixed amount
    discount = Math.min(this.discountValue, originalAmount);
  }

  return Math.round(discount);
};

export const Coupon = mongoose.model<ICouponDocument>('Coupon', couponSchema);

// Coupon usage tracking
export interface ICouponUsageDocument extends Document {
  couponId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  usedAt: Date;
}

const couponUsageSchema = new Schema<ICouponUsageDocument>(
  {
    couponId: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    originalAmount: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      required: true,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index for checking per-user usage
couponUsageSchema.index({ couponId: 1, userId: 1 });

export const CouponUsage = mongoose.model<ICouponUsageDocument>(
  'CouponUsage',
  couponUsageSchema
);

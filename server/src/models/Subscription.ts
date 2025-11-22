import mongoose, { Schema, Document } from 'mongoose';

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing';

export interface ISubscriptionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  cancelAtPeriodEnd: boolean;
  trialEndDate?: Date;
  paymentMethod?: string;
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  features: {
    maxCourses: number;
    maxAIRequests: number;
    maxUploads: number;
    prioritySupport: boolean;
    offlineAccess: boolean;
    certificatesEnabled: boolean;
    customBranding: boolean;
    apiAccess: boolean;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tier: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'past_due', 'trialing'],
      default: 'active',
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    trialEndDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: 'KRW',
    },
    features: {
      maxCourses: {
        type: Number,
        default: 3, // Free tier default
      },
      maxAIRequests: {
        type: Number,
        default: 10, // Free tier default
      },
      maxUploads: {
        type: Number,
        default: 20, // Free tier default
      },
      prioritySupport: {
        type: Boolean,
        default: false,
      },
      offlineAccess: {
        type: Boolean,
        default: false,
      },
      certificatesEnabled: {
        type: Boolean,
        default: false,
      },
      customBranding: {
        type: Boolean,
        default: false,
      },
      apiAccess: {
        type: Boolean,
        default: false,
      },
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
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ tier: 1, status: 1 });

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function(): boolean {
  return (
    this.status === 'active' &&
    new Date() < this.endDate &&
    !this.cancelAtPeriodEnd
  );
};

// Method to check if in trial period
subscriptionSchema.methods.isTrial = function(): boolean {
  return (
    this.status === 'trialing' &&
    this.trialEndDate !== undefined &&
    new Date() < this.trialEndDate
  );
};

export const Subscription = mongoose.model<ISubscriptionDocument>(
  'Subscription',
  subscriptionSchema
);

// Subscription tier configurations
export const SubscriptionTiers = {
  free: {
    name: 'Free',
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: {
      maxCourses: 3,
      maxAIRequests: 10,
      maxUploads: 20,
      prioritySupport: false,
      offlineAccess: false,
      certificatesEnabled: false,
      customBranding: false,
      apiAccess: false,
    },
    description: 'Perfect for getting started',
  },
  basic: {
    name: 'Basic',
    price: {
      monthly: 9900, // KRW
      yearly: 99000, // KRW (2 months free)
    },
    features: {
      maxCourses: 20,
      maxAIRequests: 100,
      maxUploads: 200,
      prioritySupport: false,
      offlineAccess: true,
      certificatesEnabled: true,
      customBranding: false,
      apiAccess: false,
    },
    description: 'For serious learners',
  },
  premium: {
    name: 'Premium',
    price: {
      monthly: 29900, // KRW
      yearly: 299000, // KRW (2 months free)
    },
    features: {
      maxCourses: -1, // unlimited
      maxAIRequests: 500,
      maxUploads: 1000,
      prioritySupport: true,
      offlineAccess: true,
      certificatesEnabled: true,
      customBranding: false,
      apiAccess: true,
    },
    description: 'For power users',
  },
  enterprise: {
    name: 'Enterprise',
    price: {
      monthly: 99900, // KRW
      yearly: 999000, // KRW (2 months free)
    },
    features: {
      maxCourses: -1, // unlimited
      maxAIRequests: -1, // unlimited
      maxUploads: -1, // unlimited
      prioritySupport: true,
      offlineAccess: true,
      certificatesEnabled: true,
      customBranding: true,
      apiAccess: true,
    },
    description: 'For teams and organizations',
  },
};

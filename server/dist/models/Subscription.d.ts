import mongoose, { Document } from 'mongoose';
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
export declare const Subscription: mongoose.Model<ISubscriptionDocument, {}, {}, {}, mongoose.Document<unknown, {}, ISubscriptionDocument, {}, {}> & ISubscriptionDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const SubscriptionTiers: {
    free: {
        name: string;
        price: {
            monthly: number;
            yearly: number;
        };
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
        description: string;
    };
    basic: {
        name: string;
        price: {
            monthly: number;
            yearly: number;
        };
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
        description: string;
    };
    premium: {
        name: string;
        price: {
            monthly: number;
            yearly: number;
        };
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
        description: string;
    };
    enterprise: {
        name: string;
        price: {
            monthly: number;
            yearly: number;
        };
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
        description: string;
    };
};
//# sourceMappingURL=Subscription.d.ts.map
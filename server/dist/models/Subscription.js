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
exports.SubscriptionTiers = exports.Subscription = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const subscriptionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});
// Indexes for efficient queries
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ tier: 1, status: 1 });
// Method to check if subscription is active
subscriptionSchema.methods.isActive = function () {
    return (this.status === 'active' &&
        new Date() < this.endDate &&
        !this.cancelAtPeriodEnd);
};
// Method to check if in trial period
subscriptionSchema.methods.isTrial = function () {
    return (this.status === 'trialing' &&
        this.trialEndDate !== undefined &&
        new Date() < this.trialEndDate);
};
exports.Subscription = mongoose_1.default.model('Subscription', subscriptionSchema);
// Subscription tier configurations
exports.SubscriptionTiers = {
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
//# sourceMappingURL=Subscription.js.map
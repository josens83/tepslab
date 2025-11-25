"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../../models/User");
const Subscription_1 = require("../../models/Subscription");
const subscriptionService_1 = require("../../services/subscriptionService");
(0, globals_1.describe)('Subscription Integration Tests', () => {
    let userId;
    (0, globals_1.beforeAll)(async () => {
        await mongoose_1.default.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/tepslab-test');
    });
    (0, globals_1.afterAll)(async () => {
        await User_1.User.deleteMany({});
        await Subscription_1.Subscription.deleteMany({});
        await mongoose_1.default.connection.close();
    });
    (0, globals_1.beforeEach)(async () => {
        await User_1.User.deleteMany({});
        await Subscription_1.Subscription.deleteMany({});
        // Create test user
        const user = await User_1.User.create({
            email: 'subscription-test@example.com',
            password: 'Test123!@#',
            name: 'Test User',
            provider: 'local',
        });
        userId = user._id.toString();
    });
    (0, globals_1.describe)('Create Subscription', () => {
        (0, globals_1.test)('should create free subscription', async () => {
            const subscription = await subscriptionService_1.SubscriptionService.createSubscription(userId, 'free', 'monthly');
            (0, globals_1.expect)(subscription.userId.toString()).toBe(userId);
            (0, globals_1.expect)(subscription.tier).toBe('free');
            (0, globals_1.expect)(subscription.amount).toBe(0);
            (0, globals_1.expect)(subscription.status).toBe('active');
            (0, globals_1.expect)(subscription.features.maxCourses).toBe(3);
        });
        (0, globals_1.test)('should create premium subscription with monthly billing', async () => {
            const subscription = await subscriptionService_1.SubscriptionService.createSubscription(userId, 'premium', 'monthly');
            (0, globals_1.expect)(subscription.tier).toBe('premium');
            (0, globals_1.expect)(subscription.billingCycle).toBe('monthly');
            (0, globals_1.expect)(subscription.amount).toBe(Subscription_1.SubscriptionTiers.premium.price.monthly);
            (0, globals_1.expect)(subscription.features.maxCourses).toBe(-1); // unlimited
            (0, globals_1.expect)(subscription.features.prioritySupport).toBe(true);
        });
        (0, globals_1.test)('should create subscription with trial period', async () => {
            const subscription = await subscriptionService_1.SubscriptionService.createSubscription(userId, 'basic', 'monthly', 14 // 14 days trial
            );
            (0, globals_1.expect)(subscription.status).toBe('trialing');
            (0, globals_1.expect)(subscription.trialEndDate).toBeDefined();
            const trialDays = Math.ceil((subscription.trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            (0, globals_1.expect)(trialDays).toBeGreaterThanOrEqual(13);
            (0, globals_1.expect)(trialDays).toBeLessThanOrEqual(14);
        });
        (0, globals_1.test)('should cancel existing subscription when creating new one', async () => {
            // Create first subscription
            const firstSub = await subscriptionService_1.SubscriptionService.createSubscription(userId, 'basic', 'monthly');
            (0, globals_1.expect)(firstSub.status).toBe('active');
            // Create second subscription
            const secondSub = await subscriptionService_1.SubscriptionService.createSubscription(userId, 'premium', 'monthly');
            (0, globals_1.expect)(secondSub.status).toBe('active');
            // Check that first subscription is cancelled
            const updatedFirstSub = await Subscription_1.Subscription.findById(firstSub._id);
            (0, globals_1.expect)(updatedFirstSub?.status).toBe('cancelled');
            (0, globals_1.expect)(updatedFirstSub?.cancelAtPeriodEnd).toBe(true);
        });
    });
    (0, globals_1.describe)('Get Active Subscription', () => {
        (0, globals_1.test)('should get active subscription', async () => {
            await subscriptionService_1.SubscriptionService.createSubscription(userId, 'premium', 'monthly');
            const activeSubscription = await subscriptionService_1.SubscriptionService.getActiveSubscription(userId);
            (0, globals_1.expect)(activeSubscription).toBeDefined();
            (0, globals_1.expect)(activeSubscription?.tier).toBe('premium');
            (0, globals_1.expect)(activeSubscription?.status).toBe('active');
        });
        (0, globals_1.test)('should return null when no active subscription', async () => {
            const activeSubscription = await subscriptionService_1.SubscriptionService.getActiveSubscription(userId);
            (0, globals_1.expect)(activeSubscription).toBeNull();
        });
        (0, globals_1.test)('should not return cancelled subscription', async () => {
            const subscription = await subscriptionService_1.SubscriptionService.createSubscription(userId, 'premium', 'monthly');
            subscription.status = 'cancelled';
            await subscription.save();
            const activeSubscription = await subscriptionService_1.SubscriptionService.getActiveSubscription(userId);
            (0, globals_1.expect)(activeSubscription).toBeNull();
        });
    });
    (0, globals_1.describe)('Upgrade Subscription', () => {
        (0, globals_1.test)('should upgrade from basic to premium', async () => {
            // Create basic subscription
            await subscriptionService_1.SubscriptionService.createSubscription(userId, 'basic', 'monthly');
            // Upgrade to premium
            const result = await subscriptionService_1.SubscriptionService.upgradeSubscription(userId, 'premium');
            (0, globals_1.expect)(result.newSubscription.tier).toBe('premium');
            (0, globals_1.expect)(result.oldSubscription.status).toBe('cancelled');
            (0, globals_1.expect)(result.proratedCredit).toBeGreaterThan(0);
        });
        (0, globals_1.test)('should fail upgrade when no active subscription', async () => {
            await (0, globals_1.expect)(subscriptionService_1.SubscriptionService.upgradeSubscription(userId, 'premium')).rejects.toThrow('No active subscription found');
        });
    });
    (0, globals_1.describe)('Downgrade Subscription', () => {
        (0, globals_1.test)('should schedule downgrade at end of period', async () => {
            // Create premium subscription
            const currentSub = await subscriptionService_1.SubscriptionService.createSubscription(userId, 'premium', 'monthly');
            // Downgrade to basic
            const result = await subscriptionService_1.SubscriptionService.downgradeSubscription(userId, 'basic');
            (0, globals_1.expect)(result.currentSubscription.cancelAtPeriodEnd).toBe(true);
            (0, globals_1.expect)(result.pendingSubscription.tier).toBe('basic');
            (0, globals_1.expect)(result.pendingSubscription.startDate.getTime()).toBe(currentSub.endDate.getTime());
        });
    });
    (0, globals_1.describe)('Cancel Subscription', () => {
        (0, globals_1.test)('should cancel subscription at period end', async () => {
            await subscriptionService_1.SubscriptionService.createSubscription(userId, 'premium', 'monthly');
            const cancelled = await subscriptionService_1.SubscriptionService.cancelSubscription(userId, false);
            (0, globals_1.expect)(cancelled.cancelAtPeriodEnd).toBe(true);
            (0, globals_1.expect)(cancelled.status).toBe('active'); // Still active until period end
        });
        (0, globals_1.test)('should cancel subscription immediately', async () => {
            await subscriptionService_1.SubscriptionService.createSubscription(userId, 'premium', 'monthly');
            const cancelled = await subscriptionService_1.SubscriptionService.cancelSubscription(userId, true);
            (0, globals_1.expect)(cancelled.status).toBe('cancelled');
            (0, globals_1.expect)(cancelled.endDate.getTime()).toBeLessThanOrEqual(new Date().getTime());
        });
    });
    (0, globals_1.describe)('Renew Subscription', () => {
        (0, globals_1.test)('should renew subscription', async () => {
            const subscription = await subscriptionService_1.SubscriptionService.createSubscription(userId, 'premium', 'monthly');
            const originalEndDate = subscription.endDate;
            await subscriptionService_1.SubscriptionService.renewSubscription(subscription._id.toString());
            const renewed = await Subscription_1.Subscription.findById(subscription._id);
            (0, globals_1.expect)(renewed?.endDate.getTime()).toBeGreaterThan(originalEndDate.getTime());
            (0, globals_1.expect)(renewed?.status).toBe('active');
            (0, globals_1.expect)(renewed?.cancelAtPeriodEnd).toBe(false);
        });
    });
    (0, globals_1.describe)('Feature Access', () => {
        (0, globals_1.test)('should check feature access for premium user', async () => {
            await subscriptionService_1.SubscriptionService.createSubscription(userId, 'premium', 'monthly');
            const hasPrioritySupport = await subscriptionService_1.SubscriptionService.hasFeatureAccess(userId, 'prioritySupport');
            (0, globals_1.expect)(hasPrioritySupport).toBe(true);
        });
        (0, globals_1.test)('should check feature access for free user', async () => {
            await subscriptionService_1.SubscriptionService.createSubscription(userId, 'free', 'monthly');
            const hasPrioritySupport = await subscriptionService_1.SubscriptionService.hasFeatureAccess(userId, 'prioritySupport');
            (0, globals_1.expect)(hasPrioritySupport).toBe(false);
        });
        (0, globals_1.test)('should return free tier features when no subscription', async () => {
            const hasOfflineAccess = await subscriptionService_1.SubscriptionService.hasFeatureAccess(userId, 'offlineAccess');
            (0, globals_1.expect)(hasOfflineAccess).toBe(false);
        });
    });
    (0, globals_1.describe)('Usage Limits', () => {
        (0, globals_1.test)('should get correct usage limits for premium tier', async () => {
            await subscriptionService_1.SubscriptionService.createSubscription(userId, 'premium', 'monthly');
            const limits = await subscriptionService_1.SubscriptionService.getUsageLimits(userId);
            (0, globals_1.expect)(limits.maxCourses).toBe(-1); // unlimited
            (0, globals_1.expect)(limits.maxAIRequests).toBe(500);
            (0, globals_1.expect)(limits.apiAccess).toBe(true);
        });
        (0, globals_1.test)('should get free tier limits when no subscription', async () => {
            const limits = await subscriptionService_1.SubscriptionService.getUsageLimits(userId);
            (0, globals_1.expect)(limits.maxCourses).toBe(3);
            (0, globals_1.expect)(limits.maxAIRequests).toBe(10);
            (0, globals_1.expect)(limits.apiAccess).toBe(false);
        });
    });
    (0, globals_1.describe)('Expired Subscriptions', () => {
        (0, globals_1.test)('should mark expired subscriptions', async () => {
            const subscription = await subscriptionService_1.SubscriptionService.createSubscription(userId, 'premium', 'monthly');
            // Set end date to past
            subscription.endDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
            await subscription.save();
            await subscriptionService_1.SubscriptionService.checkExpiredSubscriptions();
            const updated = await Subscription_1.Subscription.findById(subscription._id);
            (0, globals_1.expect)(updated?.status).toBe('expired');
        });
    });
    (0, globals_1.describe)('Subscription Statistics', () => {
        (0, globals_1.test)('should get subscription statistics', async () => {
            // Create multiple subscriptions
            const user1 = await User_1.User.create({
                email: 'user1@example.com',
                password: 'Test123!@#',
                name: 'User 1',
                provider: 'local',
            });
            const user2 = await User_1.User.create({
                email: 'user2@example.com',
                password: 'Test123!@#',
                name: 'User 2',
                provider: 'local',
            });
            await subscriptionService_1.SubscriptionService.createSubscription(user1._id.toString(), 'basic', 'monthly');
            await subscriptionService_1.SubscriptionService.createSubscription(user2._id.toString(), 'premium', 'monthly');
            const stats = await subscriptionService_1.SubscriptionService.getSubscriptionStats();
            (0, globals_1.expect)(stats).toBeDefined();
            (0, globals_1.expect)(Array.isArray(stats)).toBe(true);
            (0, globals_1.expect)(stats.length).toBeGreaterThan(0);
        });
    });
});
//# sourceMappingURL=subscription.test.js.map
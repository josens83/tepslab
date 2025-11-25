import { SubscriptionTier, SubscriptionTiers } from '../models/Subscription';
export declare class SubscriptionService {
    /**
     * Create a new subscription for a user
     */
    static createSubscription(userId: string, tier: SubscriptionTier, billingCycle?: 'monthly' | 'yearly', trialDays?: number): Promise<any>;
    /**
     * Get active subscription for a user
     */
    static getActiveSubscription(userId: string): Promise<any | null>;
    /**
     * Upgrade subscription
     */
    static upgradeSubscription(userId: string, newTier: SubscriptionTier): Promise<any>;
    /**
     * Downgrade subscription
     */
    static downgradeSubscription(userId: string, newTier: SubscriptionTier): Promise<any>;
    /**
     * Cancel subscription
     */
    static cancelSubscription(userId: string, immediate?: boolean): Promise<any>;
    /**
     * Renew subscription
     */
    static renewSubscription(subscriptionId: string): Promise<any>;
    /**
     * Check if user has access to feature
     */
    static hasFeatureAccess(userId: string, feature: keyof typeof SubscriptionTiers.free.features): Promise<boolean>;
    /**
     * Get subscription usage limits
     */
    static getUsageLimits(userId: string): Promise<any>;
    /**
     * Check and update expired subscriptions
     */
    static checkExpiredSubscriptions(): Promise<void>;
    /**
     * Get subscription statistics
     */
    static getSubscriptionStats(): Promise<any>;
    /**
     * Cancel all existing active subscriptions for a user
     */
    private static cancelExistingSubscriptions;
}
//# sourceMappingURL=subscriptionService.d.ts.map
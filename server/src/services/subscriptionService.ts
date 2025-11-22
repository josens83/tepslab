import { Subscription, SubscriptionTier, SubscriptionTiers } from '../models/Subscription';
import { User } from '../models/User';
import mongoose from 'mongoose';

export class SubscriptionService {
  /**
   * Create a new subscription for a user
   */
  static async createSubscription(
    userId: string,
    tier: SubscriptionTier,
    billingCycle: 'monthly' | 'yearly' = 'monthly',
    trialDays?: number
  ): Promise<any> {
    try {
      // Cancel any existing active subscriptions
      await this.cancelExistingSubscriptions(userId);

      const tierConfig = SubscriptionTiers[tier];
      const amount = tierConfig.price[billingCycle];

      const startDate = new Date();
      let endDate = new Date();
      let status: 'active' | 'trialing' = 'active';
      let trialEndDate: Date | undefined;

      // Set trial period if provided
      if (trialDays && trialDays > 0) {
        status = 'trialing';
        trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + trialDays);
        endDate = new Date(trialEndDate);
      }

      // Set end date based on billing cycle
      if (billingCycle === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const subscription = await Subscription.create({
        userId: new mongoose.Types.ObjectId(userId),
        tier,
        status,
        startDate,
        endDate,
        trialEndDate,
        billingCycle,
        amount,
        currency: 'KRW',
        features: tierConfig.features,
      });

      return subscription;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  /**
   * Get active subscription for a user
   */
  static async getActiveSubscription(userId: string): Promise<any | null> {
    try {
      const subscription = await Subscription.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        status: { $in: ['active', 'trialing'] },
        endDate: { $gt: new Date() },
      }).sort({ createdAt: -1 });

      return subscription;
    } catch (error) {
      console.error('Failed to get active subscription:', error);
      return null;
    }
  }

  /**
   * Upgrade subscription
   */
  static async upgradeSubscription(
    userId: string,
    newTier: SubscriptionTier
  ): Promise<any> {
    try {
      const currentSubscription = await this.getActiveSubscription(userId);

      if (!currentSubscription) {
        throw new Error('No active subscription found');
      }

      // Calculate prorated credit from current subscription
      const now = new Date();
      const remainingDays = Math.ceil(
        (currentSubscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Cancel current subscription
      currentSubscription.status = 'cancelled';
      currentSubscription.cancelAtPeriodEnd = true;
      await currentSubscription.save();

      // Create new subscription with upgraded tier
      const newSubscription = await this.createSubscription(
        userId,
        newTier,
        currentSubscription.billingCycle
      );

      return {
        oldSubscription: currentSubscription,
        newSubscription,
        proratedCredit: remainingDays,
      };
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
      throw new Error('Failed to upgrade subscription');
    }
  }

  /**
   * Downgrade subscription
   */
  static async downgradeSubscription(
    userId: string,
    newTier: SubscriptionTier
  ): Promise<any> {
    try {
      const currentSubscription = await this.getActiveSubscription(userId);

      if (!currentSubscription) {
        throw new Error('No active subscription found');
      }

      // Schedule downgrade at end of current period
      currentSubscription.cancelAtPeriodEnd = true;
      await currentSubscription.save();

      // Create pending subscription that starts when current ends
      const newStartDate = currentSubscription.endDate;
      const newEndDate = new Date(newStartDate);

      if (currentSubscription.billingCycle === 'monthly') {
        newEndDate.setMonth(newEndDate.getMonth() + 1);
      } else {
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
      }

      const tierConfig = SubscriptionTiers[newTier];

      const pendingSubscription = await Subscription.create({
        userId: new mongoose.Types.ObjectId(userId),
        tier: newTier,
        status: 'active',
        startDate: newStartDate,
        endDate: newEndDate,
        billingCycle: currentSubscription.billingCycle,
        amount: tierConfig.price[currentSubscription.billingCycle],
        currency: 'KRW',
        features: tierConfig.features,
      });

      return {
        currentSubscription,
        pendingSubscription,
        downgradeDateDate: newStartDate,
      };
    } catch (error) {
      console.error('Failed to downgrade subscription:', error);
      throw new Error('Failed to downgrade subscription');
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(
    userId: string,
    immediate: boolean = false
  ): Promise<any> {
    try {
      const subscription = await this.getActiveSubscription(userId);

      if (!subscription) {
        throw new Error('No active subscription found');
      }

      if (immediate) {
        subscription.status = 'cancelled';
        subscription.endDate = new Date();
      } else {
        subscription.cancelAtPeriodEnd = true;
      }

      await subscription.save();

      return subscription;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Renew subscription
   */
  static async renewSubscription(subscriptionId: string): Promise<any> {
    try {
      const subscription = await Subscription.findById(subscriptionId);

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const newEndDate = new Date(subscription.endDate);

      if (subscription.billingCycle === 'monthly') {
        newEndDate.setMonth(newEndDate.getMonth() + 1);
      } else {
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
      }

      subscription.endDate = newEndDate;
      subscription.status = 'active';
      subscription.cancelAtPeriodEnd = false;

      await subscription.save();

      return subscription;
    } catch (error) {
      console.error('Failed to renew subscription:', error);
      throw new Error('Failed to renew subscription');
    }
  }

  /**
   * Check if user has access to feature
   */
  static async hasFeatureAccess(
    userId: string,
    feature: keyof typeof SubscriptionTiers.free.features
  ): Promise<boolean> {
    try {
      const subscription = await this.getActiveSubscription(userId);

      if (!subscription) {
        // Check free tier features
        return SubscriptionTiers.free.features[feature] as boolean;
      }

      return subscription.features[feature];
    } catch (error) {
      console.error('Failed to check feature access:', error);
      return false;
    }
  }

  /**
   * Get subscription usage limits
   */
  static async getUsageLimits(userId: string): Promise<any> {
    try {
      const subscription = await this.getActiveSubscription(userId);

      if (!subscription) {
        return SubscriptionTiers.free.features;
      }

      return subscription.features;
    } catch (error) {
      console.error('Failed to get usage limits:', error);
      return SubscriptionTiers.free.features;
    }
  }

  /**
   * Check and update expired subscriptions
   */
  static async checkExpiredSubscriptions(): Promise<void> {
    try {
      const now = new Date();

      const expiredSubscriptions = await Subscription.find({
        status: { $in: ['active', 'trialing'] },
        endDate: { $lt: now },
      });

      for (const subscription of expiredSubscriptions) {
        subscription.status = 'expired';
        await subscription.save();

        // Optionally: Send notification to user about expiration
        console.log(`Subscription expired for user: ${subscription.userId}`);
      }

      console.log(`Marked ${expiredSubscriptions.length} subscriptions as expired`);
    } catch (error) {
      console.error('Failed to check expired subscriptions:', error);
    }
  }

  /**
   * Get subscription statistics
   */
  static async getSubscriptionStats(): Promise<any> {
    try {
      const stats = await Subscription.aggregate([
        {
          $group: {
            _id: { tier: '$tier', status: '$status' },
            count: { $sum: 1 },
            totalRevenue: { $sum: '$amount' },
          },
        },
        {
          $group: {
            _id: '$_id.tier',
            statuses: {
              $push: {
                status: '$_id.status',
                count: '$count',
                revenue: '$totalRevenue',
              },
            },
            totalCount: { $sum: '$count' },
            totalRevenue: { $sum: '$totalRevenue' },
          },
        },
      ]);

      return stats;
    } catch (error) {
      console.error('Failed to get subscription statistics:', error);
      return [];
    }
  }

  /**
   * Cancel all existing active subscriptions for a user
   */
  private static async cancelExistingSubscriptions(userId: string): Promise<void> {
    try {
      await Subscription.updateMany(
        {
          userId: new mongoose.Types.ObjectId(userId),
          status: { $in: ['active', 'trialing'] },
        },
        {
          $set: {
            status: 'cancelled',
            cancelAtPeriodEnd: true,
          },
        }
      );
    } catch (error) {
      console.error('Failed to cancel existing subscriptions:', error);
    }
  }
}

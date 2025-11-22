import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import { User } from '../../models/User';
import { Subscription, SubscriptionTiers } from '../../models/Subscription';
import { SubscriptionService } from '../../services/subscriptionService';

describe('Subscription Integration Tests', () => {
  let userId: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/tepslab-test');
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Subscription.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Subscription.deleteMany({});

    // Create test user
    const user = await User.create({
      email: 'subscription-test@example.com',
      password: 'Test123!@#',
      name: 'Test User',
      provider: 'local',
    });

    userId = user._id.toString();
  });

  describe('Create Subscription', () => {
    test('should create free subscription', async () => {
      const subscription = await SubscriptionService.createSubscription(
        userId,
        'free',
        'monthly'
      );

      expect(subscription.userId.toString()).toBe(userId);
      expect(subscription.tier).toBe('free');
      expect(subscription.amount).toBe(0);
      expect(subscription.status).toBe('active');
      expect(subscription.features.maxCourses).toBe(3);
    });

    test('should create premium subscription with monthly billing', async () => {
      const subscription = await SubscriptionService.createSubscription(
        userId,
        'premium',
        'monthly'
      );

      expect(subscription.tier).toBe('premium');
      expect(subscription.billingCycle).toBe('monthly');
      expect(subscription.amount).toBe(SubscriptionTiers.premium.price.monthly);
      expect(subscription.features.maxCourses).toBe(-1); // unlimited
      expect(subscription.features.prioritySupport).toBe(true);
    });

    test('should create subscription with trial period', async () => {
      const subscription = await SubscriptionService.createSubscription(
        userId,
        'basic',
        'monthly',
        14 // 14 days trial
      );

      expect(subscription.status).toBe('trialing');
      expect(subscription.trialEndDate).toBeDefined();

      const trialDays = Math.ceil(
        (subscription.trialEndDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(trialDays).toBeGreaterThanOrEqual(13);
      expect(trialDays).toBeLessThanOrEqual(14);
    });

    test('should cancel existing subscription when creating new one', async () => {
      // Create first subscription
      const firstSub = await SubscriptionService.createSubscription(
        userId,
        'basic',
        'monthly'
      );

      expect(firstSub.status).toBe('active');

      // Create second subscription
      const secondSub = await SubscriptionService.createSubscription(
        userId,
        'premium',
        'monthly'
      );

      expect(secondSub.status).toBe('active');

      // Check that first subscription is cancelled
      const updatedFirstSub = await Subscription.findById(firstSub._id);
      expect(updatedFirstSub?.status).toBe('cancelled');
      expect(updatedFirstSub?.cancelAtPeriodEnd).toBe(true);
    });
  });

  describe('Get Active Subscription', () => {
    test('should get active subscription', async () => {
      await SubscriptionService.createSubscription(userId, 'premium', 'monthly');

      const activeSubscription = await SubscriptionService.getActiveSubscription(userId);

      expect(activeSubscription).toBeDefined();
      expect(activeSubscription?.tier).toBe('premium');
      expect(activeSubscription?.status).toBe('active');
    });

    test('should return null when no active subscription', async () => {
      const activeSubscription = await SubscriptionService.getActiveSubscription(userId);
      expect(activeSubscription).toBeNull();
    });

    test('should not return cancelled subscription', async () => {
      const subscription = await SubscriptionService.createSubscription(
        userId,
        'premium',
        'monthly'
      );

      subscription.status = 'cancelled';
      await subscription.save();

      const activeSubscription = await SubscriptionService.getActiveSubscription(userId);
      expect(activeSubscription).toBeNull();
    });
  });

  describe('Upgrade Subscription', () => {
    test('should upgrade from basic to premium', async () => {
      // Create basic subscription
      await SubscriptionService.createSubscription(userId, 'basic', 'monthly');

      // Upgrade to premium
      const result = await SubscriptionService.upgradeSubscription(userId, 'premium');

      expect(result.newSubscription.tier).toBe('premium');
      expect(result.oldSubscription.status).toBe('cancelled');
      expect(result.proratedCredit).toBeGreaterThan(0);
    });

    test('should fail upgrade when no active subscription', async () => {
      await expect(
        SubscriptionService.upgradeSubscription(userId, 'premium')
      ).rejects.toThrow('No active subscription found');
    });
  });

  describe('Downgrade Subscription', () => {
    test('should schedule downgrade at end of period', async () => {
      // Create premium subscription
      const currentSub = await SubscriptionService.createSubscription(
        userId,
        'premium',
        'monthly'
      );

      // Downgrade to basic
      const result = await SubscriptionService.downgradeSubscription(userId, 'basic');

      expect(result.currentSubscription.cancelAtPeriodEnd).toBe(true);
      expect(result.pendingSubscription.tier).toBe('basic');
      expect(result.pendingSubscription.startDate.getTime()).toBe(
        currentSub.endDate.getTime()
      );
    });
  });

  describe('Cancel Subscription', () => {
    test('should cancel subscription at period end', async () => {
      await SubscriptionService.createSubscription(userId, 'premium', 'monthly');

      const cancelled = await SubscriptionService.cancelSubscription(userId, false);

      expect(cancelled.cancelAtPeriodEnd).toBe(true);
      expect(cancelled.status).toBe('active'); // Still active until period end
    });

    test('should cancel subscription immediately', async () => {
      await SubscriptionService.createSubscription(userId, 'premium', 'monthly');

      const cancelled = await SubscriptionService.cancelSubscription(userId, true);

      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.endDate.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });
  });

  describe('Renew Subscription', () => {
    test('should renew subscription', async () => {
      const subscription = await SubscriptionService.createSubscription(
        userId,
        'premium',
        'monthly'
      );

      const originalEndDate = subscription.endDate;

      await SubscriptionService.renewSubscription(subscription._id.toString());

      const renewed = await Subscription.findById(subscription._id);

      expect(renewed?.endDate.getTime()).toBeGreaterThan(originalEndDate.getTime());
      expect(renewed?.status).toBe('active');
      expect(renewed?.cancelAtPeriodEnd).toBe(false);
    });
  });

  describe('Feature Access', () => {
    test('should check feature access for premium user', async () => {
      await SubscriptionService.createSubscription(userId, 'premium', 'monthly');

      const hasPrioritySupport = await SubscriptionService.hasFeatureAccess(
        userId,
        'prioritySupport'
      );

      expect(hasPrioritySupport).toBe(true);
    });

    test('should check feature access for free user', async () => {
      await SubscriptionService.createSubscription(userId, 'free', 'monthly');

      const hasPrioritySupport = await SubscriptionService.hasFeatureAccess(
        userId,
        'prioritySupport'
      );

      expect(hasPrioritySupport).toBe(false);
    });

    test('should return free tier features when no subscription', async () => {
      const hasOfflineAccess = await SubscriptionService.hasFeatureAccess(
        userId,
        'offlineAccess'
      );

      expect(hasOfflineAccess).toBe(false);
    });
  });

  describe('Usage Limits', () => {
    test('should get correct usage limits for premium tier', async () => {
      await SubscriptionService.createSubscription(userId, 'premium', 'monthly');

      const limits = await SubscriptionService.getUsageLimits(userId);

      expect(limits.maxCourses).toBe(-1); // unlimited
      expect(limits.maxAIRequests).toBe(500);
      expect(limits.apiAccess).toBe(true);
    });

    test('should get free tier limits when no subscription', async () => {
      const limits = await SubscriptionService.getUsageLimits(userId);

      expect(limits.maxCourses).toBe(3);
      expect(limits.maxAIRequests).toBe(10);
      expect(limits.apiAccess).toBe(false);
    });
  });

  describe('Expired Subscriptions', () => {
    test('should mark expired subscriptions', async () => {
      const subscription = await SubscriptionService.createSubscription(
        userId,
        'premium',
        'monthly'
      );

      // Set end date to past
      subscription.endDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await subscription.save();

      await SubscriptionService.checkExpiredSubscriptions();

      const updated = await Subscription.findById(subscription._id);
      expect(updated?.status).toBe('expired');
    });
  });

  describe('Subscription Statistics', () => {
    test('should get subscription statistics', async () => {
      // Create multiple subscriptions
      const user1 = await User.create({
        email: 'user1@example.com',
        password: 'Test123!@#',
        name: 'User 1',
        provider: 'local',
      });

      const user2 = await User.create({
        email: 'user2@example.com',
        password: 'Test123!@#',
        name: 'User 2',
        provider: 'local',
      });

      await SubscriptionService.createSubscription(user1._id.toString(), 'basic', 'monthly');
      await SubscriptionService.createSubscription(user2._id.toString(), 'premium', 'monthly');

      const stats = await SubscriptionService.getSubscriptionStats();

      expect(stats).toBeDefined();
      expect(Array.isArray(stats)).toBe(true);
      expect(stats.length).toBeGreaterThan(0);
    });
  });
});

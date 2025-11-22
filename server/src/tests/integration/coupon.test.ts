import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import { User } from '../../models/User';
import { Coupon, CouponUsage } from '../../models/Coupon';
import { CouponService } from '../../services/couponService';

describe('Coupon Integration Tests', () => {
  let adminId: string;
  let userId: string;
  let couponId: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/tepslab-test');
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Coupon.deleteMany({});
    await CouponUsage.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Coupon.deleteMany({});
    await CouponUsage.deleteMany({});

    // Create admin user
    const admin = await User.create({
      email: 'admin@example.com',
      password: 'Admin123!@#',
      name: 'Admin User',
      role: 'admin',
      provider: 'local',
    });
    adminId = admin._id.toString();

    // Create regular user
    const user = await User.create({
      email: 'user@example.com',
      password: 'User123!@#',
      name: 'Regular User',
      provider: 'local',
    });
    userId = user._id.toString();
  });

  describe('Create Coupon', () => {
    test('should create percentage discount coupon', async () => {
      const coupon = await CouponService.createCoupon({
        code: 'SAVE20',
        name: '20% Off',
        description: 'Save 20% on any course',
        discountType: 'percentage',
        discountValue: 20,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdBy: adminId,
      });

      expect(coupon.code).toBe('SAVE20');
      expect(coupon.discountType).toBe('percentage');
      expect(coupon.discountValue).toBe(20);
      expect(coupon.status).toBe('active');

      couponId = coupon._id.toString();
    });

    test('should create fixed amount discount coupon', async () => {
      const coupon = await CouponService.createCoupon({
        code: 'FIXED5000',
        name: '5000 KRW Off',
        discountType: 'fixed_amount',
        discountValue: 5000,
        minPurchaseAmount: 10000,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: adminId,
      });

      expect(coupon.discountType).toBe('fixed_amount');
      expect(coupon.discountValue).toBe(5000);
      expect(coupon.minPurchaseAmount).toBe(10000);
    });

    test('should fail with invalid percentage', async () => {
      await expect(
        CouponService.createCoupon({
          code: 'INVALID',
          name: 'Invalid Coupon',
          discountType: 'percentage',
          discountValue: 150, // Invalid: > 100
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdBy: adminId,
        })
      ).rejects.toThrow('Percentage discount must be between 0 and 100');
    });

    test('should fail with duplicate code', async () => {
      await CouponService.createCoupon({
        code: 'DUPLICATE',
        name: 'First Coupon',
        discountType: 'percentage',
        discountValue: 10,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: adminId,
      });

      await expect(
        CouponService.createCoupon({
          code: 'DUPLICATE',
          name: 'Second Coupon',
          discountType: 'percentage',
          discountValue: 20,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdBy: adminId,
        })
      ).rejects.toThrow('Coupon code already exists');
    });
  });

  describe('Validate Coupon', () => {
    beforeEach(async () => {
      await CouponService.createCoupon({
        code: 'VALIDATE20',
        name: '20% Off',
        discountType: 'percentage',
        discountValue: 20,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: adminId,
      });
    });

    test('should validate correct coupon', async () => {
      const result = await CouponService.validateCoupon('VALIDATE20', userId, 10000);

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(2000); // 20% of 10000
      expect(result.finalAmount).toBe(8000);
    });

    test('should fail with invalid code', async () => {
      const result = await CouponService.validateCoupon('INVALID', userId, 10000);

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid coupon code');
    });

    test('should fail below minimum purchase amount', async () => {
      await CouponService.createCoupon({
        code: 'MIN5000',
        name: 'Min 5000',
        discountType: 'percentage',
        discountValue: 10,
        minPurchaseAmount: 5000,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: adminId,
      });

      const result = await CouponService.validateCoupon('MIN5000', userId, 3000);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('Minimum purchase amount');
    });

    test('should apply max discount limit', async () => {
      await CouponService.createCoupon({
        code: 'MAX1000',
        name: 'Max 1000 discount',
        discountType: 'percentage',
        discountValue: 50,
        maxDiscountAmount: 1000,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: adminId,
      });

      const result = await CouponService.validateCoupon('MAX1000', userId, 10000);

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(1000); // Max limit, not 5000
      expect(result.finalAmount).toBe(9000);
    });

    test('should fail when expired', async () => {
      const expiredCoupon = await CouponService.createCoupon({
        code: 'EXPIRED',
        name: 'Expired Coupon',
        discountType: 'percentage',
        discountValue: 10,
        validUntil: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        createdBy: adminId,
      });

      const result = await CouponService.validateCoupon('EXPIRED', userId, 10000);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('expired');
    });

    test('should fail when usage limit reached', async () => {
      const limitedCoupon = await CouponService.createCoupon({
        code: 'LIMITED',
        name: 'Limited Use',
        discountType: 'percentage',
        discountValue: 10,
        usageLimit: 1,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: adminId,
      });

      // Use the coupon once
      await CouponService.applyCoupon('LIMITED', userId, 10000);

      // Try to validate again
      const result = await CouponService.validateCoupon('LIMITED', userId, 10000);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('usage limit');
    });

    test('should fail when per-user limit reached', async () => {
      await CouponService.createCoupon({
        code: 'PERUSER',
        name: 'One Per User',
        discountType: 'percentage',
        discountValue: 10,
        perUserLimit: 1,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: adminId,
      });

      // Use the coupon
      await CouponService.applyCoupon('PERUSER', userId, 10000);

      // Try to use again
      const result = await CouponService.validateCoupon('PERUSER', userId, 10000);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('already used');
    });
  });

  describe('Apply Coupon', () => {
    beforeEach(async () => {
      await CouponService.createCoupon({
        code: 'APPLY20',
        name: '20% Off',
        discountType: 'percentage',
        discountValue: 20,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: adminId,
      });
    });

    test('should apply coupon and track usage', async () => {
      const result = await CouponService.applyCoupon('APPLY20', userId, 10000);

      expect(result.success).toBe(true);
      expect(result.discountAmount).toBe(2000);
      expect(result.finalAmount).toBe(8000);

      // Check usage tracking
      const usageCount = await CouponUsage.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
      });
      expect(usageCount).toBe(1);

      // Check coupon usage count updated
      const coupon = await Coupon.findOne({ code: 'APPLY20' });
      expect(coupon?.usageCount).toBe(1);
    });

    test('should handle fixed amount discount', async () => {
      await CouponService.createCoupon({
        code: 'FIXED3000',
        name: '3000 KRW Off',
        discountType: 'fixed_amount',
        discountValue: 3000,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: adminId,
      });

      const result = await CouponService.applyCoupon('FIXED3000', userId, 10000);

      expect(result.success).toBe(true);
      expect(result.discountAmount).toBe(3000);
      expect(result.finalAmount).toBe(7000);
    });

    test('should not exceed original amount for fixed discount', async () => {
      await CouponService.createCoupon({
        code: 'BIGDISCOUNT',
        name: 'Big Discount',
        discountType: 'fixed_amount',
        discountValue: 20000,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: adminId,
      });

      const result = await CouponService.applyCoupon('BIGDISCOUNT', userId, 5000);

      expect(result.success).toBe(true);
      expect(result.discountAmount).toBe(5000); // Max is original amount
      expect(result.finalAmount).toBe(0);
    });
  });

  describe('Coupon Management', () => {
    test('should get all coupons', async () => {
      await CouponService.createCoupon({
        code: 'COUPON1',
        name: 'Coupon 1',
        discountType: 'percentage',
        discountValue: 10,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: adminId,
      });

      await CouponService.createCoupon({
        code: 'COUPON2',
        name: 'Coupon 2',
        discountType: 'percentage',
        discountValue: 20,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: adminId,
      });

      const coupons = await CouponService.getAllCoupons();

      expect(coupons.length).toBe(2);
    });

    test('should update coupon', async () => {
      const coupon = await CouponService.createCoupon({
        code: 'UPDATE',
        name: 'Original Name',
        discountType: 'percentage',
        discountValue: 10,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: adminId,
      });

      const updated = await CouponService.updateCoupon(coupon._id.toString(), {
        name: 'Updated Name',
        discountValue: 15,
      });

      expect(updated?.name).toBe('Updated Name');
      expect(updated?.discountValue).toBe(15);
    });

    test('should deactivate coupon', async () => {
      const coupon = await CouponService.createCoupon({
        code: 'DEACTIVATE',
        name: 'To Be Deactivated',
        discountType: 'percentage',
        discountValue: 10,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: adminId,
      });

      const deactivated = await CouponService.deactivateCoupon(coupon._id.toString());

      expect(deactivated?.status).toBe('inactive');

      // Should not be valid after deactivation
      const result = await CouponService.validateCoupon('DEACTIVATE', userId, 10000);
      expect(result.valid).toBe(false);
    });

    test('should delete coupon', async () => {
      const coupon = await CouponService.createCoupon({
        code: 'DELETE',
        name: 'To Be Deleted',
        discountType: 'percentage',
        discountValue: 10,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: adminId,
      });

      await CouponService.deleteCoupon(coupon._id.toString());

      const deleted = await Coupon.findById(coupon._id);
      expect(deleted).toBeNull();
    });
  });

  describe('Coupon Statistics', () => {
    test('should get coupon usage statistics', async () => {
      const coupon = await CouponService.createCoupon({
        code: 'STATS',
        name: 'Stats Coupon',
        discountType: 'percentage',
        discountValue: 20,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: adminId,
      });

      // Apply coupon multiple times
      await CouponService.applyCoupon('STATS', userId, 10000);

      const user2 = await User.create({
        email: 'user2@example.com',
        password: 'User123!@#',
        name: 'User 2',
        provider: 'local',
      });

      await CouponService.applyCoupon('STATS', user2._id.toString(), 15000);

      const stats = await CouponService.getCouponStats(coupon._id.toString());

      expect(stats.stats.totalUsage).toBe(2);
      expect(stats.stats.totalDiscount).toBeGreaterThan(0);
      expect(stats.stats.totalRevenue).toBeGreaterThan(0);
    });
  });

  describe('Check Expired Coupons', () => {
    test('should mark expired coupons as expired', async () => {
      const coupon = await CouponService.createCoupon({
        code: 'EXPIRED',
        name: 'Expired Coupon',
        discountType: 'percentage',
        discountValue: 10,
        validUntil: new Date(Date.now() - 24 * 60 * 60 * 1000),
        createdBy: adminId,
      });

      await CouponService.checkExpiredCoupons();

      const updated = await Coupon.findById(coupon._id);
      expect(updated?.status).toBe('expired');
    });
  });

  describe('User Coupon History', () => {
    test('should get user coupon usage history', async () => {
      await CouponService.createCoupon({
        code: 'HISTORY1',
        name: 'History Coupon 1',
        discountType: 'percentage',
        discountValue: 10,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: adminId,
      });

      await CouponService.createCoupon({
        code: 'HISTORY2',
        name: 'History Coupon 2',
        discountType: 'percentage',
        discountValue: 20,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: adminId,
      });

      await CouponService.applyCoupon('HISTORY1', userId, 10000);
      await CouponService.applyCoupon('HISTORY2', userId, 15000);

      const history = await CouponService.getUserCouponHistory(userId);

      expect(history.length).toBe(2);
    });
  });
});

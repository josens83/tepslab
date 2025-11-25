"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../../models/User");
const Coupon_1 = require("../../models/Coupon");
const couponService_1 = require("../../services/couponService");
(0, globals_1.describe)('Coupon Integration Tests', () => {
    let adminId;
    let userId;
    let couponId;
    (0, globals_1.beforeAll)(async () => {
        await mongoose_1.default.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/tepslab-test');
    });
    (0, globals_1.afterAll)(async () => {
        await User_1.User.deleteMany({});
        await Coupon_1.Coupon.deleteMany({});
        await Coupon_1.CouponUsage.deleteMany({});
        await mongoose_1.default.connection.close();
    });
    (0, globals_1.beforeEach)(async () => {
        await User_1.User.deleteMany({});
        await Coupon_1.Coupon.deleteMany({});
        await Coupon_1.CouponUsage.deleteMany({});
        // Create admin user
        const admin = await User_1.User.create({
            email: 'admin@example.com',
            password: 'Admin123!@#',
            name: 'Admin User',
            role: 'admin',
            provider: 'local',
        });
        adminId = admin._id.toString();
        // Create regular user
        const user = await User_1.User.create({
            email: 'user@example.com',
            password: 'User123!@#',
            name: 'Regular User',
            provider: 'local',
        });
        userId = user._id.toString();
    });
    (0, globals_1.describe)('Create Coupon', () => {
        (0, globals_1.test)('should create percentage discount coupon', async () => {
            const coupon = await couponService_1.CouponService.createCoupon({
                code: 'SAVE20',
                name: '20% Off',
                description: 'Save 20% on any course',
                discountType: 'percentage',
                discountValue: 20,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                createdBy: adminId,
            });
            (0, globals_1.expect)(coupon.code).toBe('SAVE20');
            (0, globals_1.expect)(coupon.discountType).toBe('percentage');
            (0, globals_1.expect)(coupon.discountValue).toBe(20);
            (0, globals_1.expect)(coupon.status).toBe('active');
            couponId = coupon._id.toString();
        });
        (0, globals_1.test)('should create fixed amount discount coupon', async () => {
            const coupon = await couponService_1.CouponService.createCoupon({
                code: 'FIXED5000',
                name: '5000 KRW Off',
                discountType: 'fixed_amount',
                discountValue: 5000,
                minPurchaseAmount: 10000,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdBy: adminId,
            });
            (0, globals_1.expect)(coupon.discountType).toBe('fixed_amount');
            (0, globals_1.expect)(coupon.discountValue).toBe(5000);
            (0, globals_1.expect)(coupon.minPurchaseAmount).toBe(10000);
        });
        (0, globals_1.test)('should fail with invalid percentage', async () => {
            await (0, globals_1.expect)(couponService_1.CouponService.createCoupon({
                code: 'INVALID',
                name: 'Invalid Coupon',
                discountType: 'percentage',
                discountValue: 150, // Invalid: > 100
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdBy: adminId,
            })).rejects.toThrow('Percentage discount must be between 0 and 100');
        });
        (0, globals_1.test)('should fail with duplicate code', async () => {
            await couponService_1.CouponService.createCoupon({
                code: 'DUPLICATE',
                name: 'First Coupon',
                discountType: 'percentage',
                discountValue: 10,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdBy: adminId,
            });
            await (0, globals_1.expect)(couponService_1.CouponService.createCoupon({
                code: 'DUPLICATE',
                name: 'Second Coupon',
                discountType: 'percentage',
                discountValue: 20,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdBy: adminId,
            })).rejects.toThrow('Coupon code already exists');
        });
    });
    (0, globals_1.describe)('Validate Coupon', () => {
        (0, globals_1.beforeEach)(async () => {
            await couponService_1.CouponService.createCoupon({
                code: 'VALIDATE20',
                name: '20% Off',
                discountType: 'percentage',
                discountValue: 20,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdBy: adminId,
            });
        });
        (0, globals_1.test)('should validate correct coupon', async () => {
            const result = await couponService_1.CouponService.validateCoupon('VALIDATE20', userId, 10000);
            (0, globals_1.expect)(result.valid).toBe(true);
            (0, globals_1.expect)(result.discountAmount).toBe(2000); // 20% of 10000
            (0, globals_1.expect)(result.finalAmount).toBe(8000);
        });
        (0, globals_1.test)('should fail with invalid code', async () => {
            const result = await couponService_1.CouponService.validateCoupon('INVALID', userId, 10000);
            (0, globals_1.expect)(result.valid).toBe(false);
            (0, globals_1.expect)(result.message).toBe('Invalid coupon code');
        });
        (0, globals_1.test)('should fail below minimum purchase amount', async () => {
            await couponService_1.CouponService.createCoupon({
                code: 'MIN5000',
                name: 'Min 5000',
                discountType: 'percentage',
                discountValue: 10,
                minPurchaseAmount: 5000,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdBy: adminId,
            });
            const result = await couponService_1.CouponService.validateCoupon('MIN5000', userId, 3000);
            (0, globals_1.expect)(result.valid).toBe(false);
            (0, globals_1.expect)(result.message).toContain('Minimum purchase amount');
        });
        (0, globals_1.test)('should apply max discount limit', async () => {
            await couponService_1.CouponService.createCoupon({
                code: 'MAX1000',
                name: 'Max 1000 discount',
                discountType: 'percentage',
                discountValue: 50,
                maxDiscountAmount: 1000,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdBy: adminId,
            });
            const result = await couponService_1.CouponService.validateCoupon('MAX1000', userId, 10000);
            (0, globals_1.expect)(result.valid).toBe(true);
            (0, globals_1.expect)(result.discountAmount).toBe(1000); // Max limit, not 5000
            (0, globals_1.expect)(result.finalAmount).toBe(9000);
        });
        (0, globals_1.test)('should fail when expired', async () => {
            const expiredCoupon = await couponService_1.CouponService.createCoupon({
                code: 'EXPIRED',
                name: 'Expired Coupon',
                discountType: 'percentage',
                discountValue: 10,
                validUntil: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
                createdBy: adminId,
            });
            const result = await couponService_1.CouponService.validateCoupon('EXPIRED', userId, 10000);
            (0, globals_1.expect)(result.valid).toBe(false);
            (0, globals_1.expect)(result.message).toContain('expired');
        });
        (0, globals_1.test)('should fail when usage limit reached', async () => {
            const limitedCoupon = await couponService_1.CouponService.createCoupon({
                code: 'LIMITED',
                name: 'Limited Use',
                discountType: 'percentage',
                discountValue: 10,
                usageLimit: 1,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdBy: adminId,
            });
            // Use the coupon once
            await couponService_1.CouponService.applyCoupon('LIMITED', userId, 10000);
            // Try to validate again
            const result = await couponService_1.CouponService.validateCoupon('LIMITED', userId, 10000);
            (0, globals_1.expect)(result.valid).toBe(false);
            (0, globals_1.expect)(result.message).toContain('usage limit');
        });
        (0, globals_1.test)('should fail when per-user limit reached', async () => {
            await couponService_1.CouponService.createCoupon({
                code: 'PERUSER',
                name: 'One Per User',
                discountType: 'percentage',
                discountValue: 10,
                perUserLimit: 1,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdBy: adminId,
            });
            // Use the coupon
            await couponService_1.CouponService.applyCoupon('PERUSER', userId, 10000);
            // Try to use again
            const result = await couponService_1.CouponService.validateCoupon('PERUSER', userId, 10000);
            (0, globals_1.expect)(result.valid).toBe(false);
            (0, globals_1.expect)(result.message).toContain('already used');
        });
    });
    (0, globals_1.describe)('Apply Coupon', () => {
        (0, globals_1.beforeEach)(async () => {
            await couponService_1.CouponService.createCoupon({
                code: 'APPLY20',
                name: '20% Off',
                discountType: 'percentage',
                discountValue: 20,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdBy: adminId,
            });
        });
        (0, globals_1.test)('should apply coupon and track usage', async () => {
            const result = await couponService_1.CouponService.applyCoupon('APPLY20', userId, 10000);
            (0, globals_1.expect)(result.success).toBe(true);
            (0, globals_1.expect)(result.discountAmount).toBe(2000);
            (0, globals_1.expect)(result.finalAmount).toBe(8000);
            // Check usage tracking
            const usageCount = await Coupon_1.CouponUsage.countDocuments({
                userId: new mongoose_1.default.Types.ObjectId(userId),
            });
            (0, globals_1.expect)(usageCount).toBe(1);
            // Check coupon usage count updated
            const coupon = await Coupon_1.Coupon.findOne({ code: 'APPLY20' });
            (0, globals_1.expect)(coupon?.usageCount).toBe(1);
        });
        (0, globals_1.test)('should handle fixed amount discount', async () => {
            await couponService_1.CouponService.createCoupon({
                code: 'FIXED3000',
                name: '3000 KRW Off',
                discountType: 'fixed_amount',
                discountValue: 3000,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdBy: adminId,
            });
            const result = await couponService_1.CouponService.applyCoupon('FIXED3000', userId, 10000);
            (0, globals_1.expect)(result.success).toBe(true);
            (0, globals_1.expect)(result.discountAmount).toBe(3000);
            (0, globals_1.expect)(result.finalAmount).toBe(7000);
        });
        (0, globals_1.test)('should not exceed original amount for fixed discount', async () => {
            await couponService_1.CouponService.createCoupon({
                code: 'BIGDISCOUNT',
                name: 'Big Discount',
                discountType: 'fixed_amount',
                discountValue: 20000,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdBy: adminId,
            });
            const result = await couponService_1.CouponService.applyCoupon('BIGDISCOUNT', userId, 5000);
            (0, globals_1.expect)(result.success).toBe(true);
            (0, globals_1.expect)(result.discountAmount).toBe(5000); // Max is original amount
            (0, globals_1.expect)(result.finalAmount).toBe(0);
        });
    });
    (0, globals_1.describe)('Coupon Management', () => {
        (0, globals_1.test)('should get all coupons', async () => {
            await couponService_1.CouponService.createCoupon({
                code: 'COUPON1',
                name: 'Coupon 1',
                discountType: 'percentage',
                discountValue: 10,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdBy: adminId,
            });
            await couponService_1.CouponService.createCoupon({
                code: 'COUPON2',
                name: 'Coupon 2',
                discountType: 'percentage',
                discountValue: 20,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdBy: adminId,
            });
            const coupons = await couponService_1.CouponService.getAllCoupons();
            (0, globals_1.expect)(coupons.length).toBe(2);
        });
        (0, globals_1.test)('should update coupon', async () => {
            const coupon = await couponService_1.CouponService.createCoupon({
                code: 'UPDATE',
                name: 'Original Name',
                discountType: 'percentage',
                discountValue: 10,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdBy: adminId,
            });
            const updated = await couponService_1.CouponService.updateCoupon(coupon._id.toString(), {
                name: 'Updated Name',
                discountValue: 15,
            });
            (0, globals_1.expect)(updated?.name).toBe('Updated Name');
            (0, globals_1.expect)(updated?.discountValue).toBe(15);
        });
        (0, globals_1.test)('should deactivate coupon', async () => {
            const coupon = await couponService_1.CouponService.createCoupon({
                code: 'DEACTIVATE',
                name: 'To Be Deactivated',
                discountType: 'percentage',
                discountValue: 10,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdBy: adminId,
            });
            const deactivated = await couponService_1.CouponService.deactivateCoupon(coupon._id.toString());
            (0, globals_1.expect)(deactivated?.status).toBe('inactive');
            // Should not be valid after deactivation
            const result = await couponService_1.CouponService.validateCoupon('DEACTIVATE', userId, 10000);
            (0, globals_1.expect)(result.valid).toBe(false);
        });
        (0, globals_1.test)('should delete coupon', async () => {
            const coupon = await couponService_1.CouponService.createCoupon({
                code: 'DELETE',
                name: 'To Be Deleted',
                discountType: 'percentage',
                discountValue: 10,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdBy: adminId,
            });
            await couponService_1.CouponService.deleteCoupon(coupon._id.toString());
            const deleted = await Coupon_1.Coupon.findById(coupon._id);
            (0, globals_1.expect)(deleted).toBeNull();
        });
    });
    (0, globals_1.describe)('Coupon Statistics', () => {
        (0, globals_1.test)('should get coupon usage statistics', async () => {
            const coupon = await couponService_1.CouponService.createCoupon({
                code: 'STATS',
                name: 'Stats Coupon',
                discountType: 'percentage',
                discountValue: 20,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdBy: adminId,
            });
            // Apply coupon multiple times
            await couponService_1.CouponService.applyCoupon('STATS', userId, 10000);
            const user2 = await User_1.User.create({
                email: 'user2@example.com',
                password: 'User123!@#',
                name: 'User 2',
                provider: 'local',
            });
            await couponService_1.CouponService.applyCoupon('STATS', user2._id.toString(), 15000);
            const stats = await couponService_1.CouponService.getCouponStats(coupon._id.toString());
            (0, globals_1.expect)(stats.stats.totalUsage).toBe(2);
            (0, globals_1.expect)(stats.stats.totalDiscount).toBeGreaterThan(0);
            (0, globals_1.expect)(stats.stats.totalRevenue).toBeGreaterThan(0);
        });
    });
    (0, globals_1.describe)('Check Expired Coupons', () => {
        (0, globals_1.test)('should mark expired coupons as expired', async () => {
            const coupon = await couponService_1.CouponService.createCoupon({
                code: 'EXPIRED',
                name: 'Expired Coupon',
                discountType: 'percentage',
                discountValue: 10,
                validUntil: new Date(Date.now() - 24 * 60 * 60 * 1000),
                createdBy: adminId,
            });
            await couponService_1.CouponService.checkExpiredCoupons();
            const updated = await Coupon_1.Coupon.findById(coupon._id);
            (0, globals_1.expect)(updated?.status).toBe('expired');
        });
    });
    (0, globals_1.describe)('User Coupon History', () => {
        (0, globals_1.test)('should get user coupon usage history', async () => {
            await couponService_1.CouponService.createCoupon({
                code: 'HISTORY1',
                name: 'History Coupon 1',
                discountType: 'percentage',
                discountValue: 10,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdBy: adminId,
            });
            await couponService_1.CouponService.createCoupon({
                code: 'HISTORY2',
                name: 'History Coupon 2',
                discountType: 'percentage',
                discountValue: 20,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdBy: adminId,
            });
            await couponService_1.CouponService.applyCoupon('HISTORY1', userId, 10000);
            await couponService_1.CouponService.applyCoupon('HISTORY2', userId, 15000);
            const history = await couponService_1.CouponService.getUserCouponHistory(userId);
            (0, globals_1.expect)(history.length).toBe(2);
        });
    });
});
//# sourceMappingURL=coupon.test.js.map
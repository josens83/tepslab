import { Coupon, CouponUsage, DiscountType } from '../models/Coupon';
import mongoose from 'mongoose';

interface CreateCouponParams {
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  validFrom?: Date;
  validUntil: Date;
  applicableTiers?: string[];
  applicableCourses?: string[];
  createdBy: string;
}

export class CouponService {
  /**
   * Create a new coupon
   */
  static async createCoupon(params: CreateCouponParams): Promise<any> {
    try {
      const {
        code,
        name,
        description,
        discountType,
        discountValue,
        minPurchaseAmount,
        maxDiscountAmount,
        usageLimit,
        perUserLimit,
        validFrom,
        validUntil,
        applicableTiers,
        applicableCourses,
        createdBy,
      } = params;

      // Validate discount value
      if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
        throw new Error('Percentage discount must be between 0 and 100');
      }

      if (discountType === 'fixed_amount' && discountValue < 0) {
        throw new Error('Fixed amount discount cannot be negative');
      }

      // Check if coupon code already exists
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        throw new Error('Coupon code already exists');
      }

      const coupon = await Coupon.create({
        code: code.toUpperCase(),
        name,
        description,
        discountType,
        discountValue,
        minPurchaseAmount,
        maxDiscountAmount,
        usageLimit,
        perUserLimit,
        validFrom: validFrom || new Date(),
        validUntil,
        applicableTiers,
        applicableCourses: applicableCourses?.map(id => new mongoose.Types.ObjectId(id)),
        createdBy: new mongoose.Types.ObjectId(createdBy),
      });

      return coupon;
    } catch (error: any) {
      console.error('Failed to create coupon:', error);
      throw new Error(error.message || 'Failed to create coupon');
    }
  }

  /**
   * Validate and apply coupon
   */
  static async validateCoupon(
    code: string,
    userId: string,
    amount: number,
    tier?: string,
    courseId?: string
  ): Promise<{
    valid: boolean;
    coupon?: any;
    discountAmount?: number;
    finalAmount?: number;
    message?: string;
  }> {
    try {
      const coupon = await Coupon.findOne({ code: code.toUpperCase() });

      if (!coupon) {
        return { valid: false, message: 'Invalid coupon code' };
      }

      // Check if coupon is valid
      if (!coupon.isValid()) {
        if (coupon.status === 'expired' || new Date() > coupon.validUntil) {
          return { valid: false, message: 'Coupon has expired' };
        }
        if (coupon.status === 'inactive') {
          return { valid: false, message: 'Coupon is inactive' };
        }
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
          return { valid: false, message: 'Coupon usage limit reached' };
        }
        return { valid: false, message: 'Coupon is not valid' };
      }

      // Check minimum purchase amount
      if (coupon.minPurchaseAmount && amount < coupon.minPurchaseAmount) {
        return {
          valid: false,
          message: `Minimum purchase amount is ${coupon.minPurchaseAmount} ${coupon.currency || 'KRW'}`,
        };
      }

      // Check tier applicability
      if (
        tier &&
        coupon.applicableTiers &&
        coupon.applicableTiers.length > 0 &&
        !coupon.applicableTiers.includes(tier)
      ) {
        return {
          valid: false,
          message: 'Coupon not applicable to this subscription tier',
        };
      }

      // Check course applicability
      if (
        courseId &&
        coupon.applicableCourses &&
        coupon.applicableCourses.length > 0 &&
        !coupon.applicableCourses.some(id => id.toString() === courseId)
      ) {
        return {
          valid: false,
          message: 'Coupon not applicable to this course',
        };
      }

      // Check per-user usage limit
      const userUsageCount = await CouponUsage.countDocuments({
        couponId: coupon._id,
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (coupon.perUserLimit && userUsageCount >= coupon.perUserLimit) {
        return {
          valid: false,
          message: 'You have already used this coupon',
        };
      }

      // Calculate discount
      const discountAmount = coupon.calculateDiscount(amount);
      const finalAmount = amount - discountAmount;

      return {
        valid: true,
        coupon,
        discountAmount,
        finalAmount,
        message: 'Coupon applied successfully',
      };
    } catch (error: any) {
      console.error('Failed to validate coupon:', error);
      return { valid: false, message: 'Error validating coupon' };
    }
  }

  /**
   * Apply coupon and track usage
   */
  static async applyCoupon(
    code: string,
    userId: string,
    amount: number,
    orderId?: string,
    tier?: string,
    courseId?: string
  ): Promise<{
    success: boolean;
    discountAmount: number;
    finalAmount: number;
    message?: string;
  }> {
    try {
      const validation = await this.validateCoupon(code, userId, amount, tier, courseId);

      if (!validation.valid || !validation.coupon) {
        return {
          success: false,
          discountAmount: 0,
          finalAmount: amount,
          message: validation.message,
        };
      }

      const { coupon, discountAmount, finalAmount } = validation;

      // Record coupon usage
      await CouponUsage.create({
        couponId: coupon._id,
        userId: new mongoose.Types.ObjectId(userId),
        orderId: orderId ? new mongoose.Types.ObjectId(orderId) : undefined,
        originalAmount: amount,
        discountAmount: discountAmount!,
        finalAmount: finalAmount!,
      });

      // Increment usage count
      await Coupon.findByIdAndUpdate(coupon._id, {
        $inc: { usageCount: 1 },
      });

      return {
        success: true,
        discountAmount: discountAmount!,
        finalAmount: finalAmount!,
        message: 'Coupon applied successfully',
      };
    } catch (error: any) {
      console.error('Failed to apply coupon:', error);
      return {
        success: false,
        discountAmount: 0,
        finalAmount: amount,
        message: 'Failed to apply coupon',
      };
    }
  }

  /**
   * Get all coupons (admin)
   */
  static async getAllCoupons(filters: any = {}): Promise<any[]> {
    try {
      return await Coupon.find(filters)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Failed to get coupons:', error);
      return [];
    }
  }

  /**
   * Get coupon by ID
   */
  static async getCouponById(couponId: string): Promise<any | null> {
    try {
      return await Coupon.findById(couponId).populate('createdBy', 'name email');
    } catch (error) {
      console.error('Failed to get coupon:', error);
      return null;
    }
  }

  /**
   * Update coupon
   */
  static async updateCoupon(couponId: string, updates: any): Promise<any> {
    try {
      // Prevent updating code and usage count
      delete updates.code;
      delete updates.usageCount;

      const coupon = await Coupon.findByIdAndUpdate(
        couponId,
        { $set: updates },
        { new: true }
      );

      return coupon;
    } catch (error) {
      console.error('Failed to update coupon:', error);
      throw new Error('Failed to update coupon');
    }
  }

  /**
   * Deactivate coupon
   */
  static async deactivateCoupon(couponId: string): Promise<any> {
    try {
      return await Coupon.findByIdAndUpdate(
        couponId,
        { $set: { status: 'inactive' } },
        { new: true }
      );
    } catch (error) {
      console.error('Failed to deactivate coupon:', error);
      throw new Error('Failed to deactivate coupon');
    }
  }

  /**
   * Delete coupon
   */
  static async deleteCoupon(couponId: string): Promise<void> {
    try {
      await Coupon.findByIdAndDelete(couponId);
    } catch (error) {
      console.error('Failed to delete coupon:', error);
      throw new Error('Failed to delete coupon');
    }
  }

  /**
   * Get coupon usage statistics
   */
  static async getCouponStats(couponId: string): Promise<any> {
    try {
      const coupon = await Coupon.findById(couponId);

      if (!coupon) {
        throw new Error('Coupon not found');
      }

      const usageStats = await CouponUsage.aggregate([
        {
          $match: { couponId: new mongoose.Types.ObjectId(couponId) },
        },
        {
          $group: {
            _id: null,
            totalUsage: { $sum: 1 },
            totalDiscount: { $sum: '$discountAmount' },
            totalRevenue: { $sum: '$finalAmount' },
            averageDiscount: { $avg: '$discountAmount' },
          },
        },
      ]);

      return {
        coupon,
        stats: usageStats[0] || {
          totalUsage: 0,
          totalDiscount: 0,
          totalRevenue: 0,
          averageDiscount: 0,
        },
      };
    } catch (error) {
      console.error('Failed to get coupon statistics:', error);
      throw new Error('Failed to get coupon statistics');
    }
  }

  /**
   * Check and mark expired coupons
   */
  static async checkExpiredCoupons(): Promise<void> {
    try {
      const now = new Date();

      const result = await Coupon.updateMany(
        {
          status: 'active',
          validUntil: { $lt: now },
        },
        {
          $set: { status: 'expired' },
        }
      );

      console.log(`Marked ${result.modifiedCount} coupons as expired`);
    } catch (error) {
      console.error('Failed to check expired coupons:', error);
    }
  }

  /**
   * Get user's coupon usage history
   */
  static async getUserCouponHistory(userId: string): Promise<any[]> {
    try {
      return await CouponUsage.find({
        userId: new mongoose.Types.ObjectId(userId),
      })
        .populate('couponId', 'code name discountType discountValue')
        .sort({ usedAt: -1 })
        .limit(50);
    } catch (error) {
      console.error('Failed to get user coupon history:', error);
      return [];
    }
  }
}

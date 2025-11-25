import { DiscountType } from '../models/Coupon';
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
export declare class CouponService {
    /**
     * Create a new coupon
     */
    static createCoupon(params: CreateCouponParams): Promise<any>;
    /**
     * Validate and apply coupon
     */
    static validateCoupon(code: string, userId: string, amount: number, tier?: string, courseId?: string): Promise<{
        valid: boolean;
        coupon?: any;
        discountAmount?: number;
        finalAmount?: number;
        message?: string;
    }>;
    /**
     * Apply coupon and track usage
     */
    static applyCoupon(code: string, userId: string, amount: number, orderId?: string, tier?: string, courseId?: string): Promise<{
        success: boolean;
        discountAmount: number;
        finalAmount: number;
        message?: string;
    }>;
    /**
     * Get all coupons (admin)
     */
    static getAllCoupons(filters?: any): Promise<any[]>;
    /**
     * Get coupon by ID
     */
    static getCouponById(couponId: string): Promise<any | null>;
    /**
     * Update coupon
     */
    static updateCoupon(couponId: string, updates: any): Promise<any>;
    /**
     * Deactivate coupon
     */
    static deactivateCoupon(couponId: string): Promise<any>;
    /**
     * Delete coupon
     */
    static deleteCoupon(couponId: string): Promise<void>;
    /**
     * Get coupon usage statistics
     */
    static getCouponStats(couponId: string): Promise<any>;
    /**
     * Check and mark expired coupons
     */
    static checkExpiredCoupons(): Promise<void>;
    /**
     * Get user's coupon usage history
     */
    static getUserCouponHistory(userId: string): Promise<any[]>;
}
export {};
//# sourceMappingURL=couponService.d.ts.map
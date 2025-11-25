import mongoose, { Document } from 'mongoose';
export type DiscountType = 'percentage' | 'fixed_amount';
export type CouponStatus = 'active' | 'inactive' | 'expired';
export interface ICouponDocument extends Document {
    code: string;
    name: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    minPurchaseAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    usageCount: number;
    perUserLimit?: number;
    validFrom: Date;
    validUntil: Date;
    status: CouponStatus;
    applicableTiers?: string[];
    applicableCourses?: mongoose.Types.ObjectId[];
    createdBy: mongoose.Types.ObjectId;
    metadata?: Record<string, any>;
    currency?: string;
    createdAt: Date;
    updatedAt: Date;
    isValid(): boolean;
    calculateDiscount(amount: number): number;
}
export declare const Coupon: mongoose.Model<ICouponDocument, {}, {}, {}, mongoose.Document<unknown, {}, ICouponDocument, {}, {}> & ICouponDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export interface ICouponUsageDocument extends Document {
    couponId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    orderId?: mongoose.Types.ObjectId;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    usedAt: Date;
}
export declare const CouponUsage: mongoose.Model<ICouponUsageDocument, {}, {}, {}, mongoose.Document<unknown, {}, ICouponUsageDocument, {}, {}> & ICouponUsageDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Coupon.d.ts.map
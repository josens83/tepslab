import mongoose, { Document } from 'mongoose';
export interface IInstructorRevenueDocument extends Document {
    instructorId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    enrollmentId: mongoose.Types.ObjectId;
    paymentId: mongoose.Types.ObjectId;
    totalAmount: number;
    platformFee: number;
    instructorShare: number;
    sharePercentage: number;
    currency: string;
    status: 'pending' | 'approved' | 'paid' | 'refunded';
    paidAt?: Date;
    payoutMethod?: string;
    payoutDetails?: Record<string, any>;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const InstructorRevenue: mongoose.Model<IInstructorRevenueDocument, {}, {}, {}, mongoose.Document<unknown, {}, IInstructorRevenueDocument, {}, {}> & IInstructorRevenueDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export interface IPayoutRequestDocument extends Document {
    instructorId: mongoose.Types.ObjectId;
    amount: number;
    currency: string;
    payoutMethod: 'bank_transfer' | 'paypal' | 'stripe';
    payoutDetails: {
        bankName?: string;
        accountNumber?: string;
        accountHolder?: string;
        paypalEmail?: string;
        stripeAccountId?: string;
    };
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    revenueIds: mongoose.Types.ObjectId[];
    processedBy?: mongoose.Types.ObjectId;
    processedAt?: Date;
    rejectionReason?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const PayoutRequest: mongoose.Model<IPayoutRequestDocument, {}, {}, {}, mongoose.Document<unknown, {}, IPayoutRequestDocument, {}, {}> & IPayoutRequestDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const RevenueShareConfig: {
    default: {
        instructorShare: number;
        platformShare: number;
    };
    premium: {
        instructorShare: number;
        platformShare: number;
    };
    enterprise: {
        instructorShare: number;
        platformShare: number;
    };
    minimumPayout: number;
    payoutSchedule: string;
    holdingPeriod: number;
};
//# sourceMappingURL=InstructorRevenue.d.ts.map
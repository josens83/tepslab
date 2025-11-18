import mongoose, { Document } from 'mongoose';
export interface IPayment {
    userId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    orderId: string;
    paymentKey?: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
    method?: string;
    requestedAt: Date;
    approvedAt?: Date;
    cancelledAt?: Date;
    refundedAt?: Date;
    failReason?: string;
    cancelReason?: string;
    refundReason?: string;
    receiptUrl?: string;
    metadata?: Record<string, any>;
}
export interface IPaymentDocument extends IPayment, Document {
    createdAt: Date;
    updatedAt: Date;
}
declare const Payment: mongoose.Model<IPaymentDocument, {}, {}, {}, mongoose.Document<unknown, {}, IPaymentDocument, {}, {}> & IPaymentDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Payment;
//# sourceMappingURL=Payment.d.ts.map
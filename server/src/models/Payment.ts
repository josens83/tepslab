import mongoose, { Schema, Document } from 'mongoose';

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

const paymentSchema = new Schema<IPaymentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    paymentKey: {
      type: String,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
      required: true,
      index: true,
    },
    method: {
      type: String,
      enum: ['card', 'transfer', 'virtualAccount', 'mobilePhone', 'giftCertificate', 'easyPay'],
    },
    requestedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    approvedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
    failReason: {
      type: String,
    },
    cancelReason: {
      type: String,
    },
    refundReason: {
      type: String,
    },
    receiptUrl: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// 인덱스 생성
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

const Payment = mongoose.model<IPaymentDocument>('Payment', paymentSchema);

export default Payment;

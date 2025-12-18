import type { Course } from './course';

export interface Payment {
  _id: string;
  userId: string;
  courseId: Course | string;
  orderId: string;
  paymentKey?: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  method?: string;
  requestedAt: string;
  approvedAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  failReason?: string;
  cancelReason?: string;
  refundReason?: string;
  receiptUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentPrepareRequest {
  courseId: string;
}

export interface PaymentPrepareResponse {
  orderId: string;
  amount: number;
  orderName: string;
  customerName?: string;
  customerEmail?: string;
}

export interface PaymentConfirmRequest {
  orderId: string;
  paymentKey: string;
  amount: number;
}

export interface PaymentCancelRequest {
  cancelReason: string;
}

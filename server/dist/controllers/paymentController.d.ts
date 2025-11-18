import { Response } from 'express';
import { AuthRequest } from '../types';
/**
 * 결제 준비
 * POST /api/payments/ready
 */
export declare const preparePayment: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * 결제 승인
 * POST /api/payments/confirm
 */
export declare const confirmPayment: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * 결제 내역 조회
 * GET /api/payments
 */
export declare const getPayments: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * 결제 상세 조회
 * GET /api/payments/:id
 */
export declare const getPaymentById: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * 결제 취소/환불
 * POST /api/payments/:id/cancel
 */
export declare const cancelPayment: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=paymentController.d.ts.map
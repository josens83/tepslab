import express from 'express';
import {
  preparePayment,
  confirmPayment,
  getPayments,
  getPaymentById,
  cancelPayment,
} from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 모든 라우트는 인증 필요
router.use(authenticate);

// 결제 준비
router.post('/ready', preparePayment);

// 결제 승인
router.post('/confirm', confirmPayment);

// 결제 내역 조회
router.get('/', getPayments);

// 결제 상세 조회
router.get('/:id', getPaymentById);

// 결제 취소/환불
router.post('/:id/cancel', cancelPayment);

export default router;

import { Response } from 'express';
import axios from 'axios';
import Payment from '../models/Payment';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { AuthRequest } from '../types';

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || '';
const TOSS_API_URL = 'https://api.tosspayments.com/v1';

// Base64 인코딩
const getTossAuthHeader = () => {
  const encoded = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64');
  return `Basic ${encoded}`;
};

/**
 * 결제 준비
 * POST /api/payments/ready
 */
export const preparePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { courseId } = req.body;

    if (!userId) {
      res.status(401).json({ error: '인증이 필요합니다.' });
      return;
    }

    // 강의 조회
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ error: '강의를 찾을 수 없습니다.' });
      return;
    }

    if (!course.isPublished) {
      res.status(400).json({ error: '구매할 수 없는 강의입니다.' });
      return;
    }

    // 이미 수강 중인지 확인
    const existingEnrollment = await Enrollment.findOne({
      userId,
      courseId,
      status: { $in: ['active', 'completed'] },
    });

    if (existingEnrollment) {
      res.status(400).json({ error: '이미 수강 중인 강의입니다.' });
      return;
    }

    // orderId 생성 (유니크해야 함)
    const orderId = `ORDER_${Date.now()}_${userId}_${courseId}`;

    // 결제 금액 계산 (할인가가 있으면 할인가, 없으면 정가)
    const amount = course.discountPrice || course.price;

    // Payment 레코드 생성
    const payment = await Payment.create({
      userId,
      courseId,
      orderId,
      amount,
      status: 'pending',
      requestedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: payment.orderId,
        amount: payment.amount,
        orderName: course.title,
        customerName: req.user?.name || req.user?.email,
        customerEmail: req.user?.email,
      },
    });
  } catch (error) {
    console.error('Payment preparation error:', error);
    res.status(500).json({ error: '결제 준비 중 오류가 발생했습니다.' });
  }
};

/**
 * 결제 승인
 * POST /api/payments/confirm
 */
export const confirmPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { orderId, paymentKey, amount } = req.body;

    if (!userId) {
      res.status(401).json({ error: '인증이 필요합니다.' });
      return;
    }

    // Payment 조회
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      res.status(404).json({ error: '결제 정보를 찾을 수 없습니다.' });
      return;
    }

    // 결제 금액 검증
    if (payment.amount !== amount) {
      res.status(400).json({ error: '결제 금액이 일치하지 않습니다.' });
      return;
    }

    // 사용자 검증
    if (payment.userId.toString() !== userId.toString()) {
      res.status(403).json({ error: '권한이 없습니다.' });
      return;
    }

    // TossPayments API 호출
    try {
      const tossResponse = await axios.post(
        `${TOSS_API_URL}/payments/confirm`,
        {
          orderId,
          paymentKey,
          amount,
        },
        {
          headers: {
            Authorization: getTossAuthHeader(),
            'Content-Type': 'application/json',
          },
        }
      );

      const tossData = tossResponse.data;

      // Payment 상태 업데이트
      payment.paymentKey = paymentKey;
      payment.status = 'completed';
      payment.method = tossData.method;
      payment.approvedAt = new Date(tossData.approvedAt);
      payment.receiptUrl = tossData.receipt?.url;
      payment.metadata = tossData;
      await payment.save();

      // Enrollment 자동 생성
      const course = await Course.findById(payment.courseId);
      if (course) {
        // 진도 초기화
        const progress = course.lessons.map((lesson: any, index: number) => ({
          lessonId: (lesson as any)._id?.toString() || `lesson-${index}`,
          completed: false,
          lastWatchedAt: new Date(),
          watchDuration: 0,
        }));

        await Enrollment.create({
          userId: payment.userId,
          courseId: payment.courseId,
          enrolledAt: new Date(),
          status: 'active',
          progress,
          completionPercentage: 0,
          lastAccessedAt: new Date(),
          paymentId: payment._id,
        });

        // 강의 수강생 수 증가
        course.enrolledCount += 1;
        await course.save();
      }

      res.status(200).json({
        success: true,
        data: {
          payment: {
            orderId: payment.orderId,
            paymentKey: payment.paymentKey,
            amount: payment.amount,
            status: payment.status,
            method: payment.method,
            approvedAt: payment.approvedAt,
            receiptUrl: payment.receiptUrl,
          },
        },
      });
    } catch (tossError: any) {
      console.error('TossPayments API error:', tossError.response?.data || tossError);

      // Payment 상태를 failed로 업데이트
      payment.status = 'failed';
      payment.failReason = tossError.response?.data?.message || '결제 승인 실패';
      await payment.save();

      res.status(400).json({
        error: '결제 승인에 실패했습니다.',
        details: tossError.response?.data?.message,
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ error: '결제 승인 중 오류가 발생했습니다.' });
  }
};

/**
 * 결제 내역 조회
 * GET /api/payments
 */
export const getPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: '인증이 필요합니다.' });
      return;
    }

    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('courseId', 'title thumbnailUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Payment.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: '결제 내역 조회 중 오류가 발생했습니다.' });
  }
};

/**
 * 결제 상세 조회
 * GET /api/payments/:id
 */
export const getPaymentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: '인증이 필요합니다.' });
      return;
    }

    const payment = await Payment.findById(id).populate('courseId', 'title thumbnailUrl instructor');

    if (!payment) {
      res.status(404).json({ error: '결제 정보를 찾을 수 없습니다.' });
      return;
    }

    if (payment.userId.toString() !== userId.toString()) {
      res.status(403).json({ error: '권한이 없습니다.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({ error: '결제 상세 조회 중 오류가 발생했습니다.' });
  }
};

/**
 * 결제 취소/환불
 * POST /api/payments/:id/cancel
 */
export const cancelPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const { cancelReason } = req.body;

    if (!userId) {
      res.status(401).json({ error: '인증이 필요합니다.' });
      return;
    }

    const payment = await Payment.findById(id);

    if (!payment) {
      res.status(404).json({ error: '결제 정보를 찾을 수 없습니다.' });
      return;
    }

    if (payment.userId.toString() !== userId.toString()) {
      res.status(403).json({ error: '권한이 없습니다.' });
      return;
    }

    if (payment.status !== 'completed') {
      res.status(400).json({ error: '취소할 수 없는 결제입니다.' });
      return;
    }

    if (!payment.paymentKey) {
      res.status(400).json({ error: 'paymentKey가 없습니다.' });
      return;
    }

    // TossPayments 취소 API 호출
    try {
      await axios.post(
        `${TOSS_API_URL}/payments/${payment.paymentKey}/cancel`,
        {
          cancelReason: cancelReason || '고객 요청',
        },
        {
          headers: {
            Authorization: getTossAuthHeader(),
            'Content-Type': 'application/json',
          },
        }
      );

      // Payment 상태 업데이트
      payment.status = 'refunded';
      payment.cancelReason = cancelReason;
      payment.cancelledAt = new Date();
      payment.refundedAt = new Date();
      await payment.save();

      // Enrollment 취소 처리
      await Enrollment.updateOne(
        { paymentId: payment._id },
        {
          $set: {
            status: 'cancelled',
            cancelledAt: new Date(),
          },
        }
      );

      // 강의 수강생 수 감소
      await Course.findByIdAndUpdate(payment.courseId, {
        $inc: { enrolledCount: -1 },
      });

      res.status(200).json({
        success: true,
        data: {
          payment: {
            orderId: payment.orderId,
            status: payment.status,
            cancelledAt: payment.cancelledAt,
          },
        },
      });
    } catch (tossError: any) {
      console.error('TossPayments cancel error:', tossError.response?.data || tossError);
      res.status(400).json({
        error: '결제 취소에 실패했습니다.',
        details: tossError.response?.data?.message,
      });
    }
  } catch (error) {
    console.error('Payment cancellation error:', error);
    res.status(500).json({ error: '결제 취소 중 오류가 발생했습니다.' });
  }
};

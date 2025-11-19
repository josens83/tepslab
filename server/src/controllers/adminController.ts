import { Response } from 'express';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import Payment from '../models/Payment';
import { Review } from '../models/Review';
import { AuthRequest } from '../types';

/**
 * 관리자 대시보드 통계
 * GET /api/admin/stats
 */
export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get current date info for date range queries
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Basic counts
    const [
      totalUsers,
      newUsersThisMonth,
      totalCourses,
      activeCourses,
      totalEnrollments,
      newEnrollmentsThisMonth,
      totalRevenue,
      revenueThisMonth,
      totalReviews,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: thisMonth } }),
      Course.countDocuments(),
      Course.countDocuments({ isPublished: true }),
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ createdAt: { $gte: thisMonth } }),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then((r: { total: number }[]) => r[0]?.total || 0),
      Payment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: thisMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then((r: { total: number }[]) => r[0]?.total || 0),
      Review.countDocuments(),
    ]);

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const revenueByMonth = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Popular courses
    const popularCourses = await Course.find({ isPublished: true })
      .sort('-enrolledCount')
      .limit(5)
      .select('title enrolledCount rating price');

    // Recent enrollments
    const recentEnrollments = await Enrollment.find()
      .sort('-createdAt')
      .limit(10)
      .populate('userId', 'name email')
      .populate('courseId', 'title price')
      .select('createdAt status');

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          newUsersThisMonth,
          totalCourses,
          activeCourses,
          totalEnrollments,
          newEnrollmentsThisMonth,
          totalRevenue,
          revenueThisMonth,
          totalReviews,
        },
        revenueByMonth,
        popularCourses,
        recentEnrollments,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: '통계 조회 중 오류가 발생했습니다.' });
  }
};

/**
 * 회원 목록 조회
 * GET /api/admin/users
 */
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;

    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) {
      query.role = role;
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: '회원 목록 조회 중 오류가 발생했습니다.' });
  }
};

/**
 * 회원 상태 변경
 * PUT /api/admin/users/:id/status
 */
export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: '상태 변경 중 오류가 발생했습니다.' });
  }
};

/**
 * 강의 목록 조회 (관리자용)
 * GET /api/admin/courses
 */
export const getAdminCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const [courses, total] = await Promise.all([
      Course.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Course.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get admin courses error:', error);
    res.status(500).json({ error: '강의 목록 조회 중 오류가 발생했습니다.' });
  }
};

/**
 * 결제 내역 조회 (관리자용)
 * GET /api/admin/payments
 */
export const getAdminPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) (query.createdAt as Record<string, unknown>).$gte = new Date(startDate);
      if (endDate) (query.createdAt as Record<string, unknown>).$lte = new Date(endDate);
    }

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('userId', 'name email')
        .populate('courseId', 'title price')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(query),
    ]);

    // Calculate totals
    const statusStats = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$amount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        payments,
        statusStats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get admin payments error:', error);
    res.status(500).json({ error: '결제 내역 조회 중 오류가 발생했습니다.' });
  }
};

/**
 * 결제 환불 처리 (관리자용)
 * POST /api/admin/payments/:id/refund
 */
export const refundPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(id);

    if (!payment) {
      res.status(404).json({ error: '결제 내역을 찾을 수 없습니다.' });
      return;
    }

    if (payment.status !== 'completed') {
      res.status(400).json({ error: '완료된 결제만 환불할 수 있습니다.' });
      return;
    }

    // Update payment status
    payment.status = 'refunded';
    payment.cancelReason = reason || '관리자 환불 처리';
    payment.cancelledAt = new Date();
    await payment.save();

    // Cancel enrollment
    await Enrollment.findOneAndUpdate(
      { paymentId: payment._id },
      { status: 'cancelled' }
    );

    res.status(200).json({
      success: true,
      message: '환불이 처리되었습니다.',
      data: { payment },
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({ error: '환불 처리 중 오류가 발생했습니다.' });
  }
};

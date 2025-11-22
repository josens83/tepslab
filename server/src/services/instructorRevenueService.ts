import {
  InstructorRevenue,
  PayoutRequest,
  RevenueShareConfig,
} from '../models/InstructorRevenue';
import mongoose from 'mongoose';

export class InstructorRevenueService {
  /**
   * Create revenue entry for instructor
   */
  static async createRevenue(
    instructorId: string,
    courseId: string,
    enrollmentId: string,
    paymentId: string,
    totalAmount: number,
    sharePercentage: number = RevenueShareConfig.default.instructorShare
  ): Promise<any> {
    try {
      const instructorShare = Math.round((totalAmount * sharePercentage) / 100);
      const platformFee = totalAmount - instructorShare;

      const revenue = await InstructorRevenue.create({
        instructorId: new mongoose.Types.ObjectId(instructorId),
        courseId: new mongoose.Types.ObjectId(courseId),
        enrollmentId: new mongoose.Types.ObjectId(enrollmentId),
        paymentId: new mongoose.Types.ObjectId(paymentId),
        totalAmount,
        platformFee,
        instructorShare,
        sharePercentage,
        currency: 'KRW',
        status: 'pending',
      });

      return revenue;
    } catch (error) {
      console.error('Failed to create instructor revenue:', error);
      throw new Error('Failed to create instructor revenue');
    }
  }

  /**
   * Get instructor's total earnings
   */
  static async getInstructorEarnings(instructorId: string): Promise<{
    totalEarnings: number;
    pendingEarnings: number;
    approvedEarnings: number;
    paidEarnings: number;
    availableForPayout: number;
  }> {
    try {
      const stats = await InstructorRevenue.aggregate([
        {
          $match: {
            instructorId: new mongoose.Types.ObjectId(instructorId),
          },
        },
        {
          $group: {
            _id: '$status',
            total: { $sum: '$instructorShare' },
          },
        },
      ]);

      const earnings = {
        totalEarnings: 0,
        pendingEarnings: 0,
        approvedEarnings: 0,
        paidEarnings: 0,
        availableForPayout: 0,
      };

      stats.forEach(stat => {
        earnings.totalEarnings += stat.total;

        if (stat._id === 'pending') {
          earnings.pendingEarnings = stat.total;
        } else if (stat._id === 'approved') {
          earnings.approvedEarnings = stat.total;
          earnings.availableForPayout += stat.total;
        } else if (stat._id === 'paid') {
          earnings.paidEarnings = stat.total;
        }
      });

      return earnings;
    } catch (error) {
      console.error('Failed to get instructor earnings:', error);
      throw new Error('Failed to get instructor earnings');
    }
  }

  /**
   * Get instructor's revenue by course
   */
  static async getRevenueByCourse(instructorId: string): Promise<any[]> {
    try {
      return await InstructorRevenue.aggregate([
        {
          $match: {
            instructorId: new mongoose.Types.ObjectId(instructorId),
          },
        },
        {
          $group: {
            _id: '$courseId',
            totalRevenue: { $sum: '$instructorShare' },
            totalSales: { $sum: 1 },
            pending: {
              $sum: {
                $cond: [{ $eq: ['$status', 'pending'] }, '$instructorShare', 0],
              },
            },
            approved: {
              $sum: {
                $cond: [{ $eq: ['$status', 'approved'] }, '$instructorShare', 0],
              },
            },
            paid: {
              $sum: {
                $cond: [{ $eq: ['$status', 'paid'] }, '$instructorShare', 0],
              },
            },
          },
        },
        {
          $lookup: {
            from: 'courses',
            localField: '_id',
            foreignField: '_id',
            as: 'course',
          },
        },
        {
          $unwind: '$course',
        },
        {
          $sort: { totalRevenue: -1 },
        },
      ]);
    } catch (error) {
      console.error('Failed to get revenue by course:', error);
      return [];
    }
  }

  /**
   * Approve revenue for payout
   */
  static async approveRevenue(revenueIds: string[]): Promise<void> {
    try {
      const holdingPeriodDate = new Date();
      holdingPeriodDate.setDate(
        holdingPeriodDate.getDate() - RevenueShareConfig.holdingPeriod
      );

      await InstructorRevenue.updateMany(
        {
          _id: { $in: revenueIds.map(id => new mongoose.Types.ObjectId(id)) },
          status: 'pending',
          createdAt: { $lte: holdingPeriodDate },
        },
        {
          $set: { status: 'approved' },
        }
      );
    } catch (error) {
      console.error('Failed to approve revenue:', error);
      throw new Error('Failed to approve revenue');
    }
  }

  /**
   * Create payout request
   */
  static async createPayoutRequest(
    instructorId: string,
    amount: number,
    payoutMethod: 'bank_transfer' | 'paypal' | 'stripe',
    payoutDetails: any
  ): Promise<any> {
    try {
      // Check if amount meets minimum
      if (amount < RevenueShareConfig.minimumPayout) {
        throw new Error(
          `Minimum payout amount is ${RevenueShareConfig.minimumPayout} KRW`
        );
      }

      // Check available balance
      const earnings = await this.getInstructorEarnings(instructorId);

      if (amount > earnings.availableForPayout) {
        throw new Error('Insufficient available balance for payout');
      }

      // Get approved revenue records that haven't been requested for payout
      const approvedRevenues = await InstructorRevenue.find({
        instructorId: new mongoose.Types.ObjectId(instructorId),
        status: 'approved',
      })
        .sort({ createdAt: 1 })
        .limit(1000);

      let remainingAmount = amount;
      const revenueIds: mongoose.Types.ObjectId[] = [];

      for (const revenue of approvedRevenues) {
        if (remainingAmount <= 0) break;

        revenueIds.push(revenue._id);
        remainingAmount -= revenue.instructorShare;
      }

      const payoutRequest = await PayoutRequest.create({
        instructorId: new mongoose.Types.ObjectId(instructorId),
        amount,
        currency: 'KRW',
        payoutMethod,
        payoutDetails,
        revenueIds,
        status: 'pending',
      });

      return payoutRequest;
    } catch (error: any) {
      console.error('Failed to create payout request:', error);
      throw new Error(error.message || 'Failed to create payout request');
    }
  }

  /**
   * Process payout request
   */
  static async processPayoutRequest(
    requestId: string,
    adminId: string,
    approved: boolean,
    rejectionReason?: string
  ): Promise<any> {
    try {
      const request = await PayoutRequest.findById(requestId);

      if (!request) {
        throw new Error('Payout request not found');
      }

      if (request.status !== 'pending') {
        throw new Error('Payout request already processed');
      }

      if (approved) {
        // Update payout request
        request.status = 'processing';
        request.processedBy = new mongoose.Types.ObjectId(adminId);
        request.processedAt = new Date();
        await request.save();

        // In production, integrate with payment gateway here

        // Mark as completed
        request.status = 'completed';
        await request.save();

        // Update revenue records
        await InstructorRevenue.updateMany(
          {
            _id: { $in: request.revenueIds },
          },
          {
            $set: {
              status: 'paid',
              paidAt: new Date(),
            },
          }
        );
      } else {
        request.status = 'rejected';
        request.processedBy = new mongoose.Types.ObjectId(adminId);
        request.processedAt = new Date();
        request.rejectionReason = rejectionReason;
        await request.save();
      }

      return request;
    } catch (error: any) {
      console.error('Failed to process payout request:', error);
      throw new Error(error.message || 'Failed to process payout request');
    }
  }

  /**
   * Get instructor's payout history
   */
  static async getPayoutHistory(instructorId: string): Promise<any[]> {
    try {
      return await PayoutRequest.find({
        instructorId: new mongoose.Types.ObjectId(instructorId),
      })
        .populate('processedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(50);
    } catch (error) {
      console.error('Failed to get payout history:', error);
      return [];
    }
  }

  /**
   * Get instructor dashboard analytics
   */
  static async getInstructorAnalytics(instructorId: string): Promise<any> {
    try {
      const earnings = await this.getInstructorEarnings(instructorId);
      const revenueByCourse = await this.getRevenueByCourse(instructorId);

      // Get monthly revenue trend
      const monthlyRevenue = await InstructorRevenue.aggregate([
        {
          $match: {
            instructorId: new mongoose.Types.ObjectId(instructorId),
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: '$instructorShare' },
            sales: { $sum: 1 },
          },
        },
        {
          $sort: { '_id.year': -1, '_id.month': -1 },
        },
        {
          $limit: 12,
        },
      ]);

      return {
        earnings,
        revenueByCourse,
        monthlyRevenue,
      };
    } catch (error) {
      console.error('Failed to get instructor analytics:', error);
      throw new Error('Failed to get instructor analytics');
    }
  }

  /**
   * Auto-approve revenues after holding period
   */
  static async autoApproveRevenues(): Promise<void> {
    try {
      const holdingPeriodDate = new Date();
      holdingPeriodDate.setDate(
        holdingPeriodDate.getDate() - RevenueShareConfig.holdingPeriod
      );

      const result = await InstructorRevenue.updateMany(
        {
          status: 'pending',
          createdAt: { $lte: holdingPeriodDate },
        },
        {
          $set: { status: 'approved' },
        }
      );

      console.log(`Auto-approved ${result.modifiedCount} revenue records`);
    } catch (error) {
      console.error('Failed to auto-approve revenues:', error);
    }
  }
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructorRevenueService = void 0;
const InstructorRevenue_1 = require("../models/InstructorRevenue");
const mongoose_1 = __importDefault(require("mongoose"));
class InstructorRevenueService {
    /**
     * Create revenue entry for instructor
     */
    static async createRevenue(instructorId, courseId, enrollmentId, paymentId, totalAmount, sharePercentage = InstructorRevenue_1.RevenueShareConfig.default.instructorShare) {
        try {
            const instructorShare = Math.round((totalAmount * sharePercentage) / 100);
            const platformFee = totalAmount - instructorShare;
            const revenue = await InstructorRevenue_1.InstructorRevenue.create({
                instructorId: new mongoose_1.default.Types.ObjectId(instructorId),
                courseId: new mongoose_1.default.Types.ObjectId(courseId),
                enrollmentId: new mongoose_1.default.Types.ObjectId(enrollmentId),
                paymentId: new mongoose_1.default.Types.ObjectId(paymentId),
                totalAmount,
                platformFee,
                instructorShare,
                sharePercentage,
                currency: 'KRW',
                status: 'pending',
            });
            return revenue;
        }
        catch (error) {
            console.error('Failed to create instructor revenue:', error);
            throw new Error('Failed to create instructor revenue');
        }
    }
    /**
     * Get instructor's total earnings
     */
    static async getInstructorEarnings(instructorId) {
        try {
            const stats = await InstructorRevenue_1.InstructorRevenue.aggregate([
                {
                    $match: {
                        instructorId: new mongoose_1.default.Types.ObjectId(instructorId),
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
                }
                else if (stat._id === 'approved') {
                    earnings.approvedEarnings = stat.total;
                    earnings.availableForPayout += stat.total;
                }
                else if (stat._id === 'paid') {
                    earnings.paidEarnings = stat.total;
                }
            });
            return earnings;
        }
        catch (error) {
            console.error('Failed to get instructor earnings:', error);
            throw new Error('Failed to get instructor earnings');
        }
    }
    /**
     * Get instructor's revenue by course
     */
    static async getRevenueByCourse(instructorId) {
        try {
            return await InstructorRevenue_1.InstructorRevenue.aggregate([
                {
                    $match: {
                        instructorId: new mongoose_1.default.Types.ObjectId(instructorId),
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
        }
        catch (error) {
            console.error('Failed to get revenue by course:', error);
            return [];
        }
    }
    /**
     * Approve revenue for payout
     */
    static async approveRevenue(revenueIds) {
        try {
            const holdingPeriodDate = new Date();
            holdingPeriodDate.setDate(holdingPeriodDate.getDate() - InstructorRevenue_1.RevenueShareConfig.holdingPeriod);
            await InstructorRevenue_1.InstructorRevenue.updateMany({
                _id: { $in: revenueIds.map(id => new mongoose_1.default.Types.ObjectId(id)) },
                status: 'pending',
                createdAt: { $lte: holdingPeriodDate },
            }, {
                $set: { status: 'approved' },
            });
        }
        catch (error) {
            console.error('Failed to approve revenue:', error);
            throw new Error('Failed to approve revenue');
        }
    }
    /**
     * Create payout request
     */
    static async createPayoutRequest(instructorId, amount, payoutMethod, payoutDetails) {
        try {
            // Check if amount meets minimum
            if (amount < InstructorRevenue_1.RevenueShareConfig.minimumPayout) {
                throw new Error(`Minimum payout amount is ${InstructorRevenue_1.RevenueShareConfig.minimumPayout} KRW`);
            }
            // Check available balance
            const earnings = await this.getInstructorEarnings(instructorId);
            if (amount > earnings.availableForPayout) {
                throw new Error('Insufficient available balance for payout');
            }
            // Get approved revenue records that haven't been requested for payout
            const approvedRevenues = await InstructorRevenue_1.InstructorRevenue.find({
                instructorId: new mongoose_1.default.Types.ObjectId(instructorId),
                status: 'approved',
            })
                .sort({ createdAt: 1 })
                .limit(1000);
            let remainingAmount = amount;
            const revenueIds = [];
            for (const revenue of approvedRevenues) {
                if (remainingAmount <= 0)
                    break;
                revenueIds.push(revenue._id);
                remainingAmount -= revenue.instructorShare;
            }
            const payoutRequest = await InstructorRevenue_1.PayoutRequest.create({
                instructorId: new mongoose_1.default.Types.ObjectId(instructorId),
                amount,
                currency: 'KRW',
                payoutMethod,
                payoutDetails,
                revenueIds,
                status: 'pending',
            });
            return payoutRequest;
        }
        catch (error) {
            console.error('Failed to create payout request:', error);
            throw new Error(error.message || 'Failed to create payout request');
        }
    }
    /**
     * Process payout request
     */
    static async processPayoutRequest(requestId, adminId, approved, rejectionReason) {
        try {
            const request = await InstructorRevenue_1.PayoutRequest.findById(requestId);
            if (!request) {
                throw new Error('Payout request not found');
            }
            if (request.status !== 'pending') {
                throw new Error('Payout request already processed');
            }
            if (approved) {
                // Update payout request
                request.status = 'processing';
                request.processedBy = new mongoose_1.default.Types.ObjectId(adminId);
                request.processedAt = new Date();
                await request.save();
                // In production, integrate with payment gateway here
                // Mark as completed
                request.status = 'completed';
                await request.save();
                // Update revenue records
                await InstructorRevenue_1.InstructorRevenue.updateMany({
                    _id: { $in: request.revenueIds },
                }, {
                    $set: {
                        status: 'paid',
                        paidAt: new Date(),
                    },
                });
            }
            else {
                request.status = 'rejected';
                request.processedBy = new mongoose_1.default.Types.ObjectId(adminId);
                request.processedAt = new Date();
                request.rejectionReason = rejectionReason;
                await request.save();
            }
            return request;
        }
        catch (error) {
            console.error('Failed to process payout request:', error);
            throw new Error(error.message || 'Failed to process payout request');
        }
    }
    /**
     * Get instructor's payout history
     */
    static async getPayoutHistory(instructorId) {
        try {
            return await InstructorRevenue_1.PayoutRequest.find({
                instructorId: new mongoose_1.default.Types.ObjectId(instructorId),
            })
                .populate('processedBy', 'name email')
                .sort({ createdAt: -1 })
                .limit(50);
        }
        catch (error) {
            console.error('Failed to get payout history:', error);
            return [];
        }
    }
    /**
     * Get instructor dashboard analytics
     */
    static async getInstructorAnalytics(instructorId) {
        try {
            const earnings = await this.getInstructorEarnings(instructorId);
            const revenueByCourse = await this.getRevenueByCourse(instructorId);
            // Get monthly revenue trend
            const monthlyRevenue = await InstructorRevenue_1.InstructorRevenue.aggregate([
                {
                    $match: {
                        instructorId: new mongoose_1.default.Types.ObjectId(instructorId),
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
        }
        catch (error) {
            console.error('Failed to get instructor analytics:', error);
            throw new Error('Failed to get instructor analytics');
        }
    }
    /**
     * Auto-approve revenues after holding period
     */
    static async autoApproveRevenues() {
        try {
            const holdingPeriodDate = new Date();
            holdingPeriodDate.setDate(holdingPeriodDate.getDate() - InstructorRevenue_1.RevenueShareConfig.holdingPeriod);
            const result = await InstructorRevenue_1.InstructorRevenue.updateMany({
                status: 'pending',
                createdAt: { $lte: holdingPeriodDate },
            }, {
                $set: { status: 'approved' },
            });
            console.log(`Auto-approved ${result.modifiedCount} revenue records`);
        }
        catch (error) {
            console.error('Failed to auto-approve revenues:', error);
        }
    }
}
exports.InstructorRevenueService = InstructorRevenueService;
//# sourceMappingURL=instructorRevenueService.js.map
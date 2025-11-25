"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnerMatchingService = void 0;
const LearningPartnership_1 = require("../models/LearningPartnership");
const messagingService_1 = require("./messagingService");
/**
 * Partner Matching Service
 */
class PartnerMatchingService {
    /**
     * Create partner request
     */
    static async createPartnerRequest(userId, requestData) {
        // Deactivate any existing active requests
        await LearningPartnership_1.PartnerRequest.updateMany({ userId, isActive: true }, { isActive: false });
        const request = new LearningPartnership_1.PartnerRequest({
            userId,
            ...requestData,
            isActive: true,
            matchedWith: [],
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });
        await request.save();
        return request.populate('userId', 'name avatar email');
    }
    /**
     * Get partner request by ID
     */
    static async getRequestById(requestId) {
        return LearningPartnership_1.PartnerRequest.findById(requestId)
            .populate('userId', 'name avatar email age gender');
    }
    /**
     * Get user's partner requests
     */
    static async getUserRequests(userId) {
        return LearningPartnership_1.PartnerRequest.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10);
    }
    /**
     * Update partner request
     */
    static async updatePartnerRequest(requestId, userId, updates) {
        const request = await LearningPartnership_1.PartnerRequest.findById(requestId);
        if (!request) {
            throw new Error('Partner request not found');
        }
        if (request.userId.toString() !== userId.toString()) {
            throw new Error('Not authorized to update this request');
        }
        Object.assign(request, updates);
        await request.save();
        return request;
    }
    /**
     * Delete/deactivate partner request
     */
    static async deactivateRequest(requestId, userId) {
        const request = await LearningPartnership_1.PartnerRequest.findById(requestId);
        if (!request) {
            throw new Error('Partner request not found');
        }
        if (request.userId.toString() !== userId.toString()) {
            throw new Error('Not authorized to delete this request');
        }
        request.isActive = false;
        await request.save();
    }
    /**
     * Calculate match score between two users
     */
    static calculateMatchScore(request1, request2) {
        let score = 0;
        // Target score similarity (0-30 points)
        const scoreDiff = Math.abs(request1.criteria.targetScore - request2.criteria.targetScore);
        const scorePoints = Math.max(0, 30 - (scoreDiff / 10));
        score += scorePoints;
        // Current score range overlap (0-20 points)
        const range1 = request1.criteria.currentScoreRange;
        const range2 = request2.criteria.currentScoreRange;
        const overlap = Math.min(range1.max, range2.max) - Math.max(range1.min, range2.min);
        if (overlap > 0) {
            score += Math.min(20, (overlap / 100) * 20);
        }
        // Target sections match (0-20 points)
        const commonSections = request1.criteria.targetSections.filter(s => request2.criteria.targetSections.includes(s));
        const sectionPoints = (commonSections.length / Math.max(request1.criteria.targetSections.length, 1)) * 20;
        score += sectionPoints;
        // Study time compatibility (0-15 points)
        const commonTimes = request1.criteria.preferredStudyTimes.filter(t => request2.criteria.preferredStudyTimes.includes(t));
        const timePoints = (commonTimes.length / 4) * 15;
        score += timePoints;
        // Availability overlap (0-10 points)
        const commonDays = request1.availability.days.filter(d => request2.availability.days.includes(d));
        const dayPoints = (commonDays.length / 7) * 10;
        score += dayPoints;
        // Study frequency match (0-5 points)
        if (request1.criteria.studyFrequency === request2.criteria.studyFrequency) {
            score += 5;
        }
        return Math.round(score);
    }
    /**
     * Find potential matches for a user
     */
    static async findMatches(userId, limit = 10) {
        const userRequest = await LearningPartnership_1.PartnerRequest.findOne({
            userId,
            isActive: true
        });
        if (!userRequest) {
            throw new Error('No active partner request found');
        }
        // Find other active requests
        const otherRequests = await LearningPartnership_1.PartnerRequest.find({
            userId: { $ne: userId },
            isActive: true,
            expiresAt: { $gt: new Date() }
        }).populate('userId', 'name avatar email age gender');
        // Calculate match scores
        const matches = otherRequests
            .map(request => ({
            request,
            matchScore: this.calculateMatchScore(userRequest, request)
        }))
            .filter(match => {
            // Apply preference filters
            const prefs = userRequest.preferences;
            const otherUser = match.request.userId;
            if (prefs.minAge && otherUser.age < prefs.minAge)
                return false;
            if (prefs.maxAge && otherUser.age > prefs.maxAge)
                return false;
            if (prefs.sameGender && otherUser.gender !== userRequest.userId.gender) {
                return false;
            }
            // Minimum match score threshold
            return match.matchScore >= 30;
        })
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);
        return matches;
    }
    /**
     * Send partnership request
     */
    static async sendPartnershipRequest(requesterId, targetUserId) {
        // Check if partnership already exists
        const existing = await LearningPartnership_1.LearningPartnership.findOne({
            $or: [
                { partner1: requesterId, partner2: targetUserId },
                { partner1: targetUserId, partner2: requesterId }
            ],
            status: { $in: [LearningPartnership_1.PartnershipStatus.PENDING, LearningPartnership_1.PartnershipStatus.ACTIVE] }
        });
        if (existing) {
            throw new Error('Partnership request already exists');
        }
        // Get both users' requests to calculate match score
        const [requesterRequest, targetRequest] = await Promise.all([
            LearningPartnership_1.PartnerRequest.findOne({ userId: requesterId, isActive: true }),
            LearningPartnership_1.PartnerRequest.findOne({ userId: targetUserId, isActive: true })
        ]);
        if (!requesterRequest || !targetRequest) {
            throw new Error('One or both users do not have active partner requests');
        }
        const matchScore = this.calculateMatchScore(requesterRequest, targetRequest);
        // Find common goals
        const sharedGoals = requesterRequest.criteria.goals.filter(goal => targetRequest.criteria.goals.some(g => g.toLowerCase() === goal.toLowerCase()));
        // Create partnership
        const partnership = new LearningPartnership_1.LearningPartnership({
            partner1: requesterId,
            partner2: targetUserId,
            status: LearningPartnership_1.PartnershipStatus.PENDING,
            requestedBy: requesterId,
            requestedAt: new Date(),
            matchScore,
            sharedGoals,
            studySessions: [],
            progressTracking: {
                partner1Progress: {
                    initialScore: requesterRequest.criteria.currentScoreRange.min,
                    currentScore: requesterRequest.criteria.currentScoreRange.min,
                    questionsCompleted: 0,
                    studyHours: 0
                },
                partner2Progress: {
                    initialScore: targetRequest.criteria.currentScoreRange.min,
                    currentScore: targetRequest.criteria.currentScoreRange.min,
                    questionsCompleted: 0,
                    studyHours: 0
                }
            }
        });
        await partnership.save();
        // Add to matched list
        if (!requesterRequest.matchedWith)
            requesterRequest.matchedWith = [];
        if (!targetRequest.matchedWith)
            targetRequest.matchedWith = [];
        requesterRequest.matchedWith.push(targetUserId);
        targetRequest.matchedWith.push(requesterId);
        await Promise.all([requesterRequest.save(), targetRequest.save()]);
        await partnership.populate('partner1', 'name avatar email');
        await partnership.populate('partner2', 'name avatar email');
        return partnership;
    }
    /**
     * Accept partnership request
     */
    static async acceptPartnership(partnershipId, userId) {
        const partnership = await LearningPartnership_1.LearningPartnership.findById(partnershipId);
        if (!partnership) {
            throw new Error('Partnership not found');
        }
        if (partnership.status !== LearningPartnership_1.PartnershipStatus.PENDING) {
            throw new Error('Partnership is not pending');
        }
        // Only the recipient can accept
        if (partnership.partner2.toString() !== userId.toString()) {
            throw new Error('Only the recipient can accept the partnership');
        }
        partnership.accept();
        await partnership.save();
        // Create a conversation for the partners
        const conversation = await messagingService_1.MessagingService.createOrGetConversation([
            partnership.partner1,
            partnership.partner2
        ]);
        partnership.conversationId = conversation._id;
        await partnership.save();
        await partnership.populate('partner1', 'name avatar email');
        await partnership.populate('partner2', 'name avatar email');
        return partnership;
    }
    /**
     * Reject/Cancel partnership
     */
    static async cancelPartnership(partnershipId, userId) {
        const partnership = await LearningPartnership_1.LearningPartnership.findById(partnershipId);
        if (!partnership) {
            throw new Error('Partnership not found');
        }
        const isPartner = partnership.partner1.toString() === userId.toString() ||
            partnership.partner2.toString() === userId.toString();
        if (!isPartner) {
            throw new Error('Not authorized to cancel this partnership');
        }
        partnership.cancel(userId);
        await partnership.save();
    }
    /**
     * Complete partnership
     */
    static async completePartnership(partnershipId, userId) {
        const partnership = await LearningPartnership_1.LearningPartnership.findById(partnershipId);
        if (!partnership) {
            throw new Error('Partnership not found');
        }
        const isPartner = partnership.partner1.toString() === userId.toString() ||
            partnership.partner2.toString() === userId.toString();
        if (!isPartner) {
            throw new Error('Not authorized to complete this partnership');
        }
        partnership.complete();
        await partnership.save();
        return partnership;
    }
    /**
     * Get user's partnerships
     */
    static async getUserPartnerships(userId, status) {
        const query = {
            $or: [{ partner1: userId }, { partner2: userId }]
        };
        if (status) {
            query.status = status;
        }
        return LearningPartnership_1.LearningPartnership.find(query)
            .populate(['partner1', 'partner2'], 'name avatar email')
            .sort({ createdAt: -1 });
    }
    /**
     * Add study session to partnership
     */
    static async addStudySession(partnershipId, userId, session) {
        const partnership = await LearningPartnership_1.LearningPartnership.findById(partnershipId);
        if (!partnership) {
            throw new Error('Partnership not found');
        }
        if (partnership.status !== LearningPartnership_1.PartnershipStatus.ACTIVE) {
            throw new Error('Partnership is not active');
        }
        const isPartner = partnership.partner1.toString() === userId.toString() ||
            partnership.partner2.toString() === userId.toString();
        if (!isPartner) {
            throw new Error('Not authorized to add study session');
        }
        partnership.addStudySession(session);
        await partnership.save();
        return partnership;
    }
    /**
     * Update progress for partner
     */
    static async updateProgress(partnershipId, userId, progress) {
        const partnership = await LearningPartnership_1.LearningPartnership.findById(partnershipId);
        if (!partnership) {
            throw new Error('Partnership not found');
        }
        const isPartner = partnership.partner1.toString() === userId.toString() ||
            partnership.partner2.toString() === userId.toString();
        if (!isPartner) {
            throw new Error('Not authorized to update progress');
        }
        partnership.updateProgress(userId, progress);
        await partnership.save();
        return partnership;
    }
    /**
     * Add feedback for partnership
     */
    static async addFeedback(partnershipId, userId, rating, comment) {
        const partnership = await LearningPartnership_1.LearningPartnership.findById(partnershipId);
        if (!partnership) {
            throw new Error('Partnership not found');
        }
        const isPartner = partnership.partner1.toString() === userId.toString() ||
            partnership.partner2.toString() === userId.toString();
        if (!isPartner) {
            throw new Error('Not authorized to add feedback');
        }
        // Check if already provided feedback
        const existingFeedback = partnership.feedback?.find((f) => f.providedBy.toString() === userId.toString());
        if (existingFeedback) {
            throw new Error('Feedback already provided');
        }
        partnership.addFeedback(userId, rating, comment);
        await partnership.save();
        return partnership;
    }
    /**
     * Get partnership statistics
     */
    static async getPartnershipStats(partnershipId) {
        const partnership = await LearningPartnership_1.LearningPartnership.findById(partnershipId);
        if (!partnership) {
            throw new Error('Partnership not found');
        }
        const completedSessions = partnership.studySessions.filter(s => s.completedAt).length;
        const upcomingSessions = partnership.studySessions.filter(s => !s.completedAt && new Date(s.scheduledAt) > new Date()).length;
        const totalStudyHours = partnership.progressTracking.partner1Progress.studyHours +
            partnership.progressTracking.partner2Progress.studyHours;
        const partner1Improvement = partnership.progressTracking.partner1Progress.currentScore -
            partnership.progressTracking.partner1Progress.initialScore;
        const partner2Improvement = partnership.progressTracking.partner2Progress.currentScore -
            partnership.progressTracking.partner2Progress.initialScore;
        return {
            matchScore: partnership.matchScore,
            status: partnership.status,
            completedSessions,
            upcomingSessions,
            totalSessions: partnership.studySessions.length,
            totalStudyHours,
            partner1Improvement,
            partner2Improvement,
            averageFeedbackRating: partnership.feedback && partnership.feedback.length > 0
                ? partnership.feedback.reduce((sum, f) => sum + f.rating, 0) /
                    partnership.feedback.length
                : null
        };
    }
    /**
     * Clean up expired requests
     */
    static async cleanupExpiredRequests() {
        const result = await LearningPartnership_1.PartnerRequest.updateMany({
            isActive: true,
            expiresAt: { $lt: new Date() }
        }, {
            isActive: false
        });
        return result.modifiedCount;
    }
}
exports.PartnerMatchingService = PartnerMatchingService;
//# sourceMappingURL=partnerMatchingService.js.map
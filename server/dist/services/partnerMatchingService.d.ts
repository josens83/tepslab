import { ILearningPartnership, IPartnerRequest, IMatchCriteria, PartnershipStatus } from '../models/LearningPartnership';
import mongoose from 'mongoose';
/**
 * Partner Matching Service
 */
export declare class PartnerMatchingService {
    /**
     * Create partner request
     */
    static createPartnerRequest(userId: mongoose.Types.ObjectId, requestData: {
        criteria: IMatchCriteria;
        introduction: string;
        availability: {
            days: string[];
            timeSlots: string[];
        };
        preferences?: {
            groupSize?: number;
            minAge?: number;
            maxAge?: number;
            sameGender?: boolean;
        };
    }): Promise<IPartnerRequest>;
    /**
     * Get partner request by ID
     */
    static getRequestById(requestId: mongoose.Types.ObjectId): Promise<IPartnerRequest | null>;
    /**
     * Get user's partner requests
     */
    static getUserRequests(userId: mongoose.Types.ObjectId): Promise<IPartnerRequest[]>;
    /**
     * Update partner request
     */
    static updatePartnerRequest(requestId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, updates: Partial<IPartnerRequest>): Promise<IPartnerRequest>;
    /**
     * Delete/deactivate partner request
     */
    static deactivateRequest(requestId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<void>;
    /**
     * Calculate match score between two users
     */
    static calculateMatchScore(request1: IPartnerRequest, request2: IPartnerRequest): number;
    /**
     * Find potential matches for a user
     */
    static findMatches(userId: mongoose.Types.ObjectId, limit?: number): Promise<{
        request: IPartnerRequest;
        matchScore: number;
    }[]>;
    /**
     * Send partnership request
     */
    static sendPartnershipRequest(requesterId: mongoose.Types.ObjectId, targetUserId: mongoose.Types.ObjectId): Promise<ILearningPartnership>;
    /**
     * Accept partnership request
     */
    static acceptPartnership(partnershipId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<ILearningPartnership>;
    /**
     * Reject/Cancel partnership
     */
    static cancelPartnership(partnershipId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<void>;
    /**
     * Complete partnership
     */
    static completePartnership(partnershipId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<ILearningPartnership>;
    /**
     * Get user's partnerships
     */
    static getUserPartnerships(userId: mongoose.Types.ObjectId, status?: PartnershipStatus): Promise<ILearningPartnership[]>;
    /**
     * Add study session to partnership
     */
    static addStudySession(partnershipId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, session: {
        scheduledAt: Date;
        duration: number;
        notes?: string;
    }): Promise<ILearningPartnership>;
    /**
     * Update progress for partner
     */
    static updateProgress(partnershipId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, progress: {
        currentScore?: number;
        questionsCompleted?: number;
        studyHours?: number;
    }): Promise<ILearningPartnership>;
    /**
     * Add feedback for partnership
     */
    static addFeedback(partnershipId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, rating: number, comment: string): Promise<ILearningPartnership>;
    /**
     * Get partnership statistics
     */
    static getPartnershipStats(partnershipId: mongoose.Types.ObjectId): Promise<any>;
    /**
     * Clean up expired requests
     */
    static cleanupExpiredRequests(): Promise<number>;
}
//# sourceMappingURL=partnerMatchingService.d.ts.map
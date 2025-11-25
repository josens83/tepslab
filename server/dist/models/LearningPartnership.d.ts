import mongoose, { Document } from 'mongoose';
/**
 * Partnership Status
 */
export declare enum PartnershipStatus {
    PENDING = "pending",
    ACTIVE = "active",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
/**
 * Match Criteria Interface
 */
export interface IMatchCriteria {
    targetScore: number;
    currentScoreRange: {
        min: number;
        max: number;
    };
    targetSections: string[];
    preferredStudyTimes: string[];
    studyFrequency: string;
    learningStyle: string;
    goals: string[];
}
/**
 * Learning Partnership Interface
 */
export interface ILearningPartnership extends Document {
    partner1: mongoose.Types.ObjectId;
    partner2: mongoose.Types.ObjectId;
    status: PartnershipStatus;
    requestedBy: mongoose.Types.ObjectId;
    requestedAt: Date;
    acceptedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    cancelledBy?: mongoose.Types.ObjectId;
    matchScore: number;
    sharedGoals: string[];
    targetCompletionDate?: Date;
    studySessions: {
        scheduledAt: Date;
        completedAt?: Date;
        duration: number;
        notes?: string;
        attendees: mongoose.Types.ObjectId[];
    }[];
    progressTracking: {
        partner1Progress: {
            initialScore: number;
            currentScore: number;
            questionsCompleted: number;
            studyHours: number;
        };
        partner2Progress: {
            initialScore: number;
            currentScore: number;
            questionsCompleted: number;
            studyHours: number;
        };
    };
    conversationId?: mongoose.Types.ObjectId;
    feedback?: {
        providedBy: mongoose.Types.ObjectId;
        rating: number;
        comment: string;
        createdAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
    accept(): Promise<void>;
    cancel(userId: mongoose.Types.ObjectId): Promise<void>;
    complete(): Promise<void>;
    addStudySession(session: {
        scheduledAt: Date;
        duration: number;
        notes?: string;
        attendees: mongoose.Types.ObjectId[];
    }): Promise<void>;
    updateProgress(partnerId: mongoose.Types.ObjectId, data: {
        score?: number;
        questionsCompleted?: number;
        studyHours?: number;
    }): Promise<void>;
    addFeedback(feedback: {
        providedBy: mongoose.Types.ObjectId;
        rating: number;
        comment: string;
    }): Promise<void>;
}
/**
 * Partner Request Interface
 */
export interface IPartnerRequest extends Document {
    userId: mongoose.Types.ObjectId;
    criteria: IMatchCriteria;
    introduction: string;
    availability: {
        days: string[];
        timeSlots: string[];
    };
    preferences: {
        groupSize: number;
        minAge?: number;
        maxAge?: number;
        sameGender?: boolean;
    };
    isActive: boolean;
    matchedWith?: mongoose.Types.ObjectId[];
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Partnership Models
 */
export declare const LearningPartnership: mongoose.Model<ILearningPartnership, {}, {}, {}, mongoose.Document<unknown, {}, ILearningPartnership, {}, {}> & ILearningPartnership & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const PartnerRequest: mongoose.Model<IPartnerRequest, {}, {}, {}, mongoose.Document<unknown, {}, IPartnerRequest, {}, {}> & IPartnerRequest & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=LearningPartnership.d.ts.map
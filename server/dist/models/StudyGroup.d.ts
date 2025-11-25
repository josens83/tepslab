import mongoose, { Document } from 'mongoose';
/**
 * Study Group Types
 */
export declare enum GroupType {
    PUBLIC = "public",
    PRIVATE = "private",
    INVITE_ONLY = "invite_only"
}
export declare enum GroupStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    ARCHIVED = "archived"
}
export declare enum MemberRole {
    OWNER = "owner",
    ADMIN = "admin",
    MEMBER = "member"
}
/**
 * Study Group Member Interface
 */
export interface IGroupMember {
    userId: mongoose.Types.ObjectId;
    role: MemberRole;
    joinedAt: Date;
    lastActiveAt: Date;
    contributionScore: number;
}
/**
 * Study Session Interface
 */
export interface IStudySession {
    title: string;
    description?: string;
    scheduledAt: Date;
    duration: number;
    attendees: mongoose.Types.ObjectId[];
    completedAt?: Date;
    notes?: string;
}
/**
 * Study Group Interface
 */
export interface IStudyGroup extends Document {
    name: string;
    description: string;
    groupType: GroupType;
    status: GroupStatus;
    targetScore: number;
    studyGoals: string[];
    members: IGroupMember[];
    maxMembers: number;
    settings: {
        allowMemberInvite: boolean;
        requireApproval: boolean;
        autoAcceptInvite: boolean;
        notificationsEnabled: boolean;
    };
    studySessions: IStudySession[];
    tags: string[];
    targetSections: string[];
    stats: {
        totalStudyHours: number;
        totalQuestions: number;
        averageScore: number;
        activeMembers: number;
    };
    coverImage?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    archivedAt?: Date;
    addMember(userId: mongoose.Types.ObjectId, role?: string): Promise<void>;
    removeMember(userId: mongoose.Types.ObjectId): Promise<void>;
    isAdminOrOwner(userId: mongoose.Types.ObjectId): boolean;
    updateMemberRole(userId: mongoose.Types.ObjectId, role: string): Promise<void>;
    isMember(userId: mongoose.Types.ObjectId): boolean;
    scheduleSession(session: IStudySession): Promise<void>;
}
/**
 * Study Group Model
 */
export declare const StudyGroup: mongoose.Model<IStudyGroup, {}, {}, {}, mongoose.Document<unknown, {}, IStudyGroup, {}, {}> & IStudyGroup & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=StudyGroup.d.ts.map
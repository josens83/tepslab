import { IStudyGroup, GroupType, GroupStatus, MemberRole, IStudySession } from '../models/StudyGroup';
import mongoose from 'mongoose';
/**
 * Study Group Service
 */
export declare class StudyGroupService {
    /**
     * Create a new study group
     */
    static createGroup(creatorId: mongoose.Types.ObjectId, groupData: {
        name: string;
        description: string;
        groupType: GroupType;
        targetScore: number;
        studyGoals?: string[];
        maxMembers?: number;
        targetSections?: string[];
        tags?: string[];
        coverImage?: string;
    }): Promise<IStudyGroup>;
    /**
     * Get group by ID
     */
    static getGroupById(groupId: mongoose.Types.ObjectId): Promise<IStudyGroup | null>;
    /**
     * Get all groups with filters
     */
    static getGroups(filters: {
        groupType?: GroupType;
        status?: GroupStatus;
        targetScore?: number;
        tags?: string[];
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        groups: IStudyGroup[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Get user's groups
     */
    static getUserGroups(userId: mongoose.Types.ObjectId): Promise<IStudyGroup[]>;
    /**
     * Join a group
     */
    static joinGroup(groupId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<IStudyGroup>;
    /**
     * Leave a group
     */
    static leaveGroup(groupId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<void>;
    /**
     * Update group
     */
    static updateGroup(groupId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, updates: Partial<IStudyGroup>): Promise<IStudyGroup>;
    /**
     * Delete/Archive group
     */
    static deleteGroup(groupId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<void>;
    /**
     * Update member role
     */
    static updateMemberRole(groupId: mongoose.Types.ObjectId, adminId: mongoose.Types.ObjectId, memberId: mongoose.Types.ObjectId, newRole: MemberRole): Promise<IStudyGroup>;
    /**
     * Schedule study session
     */
    static scheduleSession(groupId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, session: Omit<IStudySession, 'attendees'>): Promise<IStudyGroup>;
    /**
     * Attend study session
     */
    static attendSession(groupId: mongoose.Types.ObjectId, sessionIndex: number, userId: mongoose.Types.ObjectId): Promise<IStudyGroup>;
    /**
     * Complete study session
     */
    static completeSession(groupId: mongoose.Types.ObjectId, sessionIndex: number, userId: mongoose.Types.ObjectId, notes?: string): Promise<IStudyGroup>;
    /**
     * Update group statistics
     */
    static updateGroupStats(groupId: mongoose.Types.ObjectId, stats: {
        totalStudyHours?: number;
        totalQuestions?: number;
        averageScore?: number;
    }): Promise<IStudyGroup>;
    /**
     * Get group statistics
     */
    static getGroupStats(groupId: mongoose.Types.ObjectId): Promise<{
        memberCount: number;
        upcomingSessions: number;
        completedSessions: number;
        totalSessions: number;
        totalStudyHours: number;
        totalQuestions: number;
        averageScore: number;
        activeMembers: number;
    }>;
    /**
     * Get recommended groups for user
     */
    static getRecommendedGroups(userId: mongoose.Types.ObjectId, userTargetScore: number, limit?: number): Promise<IStudyGroup[]>;
}
//# sourceMappingURL=studyGroupService.d.ts.map
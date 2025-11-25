"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudyGroupService = void 0;
const StudyGroup_1 = require("../models/StudyGroup");
/**
 * Study Group Service
 */
class StudyGroupService {
    /**
     * Create a new study group
     */
    static async createGroup(creatorId, groupData) {
        const group = new StudyGroup_1.StudyGroup({
            ...groupData,
            createdBy: creatorId,
            status: StudyGroup_1.GroupStatus.ACTIVE,
            members: [
                {
                    userId: creatorId,
                    role: StudyGroup_1.MemberRole.OWNER,
                    joinedAt: new Date(),
                    lastActiveAt: new Date(),
                    contributionScore: 0
                }
            ],
            stats: {
                totalStudyHours: 0,
                totalQuestions: 0,
                averageScore: 0,
                activeMembers: 1
            }
        });
        await group.save();
        return group;
    }
    /**
     * Get group by ID
     */
    static async getGroupById(groupId) {
        return StudyGroup_1.StudyGroup.findById(groupId)
            .populate('members.userId', 'name email avatar')
            .populate('createdBy', 'name email avatar');
    }
    /**
     * Get all groups with filters
     */
    static async getGroups(filters) {
        const { groupType, status = StudyGroup_1.GroupStatus.ACTIVE, targetScore, tags, search, page = 1, limit = 20 } = filters;
        const query = { status };
        if (groupType) {
            query.groupType = groupType;
        }
        if (targetScore) {
            // Find groups with similar target score (±50 points)
            query.targetScore = {
                $gte: targetScore - 50,
                $lte: targetScore + 50
            };
        }
        if (tags && tags.length > 0) {
            query.tags = { $in: tags };
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        const skip = (page - 1) * limit;
        const [groups, total] = await Promise.all([
            StudyGroup_1.StudyGroup.find(query)
                .populate('createdBy', 'name avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            StudyGroup_1.StudyGroup.countDocuments(query)
        ]);
        return {
            groups,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
    /**
     * Get user's groups
     */
    static async getUserGroups(userId) {
        return StudyGroup_1.StudyGroup.find({
            'members.userId': userId,
            status: { $ne: StudyGroup_1.GroupStatus.ARCHIVED }
        })
            .populate('members.userId', 'name email avatar')
            .sort({ 'members.lastActiveAt': -1 });
    }
    /**
     * Join a group
     */
    static async joinGroup(groupId, userId) {
        const group = await StudyGroup_1.StudyGroup.findById(groupId);
        if (!group) {
            throw new Error('Study group not found');
        }
        if (group.status !== StudyGroup_1.GroupStatus.ACTIVE) {
            throw new Error('Study group is not active');
        }
        if (group.groupType === StudyGroup_1.GroupType.PRIVATE || group.groupType === StudyGroup_1.GroupType.INVITE_ONLY) {
            if (group.settings.requireApproval) {
                throw new Error('This group requires approval to join');
            }
        }
        group.addMember(userId);
        await group.save();
        return group;
    }
    /**
     * Leave a group
     */
    static async leaveGroup(groupId, userId) {
        const group = await StudyGroup_1.StudyGroup.findById(groupId);
        if (!group) {
            throw new Error('Study group not found');
        }
        group.removeMember(userId);
        await group.save();
    }
    /**
     * Update group
     */
    static async updateGroup(groupId, userId, updates) {
        const group = await StudyGroup_1.StudyGroup.findById(groupId);
        if (!group) {
            throw new Error('Study group not found');
        }
        if (!group.isAdminOrOwner(userId)) {
            throw new Error('Only group admins can update the group');
        }
        // Update allowed fields
        const allowedUpdates = [
            'name',
            'description',
            'groupType',
            'targetScore',
            'studyGoals',
            'maxMembers',
            'targetSections',
            'tags',
            'coverImage',
            'settings'
        ];
        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                group[field] = updates[field];
            }
        });
        await group.save();
        return group;
    }
    /**
     * Delete/Archive group
     */
    static async deleteGroup(groupId, userId) {
        const group = await StudyGroup_1.StudyGroup.findById(groupId);
        if (!group) {
            throw new Error('Study group not found');
        }
        // Check if user is owner
        const owner = group.members.find(m => m.role === StudyGroup_1.MemberRole.OWNER);
        if (!owner || owner.userId.toString() !== userId.toString()) {
            throw new Error('Only the group owner can delete the group');
        }
        group.status = StudyGroup_1.GroupStatus.ARCHIVED;
        group.archivedAt = new Date();
        await group.save();
    }
    /**
     * Update member role
     */
    static async updateMemberRole(groupId, adminId, memberId, newRole) {
        const group = await StudyGroup_1.StudyGroup.findById(groupId);
        if (!group) {
            throw new Error('Study group not found');
        }
        if (!group.isAdminOrOwner(adminId)) {
            throw new Error('Only group admins can update member roles');
        }
        if (newRole === StudyGroup_1.MemberRole.OWNER) {
            throw new Error('Cannot transfer ownership this way');
        }
        group.updateMemberRole(memberId, newRole);
        await group.save();
        return group;
    }
    /**
     * Schedule study session
     */
    static async scheduleSession(groupId, userId, session) {
        const group = await StudyGroup_1.StudyGroup.findById(groupId);
        if (!group) {
            throw new Error('Study group not found');
        }
        if (!group.isMember(userId)) {
            throw new Error('Only group members can schedule sessions');
        }
        group.scheduleSession(session);
        await group.save();
        return group;
    }
    /**
     * Attend study session
     */
    static async attendSession(groupId, sessionIndex, userId) {
        const group = await StudyGroup_1.StudyGroup.findById(groupId);
        if (!group) {
            throw new Error('Study group not found');
        }
        if (!group.isMember(userId)) {
            throw new Error('Only group members can attend sessions');
        }
        const session = group.studySessions[sessionIndex];
        if (!session) {
            throw new Error('Study session not found');
        }
        if (!session.attendees.includes(userId)) {
            session.attendees.push(userId);
        }
        await group.save();
        return group;
    }
    /**
     * Complete study session
     */
    static async completeSession(groupId, sessionIndex, userId, notes) {
        const group = await StudyGroup_1.StudyGroup.findById(groupId);
        if (!group) {
            throw new Error('Study group not found');
        }
        if (!group.isAdminOrOwner(userId)) {
            throw new Error('Only group admins can complete sessions');
        }
        const session = group.studySessions[sessionIndex];
        if (!session) {
            throw new Error('Study session not found');
        }
        session.completedAt = new Date();
        if (notes) {
            session.notes = notes;
        }
        // Update group stats
        group.stats.totalStudyHours += session.duration / 60;
        await group.save();
        return group;
    }
    /**
     * Update group statistics
     */
    static async updateGroupStats(groupId, stats) {
        const group = await StudyGroup_1.StudyGroup.findById(groupId);
        if (!group) {
            throw new Error('Study group not found');
        }
        if (stats.totalStudyHours !== undefined) {
            group.stats.totalStudyHours += stats.totalStudyHours;
        }
        if (stats.totalQuestions !== undefined) {
            group.stats.totalQuestions += stats.totalQuestions;
        }
        if (stats.averageScore !== undefined) {
            group.stats.averageScore = stats.averageScore;
        }
        await group.save();
        return group;
    }
    /**
     * Get group statistics
     */
    static async getGroupStats(groupId) {
        const group = await StudyGroup_1.StudyGroup.findById(groupId);
        if (!group) {
            throw new Error('Study group not found');
        }
        const upcomingSessions = group.studySessions.filter(s => !s.completedAt && new Date(s.scheduledAt) > new Date()).length;
        const completedSessions = group.studySessions.filter(s => s.completedAt).length;
        return {
            ...group.stats,
            memberCount: group.members.length,
            upcomingSessions,
            completedSessions,
            totalSessions: group.studySessions.length
        };
    }
    /**
     * Get recommended groups for user
     */
    static async getRecommendedGroups(userId, userTargetScore, limit = 5) {
        // Find groups with similar target score that user hasn't joined
        return StudyGroup_1.StudyGroup.find({
            'members.userId': { $ne: userId },
            status: StudyGroup_1.GroupStatus.ACTIVE,
            groupType: { $in: [StudyGroup_1.GroupType.PUBLIC, StudyGroup_1.GroupType.INVITE_ONLY] },
            targetScore: {
                $gte: userTargetScore - 50,
                $lte: userTargetScore + 50
            }
        })
            .populate('createdBy', 'name avatar')
            .sort({ 'stats.activeMembers': -1, createdAt: -1 })
            .limit(limit);
    }
}
exports.StudyGroupService = StudyGroupService;
//# sourceMappingURL=studyGroupService.js.map
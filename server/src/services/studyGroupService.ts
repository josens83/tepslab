import {
  StudyGroup,
  IStudyGroup,
  GroupType,
  GroupStatus,
  MemberRole,
  IStudySession
} from '../models/StudyGroup';
import mongoose from 'mongoose';

/**
 * Study Group Service
 */
export class StudyGroupService {
  /**
   * Create a new study group
   */
  static async createGroup(
    creatorId: mongoose.Types.ObjectId,
    groupData: {
      name: string;
      description: string;
      groupType: GroupType;
      targetScore: number;
      studyGoals?: string[];
      maxMembers?: number;
      targetSections?: string[];
      tags?: string[];
      coverImage?: string;
    }
  ): Promise<IStudyGroup> {
    const group = new StudyGroup({
      ...groupData,
      createdBy: creatorId,
      status: GroupStatus.ACTIVE,
      members: [
        {
          userId: creatorId,
          role: MemberRole.OWNER,
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
  static async getGroupById(groupId: mongoose.Types.ObjectId): Promise<IStudyGroup | null> {
    return StudyGroup.findById(groupId)
      .populate('members.userId', 'name email avatar')
      .populate('createdBy', 'name email avatar');
  }

  /**
   * Get all groups with filters
   */
  static async getGroups(filters: {
    groupType?: GroupType;
    status?: GroupStatus;
    targetScore?: number;
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ groups: IStudyGroup[]; total: number; page: number; totalPages: number }> {
    const {
      groupType,
      status = GroupStatus.ACTIVE,
      targetScore,
      tags,
      search,
      page = 1,
      limit = 20
    } = filters;

    const query: any = { status };

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
      StudyGroup.find(query)
        .populate('createdBy', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      StudyGroup.countDocuments(query)
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
  static async getUserGroups(
    userId: mongoose.Types.ObjectId
  ): Promise<IStudyGroup[]> {
    return StudyGroup.find({
      'members.userId': userId,
      status: { $ne: GroupStatus.ARCHIVED }
    })
      .populate('members.userId', 'name email avatar')
      .sort({ 'members.lastActiveAt': -1 });
  }

  /**
   * Join a group
   */
  static async joinGroup(
    groupId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<IStudyGroup> {
    const group = await StudyGroup.findById(groupId);

    if (!group) {
      throw new Error('Study group not found');
    }

    if (group.status !== GroupStatus.ACTIVE) {
      throw new Error('Study group is not active');
    }

    if (group.groupType === GroupType.PRIVATE || group.groupType === GroupType.INVITE_ONLY) {
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
  static async leaveGroup(
    groupId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<void> {
    const group = await StudyGroup.findById(groupId);

    if (!group) {
      throw new Error('Study group not found');
    }

    group.removeMember(userId);
    await group.save();
  }

  /**
   * Update group
   */
  static async updateGroup(
    groupId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    updates: Partial<IStudyGroup>
  ): Promise<IStudyGroup> {
    const group = await StudyGroup.findById(groupId);

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
      if (updates[field as keyof IStudyGroup] !== undefined) {
        (group as any)[field] = updates[field as keyof IStudyGroup];
      }
    });

    await group.save();
    return group;
  }

  /**
   * Delete/Archive group
   */
  static async deleteGroup(
    groupId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<void> {
    const group = await StudyGroup.findById(groupId);

    if (!group) {
      throw new Error('Study group not found');
    }

    // Check if user is owner
    const owner = group.members.find(m => m.role === MemberRole.OWNER);
    if (!owner || owner.userId.toString() !== userId.toString()) {
      throw new Error('Only the group owner can delete the group');
    }

    group.status = GroupStatus.ARCHIVED;
    group.archivedAt = new Date();
    await group.save();
  }

  /**
   * Update member role
   */
  static async updateMemberRole(
    groupId: mongoose.Types.ObjectId,
    adminId: mongoose.Types.ObjectId,
    memberId: mongoose.Types.ObjectId,
    newRole: MemberRole
  ): Promise<IStudyGroup> {
    const group = await StudyGroup.findById(groupId);

    if (!group) {
      throw new Error('Study group not found');
    }

    if (!group.isAdminOrOwner(adminId)) {
      throw new Error('Only group admins can update member roles');
    }

    if (newRole === MemberRole.OWNER) {
      throw new Error('Cannot transfer ownership this way');
    }

    group.updateMemberRole(memberId, newRole);
    await group.save();

    return group;
  }

  /**
   * Schedule study session
   */
  static async scheduleSession(
    groupId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    session: Omit<IStudySession, 'attendees'>
  ): Promise<IStudyGroup> {
    const group = await StudyGroup.findById(groupId);

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
  static async attendSession(
    groupId: mongoose.Types.ObjectId,
    sessionIndex: number,
    userId: mongoose.Types.ObjectId
  ): Promise<IStudyGroup> {
    const group = await StudyGroup.findById(groupId);

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
  static async completeSession(
    groupId: mongoose.Types.ObjectId,
    sessionIndex: number,
    userId: mongoose.Types.ObjectId,
    notes?: string
  ): Promise<IStudyGroup> {
    const group = await StudyGroup.findById(groupId);

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
  static async updateGroupStats(
    groupId: mongoose.Types.ObjectId,
    stats: {
      totalStudyHours?: number;
      totalQuestions?: number;
      averageScore?: number;
    }
  ): Promise<IStudyGroup> {
    const group = await StudyGroup.findById(groupId);

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
  static async getGroupStats(groupId: mongoose.Types.ObjectId) {
    const group = await StudyGroup.findById(groupId);

    if (!group) {
      throw new Error('Study group not found');
    }

    const upcomingSessions = group.studySessions.filter(
      s => !s.completedAt && new Date(s.scheduledAt) > new Date()
    ).length;

    const completedSessions = group.studySessions.filter(
      s => s.completedAt
    ).length;

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
  static async getRecommendedGroups(
    userId: mongoose.Types.ObjectId,
    userTargetScore: number,
    limit: number = 5
  ): Promise<IStudyGroup[]> {
    // Find groups with similar target score that user hasn't joined
    return StudyGroup.find({
      'members.userId': { $ne: userId },
      status: GroupStatus.ACTIVE,
      groupType: { $in: [GroupType.PUBLIC, GroupType.INVITE_ONLY] },
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
